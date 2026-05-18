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
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Total minutes from completed user_practices
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: practicesRaw } = await (supabase as any)
    .from("user_practices")
    .select("duration_watched")
    .eq("user_id", user.id)
    .eq("completed", true);

  const practices = (practicesRaw ?? []) as Pick<UserPractice, "duration_watched">[];
  const minutesPracticed = Math.round(
    practices.reduce((sum, p) => sum + (p.duration_watched ?? 0), 0) / 60
  );

  // Streak: count consecutive days ending today from check_ins
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: checkInsRaw } = await (supabase as any)
    .from("check_ins")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const checkIns = (checkInsRaw ?? []) as Pick<CheckIn, "created_at">[];
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
    while (days.has(cursor)) {
      streak++;
      cursor -= 86400000;
    }
  }

  // Check-ins total count (from profile)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from("profiles")
    .select("check_ins_count")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as Pick<Profile, "check_ins_count"> | null;

  return NextResponse.json({
    streak,
    minutesPracticed,
    checkInsCount: profile?.check_ins_count ?? 0,
  });
}
