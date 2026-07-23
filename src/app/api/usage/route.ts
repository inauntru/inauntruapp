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

function localDay(): string {
  // Ziua în ora României, nu UTC
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" });
}

// POST /api/usage — heartbeat: adaugă minute la ziua curentă (max 5/cerere)
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  // Heartbeat-ul legitim e 1/minut — mai mult e abuz
  const { rateLimit } = await import("@/lib/admin-auth");
  if (!rateLimit(`usage:${user.id}`, 8, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });
  }

  let minutes = 1;
  try {
    const body = await req.json();
    minutes = Math.max(1, Math.min(5, Number(body?.minutes) || 1));
  } catch { /* fără body → 1 minut */ }

  const service = createServiceClient() as any;
  const { error } = await service.rpc("increment_usage", {
    p_user: user.id,
    p_day: localDay(),
    p_minutes: minutes,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// GET /api/usage?days=N — minutele pe zi din ultimele N zile (default 14, max 90)
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const days = Math.max(1, Math.min(90, Number(req.nextUrl.searchParams.get("days")) || 14));
  const since = new Date(Date.now() - days * 86400000).toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" });

  const service = createServiceClient() as any;
  const { data, error } = await service
    .from("usage_time")
    .select("day, minutes")
    .eq("user_id", user.id)
    .gte("day", since)
    .order("day", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ days: data ?? [] });
}
