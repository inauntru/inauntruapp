/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import type { Database } from "@/lib/database.types";

async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST /api/sessions/[id]/book
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sessionId = parseInt(id, 10);
  if (isNaN(sessionId)) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

  const serviceClient = createServiceClient();

  // Fetch session
  const { data: session, error: sessionErr } = await (serviceClient as any)
    .from("live_sessions")
    .select("id, title, facilitator_name, scheduled_at, duration, spots_left, is_premium, meeting_url")
    .eq("id", sessionId)
    .single() as { data: any | null; error: any };

  if (sessionErr || !session) return NextResponse.json({ error: "Sesiunea nu există" }, { status: 404 });
  if (session.spots_left <= 0) return NextResponse.json({ error: "Nu mai sunt locuri disponibile" }, { status: 409 });

  // Decrement spots_left
  const { error: updateErr } = await (serviceClient as any)
    .from("live_sessions")
    .update({ spots_left: session.spots_left - 1 })
    .eq("id", sessionId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Send confirmation email
  try {
    const { data: authData } = await serviceClient.auth.admin.getUserById(user.id);
    const email = authData.user?.email;
    const { data: profile } = await (serviceClient as any)
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .single() as { data: { first_name: string | null } | null };

    if (email) {
      const scheduledDate = new Date(session.scheduled_at);
      const dateStr = scheduledDate.toLocaleDateString("ro-RO", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });

      await sendEmail({
        templateId: "session_booked",
        to: email,
        vars: {
          prenume: profile?.first_name || authData.user?.user_metadata?.first_name || "acolo",
          sesiune_titlu: session.title,
          sesiune_data: dateStr,
          sesiune_durata: `${session.duration} minute`,
          facilitator_nume: session.facilitator_name ?? "Facilitatorul tău",
          link: session.meeting_url ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://inauntru.ro"}/sesiuni-live`,
        },
      });
    }
  } catch {}

  return NextResponse.json({ ok: true, spotsLeft: session.spots_left - 1 });
}
