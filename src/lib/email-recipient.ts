/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utilitare comune pentru emailurile automate: destinatar, zile, serii.
 */

export const RO_TZ = "Europe/Bucharest";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.ro";
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Ziua calendaristică (YYYY-MM-DD) în ora României. */
export function dayKey(d: Date | string | number): string {
  return new Date(d).toLocaleDateString("sv-SE", { timeZone: RO_TZ });
}

function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(Date.UTC(y, m - 1, d + days, 12));
}

/**
 * Zile consecutive cu activitate, numărate înapoi de la azi.
 * Cu `allowEndingYesterday`, o serie care s-a încheiat ieri încă se consideră
 * activă (util dimineața, înainte ca persoana să-și facă check-in-ul de azi).
 */
export function computeStreak(
  dates: Array<string | Date>,
  opts: { allowEndingYesterday?: boolean; now?: number } = {}
): number {
  const days = new Set(dates.map(dayKey));
  let cursor = dayKey(opts.now ?? Date.now());
  if (!days.has(cursor)) {
    if (!opts.allowEndingYesterday) return 0;
    cursor = shiftDay(cursor, -1);
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export interface Recipient {
  email: string;
  prenume: string;
  prefs: Record<string, boolean>;
}

/** Emailul (din auth) + prenumele + preferințele de notificări ale unui utilizator. */
export async function getRecipient(service: any, userId: string): Promise<Recipient | null> {
  const [{ data: authData }, { data: profile }] = await Promise.all([
    service.auth.admin.getUserById(userId),
    service.from("profiles").select("first_name, notification_prefs").eq("id", userId).maybeSingle(),
  ]);
  const email = authData?.user?.email;
  if (!email) return null;
  return {
    email,
    prenume: profile?.first_name || authData.user?.user_metadata?.first_name || "acolo",
    prefs: (profile?.notification_prefs as Record<string, boolean>) ?? {},
  };
}

/** „Joi, 4 septembrie · 18:00" — data unei sesiuni în ora României. */
export function formatSessionDate(iso: string): string {
  const s = new Date(iso).toLocaleString("ro-RO", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    timeZone: RO_TZ,
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
