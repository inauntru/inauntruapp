"use client";

/**
 * Câmp de imagine pentru admin: poți lipi un link SAU urca o poză din calculator
 * (butonul „Urcă"). Fișierul ajunge în Supabase Storage, iar câmpul primește
 * automat URL-ul public. Cu previzualizare.
 */

import { useRef, useState } from "react";
import { UploadSimple, CircleNotch, X } from "@phosphor-icons/react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  inputClassName?: string;
}

export default function ImageUploadField({ value, onChange, inputClassName = "input" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Încărcarea a eșuat");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Încărcarea a eșuat");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="url"
          className={`${inputClassName} flex-1`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... sau apasă Urcă"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn btn-secondary btn-sm gap-1.5 flex-shrink-0 disabled:opacity-50"
        >
          {uploading ? <CircleNotch size={14} className="animate-spin" /> : <UploadSimple size={14} weight="bold" />}
          {uploading ? "Se urcă..." : "Urcă"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <p className="font-body text-label-xs text-red-600 mt-1.5">{error}</p>}
      {value && !error && (
        <div className="relative mt-2 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Previzualizare" className="h-20 rounded-lg object-cover border border-sage-border" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Șterge imaginea"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-deep-green text-white flex items-center justify-center hover:bg-forest-green"
          >
            <X size={11} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
