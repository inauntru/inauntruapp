"use client";

/**
 * „Respiră" — experiența de respirație ghidată (macheta within-breathing-menu_2).
 * Modal pe tot ecranul: meniu cu 5 tehnici + durate, apoi sesiunea cu orbul
 * animat (nori, fum, aur), inel de progres și enso-ul WithIN în centru
 * (tap pe enso = pauză/continuă). Adaptat la brand: fonturi Sentient/Inter,
 * verdele WithIN; roze/cremul orbului rămân ilustrative, ca în machetă.
 *
 * Animația e portată 1:1 din machetă — imperativă, pe stiluri inline, pentru
 * tranzițiile sincronizate cu fazele respirației (React state ar re-randa
 * exact în mijlocul tranzițiilor).
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Technique {
  id: string;
  phases: [string, number][];
  name: string;
  desc: string;
}

const TECHNIQUES: Technique[] = [
  { id: "calm", phases: [["in", 4], ["hold", 4], ["out", 6]],              name: "Relaxare",  desc: "4·4·6 — liniștește sistemul nervos" },
  { id: "box",  phases: [["in", 4], ["hold", 4], ["out", 4], ["hold", 4]], name: "Echilibru", desc: "4·4·4·4 — focus și claritate" },
  { id: "478",  phases: [["in", 4], ["hold", 7], ["out", 8]],              name: "Somn",      desc: "4·7·8 — pentru adormit ușor" },
  { id: "coh",  phases: [["in", 5], ["out", 5]],                           name: "Coerență",  desc: "5·5 — ritm cardiac echilibrat" },
  { id: "wake", phases: [["in", 6], ["out", 2]],                           name: "Trezire",   desc: "6·2 — energie de dimineață" },
];

const DURATIONS = [2, 3, 5, 10];
const PROG_C = 942.48;

/**
 * Melodiile sesiunii (în `public/`). Alegem după durată, iar piesa rulează în
 * buclă — la 10 min se reia cea de 5. Lipsa fișierului nu strică sesiunea.
 */
const BREATH_TRACKS = { short: "/breathing-3min.mp3", long: "/breathing-5min.mp3" };
const trackFor = (min: number) => (min <= 3 ? BREATH_TRACKS.short : BREATH_TRACKS.long);
const BREATH_VOLUME = 0.18;
/** Numărătoarea inversă dinainte de pornire. */
const COUNTDOWN_FROM = 3;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Apelat când o sesiune chiar începe — „am încercat respirațiile azi". */
  onSessionStarted?: () => void;
}

