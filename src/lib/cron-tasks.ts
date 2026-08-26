/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Task-urile emailurilor automate zilnice. Rulează o dată pe zi (Vercel Hobby
 * permite doar cron-uri zilnice), dimineața la ~10:00 ora României.
 *
 * Fiecare email trece prin sendEmail cu userId + ref → nu se trimite niciodată
 * de două ori aceluiași om (tabelul email_log).
 */
import { sendEmail } from "./email";
import { DAY_MS, SITE_URL, dayKey, formatSessionDate, getRecipient } from "./email-recipient";

export interface TaskResult { sent: number; skipped: number; candidates: number }

const HOUR_MS = 60 * 60 * 1000;

// ── Revenire (reactivation) ────────────────────────────────────────────────

/** După câte zile de inactivitate trimitem primul email de revenire. */
const INACTIVE_AFTER_DAYS = 7;
/** Pauză minimă între două emailuri de revenire către același utilizator. */
const RESEND_AFTER_DAYS = 14;
/** Câte emailuri de revenire trimitem maxim până când persoana revine. */
const MAX_REACTIVATION_EMAILS = 3;
/**
 * Până la 26.08.2026 cron-ul vechi trimitea emailul de revenire ZILNIC tuturor
 * inactivilor. Cine era deja inactiv la acea dată l-a primit → îl considerăm
 * notificat, ca să nu-l mai primească o dată imediat după deploy.
 * Garda expiră singură după câteva zile.
 */
const LEGACY_DAILY_SEND_AT = Date.parse("2026-08-26T10:00:00Z");
const LEGACY_GUARD_UNTIL = Date.parse("2026-08-30T00:00:00Z");

/**
 * Ultima activitate reală a fiecărui utilizator: check-in, timp petrecut în
 * platformă, practică finalizată sau ancoră completată — oricare e mai recentă.
 */
async function lastActivityByUser(service: any): Promise<Map<string, number>> {
  const last = new Map<string, number>();
  const bump = (userId: string, when: string | null | undefined) => {
    if (!userId || !when) return;
    const t = new Date(when).getTime();
    if (Number.isNaN(t)) return;
    if (t > (last.get(userId) ?? 0)) last.set(userId, t);
  };

  const [checkins, usage, practices, ancore] = await Promise.all([
    service.from("check_ins").select("user_id, created_at"),
    service.from("usage_time").select("user_id, day"),
    service.from("user_practices").select("user_id, completed_at, created_at"),
    service.from("ancore_completions").select("user_id, completed_at"),
  ]);

  for (const r of checkins.data ?? []) bump(r.user_id, r.created_at);
  // usage_time.day e o zi calendaristică (ora României) → o considerăm sfârșitul acelei zile
  for (const r of usage.data ?? []) bump(r.user_id, r.day ? `${r.day}T23:59:59+03:00` : null);
  for (const r of practices.data ?? []) bump(r.user_id, r.completed_at ?? r.created_at);
  for (const r of ancore.data ?? []) bump(r.user_id, r.completed_at);

  return last;
}

export async function runReactivation(service: any, now = Date.now()): Promise<TaskResult> {
  const result: TaskResult = { sent: 0, skipped: 0, candidates: 0 };
  const lastActivity = await lastActivityByUser(service);

  const { data: profiles } = await service
    .from("profiles")
    .select("id, reactivation_sent_at, reactivation_count");

  for (const profile of profiles ?? []) {
    const lastAt = lastActivity.get(profile.id);
    if (!lastAt) continue; // nu a folosit platforma niciodată → nu e „revenire"

    const daysInactive = Math.floor((now - lastAt) / DAY_MS);
    if (daysInactive < INACTIVE_AFTER_DAYS) continue;
    result.candidates++;

    let lastSentAt = profile.reactivation_sent_at ? new Date(profile.reactivation_sent_at).getTime() : 0;
    let emailsSoFar = lastSentAt > lastAt ? (profile.reactivation_count ?? 0) : 0;

    if (!lastSentAt && daysInactive > INACTIVE_AFTER_DAYS && now < LEGACY_GUARD_UNTIL) {
      lastSentAt = LEGACY_DAILY_SEND_AT;
      emailsSoFar = 1;
      await service
        .from("profiles")
        .update({ reactivation_sent_at: new Date(LEGACY_DAILY_SEND_AT).toISOString(), reactivation_count: 1 })
        .eq("id", profile.id);
    }

    if (emailsSoFar >= MAX_REACTIVATION_EMAILS) { result.skipped++; continue; }
    if (lastSentAt && now - lastSentAt < RESEND_AFTER_DAYS * DAY_MS) { result.skipped++; continue; }

    try {
      const to = await getRecipient(service, profile.id);
      if (!to) continue;
      const r = await sendEmail({
        templateId: "reactivation",
        to: to.email,
        userId: profile.id,
        ref: dayKey(now),
        vars: { prenume: to.prenume, nr_zile: String(daysInactive), link: `${SITE_URL}/dashboard` },
      });
      if (!r.sent) { result.skipped++; continue; }

      await service
        .from("profiles")
        .update({ reactivation_sent_at: new Date(now).toISOString(), reactivation_count: emailsSoFar + 1 })
        .eq("id", profile.id);
      result.sent++;
    } catch (e) {
      console.error("[cron/reactivation]", profile.id, e);
    }
  }
  return result;
}

// ── Ghid de start (getting_started) ────────────────────────────────────────

