"use client";

/**
 * Video de fundal robust pe mobil.
 *
 * iOS blochează autoplay-ul în modul Economisire baterie (și uneori la primul
 * load) și afișează un buton nativ de play peste video. Aici: forțăm muted +
 * play() din cod, iar dacă redarea e refuzată, afișăm în loc imaginea statică
 * (poster) — fără butonul de play.
 *
 * Cu `lazy`, fișierul nu se descarcă deloc până când secțiunea nu se apropie de
 * ecran. Contează: videoul din mijlocul primei pagini are zeci de MB și altfel
 * se descărca odată cu pagina, chiar dacă vizitatorul nu ajungea niciodată la el.
 */

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  poster: string;
  className?: string;
  style?: React.CSSProperties;
  /** Pentru secțiunile de mai jos: încarcă videoul abia când se apropie de ecran. */
  lazy?: boolean;
}

export default function BackgroundVideo({ src, poster, className, style, lazy = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  // Așteaptă ca secțiunea să se apropie de ecran înainte să ceară fișierul
  useEffect(() => {
    if (!lazy || shouldLoad) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      // Pornește încărcarea puțin înainte să ajungă la el, ca să nu se vadă saltul
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy, shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;
    const el = ref.current;
    if (!el) return;

    // React nu scrie mereu atributul `muted` în HTML — îl setăm direct pe element
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;

    // Sursa a fost adăugată abia acum, deci elementul trebuie să o recitească
    if (lazy) el.load();

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
  }, [shouldLoad, lazy]);

  return (
    <>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        // "metadata" în loc de "auto": browserul nu mai trage tot fișierul dintr-o dată
        preload="metadata"
        poster={poster}
        aria-hidden
        className={className}
        style={{ ...style, ...(blocked ? { opacity: 0 } : {}) }}
      >
        {shouldLoad && <source src={src} type="video/mp4" />}
      </video>
      {blocked && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden className={className} style={style} />
      )}
    </>
  );
}
