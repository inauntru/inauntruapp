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

// GET /api/practices/complete — ultimele practici finalizate de user (istoric real)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const service = createServiceClient() as any;
  const { data: recent, error } = await service
    .from("user_practices")
    .select("practice_id, completed_at")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Deduplicare — o practică apare o singură dată, la cea mai recentă finalizare
  const seen = new Set<number>();
  const ids: number[] = [];
  for (const r of recent ?? []) {
    if (!seen.has(r.practice_id)) { seen.add(r.practice_id); ids.push(r.practice_id); }
    if (ids.length >= 3) break;
  }
  if (ids.length === 0) return NextResponse.json({ practices: [] });

  const { data: rows } = await service
    .from("practices")
    .select("id, title, facilitator_name, duration, category, is_premium, tier")
    .in("id", ids);

  const byId = new Map((rows ?? []).map((p: any) => [p.id, p]));
  const practices = ids
    .map(id => byId.get(id))
    .filter(Boolean)
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      facilitator: p.facilitator_name ?? "",
      duration: p.duration,
      category: p.category,
      tier: p.tier ?? (p.is_premium ? "premium" : "gratuit"),
    }));

  return NextResponse.json({ practices });
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
