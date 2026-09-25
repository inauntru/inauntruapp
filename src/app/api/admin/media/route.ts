import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

const BUCKET = "media";

export interface MediaFile {
  path: string;
  name: string;
  size: number;
  createdAt: string | null;
  url: string;
}

/**
 * GET /api/admin/media — toate imaginile urcate, cele mai noi primele.
 *
 * Fișierele stau în `images/AAAA-LL/`, deci parcurgem întâi dosarele lunii.
 * Supabase Storage nu are listare recursivă, de aceea cele două treceri.
 */
export async function GET() {
  const { requireAdmin } = await import("@/lib/admin-auth");
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const store = service.storage.from(BUCKET);
  const files: MediaFile[] = [];

  const add = (prefix: string, entry: { name: string; created_at?: string | null; metadata?: { size?: number } | null }) => {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    files.push({
      path,
      name: entry.name,
      size: entry.metadata?.size ?? 0,
      createdAt: entry.created_at ?? null,
      url: store.getPublicUrl(path).data.publicUrl,
    });
  };

  const { data: months, error } = await store.list("images", { limit: 200, sortBy: { column: "name", order: "desc" } });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const entry of months ?? []) {
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
  return NextResponse.json({ files });
}

/** DELETE /api/admin/media — șterge definitiv un fișier din bibliotecă. */
export async function DELETE(req: NextRequest) {
  const { requireAdmin } = await import("@/lib/admin-auth");
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let path = "";
  try {
    const body = await req.json();
    path = typeof body?.path === "string" ? body.path : "";
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }
  // Nu lăsăm ștergerea să iasă din zona imaginilor
  if (!path || path.includes("..") || !path.startsWith("images/")) {
    return NextResponse.json({ error: "Cale invalidă" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service.storage.from(BUCKET).remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Ștergere imagine", path, {});

  return NextResponse.json({ ok: true });
}
