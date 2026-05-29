"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SpeakerHigh, SpeakerLow, SpeakerNone, Headphones, VideoCamera } from "@phosphor-icons/react";

const WAVEFORM = [30,45,60,40,72,55,80,48,35,62,75,50,42,68,85,60,44,70,52,38,63,82,56,72,46,34,60,50,78,42,55,30,48,65,80,55,40,70,52,36];

interface Props {
  title: string;
  duration: number;
  isPremium: boolean;
  mediaType?: "audio" | "video";
}

export default function PracticePlayer({ title, duration, isPremium, mediaType = "audio" }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalSeconds = duration * 60;

  useEffect(() => {
    if (playing) {
      window.dispatchEvent(new Event("practiceplay"));
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setPlaying(false); return 0; }
          return p + 100 / totalSeconds;
        });
      }, 1000);
    } else {
      window.dispatchEvent(new Event("practicestop"));
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, totalSeconds]);

  const elapsed = Math.floor((progress / 100) * totalSeconds);
  const remaining = totalSeconds - elapsed;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const VolumeIcon = volume === 0 ? SpeakerNone : volume < 50 ? SpeakerLow : SpeakerHigh;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2E1A 0%, #2D5240 50%, #0F2E1A 100%)" }}>
      {/* Top bar */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-2">
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          {mediaType === "video"
            ? <VideoCamera size={14} weight="fill" className="text-white/70" />
            : <Headphones size={14} weight="fill" className="text-white/70" />
          }
        </div>
        <p className="font-ui text-label-xs text-white/50 uppercase tracking-widest">
          {mediaType === "video" ? "Practică video" : "Practică audio"} · {duration} min
        </p>
        {isPremium && (
          <span className="ml-auto font-ui text-label-xs text-amber-300/80 bg-amber-300/10 px-2 py-0.5 rounded-full">Premium</span>
        )}
      </div>

      {/* Title */}
      <div className="px-6 pb-4">
        <h3 className="font-heading text-lg text-white leading-snug">{title}</h3>
      </div>

      {/* Waveform */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-[3px] h-14">
          {WAVEFORM.map((h, i) => {
            const pct = (i / WAVEFORM.length) * 100;
            const active = pct <= progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-150"
                style={{
                  height: `${h}%`,
                  background: active
                    ? "rgba(149, 212, 177, 0.9)"
                    : "rgba(255,255,255,0.15)",
                  transform: playing && active ? `scaleY(${1 + Math.sin(Date.now() / 200 + i) * 0.1})` : "scaleY(1)",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-2">
        <div
          className="relative h-1 bg-white/15 rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          <div
            className="absolute left-0 top-0 h-full bg-primary-fixed-dim rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-ui text-[11px] text-white/40">{fmt(elapsed)}</span>
          <span className="font-ui text-[11px] text-white/40">-{fmt(remaining)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-6 flex items-center justify-between">
        {/* Volume */}
        <div className="flex items-center gap-2 w-32">
          <button
            onClick={() => setVolume(v => v === 0 ? 80 : 0)}
            className="text-white/50 hover:text-white transition-colors"
          >
            <VolumeIcon size={18} />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 accent-primary-fixed-dim cursor-pointer"
          />
        </div>

        {/* Play/Pause */}
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-14 h-14 rounded-full bg-forest-green hover:bg-forest-green/80 flex items-center justify-center shadow-button transition-all hover:scale-105 active:scale-95"
        >
          {playing
            ? <Pause size={24} weight="fill" className="text-white" />
            : <Play size={24} weight="fill" className="text-white ml-0.5" />
          }
        </button>

        {/* Spacer symmetric */}
        <div className="w-32" />
      </div>
    </div>
  );
}
