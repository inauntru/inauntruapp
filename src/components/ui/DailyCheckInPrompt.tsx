"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import CheckInModal from "@/components/ui/CheckInModal";

/**
 * Promptul zilnic de check-in — reguli unice, oriunde e montat:
 * - apare pentru ORICINE: utilizatori logați ȘI vizitatori (check-in-ul e
 *   diferențiatorul platformei, îl arătăm înainte de crearea contului)
 * - prima apariție la câteva secunde după intrarea pe site
 * - o apariție pe zi + max 2 reamintiri dacă e închis fără completare
 * - după fiecare închidere: pauză de 10 minute care persistă și dacă
 *   schimbi pagina (snooze salvat în localStorage)
 * - după 3 închideri sau după completare — tăcere până a doua zi
 * - „completat azi": pentru utilizatori logați vine din DB (sincronizat între
 *   dispozitive); pentru vizitatori din localStorage (per browser — condiția
 *   care previne reafișarea la fiecare vizită)
 * - vizitatorul care completează vede recomandările blurate + CTA spre /register
 *   (fluxul e în CheckInModal)
 */

const MAX_APPEARANCES = 3;
const SNOOZE_MS = 10 * 60 * 1000;  // pauză după fiecare închidere (reamintire)
const FIRST_DELAY_MS = 6 * 1000;   // „la câteva secunde după ce intri"

const dismissKey = () => `checkin-dismissals-${new Date().toDateString()}`;
const getDismissals = () => {
  try { return Number(localStorage.getItem(dismissKey()) || 0); } catch { return 0; }
};
const SNOOZE_KEY = "checkin-snooze-until";
const getSnoozeUntil = () => {
  try { return Number(localStorage.getItem(SNOOZE_KEY) || 0); } catch { return 0; }
};
const setSnooze = (ms: number) => {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + ms)); } catch { /* ignore */ }
};

/* „Completat azi" pentru vizitatori (fără cont → fără DB) */
const guestDoneKey = () => `checkin-guest-done-${new Date().toDateString()}`;
const isGuestDone = () => {
  try { return localStorage.getItem(guestDoneKey()) === "1"; } catch { return false; }
};
export const markGuestCheckInDone = () => {
  try { localStorage.setItem(guestDoneKey(), "1"); } catch { /* ignore */ }
};

/* Pagini unde promptul nu are ce căuta: admin + fluxul de autentificare
   (peste formularul de register/login ar fi deranjant — acolo chiar trimitem
   vizitatorii după check-in) */
const EXCLUDED_PREFIXES = ["/admin", "/login", "/register", "/forgot-password", "/reset-password"];

/**
 * Comunicare cu restul aplicației prin evenimente window:
 * - "checkin:open"      → orice pagină poate deschide modalul manual
 * - "checkin:completed" → emis aici la completare, ca paginile să-și
 *                          actualizeze instant starea (ex: pastila din dashboard)
 */
export default function DailyCheckInPrompt() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const completedRef = useRef(false);
  const reminderRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deschidere manuală de oriunde din aplicație (ignoră snooze-ul — e cerută explicit)
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("checkin:open", openHandler);
    return () => window.removeEventListener("checkin:open", openHandler);
  }, []);

  useEffect(() => {
    if (loading) return; // așteptăm să știm dacă e vizitator sau logat
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (done: boolean) => {
      if (cancelled) return;
      if (done) completedRef.current = true;
      if (done || getDismissals() >= MAX_APPEARANCES) return;
      // Respectă pauza de după închidere, chiar și după schimbarea paginii:
      // dacă snooze-ul e activ, programează apariția abia la expirarea lui
      const snoozeRemaining = getSnoozeUntil() - Date.now();
      const delay = Math.max(FIRST_DELAY_MS, snoozeRemaining);
      timer = setTimeout(() => {
        if (!completedRef.current) setOpen(true);
      }, delay);
    };

    if (user) {
      fetch("/api/checkin")
        .then(r => r.ok ? r.json() : null)
        .then(d => schedule(!!d?.checkedIn))
        .catch(() => {});
    } else {
      schedule(isGuestDone());
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (reminderRef.current) clearTimeout(reminderRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  function handleClose() {
    setOpen(false);
    if (completedRef.current) return;
    try { localStorage.setItem(dismissKey(), String(getDismissals() + 1)); } catch { /* ignore */ }
    setSnooze(SNOOZE_MS);
    if (getDismissals() < MAX_APPEARANCES) {
      reminderRef.current = setTimeout(() => {
        if (!completedRef.current) setOpen(true);
      }, SNOOZE_MS);
    }
  }

  function handleCompleted() {
    completedRef.current = true;
    if (!user) markGuestCheckInDone();
    window.dispatchEvent(new Event("checkin:completed"));
    if (reminderRef.current) clearTimeout(reminderRef.current);
  }

  if (EXCLUDED_PREFIXES.some(p => pathname?.startsWith(p))) return null;

  return <CheckInModal isOpen={open} onClose={handleClose} onCompleted={handleCompleted} canSkip />;
}
