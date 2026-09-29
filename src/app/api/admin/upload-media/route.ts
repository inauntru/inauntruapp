import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

/** Bucket PRIVAT — fișierele nu se pot deschide fără link semnat. */
const BUCKET = "practice-media";

const ALLOWED: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/webm": "weba",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/** Plafonul spațiului de stocare (planul Supabase). */
const MAX_BYTES = 50 * 1024 * 1024;

/**
 * POST /api/admin/upload-media — pregătește o încărcare directă în Supabase.
 *
 * Fișierul NU trece prin serverul nostru: funcțiile de pe Vercel au o limită
 * mică pe corpul cererii, iar un audio de zeci de MB pica înainte să ajungă
 * aici. Așa că întoarcem un link de încărcare semnat, iar browserul trimite
 * fișierul direct la Supabase.
 */
export async function POST(req: NextRequest) {
  const { requireAdmin } = await import("@/lib/admin-auth");
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const fileType = typeof body?.fileType === "string" ? body.fileType : "";
  const fileSize = Number(body?.fileSize) || 0;

  const ext = ALLOWED[fileType];
  if (!ext) {
    return NextResponse.json(
      { error: "Format neacceptat — folosește MP3, WAV, M4A, AAC, OGG pentru audio sau MP4, WebM, MOV pentru video" },
      { status: 400 }
    );
  }
  if (fileSize > MAX_BYTES) {
    const mb = (fileSize / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      { error: `Fișierul are ${mb}MB, iar planul curent de stocare acceptă maximum 50MB per fișier.` },
      { status: 413 }
    );
  }

  const safeName = fileName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "practica";
  const kind = fileType.startsWith("video/") ? "video" : "audio";
  const path = `${kind}/${safeName}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const service = createServiceClient();
  const { data, error } = await service.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Nu am putut pregăti încărcarea" }, { status: 500 });
  }

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Încărcare fișier practică", path, { size: fileSize, type: fileType });

  // „storage:" marchează fișierele din spațiul privat, ca să le deosebim de linkuri externe
  return NextResponse.json({
    ok: true,
    bucket: BUCKET,
    path,
    token: data.token,
    value: `storage:${path}`,
    kind,
  });
}
