/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import type { Database, UserPractice, CheckIn } from "@/lib/database.types";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();

  const [{ data: practicesRaw }, { data: checkInsRaw }] = await Promise.all([
    (serviceClient as any).from("user_practices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    (serviceClient as any).from("check_ins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(90),
  ]);

  const practices = (practicesRaw ?? []) as UserPractice[];
  const checkIns = (checkInsRaw ?? []) as CheckIn[];

  // Total minutes practiced
  const totalMinutes = Math.round(
    practices.filter((p) => p.completed).reduce((s, p) => s + (p.duration_watched ?? 0), 0) / 60
  );

  // Streak
  let streak = 0;
  if (checkIns.length > 0) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = new Set(checkIns.map((c) => { const d = new Date(c.created_at); d.setHours(0, 0, 0, 0); return d.getTime(); }));
    let cursor = today.getTime();
    while (days.has(cursor)) { streak++; cursor -= 86400000; }
  }

  // Practices completed per week (last 8 weeks)
  const now = Date.now();
  const weeklyPractices: { week: string; count: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = now - (w + 1) * 7 * 86400000;
    const end = now - w * 7 * 86400000;
    const count = practices.filter((p) => {
      const t = new Date(p.created_at).getTime();
      return t >= start && t < end && p.completed;
    }).length;
    const d = new Date(now - w * 7 * 86400000);
    weeklyPractices.push({ week: `S${8 - w}`, count });
    void d;
  }

  // Check-ins per day (last 30 days)
  const dailyCheckIns: { day: string; count: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d); date.setHours(0, 0, 0, 0);
    const next = new Date(date.getTime() + 86400000);
    const count = checkIns.filter((c) => {
      const t = new Date(c.created_at).getTime();
      return t >= date.getTime() && t < next.getTime();
    }).length;
    dailyCheckIns.push({ day: date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }), count });
  }

  // Mood distribution
  const moodCounts: Record<string, number> = {};
  checkIns.forEach((c) => { moodCounts[c.mood] = (moodCounts[c.mood] ?? 0) + 1; });
  const moodData = Object.entries(moodCounts).map(([mood, count]) => ({ mood, count }));

  return NextResponse.json({
    totalMinutes,
    totalPractices: practices.filter((p) => p.completed).length,
    totalCheckIns: checkIns.length,
    streak,
    weeklyPractices,
    dailyCheckIns,
    moodData,
  });
}
