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

const KEYS = ["weeklyDigest", "sessionReminders", "newContent", "promotions"] as const;

// GET /api/user/preferences — preferințele de notificări
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const service = createServiceClient() as any;
  const { data, error } = await service
    .from("profiles")
    .select("notification_prefs")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prefs: data?.notification_prefs ?? {} });
}

// PATCH /api/user/preferences — salvează preferințele
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const body = await req.json();
  const prefs: Record<string, boolean> = {};
  for (const key of KEYS) {
    if (typeof body?.[key] === "boolean") prefs[key] = body[key];
  }
  if (Object.keys(prefs).length === 0) {
    return NextResponse.json({ error: "Nicio preferință validă" }, { status: 400 });
  }

  const service = createServiceClient() as any;
  const { error } = await service
    .from("profiles")
    .update({ notification_prefs: prefs })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
