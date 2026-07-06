"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Clock, X } from "@phosphor-icons/react";
import AnimateIn from "@/components/ui/AnimateIn";
import {
  ANCORE_DATA, NIVEL_CONFIG, CATEGORIE_CONFIG,
  type AncoreExercise, type AncoreNivel, type AncoreCategorie,
} from "@/lib/ancore";

interface Props { siteContent: Record<string, string> }

// ─── Opțiuni funnel (limbaj uman → mapare internă) ────────────────────────────
const STARE_OPTIONS: {
  label: string;
  categorie: AncoreCategorie | null;
  dotColor: string;
}[] = [
  { label: "Mă simt în alertă",    categorie: "ALERTĂ",    dotColor: "#B8CDD8" },
  { label: "Mă simt copleșită",    categorie: "ALERTĂ",    dotColor: "#B8CDD8" },
  { label: "Mă simt blocată",      categorie: "BLOCATĂ",   dotColor: "#C8C8C8" },
  { label: "Sunt foarte obosită",  categorie: "OBOSEALĂ",  dotColor: "#E8D8B8" },
  { label: "Vreau puțină liniște", categorie: "LINIȘTIRE", dotColor: "#E0C8C0" },
  { label: "Nu sunt sigură",       categorie: null,         dotColor: "#B8D8B0" },
];

const ENERGIE_OPTIONS: {
  label: string;
  sub?: string;
  nivel: AncoreNivel[];
}[] = [
  { label: "10 secunde",  nivel: ["SOS"] },
  { label: "30 secunde",  nivel: ["SOS"] },
  { label: "1 minut",     nivel: ["REGLEAZĂ"] },
  { label: "3 minute",    nivel: ["APROFUNDEAZĂ"] },
  { label: "fără grabă",  sub: "alegi cât poți acum", nivel: ["SOS", "REGLEAZĂ", "APROFUNDEAZĂ"] },
];

// ─── Logică recomandări ───────────────────────────────────────────────────────
function getRecommendations(
  categorie: AncoreCategorie | null,
  nivel: AncoreNivel[]
): AncoreExercise[] {
  const allNivel = nivel.length === 3;
  let pool: AncoreExercise[];

  if (categorie === null) {
    pool = ANCORE_DATA.filter(ex => ex.nivel === "SOS" || ex.categorie === "CONECTARE");
  } else if (allNivel) {
    pool = ANCORE_DATA.filter(ex => ex.categorie === categorie);
  } else {
    pool = ANCORE_DATA.filter(ex => ex.categorie === categorie && nivel.includes(ex.nivel));
    if (pool.length < 2) pool = ANCORE_DATA.filter(ex => ex.categorie === categorie);
  }
  if (pool.length < 2) pool = ANCORE_DATA.filter(ex => nivel.includes(ex.nivel));

  return [...pool]
    .sort((a, b) => a.v1_selectat !== b.v1_selectat ? (a.v1_selectat ? -1 : 1) : a.prioritate - b.prioritate)
    .slice(0, 6);
}

// ─── Sortare default ──────────────────────────────────────────────────────────
const SW: Record<string, number> = { Lumină: 0, Liniștire: 1, Ceață: 2, Forfotă: 3, Furtună: 4 };
const NW: Record<string, number> = { SOS: 0, REGLEAZĂ: 1, APROFUNDEAZĂ: 2 };
const SORTED_ALL = [...ANCORE_DATA].sort((a, b) => {
  const sd = (SW[a.stare_interna] ?? 5) - (SW[b.stare_interna] ?? 5);
  return sd !== 0 ? sd : (NW[a.nivel] ?? 3) - (NW[b.nivel] ?? 3);
});

function dur(sec: number) { return sec < 60 ? `${sec}s` : `${Math.round(sec / 60)} min`; }
function nivelLabel(n: string) { return n === "SOS" ? "Rapid" : n === "REGLEAZĂ" ? "Reglează" : "Profund"; }

