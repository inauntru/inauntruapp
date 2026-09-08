"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArtRespiratie } from "@/components/ui/ArtIcons";
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

const MAX_APPEARANCES = 2;
const FIRST_DELAY_MS = 40 * 1000;
const SNOOZE_MS = 15 * 60 * 1000;
const CHECKIN_BUSY_RETRY_MS = 2 * 60 * 1000;

const doneKey = () => `breathing-done-${new Date().toDateString()}`;
const isDoneToday = () => {
  try { return localStorage.getItem(doneKey()) === "1"; } catch { return false; }
};
const markDone = () => {
  try { localStorage.setItem(doneKey(), "1"); } catch { /* ignore */ }
};
const dismissKey = () => `breathing-dismissals-${new Date().toDateString()}`;
const getDismissals = () => {
  try { return Number(localStorage.getItem(dismissKey()) || 0); } catch { return 0; }
};
const SNOOZE_KEY = "breathing-snooze-until";
const getSnoozeUntil = () => {
  try { return Number(localStorage.getItem(SNOOZE_KEY) || 0); } catch { return 0; }
};
const setSnooze = (ms: number) => {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + ms)); } catch { /* ignore */ }
};

const EXCLUDED_PREFIXES = ["/admin", "/login", "/register", "/forgot-password", "/reset-password"];

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
    if (isDoneToday() || getDismissals() >= MAX_APPEARANCES) return;

    let cancelled = false;
    const attempt = (delay: number) => {
      if (cancelled) return;
      timerRef.current = setTimeout(() => {
        if (cancelled || isDoneToday()) return;
        // Nu peste check-in — amână dacă modalul lui e deschis acum
        if (document.querySelector('[data-modal="checkin"]')) {
          attempt(CHECKIN_BUSY_RETRY_MS);
          return;
        }
        setAskOpen(true);
      }, delay);
    };

    const snoozeRemaining = getSnoozeUntil() - Date.now();
    attempt(Math.max(FIRST_DELAY_MS, snoozeRemaining));

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, loading]);

  function dismiss() {
    setAskOpen(false);
    try { localStorage.setItem(dismissKey(), String(getDismissals() + 1)); } catch { /* ignore */ }
    setSnooze(SNOOZE_MS);
    if (getDismissals() < MAX_APPEARANCES) {
      timerRef.current = setTimeout(() => {
        if (!isDoneToday() && !document.querySelector('[data-modal="checkin"]')) setAskOpen(true);
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
      <PromptCard open={askOpen} onDismiss={dismiss} onAccept={acceptBreathing} />
      <BreathingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSessionStarted={markDone}
      />
    </>
  );
}

/* ── Cardul-întrebare, în stilul site-ului ────────────────────────────────── */
function PromptCard({ open, onDismiss, onAccept }: { open: boolean; onDismiss: () => void; onAccept: () => void }) {
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
              <h3 className="font-heading text-h3 text-deep-green mb-2">
                {tr("Ai făcut câteva respirații conștiente azi?")}
              </h3>
              <p className="font-body text-body-sm text-secondary-text mb-6">
                {tr("Două minute de respirație ghidată îți pot schimba ritmul întregii zile.")}
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