export default function BreathingModal({ isOpen, onClose, onSessionStarted }: Props) {
  const { tr } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  /** Telefon/touch: renunțăm la efectele scumpe (blur animat, fum) — altfel sacadează. */
  const liteRef = useRef(false);
  const [view, setView] = useState<"menu" | "session">("menu");
  const [durationMin, setDurationMin] = useState(3);
  /** Sesiunea nu pornește singură — utilizatorul apasă „Începe" (sau enso-ul). */
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  /** 3 · 2 · 1 înainte de prima inspirație; null = nu numărăm acum. */
  const [countdown, setCountdown] = useState<number | null>(null);
  const trackRef = useRef<HTMLAudioElement>(null);

  // Etichetele fazelor pentru codul imperativ (mereu cu traducerea curentă)
  const labelsRef = useRef({ in: "Inspiră", hold: "Ține", out: "Expiră" });
  labelsRef.current = { in: tr("Inspiră"), hold: tr("Ține"), out: tr("Expiră") };
  const hintsRef = useRef({ pause: "", resume: "", done: "" });
  hintsRef.current = {
    pause: tr("atinge enso-ul pentru pauză"),
    resume: tr("atinge enso-ul pentru a continua"),
    done: tr("sesiune încheiată"),
  };

  // Starea mutabilă a sesiunii (în afara ciclului React)
  const st = useRef({
    cur: null as Technique | null,
    i: 0, running: false, remaining: 0, sessionTotal: 180,
    phaseEndAt: 0, phaseLeftMs: 0, countLeft: 0, pausedMid: false,
    phaseTimer: null as ReturnType<typeof setTimeout> | null,
    tick: null as ReturnType<typeof setInterval> | null,
    clock: null as ReturnType<typeof setInterval> | null,
    hintT: null as ReturnType<typeof setTimeout> | null,
    hintLoop: null as ReturnType<typeof setInterval> | null,
    cdTimer: null as ReturnType<typeof setInterval> | null,
    fadeTimer: null as ReturnType<typeof setInterval> | null,
  }).current;

  const $ = (id: string) => rootRef.current?.querySelector<HTMLElement>(`#bre-${id}`) ?? null;

  function clearTimers() {
    if (st.phaseTimer) clearTimeout(st.phaseTimer);
    if (st.tick) clearInterval(st.tick);
    if (st.clock) clearInterval(st.clock);
    if (st.hintT) clearTimeout(st.hintT);
    if (st.hintLoop) clearInterval(st.hintLoop);
    if (st.cdTimer) clearInterval(st.cdTimer);
    if (st.fadeTimer) clearInterval(st.fadeTimer);
    st.phaseTimer = st.tick = st.clock = st.hintT = st.hintLoop = st.cdTimer = st.fadeTimer = null;
  }

  /* ── Sunet ────────────────────────────────────────────────────────────────
     Melodia sesiunii pornește odată cu numărătoarea inversă. Ambianța site-ului
     e oprită și repornită prin evenimentele pe care le folosește și playerul de
     practici — ea revine DOAR dacă rula înainte (vezi ui/BackgroundMusic.tsx). */
  /** Pornește melodia crescând volumul de la zero pe durata dată. */
  function trackPlay(fadeMs = 800) {
    const a = trackRef.current;
    if (!a) return;
    if (st.fadeTimer) { clearInterval(st.fadeTimer); st.fadeTimer = null; }
    a.volume = 0;
    a.play().catch(() => { /* fișierul poate lipsi — sesiunea merge oricum */ });
    const steps = Math.max(12, Math.round(fadeMs / 60));
    let i = 0;
    st.fadeTimer = setInterval(() => {
      i += 1;
      a.volume = Math.min(BREATH_VOLUME, (BREATH_VOLUME * i) / steps);
      if (i >= steps && st.fadeTimer) { clearInterval(st.fadeTimer); st.fadeTimer = null; }
    }, fadeMs / steps);
  }
  /** Reia după pauză — dar nu retează fade-ul pornit de numărătoare. */
  function trackResume() {
    const a = trackRef.current;
    if (!a || !a.paused) return;
    trackPlay(800);
  }
  function trackPause() {
    if (st.fadeTimer) { clearInterval(st.fadeTimer); st.fadeTimer = null; }
    trackRef.current?.pause();
  }
  function trackStop() {
    const a = trackRef.current;
    if (!a) return;
    a.pause();
    try { a.currentTime = 0; } catch { /* ignore */ }
  }

  const fmt = (s: number) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  const scale = (el: HTMLElement | null, s: number) => { if (el) el.style.transform = `scale(${s})`; };
  const setProgress = (rem: number) => {
    const el = $("parc");
    if (el) el.style.strokeDashoffset = String((PROG_C * Math.max(0, rem)) / st.sessionTotal);
  };

  function freezeVisual() {
    ["orb", "ring", "mark", "clouds", "fill", "smokes", "gold"].forEach((id) => {
      const e = $(id);
      if (!e) return;
      const cs = getComputedStyle(e);
      const tf = cs.transform, op = cs.opacity, fi = cs.filter; // citit ÎNTÂI (obiect viu)
      e.style.transition = "none";
      e.style.transform = tf === "none" ? "" : tf;
      if (id === "clouds" || id === "fill" || id === "smokes" || id === "gold") {
        e.style.opacity = op; e.style.filter = fi;
      }
    });
    const g = rootRef.current?.querySelector<HTMLElement>(".bre-guide");
    if (g) {
      const gs = getComputedStyle(g);
      const bc = gs.borderColor, bs = gs.boxShadow;
      g.style.transition = "none"; g.style.borderColor = bc; g.style.boxShadow = bs;
    }
    void $("orb")?.offsetWidth;
  }

  function applyTarget(ms: number) {
    if (!st.cur) return;
    const key = st.cur.phases[st.i][0];
    const big = key === "in" || key === "hold" ? 1 : 0.4;
    const up = key === "in" || key === "hold";
    const trz = `transform ${ms}ms cubic-bezier(.37,0,.63,1)`;
    ["orb", "ring", "mark"].forEach((id) => { const e = $(id); if (e) e.style.transition = trz; });
    const lite = liteRef.current;
    // Fumul e acum o textură rasterizată — scalarea lui e ieftină și pe telefon
    const c = $("clouds"), fl = $("fill"), sm = $("smokes"), gd = $("gold");
    // Pe telefon nu animăm `filter` (blur-ul recalculat la fiecare cadru = sacadare)
    if (c) c.style.transition = lite
      ? `transform ${ms}ms cubic-bezier(.37,0,.63,1), opacity ${ms}ms ease`
      : `transform ${ms}ms cubic-bezier(.37,0,.63,1), opacity ${ms}ms ease, filter ${ms}ms ease`;
    if (fl) fl.style.transition = `opacity ${ms}ms ease`;
    if (sm) sm.style.transition = `transform ${ms}ms cubic-bezier(.37,0,.63,1), opacity ${ms}ms ease`;
    if (gd) gd.style.transition = `opacity ${ms}ms ease`;
    void $("orb")?.offsetWidth;
    scale($("orb"), big); scale($("ring"), big); scale($("mark"), 1);
    if (c) {
      c.style.transform = `scale(${up ? 1.12 : 0.85})`;
      c.style.opacity = up ? ".85" : "1";
      if (!lite) c.style.filter = up ? "blur(14px) saturate(1.1)" : "blur(6px) saturate(1.7) brightness(1.04)";
    }
    if (fl) fl.style.opacity = up ? ".5" : ".98";
    if (sm) { sm.style.transform = `scale(${up ? 1.15 : 0.9})`; sm.style.opacity = up ? ".85" : "1"; }
    if (gd) gd.style.opacity = up ? "1" : "0";
    const g = rootRef.current?.querySelector<HTMLElement>(".bre-guide");
    if (!g) return;
    if (key === "in") {
      // ajunge la maxim → strălucirea apare abia la finalul inspirului
      g.style.transition = `border-color ${Math.round(ms * 0.35)}ms ease ${Math.round(ms * 0.65)}ms, box-shadow ${Math.round(ms * 0.35)}ms ease ${Math.round(ms * 0.65)}ms`;
      g.style.borderColor = "rgba(255,234,196,.9)";
      g.style.boxShadow = "0 0 28px rgba(255,226,170,.45), inset 0 0 20px rgba(255,226,170,.18)";
    } else if (key === "hold") {
      g.style.transition = "none";
      g.style.borderColor = "rgba(255,234,196,.9)";
      g.style.boxShadow = "0 0 28px rgba(255,226,170,.45), inset 0 0 20px rgba(255,226,170,.18)";
    } else {
      g.style.transition = `border-color ${Math.round(ms * 0.3)}ms ease, box-shadow ${Math.round(ms * 0.3)}ms ease`;
      g.style.borderColor = "rgba(243,238,230,.26)";
      g.style.boxShadow = "none";
    }
  }

  function startPhase(resume: boolean) {
    if (!st.cur) return;
    const key = st.cur.phases[st.i][0];
    const sec = st.cur.phases[st.i][1];
    const ms = resume ? st.phaseLeftMs : sec * 1000;
    st.countLeft = resume ? Math.max(1, Math.round(st.phaseLeftMs / 1000)) : sec;
    applyTarget(ms);
    const pl = $("plabel"), pc = $("pcount");
    if (pl) pl.textContent = labelsRef.current[key as "in" | "hold" | "out"] ?? key;
    if (pc) pc.textContent = st.countLeft > 0 ? String(st.countLeft) : "";
    if (st.tick) clearInterval(st.tick);
    st.tick = setInterval(() => {
      st.countLeft--;
      const el = $("pcount");
      if (el) el.textContent = st.countLeft > 0 ? String(st.countLeft) : "";
    }, 1000);
    st.phaseEndAt = Date.now() + ms;
    if (st.phaseTimer) clearTimeout(st.phaseTimer);
    st.phaseTimer = setTimeout(() => {
      if (!st.cur) return;
      st.i = (st.i + 1) % st.cur.phases.length;
      if (st.running) startPhase(false);
    }, ms);
  }

  function startClock() {
    if (st.clock) clearInterval(st.clock);
    st.clock = setInterval(() => {
      if (!st.running) return;
      st.remaining--;
      const t = $("timer");
      if (t) t.textContent = fmt(Math.max(st.remaining, 0));
      setProgress(st.remaining);
      if (st.remaining <= 0) {
        pause();
        const pl = $("plabel"), pc = $("pcount");
        if (pl) pl.textContent = tr("Gata");
        if (pc) pc.textContent = "";
        $("mark")?.classList.remove("bre-paused");
        showHint(hintsRef.current.done, false);
        setStarted(false);
        setFinished(true);
      }
    }, 1000);
  }

  /**
   * `auto` = reamintire discretă: apare estompat, ține câteva secunde, se stinge.
   * Fără `auto` rămâne pe ecran (pauză / final de sesiune).
   */
  function showHint(t: string, auto: boolean) {
    const h = $("hint");
    if (!h) return;
    if (st.hintT) clearTimeout(st.hintT);
    h.textContent = t;
    h.style.opacity = auto ? ".7" : "1";
    if (auto) st.hintT = setTimeout(() => { h.style.opacity = "0"; }, 4000);
  }

  /** În timpul sesiunii, indiciul revine discret din când în când. */
  function startHintLoop() {
    if (st.hintLoop) clearInterval(st.hintLoop);
    st.hintLoop = setInterval(() => {
      if (st.running) showHint(hintsRef.current.pause, true);
    }, 18000);
  }

  function play() {
    st.running = true;
    setStarted(true);
    setFinished(false);
    trackResume();
    $("mark")?.classList.remove("bre-paused");
    showHint(hintsRef.current.pause, true);
    startHintLoop();
    startClock();
    if (st.pausedMid) { st.pausedMid = false; startPhase(true); }
    else startPhase(false);
  }

  function pause() {
    st.running = false;
    trackPause();
    $("mark")?.classList.add("bre-paused");
    if (st.hintLoop) { clearInterval(st.hintLoop); st.hintLoop = null; }
    showHint(hintsRef.current.resume, false);
    if (st.phaseTimer) clearTimeout(st.phaseTimer);
    if (st.tick) clearInterval(st.tick);
    st.phaseLeftMs = Math.max(200, st.phaseEndAt - Date.now());
    freezeVisual();
    st.pausedMid = true;
  }

  function handleMarkTap() {
    if (st.cdTimer) return; // în timpul numărătorii inverse nu facem nimic
    const r = $("tapring");
    if (r) { r.classList.remove("bre-go"); void r.offsetWidth; r.classList.add("bre-go"); }
    if (st.remaining <= 0) return;
    if (st.running) { pause(); return; }
    // Prima pornire trece tot prin numărătoare; reluarea după pauză e imediată
    if (st.pausedMid) play(); else beginCountdown();
  }

  /** Pregătește sesiunea. `autoPlay` doar la reluarea de la capăt („Începe din nou"). */
  function startSession(t: Technique, autoPlay = false) {
    st.cur = t; st.i = 0;
    st.remaining = durationMin * 60;
    st.sessionTotal = st.remaining;
    st.pausedMid = false;
    st.running = false;
    setStarted(false);
    setFinished(false);
    setView("session");
    // Poziția de start a vizualului — fără tranziții; pornirea o dă utilizatorul
    requestAnimationFrame(() => {
      const tn = $("tname"), tm = $("timer");
      if (tn) tn.textContent = tr(t.name);
      if (tm) tm.textContent = fmt(st.remaining);
      const pl = $("plabel"), pc = $("pcount");
      if (pl) pl.textContent = "";
      if (pc) pc.textContent = "";
      const hh = $("hint");
      if (hh) { hh.textContent = ""; hh.style.opacity = "0"; }
      ["orb", "ring", "mark", "clouds", "fill", "smokes", "gold"].forEach((id) => {
        const e = $(id); if (e) e.style.transition = "none";
      });
      scale($("orb"), 0.4); scale($("ring"), 0.4); scale($("mark"), 1);
      const c0 = $("clouds");
      if (c0) {
        c0.style.transform = "scale(.85)"; c0.style.opacity = "1";
        if (!liteRef.current) c0.style.filter = "blur(6px) saturate(1.7) brightness(1.04)";
      }
      const f0 = $("fill"); if (f0) f0.style.opacity = ".98";
      const s0 = $("smokes"); if (s0) { s0.style.transform = "scale(.9)"; s0.style.opacity = "1"; }
      const g0 = $("gold"); if (g0) g0.style.opacity = "0";
      const gd = rootRef.current?.querySelector<HTMLElement>(".bre-guide");
      if (gd) { gd.style.transition = "none"; gd.style.borderColor = "rgba(243,238,230,.26)"; gd.style.boxShadow = "none"; }
      setProgress(st.remaining);
      void $("orb")?.offsetWidth;
      if (autoPlay) requestAnimationFrame(() => requestAnimationFrame(play));
    });
  }

  /**
   * Butonul de sub cerc (sau enso-ul, la prima pornire): 3 · 2 · 1, apoi sesiunea.
   * Tot atunci se oprește ambianța site-ului și pornește melodia de respirație.
   */
  function beginCountdown() {
    if (st.cdTimer) return;
    if (st.remaining <= 0 && st.cur) startSession(st.cur); // reia de la capăt, tot cu numărătoare
    onSessionStarted?.();
    window.dispatchEvent(new Event("practiceplay")); // pune pe pauză muzica de fundal
    trackPlay(COUNTDOWN_FROM * 1000);                // fade-in exact pe durata numărătorii
    let n = COUNTDOWN_FROM;
    setCountdown(n);
    st.cdTimer = setInterval(() => {
      n -= 1;
      if (n > 0) { setCountdown(n); return; }
      if (st.cdTimer) { clearInterval(st.cdTimer); st.cdTimer = null; }
      setCountdown(null);
      play();
    }, 1000);
  }

  /** Iese din exercițiu: oprește melodia sesiunii și lasă ambianța să revină. */
  function leaveSession() {
    trackStop();
    window.dispatchEvent(new Event("practicestop"));
  }

  function backToMenu() {
    if (st.running || st.pausedMid) pause();
    clearTimers();
    leaveSession();
    st.cur = null;
    setStarted(false);
    setFinished(false);
    setCountdown(null);
    setView("menu");
  }

  function handleClose() {
    clearTimers();
    leaveSession();
    st.cur = null; st.running = false; st.pausedMid = false;
    setStarted(false);
    setFinished(false);
    setCountdown(null);
    setView("menu");
    onClose();
  }

  // Escape închide; curățenie la demontare
  useEffect(() => {
    if (!isOpen) return;
    liteRef.current =
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(max-width: 640px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]" data-modal="breathing">
      <style>{BREATHING_CSS}</style>
      {/* Fundal — click închide doar din meniu, ca să nu pierzi o sesiune pornită */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="bre-backdrop"
        onClick={view === "menu" ? handleClose : undefined}
      />
      <div className="bre-wrap" ref={rootRef}>
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="bre-app"
        >
          {/* Melodia sesiunii — pornește odată cu numărătoarea inversă */}
          <audio ref={trackRef} src={trackFor(durationMin)} loop preload="none" />

          {/* Închidere */}
          <button className="bre-close" onClick={handleClose} aria-label={tr("Închide")}>
            <X size={18} weight="bold" />
          </button>

          {/* ── Meniu ── */}
          <section className="bre-view" hidden={view !== "menu"}>
            <div className="bre-brand">
              {/* logoul orizontal alb din brand kit — static, fără animație */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-orizontal-alb.png" alt="WithIN" className="bre-logo-h" />
            </div>
            <h1 className="bre-h1">{tr("Respiră")}</h1>
            <p className="bre-sub">{tr("Alege o tehnică și lasă-te ghidată.")}</p>
            <div className="bre-dur">
              {DURATIONS.map((m) => (
                <button key={m} className={`bre-chip${m === durationMin ? " bre-on" : ""}`} onClick={() => setDurationMin(m)}>
                  {m} min
                </button>
              ))}
            </div>
            <div className="bre-list">
              {TECHNIQUES.map((t) => (
                <button key={t.id} className="bre-card" onClick={() => startSession(t)}>
                  <span className="bre-dot">{t.phases.map((p) => p[1]).join("·")}</span>
                  <span>
                    <span className="bre-card-title">{tr(t.name)}</span>
                    <span className="bre-card-desc">{tr(t.desc)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Sesiune ── */}
          <section className="bre-view" hidden={view !== "session"}>
            <div className="bre-top">
              <button className="bre-back" onClick={backToMenu} aria-label={tr("Înapoi")}>&larr;</button>
              <div className="bre-tname" id="bre-tname">—</div>
              <div className="bre-timer" id="bre-timer">0:00</div>
            </div>
            <div className="bre-stage">
              <div className="bre-breath">
                <div className="bre-guide"></div>
                <svg className="bre-prog" viewBox="0 0 320 320">
                  <circle className="bre-ptrack" cx="160" cy="160" r="150" />
                  <circle className="bre-parc" id="bre-parc" cx="160" cy="160" r="150" />
                </svg>
                <div className="bre-orb" id="bre-orb">
                  <div className="bre-fill" id="bre-fill"></div>
                  <div className="bre-clouds" id="bre-clouds">
                    <div className="bre-cloudspin"><i className="bre-c1"></i><i className="bre-c2"></i><i className="bre-c3"></i><i className="bre-c4"></i><i className="bre-c5"></i></div>
                  </div>
                  <div className="bre-smokes" id="bre-smokes"><div className="bre-smoke bre-s1"></div><div className="bre-smoke bre-s2"></div></div>
                  <div className="bre-gold" id="bre-gold"></div>
                </div>
                <div className="bre-ring" id="bre-ring"></div>
                <div className="bre-mark" id="bre-mark" onClick={handleMarkTap} role="button" tabIndex={0} aria-label={tr("Pauză / continuă")}>
                  <div className="bre-tapring" id="bre-tapring"></div>
                  <span className="bre-fx">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="bre-logo-c" src="/cerc-cream.png" alt="WithIN" />
                  </span>
                </div>
              </div>
              {/* Faza curentă — pastilă, în stilul meniului din header */}
              <div className={`bre-phase${countdown !== null ? " bre-counting" : ""}`}>
                <div className="bre-count3" key={countdown ?? "-"}>{countdown}</div>
                <div className="bre-plabel" id="bre-plabel"></div>
                <div className="bre-pcount" id="bre-pcount"></div>
              </div>
            </div>
            <div className="bre-bottom">
              <div className="bre-hint" id="bre-hint"></div>
              {!started && countdown === null && (
                <button className="bre-btn" onClick={beginCountdown}>
                  {finished ? tr("Începe din nou") : tr("Începe")}
                </button>
              )}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

/* CSS-ul machetei, cu clase prefixate „bre-" (tag-ul <style> e global) și
   tokens adaptate la brand: fonturi Sentient/Inter, verdele WithIN. */
const BREATHING_CSS = `
.bre-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)}
/* 100dvh — pe iOS ține cont de barele browserului care apar/dispar */
.bre-wrap{position:fixed;left:0;right:0;top:0;height:100vh;height:100dvh;
  display:flex;align-items:center;justify-content:center;pointer-events:none;
  padding:14px;padding-bottom:max(14px,env(safe-area-inset-bottom))}
/* Pop-up cu margini rotunjite pe orice ecran; pe desktop se oprește la 460×680 */
.bre-app{position:relative;width:100%;height:100%;overflow:hidden;pointer-events:auto;color:#F3EEE6;
  border-radius:26px;box-shadow:0 8px 48px rgba(15,46,26,.28);
  font-family:var(--font-body),system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  background:radial-gradient(circle at 50% 38%, #2B8C5C 0%, #1E5C3D 55%, #0F2E1A 100%)}
@media (min-width:640px){
  .bre-wrap{padding:16px}
  .bre-app{max-width:460px;height:min(92vh,680px)}
}
.bre-close{position:absolute;top:34px;right:26px;z-index:5;width:38px;height:38px;border-radius:50%;
  border:1px solid rgba(243,238,230,.35);background:transparent;color:#F3EEE6;cursor:pointer;
  display:grid;place-items:center;transition:.2s}
.bre-close:hover{background:rgba(243,238,230,.12)}
.bre-view{position:absolute;inset:0;display:flex;flex-direction:column;
  padding:34px 26px 30px;transition:opacity .4s;opacity:1}
.bre-view[hidden]{opacity:0;pointer-events:none}
.bre-brand{display:flex;align-items:center;min-height:38px}
.bre-brand .bre-logo-h{height:26px;width:auto;display:block}
.bre-h1{font-family:var(--font-heading),Georgia,serif;font-weight:600;font-size:36px;letter-spacing:.01em;margin:22px 0 4px}
.bre-sub{color:rgba(243,238,230,.6);font-size:14px;margin-bottom:18px}
.bre-dur{display:flex;gap:8px;margin-bottom:20px}
.bre-chip{border:1px solid rgba(243,238,230,.3);background:transparent;color:#F3EEE6;font:inherit;
  padding:8px 16px;border-radius:999px;font-size:12px;letter-spacing:.06em;cursor:pointer;transition:.2s}
.bre-chip.bre-on{background:rgba(243,238,230,.14);border-color:#F3EEE6}
.bre-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;-webkit-overflow-scrolling:touch;
  padding-right:8px;margin-right:-4px;
  scrollbar-width:thin;scrollbar-color:rgba(243,238,230,.22) transparent}
.bre-list::-webkit-scrollbar{width:4px}
.bre-list::-webkit-scrollbar-track{background:transparent}
.bre-list::-webkit-scrollbar-thumb{background:rgba(243,238,230,.22);border-radius:999px}
.bre-list::-webkit-scrollbar-thumb:hover{background:rgba(243,238,230,.4)}
.bre-list::-webkit-scrollbar-button{display:none;width:0;height:0}
.bre-card{text-align:left;border:1px solid rgba(243,238,230,.2);background:rgba(243,238,230,.05);color:#F3EEE6;font:inherit;
  border-radius:18px;padding:16px 18px;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:14px}
.bre-card:hover{background:rgba(243,238,230,.1);border-color:rgba(243,238,230,.4)}
.bre-card .bre-dot{width:38px;height:38px;border-radius:50%;flex:none;border:1.5px solid #E8C4B8;
  display:grid;place-items:center;font-size:11px;color:#E8C4B8}
.bre-card-title{display:block;font-family:var(--font-heading),Georgia,serif;font-weight:600;font-size:22px;margin-bottom:1px}
.bre-card-desc{display:block;color:rgba(243,238,230,.6);font-size:12.5px}
.bre-top{display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:8px}
.bre-back{position:absolute;left:0;width:38px;height:38px;border-radius:50%;border:1px solid rgba(243,238,230,.35);
  background:transparent;color:#F3EEE6;font-size:18px;cursor:pointer;display:grid;place-items:center}
.bre-tname{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,238,230,.6)}
/* right:50px — lasă loc butonului de închidere, ca să nu cadă peste cronometru */
.bre-timer{position:absolute;right:50px;font-size:15px;font-variant-numeric:tabular-nums;color:rgba(243,238,230,.6)}
.bre-stage{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px}
.bre-breath{position:relative;width:320px;height:320px;display:grid;place-items:center}
.bre-guide{position:absolute;width:300px;height:300px;border-radius:50%;border:1px solid rgba(243,238,230,.26);will-change:border-color,box-shadow}
/* Masca radială e obligatorie: pe Safari/iOS copiii cu filtre scapă din
   border-radius + overflow:hidden și orbul apare ca pătrat. */
.bre-orb{position:absolute;width:300px;height:300px;border-radius:50%;overflow:hidden;
  -webkit-mask-image:radial-gradient(circle at 50% 50%,#000 99%,transparent 100%);
  mask-image:radial-gradient(circle at 50% 50%,#000 99%,transparent 100%);
  background:radial-gradient(circle at 50% 50%, rgba(232,196,184,.20), rgba(232,196,184,.05) 62%, rgba(232,196,184,0) 100%);
  box-shadow:0 0 50px 8px rgba(232,196,184,.14);transform:scale(.4);will-change:transform}
.bre-ring{position:absolute;width:300px;height:300px;border-radius:50%;border:1.5px solid rgba(243,238,230,.8);
  transform:scale(.4);will-change:transform}
.bre-mark{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:7px;
  cursor:pointer;padding:22px;border-radius:50%;-webkit-tap-highlight-color:transparent}
.bre-mark .bre-fx{display:block}
.bre-mark .bre-logo-c{width:126px;height:auto;display:block;transition:opacity .4s}
.bre-mark.bre-paused .bre-logo-c{opacity:.55}
.bre-tapring{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(243,238,230,.75);opacity:0;transform:scale(.6);pointer-events:none}
.bre-tapring.bre-go{animation:bre-tap .65s ease-out}
@keyframes bre-tap{0%{opacity:.85;transform:scale(.6)}100%{opacity:0;transform:scale(1.7)}}
/* Faza curentă — pastilă ca în meniul din header, sub cerc (nu suprapusă) */
.bre-phase{text-align:center;min-height:62px}
.bre-plabel{display:inline-flex;align-items:center;justify-content:center;min-width:158px;
  padding:10px 24px;border-radius:999px;border:1px solid rgba(243,238,230,.26);
  background:rgba(243,238,230,.12);backdrop-filter:blur(6px);
  font-size:13px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;color:#F3EEE6}
.bre-plabel:empty{display:none}
.bre-pcount{margin-top:8px;font-size:13px;color:rgba(243,238,230,.6);font-variant-numeric:tabular-nums}
/* Numărătoarea inversă 3 · 2 · 1 — apare în locul pastilei, sub cerc */
.bre-count3{display:none;font-family:var(--font-heading),Georgia,serif;font-size:48px;line-height:1;
  color:rgba(243,238,230,.92);font-variant-numeric:tabular-nums}
.bre-phase.bre-counting .bre-count3{display:block;animation:bre-cd .95s ease-out both}
.bre-phase.bre-counting .bre-plabel,.bre-phase.bre-counting .bre-pcount{display:none}
@keyframes bre-cd{
  0%{opacity:0;transform:scale(1.3)}
  28%{opacity:1;transform:scale(1)}
  100%{opacity:.45;transform:scale(.94)}
}
.bre-bottom{display:flex;align-items:center;justify-content:center;min-height:44px}
.bre-btn{border:1px solid rgba(243,238,230,.35);background:rgba(243,238,230,.08);color:#F3EEE6;font:inherit;
  padding:12px 34px;border-radius:999px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;
  cursor:pointer;transition:.2s}
.bre-btn:hover{background:rgba(243,238,230,.18);border-color:rgba(243,238,230,.6)}
.bre-hint{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,238,230,.6);opacity:0;transition:opacity 1.2s ease;text-align:center;min-height:16px}
.bre-fill{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(236,190,176,.96),rgba(228,182,168,.86) 55%,rgba(224,176,162,.72) 100%);opacity:.98;will-change:opacity}
.bre-clouds{position:absolute;inset:0;transform:scale(.85);opacity:1;filter:blur(6px) saturate(1.7) brightness(1.04);will-change:transform,opacity,filter}
.bre-cloudspin{position:absolute;inset:-10%;animation:bre-drift 40s linear infinite}
.bre-cloudspin i{position:absolute;border-radius:50%;display:block}
.bre-cloudspin .bre-c1{width:78%;height:78%;left:0%;top:6%;background:radial-gradient(circle,rgba(232,196,184,1),rgba(232,196,184,0) 78%)}
.bre-cloudspin .bre-c2{width:74%;height:74%;left:30%;top:22%;background:radial-gradient(circle,rgba(243,225,215,.98),rgba(243,225,215,0) 78%)}
.bre-cloudspin .bre-c3{width:70%;height:70%;left:12%;top:36%;background:radial-gradient(circle,rgba(240,205,190,.98),rgba(240,205,190,0) 78%)}
.bre-cloudspin .bre-c4{width:62%;height:62%;left:38%;top:0%;background:radial-gradient(circle,rgba(243,238,230,.95),rgba(243,238,230,0) 78%)}
.bre-cloudspin .bre-c5{width:64%;height:64%;left:18%;top:18%;background:radial-gradient(circle,rgba(236,200,188,1),rgba(236,200,188,0) 78%)}
@keyframes bre-drift{to{transform:rotate(360deg)}}
/* Textura de fum e „coaptă" o singură dată ca imagine SVG (data URI), nu aplicată
   ca filtru viu: browserul o rasterizează o dată, apoi doar o rotește — la fel de
   texturată vizual, dar fără recalcularea turbulenței la fiecare cadru. */
.bre-smokes{position:absolute;inset:0;transform:scale(.9);opacity:1;will-change:transform,opacity}
.bre-smoke{position:absolute;inset:-25%;border-radius:50%;pointer-events:none;will-change:transform;
  background-repeat:no-repeat;background-size:cover;background-position:center}
.bre-s1{animation:bre-swirl 48s linear infinite;mix-blend-mode:screen;opacity:.95;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='a' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.011' numOctaves='3' seed='7'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.94 0 0 0 0 0.78 0 0 0 0 0.72 2.3 0 0 0 -0.78'/%3E%3CfeGaussianBlur stdDeviation='1.4'/%3E%3C/filter%3E%3Crect width='320' height='320' filter='url(%23a)'/%3E%3C/svg%3E")}
.bre-s2{animation:bre-swirl 66s linear infinite reverse;mix-blend-mode:soft-light;opacity:.9;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='b' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.018' numOctaves='2' seed='2'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.97 0 0 0 0 0.93 0 0 0 0 0.88 2.1 0 0 0 -0.72'/%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3Crect width='320' height='320' filter='url(%23b)'/%3E%3C/svg%3E")}
@keyframes bre-swirl{to{transform:rotate(360deg)}}
.bre-gold{position:absolute;inset:0;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle at 50% 46%,rgba(250,214,150,.92),rgba(238,190,118,.78) 55%,rgba(226,172,96,.62) 100%);
  mix-blend-mode:soft-light;opacity:0;will-change:opacity}
.bre-top,.bre-stage,.bre-bottom{position:relative;z-index:1}
.bre-prog{position:absolute;width:316px;height:316px;transform:rotate(-90deg);pointer-events:none;z-index:1}
.bre-prog circle{fill:none;stroke-linecap:round}
.bre-ptrack{stroke:rgba(243,238,230,.10);stroke-width:2}
.bre-parc{stroke:#E8C4B8;stroke-width:2.5;stroke-dasharray:942.48;stroke-dashoffset:942.48;transition:stroke-dashoffset .9s linear}
@media (prefers-reduced-motion: reduce){
  .bre-orb,.bre-ring,.bre-mark{transition-duration:.2s!important}
  .bre-logo-c,.bre-fx,.bre-logo-h,.bre-cloudspin,.bre-smoke{animation:none!important}
}
/* Pe touch/ecrane mici păstrăm textura (stratul „screen"), dar renunțăm la al
   doilea strat cu soft-light — două amestecuri suprapuse costă prea mult acolo. */
@media (hover:none),(max-width:640px){
  .bre-s2{display:none}
  .bre-clouds{filter:blur(9px) saturate(1.45) brightness(1.03)}
}
/* Ecrane înguste sau scunde — cercul se micșorează ca să nu fie tăiat */
@media (max-width:380px),(max-height:660px){
  .bre-breath{width:280px;height:280px}
  .bre-guide,.bre-orb,.bre-ring{width:260px;height:260px}
  .bre-prog{width:276px;height:276px}
  .bre-mark .bre-logo-c{width:110px}
}
`;
