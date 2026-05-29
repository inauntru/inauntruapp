"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MusicNote, MusicNoteSimple } from "@phosphor-icons/react";

const VOLUME = 0.15;
const START_SECONDS = 10;

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [pausedByPractice, setPausedByPractice] = useState(false);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;
    try {
      await audio.play();
      setPlaying(true);
    } catch {}
  }, []);

  // First user interaction — start music
  useEffect(() => {
    const start = () => {
      setReady(true);
      tryPlay();
      document.removeEventListener("click", start);
      document.removeEventListener("touchstart", start);
    };
    document.addEventListener("click", start);
    document.addEventListener("touchstart", start);
    return () => {
      document.removeEventListener("click", start);
      document.removeEventListener("touchstart", start);
    };
  }, [tryPlay]);

  // Pause/resume when practice player starts/stops
  useEffect(() => {
    const onPracticePlay = () => {
      if (playing) {
        audioRef.current?.pause();
        setPlaying(false);
        setPausedByPractice(true);
      }
    };
    const onPracticeStop = () => {
      if (pausedByPractice) {
        setPausedByPractice(false);
        tryPlay();
      }
    };
    window.addEventListener("practiceplay", onPracticePlay);
    window.addEventListener("practicestop", onPracticeStop);
    return () => {
      window.removeEventListener("practiceplay", onPracticePlay);
      window.removeEventListener("practicestop", onPracticeStop);
    };
  }, [playing, pausedByPractice, tryPlay]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      setPausedByPractice(false);
    } else {
      tryPlay();
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/ambient-music.mp3"
        loop
        preload="none"
        onCanPlay={() => {
          const audio = audioRef.current;
          if (audio && audio.currentTime < START_SECONDS) {
            audio.currentTime = START_SECONDS;
          }
        }}
      />

      <button
        onClick={toggle}
        title={playing ? "Oprește muzica ambientală" : "Pornește muzica ambientală"}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-sage-border hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        {/* Animated bars when playing */}
        {playing ? (
          <span className="flex items-end gap-[2px] h-4">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-forest-green"
                style={{
                  height: "100%",
                  animation: `musicBar ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                  transformOrigin: "bottom",
                }}
              />
            ))}
          </span>
        ) : (
          <MusicNoteSimple size={14} weight="fill" className="text-secondary-text" />
        )}
        <span className={`font-body text-[11px] font-medium transition-colors ${playing ? "text-forest-green" : "text-secondary-text"}`}>
          {playing ? "Ambianță" : "Pornește muzica"}
        </span>
      </button>

      <style>{`
        @keyframes musicBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
}
