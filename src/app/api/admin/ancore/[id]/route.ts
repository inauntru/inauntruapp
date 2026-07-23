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

async function getExercises() {
  const serviceClient = createServiceClient() as any;
  const { data } = await serviceClient
    .from("settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .single();
  return data?.value ? JSON.parse(data.value as string) : [...ANCORE_DATA];
}

async function saveExercises(exercises: unknown[]) {
  const serviceClient = createServiceClient() as any;
  await serviceClient.from("settings").upsert({ key: SETTINGS_KEY, value: JSON.stringify(exercises) });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const exercises = await getExercises();
    const idx = exercises.findIndex((e: { id: string }) => e.id === id);
    if (idx === -1) return NextResponse.json({ error: "Exercițiu negăsit" }, { status: 404 });
    exercises[idx] = { ...exercises[idx], ...body, id };
    await saveExercises(exercises);
    return NextResponse.json({ exercise: exercises[idx] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const exercises = await getExercises();
    const filtered = exercises.filter((e: { id: string }) => e.id !== id);
    if (filtered.length === exercises.length) return NextResponse.json({ error: "Exercițiu negăsit" }, { status: 404 });
    await saveExercises(filtered);

    const { logAdminAction } = await import("@/lib/audit");
    await logAdminAction("Ștergere ancoră", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
