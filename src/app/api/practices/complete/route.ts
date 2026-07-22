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

// POST /api/practices/complete { practiceId, durationMinutes }
// Înregistrează o practică finalizată în user_practices
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { practiceId, durationMinutes } = await req.json();
  if (!practiceId || typeof practiceId !== "number") {
    return NextResponse.json({ error: "Lipsește practiceId" }, { status: 400 });
  }

  const minutes = Math.max(0, Math.min(240, Number(durationMinutes) || 0));

  const service = createServiceClient() as any;
  const { error } = await service.from("user_practices").insert({
    user_id: user.id,
    practice_id: practiceId,
    completed: true,
    duration_watched: minutes,
    completed_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
