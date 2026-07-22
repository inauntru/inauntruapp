/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Refuza tot daca CRON_SECRET nu e configurat (evita "Bearer undefined")
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inauntru.ro";

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get check-ins from the past week
  const { data: checkins } = await (supabase as any)
    .from("check_ins")
    .select("user_id, mood, created_at")
    .gte("created_at", weekAgo) as { data: { user_id: string; mood: string; created_at: string }[] | null };

  // Group by user
  const byUser = new Map<string, number>();
  for (const c of (checkins ?? [])) {
    byUser.set(c.user_id, (byUser.get(c.user_id) ?? 0) + 1);
  }

  let sent = 0;
  for (const [userId, count] of Array.from(byUser.entries())) {
    try {
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .single() as { data: { first_name: string | null } | null };

      const { data: authData } = await supabase.auth.admin.getUserById(userId);
      const email = authData.user?.email;
      if (!email) continue;

      await sendEmail({
        templateId: "weekly_summary",
        to: email,
        vars: {
          prenume: profile?.first_name || authData.user?.user_metadata?.first_name || "acolo",
          nr_practici: String(count),
          nr_minute: String(count * 5),
          nr_zile: String(new Set(
            (checkins ?? []).filter((c: any) => c.user_id === userId).map((c: any) => c.created_at.slice(0, 10))
          ).size),
          link: `${siteUrl}/dashboard`,
        },
      });
      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent, usersWithActivity: byUser.size });
}
