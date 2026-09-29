import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

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

const MAX_BYTES = 50 * 1024 * 1024; // limita spațiului de stocare

/**
 * POST /api/admin/upload-media — urcă fișierul unei practici în spațiul privat.
 *
 * Întoarce CALEA din stocare, nu o adresă publică: redarea se face prin
 * /api/practices/[id]/media, care verifică abonamentul și semnează un link
 * temporar. Așa conținutul plătit chiar rămâne în spatele abonamentului.
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
    return NextResponse.json(
      { error: "Format neacceptat — folosește MP3, WAV, M4A, AAC, OGG pentru audio sau MP4, WebM, MOV pentru video" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    const mb = Math.round(file.size / (1024 * 1024));
    return NextResponse.json(
      { error: `Fișierul are ${mb}MB, iar limita e de 50MB. Împarte-l sau exportă-l puțin mai mic.` },
      { status: 400 }
    );
  }

  const safeName = file.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "practica";
  const kind = file.type.startsWith("video/") ? "video" : "audio";
  const path = `${kind}/${safeName}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const service = createServiceClient();
  const { error } = await service.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logAdminAction } = await import("@/lib/audit");
  await logAdminAction("Încărcare fișier practică", path, { size: file.size, type: file.type });

  // „storage:" marchează fișierele din spațiul privat, ca să le deosebim de linkuri externe
  return NextResponse.json({ ok: true, value: `storage:${path}`, kind });
}
