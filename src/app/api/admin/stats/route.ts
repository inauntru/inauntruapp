/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authenticated";
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();

  const [{ data: authData }, { data: profiles }, { data: checkInsRaw }] = await Promise.all([
    serviceClient.auth.admin.listUsers({ perPage: 1000 }),
    (serviceClient as any).from("profiles").select("id, plan"),
    (serviceClient as any).from("check_ins").select("created_at"),
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

  return NextResponse.json({
    totalUsers: users.length,
    confirmedUsers,
    paidUsers,
    totalCheckIns: checkIns.length,
    usersByPlan,
    newUsersPerDay,
    checkInsPerDay,
  });
}
