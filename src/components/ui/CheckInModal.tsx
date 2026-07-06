"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ArrowRight,
  Check,
  Leaf,
  BatteryLow,
  Lightning,
  CircleHalf,
  Smiley,
  Star,
  Clock,
} from "@phosphor-icons/react";
import { PRACTICES } from "@/lib/mockData";

interface MoodOption {
  id: string;
  label: string;
  desc: string;
  Icon: React.ElementType;
}

const MOODS: MoodOption[] = [
  { id: "epuizat",   label: "Epuizat",   desc: "Fără energie", Icon: BatteryLow  },
  { id: "tensionat", label: "Tensionat", desc: "Sub presiune", Icon: Lightning   },
  { id: "ok",        label: "Ok",        desc: "Mediu",        Icon: CircleHalf  },
  { id: "bine",      label: "Bine",      desc: "Decent",       Icon: Smiley      },
  { id: "excelent",  label: "Excelent",  desc: "Energizat",    Icon: Star        },
];

const BODY_ZONES = [
  "Cap", "Gât", "Umeri", "Mâini", "Piept", "Abdomen", "Spate", "Șolduri", "Picioare",
];

const INTENSITY = [
  { id: "deloc",   label: "Deloc",         value: 0 },
  { id: "usor",    label: "Ușor",          value: 1 },
  { id: "moderat", label: "Moderat",       value: 2 },
  { id: "intens",  label: "Intens",        value: 3 },
  { id: "forte",   label: "Foarte intens", value: 4 },
];

// Mood → practice IDs
const MOOD_PRACTICES: Record<string, number[]> = {
  epuizat:   [4, 1, 2],
  tensionat: [1, 7, 2],
  ok:        [2, 7, 5],
  bine:      [5, 3, 6],
  excelent:  [5, 8, 3],
};

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  canSkip?: boolean;
}

