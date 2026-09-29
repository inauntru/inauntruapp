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

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MediaUploadField({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isStored = value.startsWith("storage:");
  const storedName = isStored ? value.slice("storage:".length).split("/").pop() : "";
  const isVideo = isStored ? value.includes("video/") : /\.(mp4|webm|mov)(\?|$)/i.test(value);

  function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setProgress(0);

    // XMLHttpRequest, nu fetch — avem nevoie de progres la fișierele mari
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.value) onChange(data.value);
        else setError(data.error ?? "Încărcarea a eșuat");
      } catch {
        setError("Încărcarea a eșuat");
      }
    });
    xhr.addEventListener("error", () => {
      setUploading(false);
      setError("Încărcarea a eșuat — verifică legătura la internet");
    });

    xhr.open("POST", "/api/admin/upload-media");
    xhr.send(fd);
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
