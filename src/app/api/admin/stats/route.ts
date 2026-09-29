/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();

  const [{ data: authData }, { data: profiles }, { data: checkInsRaw }, { data: donePracticesRaw }, { data: practicesRaw }] = await Promise.all([
    serviceClient.auth.admin.listUsers({ perPage: 1000 }),
    (serviceClient as any).from("profiles").select("id, plan"),
    (serviceClient as any).from("check_ins").select("created_at"),
    (serviceClient as any).from("user_practices").select("practice_id, duration_watched, completed_at, completed"),
    (serviceClient as any).from("practices").select("id, title, category, views_count, status"),
  ]);

  const users = authData?.users ?? [];
  const profileList = (profiles ?? []) as { id: string; plan: string }[];
  const checkIns = (checkInsRaw ?? []) as { created_at: string }[];

  const confirmedUsers = users.filter((u) => !!u.email_confirmed_at).length;
  const paidUsers = profileList.filter((p) => p.plan !== "gratuit").length;

  // Users by plan
  const planCount: Record<string, number> = { gratuit: 0, standard: 0, premium: 0 };
  profileList.forEach((p) => { planCount[p.plan] = (planCount[p.plan] ?? 0) + 1; });
  const usersByPlan = Object.entries(planCount).map(([plan, count]) => ({ plan, count }));

  // New users per day (last 30 days)
  const newUsersPerDay: { day: string; count: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d); date.setHours(0, 0, 0, 0);
    const next = new Date(date.getTime() + 86400000);
    const count = users.filter((u) => {
      const t = new Date(u.created_at).getTime();
      return t >= date.getTime() && t < next.getTime();
    }).length;
    newUsersPerDay.push({ day: date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }), count });
  }

  // Check-ins per day (last 30 days)
  const checkInsPerDay: { day: string; count: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d); date.setHours(0, 0, 0, 0);
    const next = new Date(date.getTime() + 86400000);
    const count = checkIns.filter((c) => {
      const t = new Date(c.created_at).getTime();
      return t >= date.getTime() && t < next.getTime();
    }).length;
    checkInsPerDay.push({ day: date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }), count });
  }

  // ── Practici ───────────────────────────────────────────────────────────
  // „Porniri" = de câte ori s-a cerut fișierul; „finalizări" = parcurse 90%+.
  const done = (donePracticesRaw ?? []) as { practice_id: number; duration_watched: number | null; completed_at: string | null; completed: boolean }[];
  const practices = (practicesRaw ?? []) as { id: number; title: string; category: string | null; views_count: number | null; status: string }[];

  const since30 = Date.now() - 30 * 86400000;
  const doneLast30 = done.filter((d) => d.completed_at && new Date(d.completed_at).getTime() >= since30);
  const totalMinutes = done.reduce((sum, d) => sum + (d.duration_watched ?? 0), 0);

  const doneByPractice = new Map<number, number>();
  done.forEach((d) => doneByPractice.set(d.practice_id, (doneByPractice.get(d.practice_id) ?? 0) + 1));

  const practiceStats = practices
    .map((p) => {
      const completions = doneByPractice.get(p.id) ?? 0;
      const starts = p.views_count ?? 0;
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        starts,
        completions,
        // Rata are sens doar dacă practica a fost pornită măcar o dată
        rate: starts > 0 ? Math.round((completions / starts) * 100) : null,
      };
    })
    .filter((p) => p.starts > 0 || p.completions > 0)
    .sort((a, b) => b.completions - a.completions || b.starts - a.starts);

  // Finalizări pe zi (ultimele 30)
  const practicesPerDay: { day: string; count: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date(); date.setDate(date.getDate() - d); date.setHours(0, 0, 0, 0);
    const next = new Date(date.getTime() + 86400000);
    const count = done.filter((x) => {
      if (!x.completed_at) return false;
      const t = new Date(x.completed_at).getTime();
      return t >= date.getTime() && t < next.getTime();
    }).length;
    practicesPerDay.push({ day: date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }), count });
  }

  return NextResponse.json({
    totalPracticesDone: done.length,
    practicesDoneLast30: doneLast30.length,
    totalMinutesPracticed: totalMinutes,
    practiceStats: practiceStats.slice(0, 12),
    practicesPerDay,
    totalUsers: users.length,
    confirmedUsers,
    paidUsers,
    totalCheckIns: checkIns.length,
    usersByPlan,
    newUsersPerDay,
    checkInsPerDay,
  });
}
