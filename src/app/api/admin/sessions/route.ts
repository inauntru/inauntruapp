/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return check();
}

// GET /api/admin/sessions
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await createServiceClient()
    .from("live_sessions")
    .select("*")
    .order("scheduled_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/sessions
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, facilitator_name, scheduled_at, duration, spots_total, is_premium, meeting_url } = body;

  if (!title || !scheduled_at) {
    return NextResponse.json({ error: "title și scheduled_at sunt obligatorii" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (serviceClient as any).from("live_sessions").insert({
    title,
    facilitator_name: facilitator_name ?? null,
    scheduled_at,
    duration: duration ?? 60,
    spots_total: spots_total ?? 25,
    spots_left: spots_total ?? 25,
    is_premium: is_premium ?? false,
    meeting_url: meeting_url ?? null,
    tags: [],
    status: "upcoming",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
