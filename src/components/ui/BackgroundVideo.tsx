"use client";

/**
 * Video de fundal robust pe mobil.
 *
 * iOS blochează autoplay-ul în modul Economisire baterie (și uneori la primul
 * load) și afișează un buton nativ de play peste video. Aici: forțăm muted +
 * play() din cod, iar dacă redarea e refuzată, afișăm în loc imaginea statică
 * (poster) — fără butonul de play.
 */

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  poster: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function BackgroundVideo({ src, poster, className, style }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // React nu scrie mereu atributul `muted` în HTML — îl setăm direct pe element
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;

    let active = true;
    const tryPlay = () => {
      el.play().then(
        () => { if (active) setBlocked(false); },
        () => { if (active) setBlocked(true); }
      );
    };
    tryPlay();
    // La prima atingere mai încercăm o dată (iOS permite redarea după interacțiune)
    const onTouch = () => tryPlay();
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    return () => { active = false; window.removeEventListener("touchstart", onTouch); };
  }, []);

  return (
    <>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        aria-hidden
        className={className}
        style={{ ...style, ...(blocked ? { opacity: 0 } : {}) }}
      >
        <source src={src} type="video/mp4" />
      </video>
      {blocked && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden className={className} style={style} />
      )}
    </>
  );
}
