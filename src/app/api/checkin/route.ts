/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

async function getSessionClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
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
}

// GET /api/checkin — check if user already checked in today
export async function GET() {
  const supabase = await getSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);

  const { data } = await supabase
    .from("check_ins")
    .select("id, mood, created_at")
    .eq("user_id", user.id)
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString())
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ checkedIn: !!data, checkIn: data ?? null });
}

// POST /api/checkin — save a new check-in and increment profile counter
export async function POST(req: NextRequest) {
  const supabase = await getSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rateLimit } = await import("@/lib/admin-auth");
  if (!rateLimit(`checkin:${user.id}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe cereri. Încearcă mai târziu." }, { status: 429 });
  }

  const { mood, body_zones, intensity, note } = await req.json();
  if (!mood) return NextResponse.json({ error: "mood required" }, { status: 400 });

  // Un singur check-in pe zi — dacă există deja unul azi, nu inserăm altul
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const { data: existing } = await supabase
    .from("check_ins")
    .select("id")
    .eq("user_id", user.id)
    .gte("created_at", dayStart.toISOString())
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, alreadyCheckedIn: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("check_ins").insert({
    user_id: user.id,
    mood,
    body_zones: body_zones ?? [],
    intensity: intensity ?? null,
    note: note ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Increment check_ins_count on profile using service client to bypass RLS
  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (serviceClient as any)
    .from("profiles")
    .select("check_ins_count, first_name")
    .eq("id", user.id)
    .single() as { data: { check_ins_count: number; first_name: string | null } | null };

  let streak = 0;
  if (profile !== null) {
    const wasFirst = (profile.check_ins_count ?? 0) === 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (serviceClient as any)
      .from("profiles")
      .update({ check_ins_count: (profile.check_ins_count ?? 0) + 1 })
      .eq("id", user.id);

    // Emailuri automate — best-effort, nu blochează check-in-ul
    try {
      const { sendEmail } = await import("@/lib/email");
      const { computeStreak, getRecipient, SITE_URL } = await import("@/lib/email-recipient");

      // Seria reală de zile consecutive, inclusiv check-in-ul de azi
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: allCheckins } = await (serviceClient as any)
        .from("check_ins")
        .select("created_at")
        .eq("user_id", user.id);
      streak = computeStreak((allCheckins ?? []).map((c: { created_at: string }) => c.created_at));

      const rcpt = wasFirst || STREAK_MILESTONES.includes(streak)
        ? await getRecipient(serviceClient, user.id)
        : null;

      if (rcpt && wasFirst) {
        await sendEmail({
          templateId: "first_checkin",
          to: rcpt.email,
          userId: user.id,
          ref: "once",
          vars: { prenume: rcpt.prenume, link: `${SITE_URL}/dashboard` },
        });
      }

      // Emailul de serie se trimite DOAR când seria chiar atinge pragul.
      // ref = prag + ziua → o serie refăcută mai târziu primește din nou felicitarea.
      if (rcpt && STREAK_MILESTONES.includes(streak)) {
        const { dayKey } = await import("@/lib/email-recipient");
        await sendEmail({
          templateId: "practice_streak",
          to: rcpt.email,
          userId: user.id,
          ref: `streak-${streak}-${dayKey(Date.now())}`,
          vars: { prenume: rcpt.prenume, nr_zile: String(streak), link: `${SITE_URL}/dashboard` },
        });
      }
    } catch (e) {
      console.error("[checkin] email", e);
    }
  }

  return NextResponse.json({ ok: true, streak });
}

/** Pragurile la care felicităm seria de zile consecutive de check-in. */
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 100];
