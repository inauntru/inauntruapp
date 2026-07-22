import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

const SETTINGS_KEY = "ancore_exercises";

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { exercises } = await req.json();
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json({ error: "Lista de exerciții este goală sau invalidă" }, { status: 400 });
  }

  // Validate each exercise has at minimum an id and nume
  for (const ex of exercises) {
    if (!ex.id || !ex.nume) {
      return NextResponse.json({ error: `Exercițiu invalid (lipsesc id sau nume): ${JSON.stringify(ex).slice(0, 100)}` }, { status: 400 });
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceClient = createServiceClient() as any;
    await serviceClient.from("settings").upsert({ key: SETTINGS_KEY, value: JSON.stringify(exercises) });
    return NextResponse.json({ ok: true, count: exercises.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
