/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET /api/sessions/reserve — id-urile sesiunilor rezervate de userul curent
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const service = createServiceClient() as any;
  const { data, error } = await service
    .from("session_registrations")
    .select("session_id")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reserved: (data ?? []).map((r: any) => r.session_id) });
}

// POST /api/sessions/reserve { sessionId } — rezervă un loc
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "Lipsește sessionId" }, { status: 400 });

  const service = createServiceClient() as any;

  const { data: session, error: sessErr } = await service
    .from("live_sessions")
    .select("id, spots_left")
    .eq("id", sessionId)
    .single();

  // Sesiunea nu există în DB (date demo) — clientul cade pe localStorage
  if (sessErr || !session) {
    return NextResponse.json({ error: "Sesiunea nu există" }, { status: 404 });
  }
  if (session.spots_left <= 0) {
    return NextResponse.json({ error: "Nu mai sunt locuri disponibile" }, { status: 409 });
  }

  const { error: insErr } = await service
    .from("session_registrations")
    .insert({ session_id: sessionId, user_id: user.id });

  if (insErr) {
    // 23505 = unique_violation → deja rezervat
    if (insErr.code === "23505") {
      return NextResponse.json({ ok: true, alreadyReserved: true, spotsLeft: session.spots_left });
    }
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  const { data: updated } = await service
    .from("live_sessions")
    .update({ spots_left: session.spots_left - 1 })
    .eq("id", sessionId)
    .select("spots_left")
    .single();

  return NextResponse.json({ ok: true, spotsLeft: updated?.spots_left ?? session.spots_left - 1 });
}
