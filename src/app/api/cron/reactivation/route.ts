/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const DAY_MS = 24 * 60 * 60 * 1000;

/** După câte zile de inactivitate trimitem primul email de revenire. */
const INACTIVE_AFTER_DAYS = 7;
/** Pauză minimă între două emailuri de revenire către același utilizator. */
const RESEND_AFTER_DAYS = 14;
/** Câte emailuri de revenire trimitem maxim până când persoana revine. */
const MAX_EMAILS = 3;

/**
 * Ultima activitate reală a fiecărui utilizator: check-in, timp petrecut în
 * platformă, practică finalizată sau ancoră completată — oricare e mai recentă.
 */
async function lastActivityByUser(supabase: any): Promise<Map<string, number>> {
  const last = new Map<string, number>();
  const bump = (userId: string, when: string | null | undefined) => {
    if (!userId || !when) return;
    const t = new Date(when).getTime();
    if (Number.isNaN(t)) return;
    if (t > (last.get(userId) ?? 0)) last.set(userId, t);
  };

  const [checkins, usage, practices, ancore] = await Promise.all([
    supabase.from("check_ins").select("user_id, created_at"),
    supabase.from("usage_time").select("user_id, day"),
    supabase.from("user_practices").select("user_id, completed_at, created_at"),
    supabase.from("ancore_completions").select("user_id, completed_at"),
  ]);

  for (const r of checkins.data ?? []) bump(r.user_id, r.created_at);
  // usage_time.day e o zi calendaristică (ora României) → o considerăm sfârșitul acelei zile
  for (const r of usage.data ?? []) bump(r.user_id, r.day ? `${r.day}T23:59:59+03:00` : null);
  for (const r of practices.data ?? []) bump(r.user_id, r.completed_at ?? r.created_at);
  for (const r of ancore.data ?? []) bump(r.user_id, r.completed_at);

  return last;
}

export async function GET(req: NextRequest) {
  // Refuza tot daca CRON_SECRET nu e configurat (evita "Bearer undefined")
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient() as any;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.ro";
  const now = Date.now();

  const lastActivity = await lastActivityByUser(supabase);

  // Doar utilizatori care au folosit platforma măcar o dată (au ce să „revină")
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, reactivation_sent_at, reactivation_count") as {
      data: {
        id: string;
        first_name: string | null;
        reactivation_sent_at: string | null;
        reactivation_count: number | null;
      }[] | null;
    };

  let sent = 0;
  let inactive = 0;
  let skipped = 0;

  for (const profile of profiles ?? []) {
    const lastAt = lastActivity.get(profile.id);
    if (!lastAt) continue; // nu a făcut nimic niciodată → nu e „revenire"

    const daysInactive = Math.floor((now - lastAt) / DAY_MS);
    if (daysInactive < INACTIVE_AFTER_DAYS) continue;
    inactive++;

    // Dacă persoana a revenit după ultimul email, contorul o ia de la zero
    const lastSentAt = profile.reactivation_sent_at ? new Date(profile.reactivation_sent_at).getTime() : 0;
    const emailsSoFar = lastSentAt > lastAt ? (profile.reactivation_count ?? 0) : 0;

    if (emailsSoFar >= MAX_EMAILS) { skipped++; continue; }
    if (lastSentAt && now - lastSentAt < RESEND_AFTER_DAYS * DAY_MS) { skipped++; continue; }

    try {
      const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
      const email = authData?.user?.email;
      if (!email) continue;

      await sendEmail({
        templateId: "reactivation",
        to: email,
        vars: {
          prenume: profile.first_name || authData.user?.user_metadata?.first_name || "acolo",
          nr_zile: String(daysInactive),
          link: `${siteUrl}/dashboard`,
        },
      });

      await supabase
        .from("profiles")
        .update({
          reactivation_sent_at: new Date(now).toISOString(),
          reactivation_count: emailsSoFar + 1,
        })
        .eq("id", profile.id);

      sent++;
    } catch {}
  }

  return NextResponse.json({ ok: true, sent, inactive, skipped });
}