// ─── Modal exercițiu ──────────────────────────────────────────────────────────
function ExerciseModal({ ex, onClose, onComplete }: {
  ex: AncoreExercise;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const [step, setStep] = useState(0);
  const total = 1 + ex.pasi.length + 1;
  const isIntro = step === 0;
  const isFinal = step === total - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh" }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-forest-green rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">I</span>
            </div>
            <span className="font-heading font-bold text-sm text-deep-green">INAUNTRU</span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green transition-colors">
            <X size={16} className="text-secondary-text" />
          </button>
        </div>

        {!isIntro && (
          <div className="flex items-center justify-center gap-1.5 pt-4 px-6">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{ width: i === step ? 20 : 6, height: 6,
                  backgroundColor: i <= step ? "#1B5E34" : "#D1D5DB" }} />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }} className="px-6 py-6">
              {isIntro && (
                <div className="text-center">
                  <h2 className="font-heading text-h2 text-deep-green mb-4">{ex.nume}</h2>
                  <p className="font-body text-body-md text-on-surface leading-relaxed mb-2">{ex.trigger_text}</p>
                  <p className="font-body text-label-xs text-secondary-text flex items-center justify-center gap-1.5 mt-4">
                    <Clock size={13} />{dur(ex.durata_sec)} · {ex.pasi.length} {ex.pasi.length === 1 ? "pas" : "pași"}
                  </p>
                </div>
              )}
              {!isIntro && !isFinal && (
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-light-green flex items-center justify-center mx-auto mb-5">
                    <span className="font-heading font-bold text-forest-green text-body-sm">{step}</span>
                  </div>
                  <p className="font-body text-body-lg text-deep-green leading-relaxed">{ex.pasi[step - 1]}</p>
                </div>
              )}
              {isFinal && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center mx-auto mb-5">
                    <Check size={22} weight="bold" className="text-forest-green" />
                  </div>
                  <p className="font-body text-body-lg text-deep-green font-semibold mb-4 leading-relaxed">{ex.ancora_text}</p>
                  <p className="font-body text-body-sm text-secondary-text leading-relaxed">{ex.inchidere_text}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-sage-border flex gap-3">
          <button onClick={() => isIntro ? onClose() : setStep(s => s - 1)} className="btn btn-ghost flex-shrink-0">
            <ArrowLeft size={14} weight="bold" />
          </button>
          {!isFinal ? (
            <button onClick={() => setStep(s => s + 1)} className="btn btn-primary flex-1 gap-2">
              {isIntro ? "Încearcă" : "Continuă"} <ArrowRight size={14} weight="bold" />
            </button>
          ) : (
            <button onClick={() => { onComplete ? onComplete() : onClose(); }} className="btn btn-primary flex-1 gap-2">
              <Check size={14} weight="bold" /> Gata
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Card exercițiu ───────────────────────────────────────────────────────────
function ExerciseCard({ ex, onStart, recommended }: {
  ex: AncoreExercise; onStart: () => void; recommended?: boolean;
}) {
  const niv = NIVEL_CONFIG[ex.nivel];
  return (
    <div className="bg-white rounded-2xl border border-sage-border shadow-sm hover:shadow-md transition-shadow flex flex-col w-full" style={{ minHeight: 220 }}>
      <div className="p-4 flex-1 flex flex-col">
        <div className="h-6 mb-1 flex items-center">
          {recommended && (
            <span className="text-[9px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-light-green text-forest-green border border-forest-green/20">
              Recomandat
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-body font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: niv.bg, color: niv.text }}>
            {nivelLabel(ex.nivel)}
          </span>
          <span className="flex items-center gap-1 font-body text-[10px] text-secondary-text">
            <Clock size={10} />{dur(ex.durata_sec)}
          </span>
        </div>
        <h3 className="font-body font-semibold text-body-sm text-deep-green mb-1.5 line-clamp-2">{ex.nume}</h3>
        <p className="font-body text-label-xs text-secondary-text line-clamp-2 flex-1">{ex.descriere_scurta}</p>
      </div>
      <div className="p-3 pt-0 mt-auto">
        <button onClick={onStart}
          className="w-full py-2 rounded-xl bg-light-green text-forest-green font-body font-semibold text-label-xs hover:bg-forest-green hover:text-white transition-colors">
          Încearcă
        </button>
      </div>
    </div>
  );
}

// ─── Pagina principală ────────────────────────────────────────────────────────
type FunnelStep = "stare" | "energie" | "result" | "browse" | "all";

export default function AncoreClient({ siteContent }: Props) {
  const t = (key: string, fallback: string) => siteContent[key] || fallback;
  const funnelRef = useRef<HTMLElement>(null);

  const [funnelStep, setFunnelStep] = useState<FunnelStep>("stare");
  const [selectedStare, setSelectedStare] = useState<typeof STARE_OPTIONS[0] | null>(null);
  const [selectedEnergie, setSelectedEnergie] = useState<typeof ENERGIE_OPTIONS[0] | null>(null);
  const [recommendations, setRecommendations] = useState<AncoreExercise[]>([]);
  const [activeEx, setActiveEx] = useState<AncoreExercise | null>(null);
  const [isPrimaryEx, setIsPrimaryEx] = useState(false);

  function scrollToFunnel() {
    funnelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pickStare(opt: typeof STARE_OPTIONS[0]) {
    setSelectedStare(opt);
    setFunnelStep("energie");
  }

  function pickEnergie(opt: typeof ENERGIE_OPTIONS[0]) {
    setSelectedEnergie(opt);
    const recs = getRecommendations(selectedStare!.categorie, opt.nivel);
    setRecommendations(recs);
    setFunnelStep("result");
  }

  function resetFunnel() {
    setSelectedStare(null);
    setSelectedEnergie(null);
    setRecommendations([]);
    setFunnelStep("stare");
    setTimeout(() => scrollToFunnel(), 50);
  }

  return (
    <div className="min-h-screen bg-bg-main">

      {/* ── Hero ── */}
      <section className="relative h-[55vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <video autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center center" }}>
          <source src="/hero-video-2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to right, rgba(15,46,26,0.85) 0%, rgba(15,46,26,0.70) 40%, rgba(15,46,26,0.30) 70%, transparent 100%)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/70 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <AnimateIn from="bottom">
              <div className="max-w-xl">
                <p className="font-body text-label-sm uppercase tracking-widest mb-3"
                  style={{ color: "rgba(180,230,200,0.9)" }}>
                  {t("label", "Exerciții de reglare")}
                </p>
                <h1 className="font-heading text-h1 text-white mb-4">{t("title", "Ancore")}</h1>
                <p className="font-body text-body-lg mb-8" style={{ color: "rgba(240,252,244,0.80)" }}>
                  {t("subtitle", "Trei întrebări scurte. Ancora potrivită pentru tine acum.")}
                </p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={scrollToFunnel}
                  className="btn btn-indigo gap-2 text-base px-6 py-3">
                  Descoperă ancora ta <ArrowRight size={16} weight="bold" />
                </motion.button>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Funnel inline ── */}
      <section ref={funnelRef} className="bg-white border-b border-sage-border scroll-mt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AnimatePresence mode="wait">

            {/* Pas 1 — Stare */}
            {funnelStep === "stare" && (
              <motion.div key="stare"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.22 }}>
                <p className="font-body text-label-xs text-forest-green uppercase tracking-widest mb-2">Pas 1</p>
                <h2 className="font-heading text-h2 text-deep-green mb-1">Cum te simți acum?</h2>
                <p className="font-body text-body-sm text-secondary-text mb-8">
                  Alege starea ta — un tap și trecem mai departe.
                </p>
                <div className="space-y-3">
                  {STARE_OPTIONS.map(opt => (
                    <motion.button key={opt.label} whileTap={{ scale: 0.98 }}
                      onClick={() => pickStare(opt)}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-sage-border bg-bg-main hover:border-forest-green hover:bg-light-green/30 transition-all duration-150 text-left group"
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opt.dotColor }} />
                      <span className="font-body font-semibold text-body-sm text-deep-green group-hover:text-forest-green transition-colors">
                        {opt.label}
                      </span>
                      <ArrowRight size={14} className="ml-auto text-secondary-text group-hover:text-forest-green transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pas 2 — Energie */}
            {funnelStep === "energie" && (
              <motion.div key="energie"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.22 }}>
                <button onClick={() => setFunnelStep("stare")}
                  className="flex items-center gap-1.5 text-secondary-text hover:text-deep-green transition-colors mb-5 font-body text-label-xs">
                  <ArrowLeft size={13} weight="bold" /> Înapoi
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedStare?.dotColor }} />
                  <span className="font-body text-body-sm text-secondary-text">
                    {selectedStare?.label}
                  </span>
                </div>
                <p className="font-body text-label-xs text-forest-green uppercase tracking-widest mb-2">Pas 2</p>
                <h2 className="font-heading text-h2 text-deep-green mb-1">Câtă energie ai pentru asta?</h2>
                <p className="font-body text-body-sm text-secondary-text mb-8">
                  Alege cât timp poți aloca acum.
                </p>
                <div className="space-y-3">
                  {ENERGIE_OPTIONS.map(opt => (
                    <motion.button key={opt.label} whileTap={{ scale: 0.98 }}
                      onClick={() => pickEnergie(opt)}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-sage-border bg-bg-main hover:border-forest-green hover:bg-light-green/30 transition-all duration-150 text-left group"
                    >
                      <div className="flex-1">
                        <span className="font-body font-semibold text-body-sm text-deep-green group-hover:text-forest-green transition-colors block">
                          {opt.label}
                        </span>
                        {opt.sub && (
                          <span className="font-body text-label-xs text-secondary-text">{opt.sub}</span>
                        )}
                      </div>
                      <ArrowRight size={14} className="flex-shrink-0 text-secondary-text group-hover:text-forest-green transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Rezultat */}
            {funnelStep === "result" && (
              <motion.div key="result"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.22 }}>
                {/* Selecții */}
                <div className="flex items-center gap-3 flex-wrap mb-8">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-green/60 border border-forest-green/20">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedStare?.dotColor }} />
                    <span className="font-body text-label-xs font-semibold text-forest-green">{selectedStare?.label}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-green/60 border border-forest-green/20">
                    <Clock size={12} className="text-forest-green" />
                    <span className="font-body text-label-xs font-semibold text-forest-green">{selectedEnergie?.label}</span>
                  </div>
                  <button onClick={resetFunnel}
                    className="font-body text-label-xs text-secondary-text hover:text-deep-green underline underline-offset-2 transition-colors">
                    Încearcă din nou
                  </button>
                </div>

                <h2 className="font-heading text-h2 text-deep-green mb-1">Recomandat acum</h2>
                <p className="font-body text-body-sm text-secondary-text mb-6">
                  {recommendations.length} {recommendations.length === 1 ? "exercițiu" : "exerciții"} potrivite pentru tine
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {/* ── Recomandări (sub funnel, vizibile după completare) ── */}
      <AnimatePresence>
        {funnelStep === "result" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          >
            {/* Primar — primul exercițiu recomandat, mai mare */}
            {recommendations[0] && (
              <div className="mb-8">
                <div className="bg-white rounded-2xl border-2 border-forest-green/30 shadow-md p-6 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <span className="inline-block text-[9px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-light-green text-forest-green border border-forest-green/20 mb-3">
                      Ancora ta acum
                    </span>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-body font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: NIVEL_CONFIG[recommendations[0].nivel].bg, color: NIVEL_CONFIG[recommendations[0].nivel].text }}>
                        {nivelLabel(recommendations[0].nivel)}
                      </span>
                      <span className="flex items-center gap-1 font-body text-[10px] text-secondary-text">
                        <Clock size={10} />{dur(recommendations[0].durata_sec)}
                      </span>
                    </div>
                    <h3 className="font-heading text-h2 text-deep-green mb-2">{recommendations[0].nume}</h3>
                    <p className="font-body text-body-sm text-secondary-text">{recommendations[0].descriere_scurta}</p>
                  </div>
                  <div className="flex items-end sm:items-center">
                    <button onClick={() => { setActiveEx(recommendations[0]); setIsPrimaryEx(true); }}
                      className="btn btn-primary gap-2 w-full sm:w-auto">
                      Încearcă <ArrowRight size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alte opțiuni */}
            {recommendations.length > 1 && (
              <div className="mb-10">
                <p className="font-body text-label-xs text-secondary-text uppercase tracking-widest mb-4">Alte opțiuni</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {recommendations.slice(1).map((ex, i) => (
                    <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }} className="flex h-full">
                      <ExerciseCard ex={ex} onStart={() => setActiveEx(ex)} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Link toate exercițiile */}
            <div className="text-center">
              <button onClick={() => setFunnelStep("all")}
                className="font-body text-body-sm text-forest-green hover:text-deep-green underline underline-offset-4 transition-colors">
                Vezi toate exercițiile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Browse: recomandate + toate (după finalizarea exercițiului primar) ── */}
      <AnimatePresence>
        {funnelStep === "browse" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          >
            {/* Bar context */}
            <div className="flex items-center gap-3 flex-wrap mb-10 p-3 bg-light-green/40 rounded-xl border border-forest-green/20 w-fit">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedStare?.dotColor }} />
                <span className="font-body text-label-xs font-semibold text-forest-green">{selectedStare?.label}</span>
              </div>
              <span className="text-secondary-text">·</span>
              <span className="font-body text-label-xs font-semibold text-forest-green">{selectedEnergie?.label}</span>
              <button onClick={resetFunnel}
                className="font-body text-label-xs text-secondary-text hover:text-deep-green underline underline-offset-2 transition-colors ml-1">
                Recalibrează
              </button>
            </div>

            {/* Recomandate */}
            <div className="mb-12">
              <h2 className="font-heading text-h2 text-deep-green mb-6">Recomandate pentru tine</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((ex, i) => (
                  <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }} className="flex h-full">
                    <ExerciseCard ex={ex} recommended onStart={() => { setActiveEx(ex); setIsPrimaryEx(false); }} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Toate */}
            <div className="border-t border-sage-border pt-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-h3 text-deep-green">Toate ancorele</h3>
                <span className="font-body text-body-sm text-secondary-text">{SORTED_ALL.length} exerciții</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {SORTED_ALL.map((ex, i) => (
                  <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.4) }} className="flex h-full">
                    <ExerciseCard ex={ex} onStart={() => { setActiveEx(ex); setIsPrimaryEx(false); }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toate ancorele ── */}
      <AnimatePresence>
        {funnelStep === "all" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-h2 text-deep-green">Toate ancorele</h2>
                <p className="font-body text-body-sm text-secondary-text mt-1">{SORTED_ALL.length} exerciții</p>
              </div>
              <button onClick={resetFunnel} className="btn btn-ghost btn-sm gap-1.5">
                <ArrowLeft size={13} weight="bold" /> Recalibrează
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {SORTED_ALL.map((ex, i) => (
                <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.015, 0.4) }} className="flex h-full">
                  <ExerciseCard ex={ex} onStart={() => setActiveEx(ex)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal exercițiu ── */}
      <AnimatePresence>
        {activeEx && (
          <ExerciseModal
            key={activeEx.id}
            ex={activeEx}
            onClose={() => { setActiveEx(null); setIsPrimaryEx(false); }}
            onComplete={isPrimaryEx ? () => { setActiveEx(null); setIsPrimaryEx(false); setFunnelStep("browse"); } : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
