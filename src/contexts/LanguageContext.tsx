"use client";

/**
 * Sistem de traducere RO/EN.
 *
 * Principiu: româna e limba sursă, scrisă direct în componente.
 * Traducerea se face prin `tr("text românesc")` — când limba e EN,
 * caută textul în dicționarul englez; dacă lipsește, rămâne româna
 * (nimic nu se strică, doar rămâne netradus până adăugăm intrarea).
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translateEn } from "@/lib/i18n/en";
import { setDateLocale } from "@/lib/i18n/date";

export type Locale = "ro" | "en";

/**
 * DEZACTIVAT (2026-09): site-ul rulează doar în română — butonul RO/EN e ascuns
 * și traducerea oprită, ca textele să poată fi editate liber din Admin → Texte site.
 * Pune true ca să reactivezi engleza (dicționarele din lib/i18n rămân pregătite).
 */
export const I18N_ENABLED = false;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Traduce un text românesc în limba curentă. */
  tr: (ro: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "ro",
  setLocale: () => {},
  tr: (ro) => ro,
});

const STORAGE_KEY = "within-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ro");

  useEffect(() => {
    if (!I18N_ENABLED) return; // doar română — ignorăm preferința salvată
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ro") { setDateLocale(saved); setLocaleState(saved); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(l: Locale) {
    if (!I18N_ENABLED) return;
    setDateLocale(l);
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }

  const tr = (ro: string) => (I18N_ENABLED && locale === "en" ? translateEn(ro) : ro);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