/**
 * La 1–3 zile după înregistrare, celor care încă nu au făcut niciun check-in.
 * Cine a făcut deja check-in a primit „Primul check-in" — nu mai are nevoie de ghid.
 */
export async function runGettingStarted(service: any, now = Date.now()): Promise<TaskResult> {
  const result: TaskResult = { sent: 0, skipped: 0, candidates: 0 };
  const from = new Date(now - 3 * DAY_MS).toISOString();
  const to = new Date(now - 1 * DAY_MS).toISOString();

  const { data: profiles } = await service
    .from("profiles")
    .select("id")
    .gte("created_at", from)
    .lte("created_at", to)
    .eq("check_ins_count", 0);

  for (const profile of profiles ?? []) {
    result.candidates++;
    try {
      const rcpt = await getRecipient(service, profile.id);
      if (!rcpt) continue;
      const r = await sendEmail({
        templateId: "getting_started",
        to: rcpt.email,
        userId: profile.id,
        ref: "once",
        vars: { prenume: rcpt.prenume, link: `${SITE_URL}/dashboard` },
      });
      if (r.sent) result.sent++; else result.skipped++;
    } catch (e) {
      console.error("[cron/getting_started]", profile.id, e);
    }
  }
  return result;
}

// ── Sesiuni LIVE: reminder + follow-up ─────────────────────────────────────

async function registrationsFor(service: any, sessionIds: number[]): Promise<Map<number, string[]>> {
  const byUser = new Map<number, string[]>();
  if (!sessionIds.length) return byUser;
  const { data } = await service
    .from("session_registrations")
    .select("session_id, user_id")
    .in("session_id", sessionIds);
  for (const r of data ?? []) {
    const list = byUser.get(Number(r.session_id)) ?? [];
    list.push(r.user_id);
    byUser.set(Number(r.session_id), list);
  }
  return byUser;
}

/**
 * Reminder pentru sesiunile de mâine: rulând o dată pe zi, prindem sesiunile
 * care încep în 12–36 de ore → fiecare sesiune e anunțată exact o dată, cu ~o zi înainte.
 */
export async function runSessionReminders(service: any, now = Date.now()): Promise<TaskResult> {
  const result: TaskResult = { sent: 0, skipped: 0, candidates: 0 };
  const from = new Date(now + 12 * HOUR_MS).toISOString();
  const to = new Date(now + 36 * HOUR_MS).toISOString();

  const { data: sessions } = await service
    .from("live_sessions")
    .select("id, title, scheduled_at, facilitator_name, meeting_url, status")
    .gte("scheduled_at", from)
    .lte("scheduled_at", to)
    .neq("status", "cancelled");

  const regs = await registrationsFor(service, (sessions ?? []).map((s: any) => s.id));

  for (const s of sessions ?? []) {
    for (const userId of regs.get(s.id) ?? []) {
      result.candidates++;
      try {
        const rcpt = await getRecipient(service, userId);
        if (!rcpt) continue;
        if (rcpt.prefs.sessionReminders === false) { result.skipped++; continue; }
        const r = await sendEmail({
          templateId: "session_reminder",
          to: rcpt.email,
          userId,
          ref: `s${s.id}`,
          vars: {
            prenume: rcpt.prenume,
            sesiune_titlu: s.title,
            sesiune_data: formatSessionDate(s.scheduled_at),
            facilitator_nume: s.facilitator_name ?? "Echipa WithIn",
            link: s.meeting_url || `${SITE_URL}/sesiuni-live`,
          },
        });
        if (r.sent) result.sent++; else result.skipped++;
      } catch (e) {
        console.error("[cron/session_reminder]", s.id, userId, e);
      }
    }
  }
  return result;
}

/** Follow-up în dimineața de după sesiune (sesiuni încheiate în ultimele 1–25 de ore). */
export async function runSessionFollowups(service: any, now = Date.now()): Promise<TaskResult> {
  const result: TaskResult = { sent: 0, skipped: 0, candidates: 0 };
  // scheduled_at + durată ∈ [now-25h, now-1h]; durata max ~3h → căutăm cu marjă
  const from = new Date(now - 28 * HOUR_MS).toISOString();
  const to = new Date(now - 1 * HOUR_MS).toISOString();

  const { data: sessions } = await service
    .from("live_sessions")
    .select("id, title, scheduled_at, duration, facilitator_name, status")
    .gte("scheduled_at", from)
    .lte("scheduled_at", to)
    .neq("status", "cancelled");

  const ended = (sessions ?? []).filter((s: any) => {
    const endAt = new Date(s.scheduled_at).getTime() + (s.duration ?? 60) * 60 * 1000;
    return endAt >= now - 25 * HOUR_MS && endAt <= now - 1 * HOUR_MS;
  });

  const regs = await registrationsFor(service, ended.map((s: any) => s.id));

  for (const s of ended) {
    for (const userId of regs.get(s.id) ?? []) {
      result.candidates++;
      try {
        const rcpt = await getRecipient(service, userId);
        if (!rcpt) continue;
        const r = await sendEmail({
          templateId: "session_followup",
          to: rcpt.email,
          userId,
          ref: `s${s.id}`,
          vars: {
            prenume: rcpt.prenume,
            facilitator_nume: s.facilitator_name ?? "Echipa WithIn",
            link: `${SITE_URL}/dashboard`,
          },
        });
        if (r.sent) result.sent++; else result.skipped++;
      } catch (e) {
        console.error("[cron/session_followup]", s.id, userId, e);
      }
    }
  }
  return result;
}
