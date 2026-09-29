"use client";

/**
 * Playerul practicii — redă fișierul real.
 *
 * Adresa nu vine din pagină, ci de la /api/practices/[id]/media, care verifică
 * abonamentul și semnează un link temporar. Dacă practica are link extern
 * (Vimeo, YouTube), îl arătăm în cadrul lor.
 *
 * Finalizarea se înregistrează o singură dată pe redare, la 90% din durată —
 * suficient cât să însemne că practica chiar a fost parcursă.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Play, Pause, SpeakerHigh, SpeakerLow, SpeakerNone,
  Headphones, VideoCamera, Lock, CircleNotch, Warning,
} from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";

const WAVEFORM = [30,45,60,40,72,55,80,48,35,62,75,50,42,68,85,60,44,70,52,38,63,82,56,72,46,34,60,50,78,42,55,30,48,65,80,55,40,70,52,36];

interface Props {
  title: string;
  duration: number;
  isPremium: boolean;
  mediaType?: "audio" | "video";
  practiceId?: number;
  locked?: boolean;
}

/** Linkurile de Vimeo/YouTube se redau în cadrul lor, nu în playerul nostru. */
function embedUrl(url: string): string | null {
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?color=2B8C5C&title=0&byline=0&portrait=0`;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  return null;
}

export default function PracticePlayer({ title, duration, isPremium, mediaType = "audio", practiceId, locked = false }: Props) {
  const { tr } = useLanguage();
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const completedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(duration * 60);
  const [src, setSrc] = useState<string | null>(null);
  const [embed, setEmbed] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const progress = total > 0 ? (current / total) * 100 : 0;
  const remaining = Math.max(0, total - current);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const VolumeIcon = volume === 0 ? SpeakerNone : volume < 50 ? SpeakerLow : SpeakerHigh;

  /** Cerem adresa abia când omul vrea să asculte — linkul semnat are viață scurtă. */
  const ensureSource = useCallback(async () => {
    if (src || embed || !practiceId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/practices/${practiceId}/media`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nu am putut porni practica");
      const asEmbed = data.external ? embedUrl(data.url) : null;
      if (asEmbed) setEmbed(asEmbed);
      else setSrc(data.url);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Nu am putut porni practica");
    }
    setLoading(false);
  }, [src, embed, practiceId]);

  async function toggle() {
    if (!src && !embed) {
      await ensureSource();
      setPlaying(true); // redarea pornește în efectul de mai jos, când sursa e gata
      return;
    }
    setPlaying((p) => !p);
  }

  // Pornire/oprire efectivă + oprirea muzicii de fundal a site-ului
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (playing) {
      window.dispatchEvent(new Event("practiceplay"));
      el.play().catch(() => setPlaying(false));
    } else {
      window.dispatchEvent(new Event("practicestop"));
      el.pause();
    }
  }, [playing, src]);

  useEffect(() => {
    if (mediaRef.current) mediaRef.current.volume = volume / 100;
  }, [volume, src]);

  /** Marcăm practica drept parcursă la 90% — o singură dată pe redare. */
  function handleTimeUpdate() {
    const el = mediaRef.current;
    if (!el) return;
    setCurrent(el.currentTime);
    if (!completedRef.current && el.duration && el.currentTime / el.duration >= 0.9 && practiceId) {
      completedRef.current = true;
      fetch("/api/practices/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceId, durationMinutes: Math.round(el.duration / 60) }),
      }).catch(() => {});
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = mediaRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration;
    setCurrent(el.currentTime);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2E1A 0%, #2D5240 50%, #0F2E1A 100%)" }}>
      {/* Bara de sus */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-2">
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          {mediaType === "video"
            ? <VideoCamera size={14} weight="fill" className="text-white/70" />
            : <Headphones size={14} weight="fill" className="text-white/70" />}
        </div>
        <p className="font-ui text-label-xs text-white/50 uppercase tracking-widest">
          {mediaType === "video" ? tr("Practică video") : tr("Practică audio")} · {duration} min
        </p>
        {isPremium && (
          <span className="ml-auto font-ui text-label-xs text-amber-300/80 bg-amber-300/10 px-2 py-0.5 rounded-full">Premium</span>
        )}
      </div>

      <div className="px-6 pb-4">
        <h3 className="font-heading text-lg text-white leading-snug">{title}</h3>
      </div>

      {locked ? (
        <div className="px-6 pb-8 pt-2 text-center">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} weight="fill" className="text-amber-300/90" />
          </div>
          <p className="font-body text-body-sm text-white/70 mb-5 max-w-xs mx-auto">
            {tr("Această practică face parte din conținutul premium. Abonează-te pentru acces nelimitat.")}
          </p>
          <Link href="/preturi" className="btn btn-primary btn-sm shadow-button">
            {tr("Vezi abonamentele")}
          </Link>
        </div>
      ) : embed ? (
        /* Link extern — cadrul furnizorului */
        <div className="px-6 pb-6">
          <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={embed}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Elementul care redă efectiv */}
          {src && (mediaType === "video" ? (
            <div className="px-6 pb-4">
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={src}
                className="w-full rounded-xl bg-black"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setTotal(e.currentTarget.duration || duration * 60)}
                onEnded={() => setPlaying(false)}
                onError={() => setLoadError(tr("Fișierul nu a putut fi redat"))}
                playsInline
              />
            </div>
          ) : (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={src}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => setTotal(e.currentTarget.duration || duration * 60)}
              onEnded={() => setPlaying(false)}
              onError={() => setLoadError(tr("Fișierul nu a putut fi redat"))}
              preload="metadata"
            />
          ))}

          {/* Unda sonoră — doar la audio */}
          {mediaType !== "video" && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-[3px] h-14">
                {WAVEFORM.map((h, i) => {
                  const active = (i / WAVEFORM.length) * 100 <= progress;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all duration-150"
                      style={{
                        height: `${h}%`,
                        background: active ? "rgba(149, 212, 177, 0.9)" : "rgba(255,255,255,0.15)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Bara de progres */}
          <div className="px-6 pb-2">
            <div className="relative h-1 bg-white/15 rounded-full cursor-pointer" onClick={seek}>
              <div className="absolute left-0 top-0 h-full bg-primary-fixed-dim rounded-full" style={{ width: `${progress}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" style={{ left: `calc(${progress}% - 6px)` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="font-ui text-[11px] text-white/40">{fmt(current)}</span>
              <span className="font-ui text-[11px] text-white/40">-{fmt(remaining)}</span>
            </div>
          </div>

          {loadError && (
            <p className="px-6 pb-2 font-body text-label-xs text-amber-300/90 flex items-center gap-1.5">
              <Warning size={13} /> {loadError}
            </p>
          )}

          {/* Controale */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 w-32">
              <button onClick={() => setVolume((v) => (v === 0 ? 80 : 0))} className="text-white/50 hover:text-white transition-colors">
                <VolumeIcon size={18} />
              </button>
              <input
                type="range" min={0} max={100} value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1 accent-primary-fixed-dim cursor-pointer"
                aria-label={tr("Volum")}
              />
            </div>

            <button
              onClick={toggle}
              disabled={loading}
              aria-label={playing ? tr("Pauză") : tr("Redă")}
              className="w-14 h-14 rounded-full bg-forest-green hover:bg-forest-green/80 flex items-center justify-center shadow-button transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
            >
              {loading
                ? <CircleNotch size={22} className="animate-spin text-white" />
                : playing
                  ? <Pause size={24} weight="fill" className="text-white" />
                  : <Play size={24} weight="fill" className="text-white ml-0.5" />}
            </button>

            <div className="w-32" />
          </div>
        </>
      )}
    </div>
  );
}
