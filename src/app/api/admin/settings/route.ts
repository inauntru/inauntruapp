/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authenticated";
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();
  const { data } = await (serviceClient as any).from("settings").select("key, value");
  const map: Record<string, unknown> = {};
  for (const row of (data ?? [])) map[row.key] = row.value;
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { key: string; value: unknown };
  if (!body.key) return NextResponse.json({ error: "key este obligatoriu" }, { status: 400 });

  const serviceClient = createServiceClient();
  const { error } = await (serviceClient as any)
    .from("settings")
    .upsert({ key: body.key, value: body.value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
