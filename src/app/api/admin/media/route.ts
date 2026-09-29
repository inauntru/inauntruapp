/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { readFolders, writeFolders } from "@/lib/media-folders";

export const runtime = "nodejs";

const BUCKET = "media";
const PLACEHOLDER = ".emptyFolderPlaceholder";

interface MediaFile {
  path: string;
  name: string;
  size: number;
  createdAt: string | null;
  url: string;
  folder: string | null;
}

async function requireAdmin() {
  const { requireAdmin: check } = await import("@/lib/admin-auth");
  return (await check()) !== null;
}

/**
 * GET /api/admin/media — imaginile urcate și dosarele existente.
 * Storage nu are listare recursivă, de aceea parcurgem întâi subdosarele.
 */
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient() as any;
  const store = service.storage.from(BUCKET);
  const state = await readFolders(service);
  const files: MediaFile[] = [];

  const add = (prefix: string, entry: { name: string; created_at?: string | null; metadata?: { size?: number } | null }) => {
    if (entry.name === PLACEHOLDER) return;
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    files.push({
      path,
      name: entry.name,
      size: entry.metadata?.size ?? 0,
      createdAt: entry.created_at ?? null,
      url: store.getPublicUrl(path).data.publicUrl,
      folder: state.assign[path] ?? null,
    });
  };

  const { data: subfolders, error } = await store.list("images", { limit: 200, sortBy: { column: "name", order: "desc" } });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const entry of subfolders ?? []) {
    if (entry.id !== null) { add("images", entry); continue; } // fișier direct în images/
    const { data: inner } = await store.list(`images/${entry.name}`, {
      limit: 1000,
      sortBy: { column: "created_at", order: "desc" },
    });
    for (const file of inner ?? []) {
      if (file.id === null) continue;
      add(`images/${entry.name}`, file);
    }
  }

  files.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({ files, folders: state.folders });
}

/** PUT /api/admin/media — mută o imagine într-un dosar (sau o scoate din dosare). */
export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let path = "", folder: string | null = null;
  try {
    const body = await req.json();
    path = typeof body?.path === "string" ? body.path : "";
    folder = typeof body?.folder === "string" && body.folder ? body.folder : null;
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }
  if (!path.startsWith("images/")) return NextResponse.json({ error: "Cale invalidă" }, { status: 400 });

  const service = createServiceClient() as any;
  const state = await readFolders(service);
  if (folder && !state.folders.includes(folder)) {
    return NextResponse.json({ error: "Dosarul nu există" }, { status: 400 });
  }
  if (folder) state.assign[path] = folder;
  else delete state.assign[path];
  await writeFolders(service, state);

  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/media — șterge definitiv o imagine. */
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let path = "";
  try {
    const body = await req.json();
    path = typeof body?.path === "string" ? body.path : "";
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }
  if (!path || path.includes("..") || !path.startsWith("images/")) {
    return NextResponse.json({ error: "Cale invalidă" }, { status: 400 });
  }

  const service = createServiceClient() as any;
  const { error } = await service.storage.from(BUCKET).remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // curățăm și apartenența la dosar, să nu rămână urme
  const state = await readFolders(service);
  if (state.assign[path]) {
    delete state.assign[path];
    await writeFolders(service, state);
  }

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Ștergere imagine", path, {});

  return NextResponse.json({ ok: true });
}
