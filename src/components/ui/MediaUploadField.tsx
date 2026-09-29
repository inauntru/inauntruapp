"use client";

/**
 * Fișierul unei practici: îl urci de pe calculator SAU lipești un link, dacă e
 * deja online (Vimeo, YouTube, sau o adresă directă către fișier).
 *
 * Ce urci ajunge într-un spațiu PRIVAT și se salvează ca „storage:cale".
 * Redarea trece prin /api/practices/[id]/media, care verifică abonamentul și
 * semnează un link temporar — de asta fișierul nu poate fi luat și dat mai departe.
 */

import { useRef, useState } from "react";
import { UploadSimple, CircleNotch, X, LinkSimple, FileAudio, FileVideo, Lock } from "@phosphor-icons/react";

interface MediaMeta {
  /** Durata fisierului, rotunjita la minute. */
  durationMin?: number;
  kind?: "audio" | "video";
}

interface Props {
  value: string;
  onChange: (value: string, meta?: MediaMeta) => void;
}

/**
 * Citeste durata fisierului inainte de incarcare, fara sa-l trimita nicaieri:
 * browserul deschide doar antetul si ne spune cate secunde are.
 */
function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
    el.preload = "metadata";
    const done = (value: number | null) => { URL.revokeObjectURL(url); resolve(value); };
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? el.duration : null);
    el.onerror = () => done(null);
    el.src = url;
  });
}

export default function MediaUploadField({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isStored = value.startsWith("storage:");
  const storedName = isStored ? value.slice("storage:".length).split("/").pop() : "";
  const isVideo = isStored ? value.includes("video/") : /\.(mp4|webm|mov)(\?|$)/i.test(value);

  /**
   * Incarcarea merge DIRECT la Supabase, nu prin serverul nostru: functiile de
   * pe Vercel au o limita mica pe corpul cererii, iar un audio de zeci de MB
   * pica inainte sa ajunga acolo. Serverul doar semneaza dreptul de incarcare.
   */
  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const seconds = await readDuration(file);

      const prep = await fetch("/api/admin/upload-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
      });
      const info = await prep.json();
      if (!prep.ok) throw new Error(info.error ?? "Incarcarea a esuat");

      const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/upload/sign/${info.bucket}/${info.path}?token=${info.token}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(xhr.status === 413 ? "Fisierul e prea mare pentru planul curent" : "Incarcarea a esuat"));
        });
        xhr.addEventListener("error", () => reject(new Error("Incarcarea a esuat — verifica legatura la internet")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      onChange(info.value, {
        durationMin: seconds ? Math.max(1, Math.round(seconds / 60)) : undefined,
        kind: info.kind,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Incarcarea a esuat");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      {/* Fișier urcat */}
      {isStored ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-light-green border border-sage-border">
          {isVideo
            ? <FileVideo size={20} weight="duotone" className="text-forest-green flex-shrink-0" />
            : <FileAudio size={20} weight="duotone" className="text-forest-green flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="font-body text-body-sm text-deep-green truncate">{storedName}</p>
            <p className="font-body text-label-xs text-secondary-text flex items-center gap-1">
              <Lock size={10} weight="fill" /> în spațiul privat — se redă doar cu abonamentul potrivit
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Scoate fișierul"
            className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-secondary-text hover:text-terracotta flex-shrink-0"
          >
            <X size={13} weight="bold" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkSimple size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
              <input
                type="text"
                className="input w-full !pl-9"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Lipește un link (Vimeo, YouTube, adresă directă) sau apasă Urcă"
              />
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn btn-secondary btn-sm gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              {uploading ? <CircleNotch size={14} className="animate-spin" /> : <UploadSimple size={14} weight="bold" />}
              {uploading ? `${progress}%` : "Urcă"}
            </button>
          </div>

          {uploading && (
            <div className="h-1.5 bg-light-green rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-forest-green rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          )}
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {error && <p className="font-body text-label-xs text-red-600 mt-1.5">{error}</p>}

      {!value && !uploading && !error && (
        <p className="font-body text-label-xs text-secondary-text mt-1.5">
          Audio: MP3, WAV, M4A, AAC, OGG · Video: MP4, WebM, MOV · maximum 50MB
        </p>
      )}
    </div>
  );
}
