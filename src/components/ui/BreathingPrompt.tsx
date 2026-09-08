"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArtRespiratie } from "@/components/ui/ArtIcons";
import { PROMPT_KEYS, BREATHING_MAX_APPEARANCES } from "@/lib/prompt-state";
import BreathingModal from "@/components/ui/BreathingModal";

/**
 * Promptul „Respiră" — pandantul check-in-ului, pentru utilizatori logați:
 * - întreabă blând dacă ai făcut respirații conștiente azi, cu două opțiuni:
 *   închide sau respiră acum (deschide experiența completă)
 * - prima apariție la ~40s după intrare (după check-in, care vine la ~6s);
 *   dacă modalul de check-in e deschis în acel moment, se amână 2 minute
 * - max 2 apariții pe zi, pauză de 15 minute după o închidere
 * - „am respirat azi" = a pornit o sesiune (localStorage, per zi)
 * - butonul „Respiră" din dashboard deschide direct experiența prin
 *   evenimentul window "breathing:open" (fără întrebare, fără limite)
 */

const MAX_APPEARANCES = BREATHING_MAX_APPEARANCES;
const FIRST_DELAY_MS = 20 * 1000;
const SNOOZE_MS = 15 * 60 * 1000;

const isDoneToday = () => {
  try { return localStorage.getItem(PROMPT_KEYS.breathingDone()) === "1"; } catch { return false; }
};
const markDone = () => {
  try { localStorage.setItem(PROMPT_KEYS.breathingDone(), "1"); } catch { /* ignore */ }
};
const getDismissals = () => {
  try { return Number(localStorage.getItem(PROMPT_KEYS.breathingDismissals()) || 0); } catch { return 0; }
};
const getSnoozeUntil = () => {
  try { return Number(localStorage.getItem(PROMPT_KEYS.breathingSnooze) || 0); } catch { return 0; }
};
const setSnooze = (ms: number) => {
  try { localStorage.setItem(PROMPT_KEYS.breathingSnooze, String(Date.now() + ms)); } catch { /* ignore */ }
};

const EXCLUDED_PREFIXES = ["/admin", "/login", "/register", "/forgot-password", "/reset-password"];

/**
 * „Știai că…" — un fapt scurt despre respirație la fiecare apariție, altul de
 * fiecare dată. Rotim după ziua din an + numărul apariției.
 */
const FACTS = [
  "Un expir mai lung decât inspirul îi spune corpului că e în siguranță. Acolo începe calmul.",
  "Respirația e singura funcție automată a corpului pe care o poți conduce conștient.",
  "Respirat pe nas, aerul e filtrat, încălzit și umezit înainte să ajungă în plămâni.",
  "În jur de șase respirații pe minut aduc inima și respirația în același ritm.",
  "Două inspiruri scurte urmate de un expir lung sunt felul corpului de a se descărca. De aceea oftăm.",
  "Dacă umerii ți se ridică la fiecare inspir, respiri de sus. Diafragma stă neîntrebuințată.",
];

function factOfNow(offset: number) {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return FACTS[(dayOfYear + offset) % FACTS.length];
}

export default function BreathingPrompt() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [askOpen, setAskOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Butonul „Respiră" (dashboard sau oriunde) → direct experiența
  useEffect(() => {
    const openHandler = () => { setAskOpen(false); setModalOpen(true); };
    window.addEventListener("breathing:open", openHandler);
    return () => window.removeEventListener("breathing:open", openHandler);
  }, []);

  // Apariția periodică — doar pentru utilizatori logați
  useEffect(() => {
    if (loading || !user) return;
    // Ajutor de testare: ?respira=test îl arată imediat, ignorând limitele zilei
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("respira") === "test") {
      const t = setTimeout(() => setAskOpen(true), 2500);
      return () => clearTimeout(t);
    }
    if (isDoneToday() || getDismissals() >= MAX_APPEARANCES) return;

    let cancelled = false;
    // „Respiră" are întâietate: nu așteaptă după check-in, apare când îi vine rândul
    const snoozeRemaining = getSnoozeUntil() - Date.now();
    timerRef.current = setTimeout(() => {
      if (cancelled || isDoneToday()) return;
      setAskOpen(true);
    }, Math.max(FIRST_DELAY_MS, snoozeRemaining));

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, loading]);

  function dismiss() {
    setAskOpen(false);
    try { localStorage.setItem(PROMPT_KEYS.breathingDismissals(), String(getDismissals() + 1)); } catch { /* ignore */ }
    setSnooze(SNOOZE_MS);
    if (getDismissals() < MAX_APPEARANCES) {
      timerRef.current = setTimeout(() => {
        if (!isDoneToday()) setAskOpen(true);
      }, SNOOZE_MS);
    }
  }

  function acceptBreathing() {
    setAskOpen(false);
    setModalOpen(true);
  }

  if (EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <>
      <PromptCard open={askOpen} onDismiss={dismiss} onAccept={acceptBreathing} fact={factOfNow(getDismissals())} />
      <BreathingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSessionStarted={markDone}
      />
    </>
  );
}

/* ── Cardul-întrebare, în stilul site-ului ────────────────────────────────── */
function PromptCard({ open, onDismiss, onAccept, fact }: { open: boolean; onDismiss: () => void; onAccept: () => void; fact: string }) {
  const { tr } = useLanguage();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              data-prompt="breathing"
              className="pointer-events-auto bg-white rounded-2xl shadow-modal w-full max-w-[400px] p-6 text-center relative"
            >
              <button
                onClick={onDismiss}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-light-green hover:bg-sage-border transition-colors"
                aria-label={tr("Închide")}
              >
                <X size={16} weight="bold" className="text-secondary-text" />
              </button>
              <ArtRespiratie className="w-16 h-16 mx-auto mb-4 mt-2" />
              <p className="font-body text-label-xs font-semibold uppercase tracking-[0.18em] text-forest-green mb-2">
                {tr("Știai că…")}
              </p>
              <h3 className="font-heading text-h3 text-deep-green mb-3 leading-snug">
                {tr(fact)}
              </h3>
              <p className="font-body text-body-sm text-secondary-text mb-6">
                {tr("Ai respirat conștient azi? Două minute ghidate schimbă ritmul întregii zile.")}
              </p>
              <button onClick={onAccept} className="btn btn-primary w-full justify-center mb-3">
                {tr("Respiră acum")}
              </button>
              <button onClick={onDismiss} className="font-body text-body-sm text-secondary-text hover:text-forest-green transition-colors">
                {tr("Nu acum")}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
