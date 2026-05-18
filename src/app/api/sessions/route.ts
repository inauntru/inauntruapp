import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { LIVE_SESSIONS } from "@/lib/mockData";
import type { LiveSession } from "@/lib/database.types";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("live_sessions")
    .select("*")
    .in("status", ["upcoming", "live"])
    .order("scheduled_at", { ascending: true });

  if (error || !data || data.length === 0) {
    return NextResponse.json(LIVE_SESSIONS);
  }

  const normalized = (data as LiveSession[]).map((s) => ({
    id: s.id,
    title: s.title,
    facilitator: s.facilitator_name ?? "",
    date: s.scheduled_at,
    duration: s.duration,
    spotsTotal: s.spots_total,
    spotsLeft: s.spots_left,
    type: "Grup",
    isPremium: s.is_premium,
    zoomLink: s.meeting_url ?? "#",
    description: "",
    tags: s.tags ?? [],
    status: s.status,
  }));

  return NextResponse.json(normalized);
}
