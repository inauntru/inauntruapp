/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database, UserPractice, CheckIn, Profile } from "@/lib/database.types";

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

  // Completed practices
  const { data: practicesRaw } = await (supabase as any)
    .from("user_practices")
    .select("duration_watched, completed_at")
    .eq("user_id", user.id)
    .eq("completed", true);

  const practices = (practicesRaw ?? []) as Pick<UserPractice, "duration_watched" | "completed_at">[];
  const minutesPracticed = Math.round(
    practices.reduce((sum, p) => sum + (p.duration_watched ?? 0), 0) / 60
  );
  const practicesCompleted = practices.length;

  // All check-ins for streak + weekly count
  const { data: checkInsRaw } = await (supabase as any)
    .from("check_ins")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const checkIns = (checkInsRaw ?? []) as Pick<CheckIn, "created_at">[];

  // Streak: consecutive days ending today
  let streak = 0;
  if (checkIns.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = new Set(checkIns.map((c) => {
      const d = new Date(c.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }));
    let cursor = today.getTime();
    while (days.has(cursor)) { streak++; cursor -= 86400000; }
  }

  // Check-ins in the last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  const checkInsThisWeek = new Set(
    checkIns
      .filter((c) => new Date(c.created_at) >= weekAgo)
      .map((c) => {
        const d = new Date(c.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
  ).size;

  // Journal entries count
  const { count: journalCount } = await (supabase as any)
    .from("journal_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Total check-ins from profile
  const { data: profileRaw } = await (supabase as any)
    .from("profiles")
    .select("check_ins_count")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as Pick<Profile, "check_ins_count"> | null;

  return NextResponse.json({
    streak,
    minutesPracticed,
    checkInsCount: profile?.check_ins_count ?? checkIns.length,
    practicesCompleted,
    checkInsThisWeek,
    journalCount: journalCount ?? 0,
  });
}
