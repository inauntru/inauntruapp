/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

// This route is a placeholder — session reminders require a session_bookings table
// to know which users booked each session. Create that table in Supabase to enable full functionality.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Sessions starting in ~24 hours (between 23h and 25h from now)
  const from = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString();
  const to = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();

  const { data: sessions } = await (supabase as any)
    .from("live_sessions")
    .select("id, title, scheduled_at, facilitator_name, meeting_url")
    .eq("status", "upcoming")
    .gte("scheduled_at", from)
    .lte("scheduled_at", to) as { data: any[] | null };

  // Without a session_bookings table, we can't target specific users.
  // This returns upcoming sessions for manual action or future extension.
  return NextResponse.json({
    ok: true,
    upcomingSessions: (sessions ?? []).map((s: any) => ({ id: s.id, title: s.title, at: s.scheduled_at })),
    note: "Requires session_bookings table to send targeted reminders",
  });
}
