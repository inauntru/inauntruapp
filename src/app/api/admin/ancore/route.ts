/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import { ANCORE_DATA } from "@/lib/ancore";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

const SETTINGS_KEY = "ancore_exercises";

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const serviceClient = createServiceClient();
    const { data } = await (serviceClient as any)
      .from("settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .single();

    if (data?.value) {
      const parsed = JSON.parse(data.value as string);
      return NextResponse.json({ exercises: parsed });
    }
  } catch {
    // fall through to default
  }

  return NextResponse.json({ exercises: ANCORE_DATA });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.nume?.trim()) return NextResponse.json({ error: "Numele este obligatoriu" }, { status: 400 });

  try {
    const serviceClient = createServiceClient() as any;
    const { data: existing } = await serviceClient
      .from("settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .single();

    let exercises = existing?.value ? JSON.parse(existing.value as string) : [...ANCORE_DATA];

    const newId = `M-${String(Date.now()).slice(-6)}`;
    const newExercise = { ...body, id: newId };
    exercises = [...exercises, newExercise];

    await serviceClient.from("settings").upsert({ key: SETTINGS_KEY, value: JSON.stringify(exercises) });
    return NextResponse.json({ exercise: newExercise });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
