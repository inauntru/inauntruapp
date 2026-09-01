import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_BYTES = 8 * 1024 * 1024; // 8MB — suficient pentru orice copertă

/**
 * POST /api/admin/upload — urcă o imagine în Supabase Storage (bucket public
 * „media") și întoarce URL-ul public, gata de pus în image_url.
 */
export async function POST(req: NextRequest) {
  const { requireAdmin } = await import("@/lib/admin-auth");
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Niciun fișier primit" }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format neacceptat — folosește JPG, PNG, WebP, GIF sau AVIF" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imaginea depășește 8MB — micșoreaz-o și încearcă din nou" }, { status: 400 });
  }

  const safeName = file.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "imagine";
  const month = new Date().toISOString().slice(0, 7); // ex. 2026-09
  const path = `images/${month}/${safeName}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const service = createServiceClient();
  const { error } = await service.storage
    .from("media")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = service.storage.from("media").getPublicUrl(path);

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Încărcare imagine", path, { size: file.size, type: file.type });

  return NextResponse.json({ ok: true, url: data.publicUrl });
}
