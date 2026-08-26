/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { DAY_MS, SITE_URL, computeStreak, dayKey, getRecipient } from "@/lib/email-recipient";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Mesajul personalizat, în funcție de câte zile din 7 a fost persoana activă. */
function personalMessage(activeDays: number, streak: number): string {
  if (activeDays >= 5) {
    return `Ai fost pe platformă ${activeDays} zile din 7 — o săptămână cu adevărat constantă. Sistemul tău nervos învață să revină mai repede la echilibru cu fiecare repetare.`;
  }
  if (activeDays >= 3) {
    return `${activeDays} zile din 7 — un ritm bun. Săptămâna viitoare încearcă să adaugi încă o zi; constanța contează mai mult decât durata.`;
  }
  if (streak > 0) {
    return `Ai revenit săptămâna aceasta și ai deja ${streak} ${streak === 1 ? "zi" : "zile"} la rând. Următorul pas e simplu: repetă mâine.`;
  }
  return `Ai revenit săptămâna aceasta — chiar și un check-in de 2 minute contează. Următorul pas e să-l repeți mâine.`;
}

/**
 * Rezumatul săptămânal (luni dimineața) — doar celor care au avut activitate
 * în ultimele 7 zile și nu au dezactivat „Rezumat săptămânal" din cont.
 */
export async function GET(req: NextRequest) {
  // Refuza tot daca CRON_SECRET nu e configurat (evita "Bearer undefined")
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient() as any;
  const now = Date.now();
  const weekAgoIso = new Date(now - 7 * DAY_MS).toISOString();
  const weekAgoDay = dayKey(now - 7 * DAY_MS);

  const [checkinsAll, practices, ancore, usage] = await Promise.all([
    service.from("check_ins").select("user_id, created_at"),
    service.from("user_practices").select("user_id, completed_at, created_at").eq("completed", true).gte("completed_at", weekAgoIso),
    service.from("ancore_completions").select("user_id, completed_at").gte("completed_at", weekAgoIso),
    service.from("usage_time").select("user_id, day, minutes").gte("day", weekAgoDay),
  ]);

  // Toate check-in-urile per utilizator (pentru serie) + activitatea din săptămână
  const checkinsByUser = new Map<string, string[]>();
  for (const c of checkinsAll.data ?? []) {
    const list = checkinsByUser.get(c.user_id) ?? [];
    list.push(c.created_at);
    checkinsByUser.set(c.user_id, list);
  }

  type Week = { days: Set<string>; practices: number; minutes: number };
  const week = new Map<string, Week>();
  const touch = (userId: string, day: string) => {
    const w = week.get(userId) ?? { days: new Set<string>(), practices: 0, minutes: 0 };
    w.days.add(day);
    week.set(userId, w);
    return w;
  };
  for (const c of checkinsAll.data ?? []) {
    if (c.created_at >= weekAgoIso) touch(c.user_id, dayKey(c.created_at));
  }
  for (const p of practices.data ?? []) touch(p.user_id, dayKey(p.completed_at ?? p.created_at)).practices++;
  for (const a of ancore.data ?? []) touch(a.user_id, dayKey(a.completed_at)).practices++;
  for (const u of usage.data ?? []) touch(u.user_id, u.day).minutes += u.minutes ?? 0;

  let sent = 0;
  let skipped = 0;
  for (const [userId, w] of Array.from(week.entries())) {
    try {
      const rcpt = await getRecipient(service, userId);
      if (!rcpt) continue;
      // Respectăm opțiunea „Rezumat săptămânal" din Contul meu → Notificări
      if (rcpt.prefs.weeklyDigest === false) { skipped++; continue; }

      const streak = computeStreak(checkinsByUser.get(userId) ?? [], { allowEndingYesterday: true, now });

      const r = await sendEmail({
        templateId: "weekly_summary",
        to: rcpt.email,
        userId,
        ref: dayKey(now),
        vars: {
          prenume: rcpt.prenume,
          nr_practici: String(w.practices),
          nr_minute: String(w.minutes),
          streak: String(streak),
          mesaj_personalizat: personalMessage(w.days.size, streak),
          link: `${SITE_URL}/dashboard`,
        },
      });
      if (r.sent) sent++; else skipped++;
    } catch (e) {
      console.error("[cron/weekly-summary]", userId, e);
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, usersWithActivity: week.size });
}
