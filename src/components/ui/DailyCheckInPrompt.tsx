"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import CheckInModal from "@/components/ui/CheckInModal";

/**
 * Promptul zilnic de check-in — reguli unice, oriunde e montat:
 * - apare DOAR pentru utilizatori logați
 * - o apariție pe zi + max 2 reamintiri dacă e închis fără completare
 * - după fiecare închidere: pauză de 5 minute care persistă și dacă
 *   schimbi pagina (snooze salvat în localStorage)
 * - după 3 închideri sau după completare — tăcere până a doua zi
 * - starea "completat" vine din DB (sincronizată între dispozitive)
 */

const MAX_APPEARANCES = 3;
const SNOOZE_MS = 5 * 60 * 1000; // pauză după fiecare închidere

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

/**
 * Comunicare cu restul aplicației prin evenimente window:
 * - "checkin:open"      → orice pagină poate deschide modalul manual
 * - "checkin:completed" → emis aici la completare, ca paginile să-și
 *                          actualizeze instant starea (ex: pastila din dashboard)
 */
export default function DailyCheckInPrompt() {
  const { user } = useAuth();
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
    if (!user) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    fetch("/api/checkin")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled) return;
        const done = !!d?.checkedIn;
        if (done) completedRef.current = true;
        if (done || getDismissals() >= MAX_APPEARANCES) return;

        // Respectă pauza de după închidere, chiar și după schimbarea paginii:
        // dacă snooze-ul e activ, programează apariția abia la expirarea lui
        const snoozeRemaining = getSnoozeUntil() - Date.now();
        const delay = Math.max(3000, snoozeRemaining);
        timer = setTimeout(() => {
          if (!completedRef.current) setOpen(true);
        }, delay);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (reminderRef.current) clearTimeout(reminderRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    window.dispatchEvent(new Event("checkin:completed"));
    if (reminderRef.current) clearTimeout(reminderRef.current);
  }

  if (!user) return null;

  return <CheckInModal isOpen={open} onClose={handleClose} onCompleted={handleCompleted} canSkip />;
}
