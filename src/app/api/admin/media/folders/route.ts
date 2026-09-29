/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { readFolders, writeFolders, cleanFolderName } from "@/lib/media-folders";

export const runtime = "nodejs";

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

/** POST /api/admin/media/folders — dosar nou în bibliotecă. */
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = cleanFolderName(body?.name);
  if (!name) return NextResponse.json({ error: "Numele dosarului e gol" }, { status: 400 });

  const service = createServiceClient() as any;
  const state = await readFolders(service);
  if (state.folders.some((f) => f.toLowerCase() === name.toLowerCase())) {
    return NextResponse.json({ error: "Există deja un dosar cu numele ăsta" }, { status: 400 });
  }
  state.folders.push(name);
  state.folders.sort((a, b) => a.localeCompare(b, "ro"));
  await writeFolders(service, state);

  return NextResponse.json({ ok: true, folders: state.folders });
}

/**
 * DELETE /api/admin/media/folders — șterge dosarul, nu și pozele.
 * Imaginile din el rămân în bibliotecă și trec la „Nesortate".
 */
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = cleanFolderName(body?.name);
  if (!name) return NextResponse.json({ error: "Nume invalid" }, { status: 400 });

  const service = createServiceClient() as any;
  const state = await readFolders(service);
  state.folders = state.folders.filter((f) => f !== name);
  for (const [path, folder] of Object.entries(state.assign)) {
    if (folder === name) delete state.assign[path];
  }
  await writeFolders(service, state);

  return NextResponse.json({ ok: true, folders: state.folders });
}
