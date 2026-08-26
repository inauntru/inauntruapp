import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  runGettingStarted,
  runReactivation,
  runSessionFollowups,
  runSessionReminders,
} from "@/lib/cron-tasks";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Cron-ul zilnic al emailurilor automate (vezi vercel.json — 07:00 UTC = 10:00 RO):
 *  - ghid de start (1–3 zile după înregistrare, fără check-in)
 *  - revenire (după 7 zile de inactivitate, apoi la 14 zile, max 3)
 *  - reminder sesiune LIVE (cu ~o zi înainte)
 *  - follow-up sesiune LIVE (în dimineața de după)
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

  const service = createServiceClient();
  const now = Date.now();

  const safe = async (name: string, fn: () => Promise<unknown>) => {
    try { return await fn(); } catch (e) {
      console.error(`[cron/daily] ${name}`, e);
      return { error: e instanceof Error ? e.message : String(e) };
    }
  };

  const [getting_started, reactivation, session_reminders, session_followups] = await Promise.all([
    safe("getting_started", () => runGettingStarted(service, now)),
    safe("reactivation", () => runReactivation(service, now)),
    safe("session_reminders", () => runSessionReminders(service, now)),
    safe("session_followups", () => runSessionFollowups(service, now)),
  ]);

  return NextResponse.json({ ok: true, getting_started, reactivation, session_reminders, session_followups });
}