export default function CheckInModal({ isOpen, onClose, canSkip = true }: CheckInModalProps) {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [noTension, setNoTension] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedMood(null);
      setSelectedZones([]);
      setNoTension(false);
      setSelectedIntensity(null);
      setNote("");
      setCompleted(false);
    }
  }, [isOpen]);

  const toggleZone = (zone: string) => {
    setNoTension(false);
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const handleComplete = async () => {
    setCompleted(true);
    try {
      await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood,
          body_zones: selectedZones,
          intensity: selectedIntensity,
          note: note || null,
        }),
      });
    } catch {
      // Silently ignore — completion screen already shown
    }
  };

  const recommendations = PRACTICES.filter((p) =>
    (MOOD_PRACTICES[selectedMood ?? "ok"] ?? [1, 2, 5]).includes(p.id)
  ).slice(0, 3);

  const slideVariants = {
    enter: { x: "100%", opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  };

  const zoneClass = (zone: string) =>
    `body-zone${selectedZones.includes(zone) ? " active" : ""}`;
  const armClass = () =>
    `body-zone${selectedZones.includes("Mâini") ? " active" : ""}`;
  const legClass = () =>
    `body-zone${selectedZones.includes("Picioare") ? " active" : ""}`;

  const canProceedStep1 = selectedMood !== null;
  const canProceedStep2 = selectedZones.length > 0 || noTension;
  const canProceedStep3 = selectedIntensity !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={canSkip ? onClose : undefined}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="bg-white rounded-2xl shadow-modal w-full max-w-[460px] max-h-[85vh] overflow-y-auto"
            >
              {!completed ? (
                <div className="p-5 md:p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-forest-green rounded-full flex items-center justify-center">
                        <Leaf size={14} weight="fill" className="text-white" />
                      </div>
                      <span className="font-body text-label-sm text-secondary-text uppercase tracking-widest">
                        Check-in zilnic
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-label-xs text-secondary-text">{step}/3</span>
                      {canSkip && (
                        <button
                          onClick={onClose}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green transition-colors"
                        >
                          <X size={16} weight="regular" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-light-green rounded-full mb-8 overflow-hidden">
                    <motion.div
                      className="h-full bg-forest-green rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(step / 3) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Step 1: Mood */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <h2 className="font-heading text-h3 text-deep-green mb-1">Cum te simți acum?</h2>
                        <p className="font-body text-body-sm text-secondary-text mb-6">Nu există răspuns greșit.</p>
                        <div className="grid grid-cols-5 gap-2">
                          {MOODS.map((mood) => {
                            const MoodIcon = mood.Icon;
                            const isSelected = selectedMood === mood.id;
                            return (
                              <motion.button
                                key={mood.id}
                                onClick={() => setSelectedMood(mood.id)}
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                                  isSelected
                                    ? "bg-forest-green border-forest-green text-white shadow-button"
                                    : "bg-white border-sage-border text-on-surface hover:border-forest-green hover:bg-light-green"
                                }`}
                              >
                                <MoodIcon size={28} weight={isSelected ? "fill" : "regular"} className={isSelected ? "text-white" : "text-forest-green"} />
                                <span className="font-body text-label-xs font-semibold leading-tight text-center">{mood.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Body map */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <h2 className="font-heading text-h3 text-deep-green mb-1">Unde simți tensiunea?</h2>
                        <p className="font-body text-body-sm text-secondary-text mb-4">Poți selecta mai multe zone.</p>
                        <div className="flex gap-4 items-start">
                          {/* SVG body silhouette */}
                          <div className="flex-shrink-0">
                            <svg viewBox="0 0 110 230" width="96" fill="none">
                              {/* Cap */}
                              <ellipse className={zoneClass("Cap")} cx="55" cy="14" rx="12" ry="13" onClick={() => toggleZone("Cap")}/>
                              {/* Gât */}
                              <path className={zoneClass("Gât")} d="M49,26 Q52,24 55,24 Q58,24 61,26 L62,36 Q58,38 55,38 Q52,38 48,36 Z" onClick={() => toggleZone("Gât")}/>
                              {/* Umeri */}
                              <path className={zoneClass("Umeri")} d="M15,36 Q20,31 49,34 H61 Q90,31 95,36 L92,49 Q82,45 55,46 Q28,45 18,49 Z" onClick={() => toggleZone("Umeri")}/>
                              {/* Left arm (Mâini) */}
                              <path className={armClass()} d="M18,49 Q14,45 9,47 L7,100 Q6,108 7,114 Q5,120 5,126 Q5,132 7,135 Q9,137 12,137 Q15,137 17,135 Q19,132 18,126 Q17,120 18,114 Q19,108 19,100 L19,49 Z" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="5" y="133" width="3" height="10" rx="1.6" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="9" y="132" width="3" height="11" rx="1.6" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="13" y="131" width="3.2" height="12" rx="1.6" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="17" y="132" width="3" height="11" rx="1.6" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="19.5" y="123" width="3" height="9" rx="1.5" transform="rotate(16,21,127)" onClick={() => toggleZone("Mâini")}/>
                              {/* Right arm (Mâini) */}
                              <path className={armClass()} d="M92,49 Q96,45 101,47 L103,100 Q104,108 103,114 Q105,120 105,126 Q105,132 103,135 Q101,137 98,137 Q95,137 93,135 Q91,132 92,126 Q93,120 92,114 Q91,108 91,100 L91,49 Z" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="102" y="133" width="3" height="10" rx="1.6" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="98" y="132" width="3" height="11" rx="1.6" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="93.8" y="131" width="3.2" height="12" rx="1.6" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="90" y="132" width="3" height="11" rx="1.6" onClick={() => toggleZone("Mâini")}/>
                              <rect className={armClass()} x="87.5" y="123" width="3" height="9" rx="1.5" transform="rotate(-16,89,127)" onClick={() => toggleZone("Mâini")}/>
                              {/* Piept */}
                              <path className={zoneClass("Piept")} d="M19,48 Q28,45 55,46 Q82,45 91,48 L89,71 Q80,73 55,73 Q30,73 21,71 Z" onClick={() => toggleZone("Piept")}/>
                              {/* Abdomen */}
                              <path className={zoneClass("Abdomen")} d="M21,71 Q30,73 55,73 Q80,73 89,71 L87,92 Q78,94 55,94 Q32,94 23,92 Z" onClick={() => toggleZone("Abdomen")}/>
                              {/* Șolduri */}
                              <path className={zoneClass("Șolduri")} d="M23,92 Q32,94 55,94 Q78,94 87,92 L88,109 Q80,113 55,113 Q30,113 22,109 Z" onClick={() => toggleZone("Șolduri")}/>
                              {/* Picioare */}
                              <rect className={legClass()} x="24" y="111" width="22" height="114" rx="9" onClick={() => toggleZone("Picioare")}/>
                              <rect className={legClass()} x="64" y="111" width="22" height="114" rx="9" onClick={() => toggleZone("Picioare")}/>
                            </svg>
                          </div>
                          {/* Zone buttons */}
                          <div className="flex-1 flex flex-col gap-1.5 pt-1">
                            <div className="flex flex-wrap gap-1.5">
                              {BODY_ZONES.map((zone) => (
                                <motion.button
                                  key={zone}
                                  onClick={() => toggleZone(zone)}
                                  whileTap={{ scale: 0.95 }}
                                  className={`px-3 py-1.5 rounded-full text-body-sm font-body font-medium border transition-all duration-200 flex items-center gap-1.5 ${
                                    selectedZones.includes(zone)
                                      ? "bg-light-green border-forest-green text-forest-green"
                                      : "bg-white border-sage-border text-secondary-text hover:border-forest-green"
                                  }`}
                                >
                                  {selectedZones.includes(zone) && (
                                    <span className="w-3 h-3 rounded-full bg-forest-green flex items-center justify-center flex-shrink-0">
                                      <Check size={8} weight="bold" className="text-white" />
                                    </span>
                                  )}
                                  {zone}
                                </motion.button>
                              ))}
                            </div>
                            <button
                              onClick={() => { setNoTension(true); setSelectedZones([]); setTimeout(goNext, 200); }}
                              className="mt-1 px-3 py-1.5 rounded-full text-body-sm font-body font-medium border border-dashed border-sage-border bg-white text-secondary-text hover:border-forest-green transition-all duration-200 text-left"
                            >
                              Nu simt tensiune nicăieri
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Intensity */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <h2 className="font-heading text-h3 text-deep-green mb-1">Cât de intens simți?</h2>
                        <p className="font-body text-body-sm text-secondary-text mb-6">Evaluează intensitatea senzației.</p>
                        <div className="flex flex-col gap-2 mb-6">
                          {INTENSITY.map((item) => (
                            <motion.button
                              key={item.id}
                              onClick={() => setSelectedIntensity(item.id)}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full py-3 px-4 rounded-xl border text-left font-body text-body-sm font-medium transition-all duration-200 ${
                                selectedIntensity === item.id
                                  ? "bg-forest-green border-forest-green text-white"
                                  : "bg-white border-sage-border text-on-surface hover:border-forest-green hover:bg-light-green"
                              }`}
                            >
                              <span className="inline-block w-24">{item.label}</span>
                              <span className="ml-2 opacity-50">{"●".repeat(item.value + 1)}</span>
                            </motion.button>
                          ))}
                        </div>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Vrei să adaugi ceva? (opțional)"
                          className="w-full bg-surface-container-low border border-sage-border rounded-xl px-4 py-3 text-body-sm font-body text-on-surface placeholder-secondary-text resize-none focus:outline-none focus:border-forest-green transition-colors"
                          rows={2}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-sage-border">
                    {step > 1 ? (
                      <button onClick={goBack} className="font-body text-body-sm text-secondary-text hover:text-forest-green transition-colors">
                        ← Înapoi
                      </button>
                    ) : (
                      <div />
                    )}
                    <div className="flex items-center gap-3">
                      {canSkip && step === 1 && (
                        <button onClick={onClose} className="font-body text-body-sm text-secondary-text hover:text-forest-green transition-colors">
                          Sari peste
                        </button>
                      )}
                      {step < 3 ? (
                        <button
                          onClick={goNext}
                          disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                          className={`btn btn-primary btn-sm ${(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          Continuă <ArrowRight size={16} weight="bold" />
                        </button>
                      ) : (
                        <button
                          onClick={handleComplete}
                          disabled={!canProceedStep3}
                          className={`btn btn-primary ${!canProceedStep3 ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          Găsește practica potrivită <ArrowRight size={16} weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Completion screen */
                <div className="p-6">
                  {/* Close button */}
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={onClose}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green transition-colors text-secondary-text"
                    >
                      <X size={16} weight="regular" />
                    </button>
                  </div>

                  {/* Icon + message */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-5">
                      <div className="w-20 h-20 rounded-full bg-forest-green/10 flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-12 h-12 rounded-full bg-forest-green flex items-center justify-center"
                        >
                          <Check size={24} weight="bold" className="text-white" />
                        </motion.div>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.2, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-forest-green/20"
                      />
                    </div>
                    <h3 className="font-heading text-h3 text-deep-green mb-2">
                      Mulțumim că te-ai conectat cu tine azi
                    </h3>
                    <p className="font-body text-body-sm text-secondary-text">
                      Am ales {recommendations.length} practici potrivite pentru tine.
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="flex flex-col gap-3">
                    {recommendations.map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/practici/${p.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 bg-light-green border border-sage-border rounded-xl p-4 hover:border-forest-green hover:shadow-card transition-all group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
                          <Image
                            src={`${p.image}?w=120&q=75`}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-label-xs text-secondary-text mb-0.5">{p.category}</p>
                          <p className="font-body text-body-sm font-semibold text-deep-green leading-tight line-clamp-1">
                            {p.title}
                          </p>
                          <p className="font-body text-label-xs text-secondary-text flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            {p.duration} min · {p.facilitator}
                          </p>
                        </div>
                        <ArrowRight size={16} weight="bold" className="text-forest-green flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
