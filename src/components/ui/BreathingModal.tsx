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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Apelat când o sesiune chiar începe — „am încercat respirațiile azi". */
  onSessionStarted?: () => void;
}

export default function BreathingModal({ isOpen, onClose, onSessionStarted }: Props) {
  const { tr } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"menu" | "session">("menu");
  const [durationMin, setDurationMin] = useState(3);

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
  }).current;

  const $ = (id: string) => rootRef.current?.querySelector<HTMLElement>(`#bre-${id}`) ?? null;

  function clearTimers() {
    if (st.phaseTimer) clearTimeout(st.phaseTimer);
    if (st.tick) clearInterval(st.tick);
    if (st.clock) clearInterval(st.clock);
    if (st.hintT) clearTimeout(st.hintT);
    if (st.hintLoop) clearInterval(st.hintLoop);
    st.phaseTimer = st.tick = st.clock = st.hintT = st.hintLoop = null;
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
    const c = $("clouds"), fl = $("fill"), sm = $("smokes"), gd = $("gold");
    if (c) c.style.transition = `transform ${ms}ms cubic-bezier(.37,0,.63,1), opacity ${ms}ms ease, filter ${ms}ms ease`;
    if (fl) fl.style.transition = `opacity ${ms}ms ease`;
    if (sm) sm.style.transition = `transform ${ms}ms cubic-bezier(.37,0,.63,1), opacity ${ms}ms ease`;
    if (gd) gd.style.transition = `opacity ${ms}ms ease`;
    void $("orb")?.offsetWidth;
    scale($("orb"), big); scale($("ring"), big); scale($("mark"), 1);
    if (c) {
      c.style.transform = `scale(${up ? 1.12 : 0.85})`;
      c.style.opacity = up ? ".85" : "1";
      c.style.filter = up ? "blur(14px) saturate(1.1)" : "blur(6px) saturate(1.7) brightness(1.04)";
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
    $("mark")?.classList.remove("bre-paused");
    showHint(hintsRef.current.pause, true);
    startHintLoop();
    startClock();
    if (st.pausedMid) { st.pausedMid = false; startPhase(true); }
    else startPhase(false);
  }

  function pause() {
    st.running = false;
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
    const r = $("tapring");
    if (r) { r.classList.remove("bre-go"); void r.offsetWidth; r.classList.add("bre-go"); }
    if (st.remaining <= 0) return;
    if (st.running) pause(); else play();
  }

  function startSession(t: Technique) {
    st.cur = t; st.i = 0;
    st.remaining = durationMin * 60;
    st.sessionTotal = st.remaining;
    st.pausedMid = false;
    setView("session");
    onSessionStarted?.();
    // Poziția de start a vizualului — fără tranziții, apoi play
    requestAnimationFrame(() => {
      const tn = $("tname"), tm = $("timer");
      if (tn) tn.textContent = tr(t.name);
      if (tm) tm.textContent = fmt(st.remaining);
      ["orb", "ring", "mark", "clouds", "fill", "smokes", "gold"].forEach((id) => {
        const e = $(id); if (e) e.style.transition = "none";
      });
      scale($("orb"), 0.4); scale($("ring"), 0.4); scale($("mark"), 1);
      const c0 = $("clouds");
      if (c0) { c0.style.transform = "scale(.85)"; c0.style.opacity = "1"; c0.style.filter = "blur(6px) saturate(1.7) brightness(1.04)"; }
      const f0 = $("fill"); if (f0) f0.style.opacity = ".98";
      const s0 = $("smokes"); if (s0) { s0.style.transform = "scale(.9)"; s0.style.opacity = "1"; }
      const g0 = $("gold"); if (g0) g0.style.opacity = "0";
      const gd = rootRef.current?.querySelector<HTMLElement>(".bre-guide");
      if (gd) { gd.style.transition = "none"; gd.style.borderColor = "rgba(243,238,230,.26)"; gd.style.boxShadow = "none"; }
      setProgress(st.remaining);
      void $("orb")?.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(play));
    });
  }

  function backToMenu() {
    if (st.running || st.pausedMid) pause();
    clearTimers();
    st.cur = null;
    setView("menu");
  }

  function handleClose() {
    clearTimers();
    st.cur = null; st.running = false; st.pausedMid = false;
    setView("menu");
    onClose();
  }

  // Escape închide; curățenie la demontare
  useEffect(() => {
    if (!isOpen) return;
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
          {/* Fum SVG (filtre) */}
          <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs>
            <filter id="bre-smokeA" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={4} seed={7} result="n">
                <animate attributeName="baseFrequency" values="0.010;0.014;0.010" dur="22s" repeatCount="indefinite" />
              </feTurbulence>
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.94  0 0 0 0 0.78  0 0 0 0 0.72  2.3 0 0 0 -0.78" result="c" />
              <feGaussianBlur in="c" stdDeviation="1.4" />
            </filter>
            <filter id="bre-smokeB" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={3} seed={2} result="n">
                <animate attributeName="baseFrequency" values="0.016;0.022;0.016" dur="30s" repeatCount="indefinite" />
              </feTurbulence>
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.97  0 0 0 0 0.93  0 0 0 0 0.88  2.1 0 0 0 -0.72" result="c" />
              <feGaussianBlur in="c" stdDeviation="1" />
            </filter>
          </defs></svg>

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
                <div className="bre-phase">
                  <div className="bre-plabel" id="bre-plabel">—</div>
                  <div className="bre-pcount" id="bre-pcount"></div>
                </div>
              </div>
            </div>
            <div className="bre-bottom"><div className="bre-hint" id="bre-hint"></div></div>
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
.bre-wrap{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
/* Telefon: pe tot ecranul. Desktop (≥640px): pop-up vertical, lat cât check-in-ul. */
.bre-app{position:relative;width:100%;height:100%;overflow:hidden;pointer-events:auto;color:#F3EEE6;
  font-family:var(--font-body),system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  background:radial-gradient(circle at 50% 38%, #2B8C5C 0%, #1E5C3D 55%, #0F2E1A 100%)}
@media (min-width:640px){
  .bre-wrap{padding:16px}
  .bre-app{max-width:460px;height:min(92vh,680px);border-radius:24px;box-shadow:0 8px 48px rgba(15,46,26,.28)}
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
.bre-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;-webkit-overflow-scrolling:touch}
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
.bre-stage{flex:1;display:flex;align-items:center;justify-content:center}
.bre-breath{position:relative;width:320px;height:320px;display:grid;place-items:center}
.bre-guide{position:absolute;width:300px;height:300px;border-radius:50%;border:1px solid rgba(243,238,230,.26);will-change:border-color,box-shadow}
.bre-orb{position:absolute;width:300px;height:300px;border-radius:50%;overflow:hidden;
  background:radial-gradient(circle at 50% 50%, rgba(232,196,184,.20), rgba(232,196,184,.05) 62%, rgba(232,196,184,0) 100%);
  box-shadow:0 0 50px 8px rgba(232,196,184,.14);transform:scale(.4);will-change:transform}
.bre-ring{position:absolute;width:300px;height:300px;border-radius:50%;border:1.5px solid rgba(243,238,230,.8);
  transform:scale(.4);will-change:transform}
.bre-mark{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:7px;
  cursor:pointer;padding:22px;border-radius:50%;-webkit-tap-highlight-color:transparent}
.bre-mark .bre-fx{display:block}
.bre-mark .bre-logo-c{width:96px;height:auto;display:block;transition:opacity .4s}
.bre-mark.bre-paused .bre-logo-c{opacity:.55}
.bre-tapring{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(243,238,230,.75);opacity:0;transform:scale(.6);pointer-events:none}
.bre-tapring.bre-go{animation:bre-tap .65s ease-out}
@keyframes bre-tap{0%{opacity:.85;transform:scale(.6)}100%{opacity:0;transform:scale(1.7)}}
.bre-phase{position:absolute;bottom:-58px;left:0;right:0;text-align:center}
.bre-plabel{font-size:21px;letter-spacing:.16em;text-transform:uppercase;font-weight:300}
.bre-pcount{margin-top:6px;font-size:13px;color:rgba(243,238,230,.6);font-variant-numeric:tabular-nums}
.bre-bottom{display:flex;justify-content:center}
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
.bre-smokes{position:absolute;inset:0;transform:scale(.9);opacity:1;will-change:transform,opacity}
.bre-smoke{position:absolute;inset:-25%;border-radius:50%;background:rgba(0,0,0,.01);pointer-events:none;will-change:transform}
.bre-s1{filter:url(#bre-smokeA);animation:bre-swirl 48s linear infinite;mix-blend-mode:screen;opacity:.95}
.bre-s2{filter:url(#bre-smokeB);animation:bre-swirl 66s linear infinite reverse;mix-blend-mode:soft-light;opacity:.9}
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
/* Ecrane înguste sau scunde — cercul se micșorează ca să nu fie tăiat */
@media (max-width:380px),(max-height:660px){
  .bre-breath{width:280px;height:280px}
  .bre-guide,.bre-orb,.bre-ring{width:260px;height:260px}
  .bre-prog{width:276px;height:276px}
  .bre-mark .bre-logo-c{width:84px}
}
`;
