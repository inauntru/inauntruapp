/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inauntru.ro";

  // Find users with no check-in in the last 7 days
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all user_ids who checked in recently
  const { data: recentCheckins } = await (supabase as any)
    .from("check_ins")
    .select("user_id")
    .gte("created_at", cutoff) as { data: { user_id: string }[] | null };

  const activeUserIds = new Set((recentCheckins ?? []).map((c: any) => c.user_id));

  // Get all users with at least one check-in (so they're familiar with the app)
  const { data: allCheckinUsers } = await (supabase as any)
    .from("profiles")
    .select("id, first_name")
    .gt("check_ins_count", 0) as { data: { id: string; first_name: string | null }[] | null };

  const inactiveUsers = (allCheckinUsers ?? []).filter((u: any) => !activeUserIds.has(u.id));

  let sent = 0;
  for (const profile of inactiveUsers) {
    try {
      const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
      const email = authData.user?.email;
      if (!email) continue;
      await sendEmail({
        templateId: "reactivation",
        to: email,
        vars: {
          prenume: profile.first_name || authData.user?.user_metadata?.first_name || "acolo",
          link: `${siteUrl}/dashboard`,
        },
      });
      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent, inactive: inactiveUsers.length });
}
