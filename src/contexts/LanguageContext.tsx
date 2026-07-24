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
import { EN } from "@/lib/i18n/en";

export type Locale = "ro" | "en";

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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ro") setLocaleState(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }

  const tr = (ro: string) => (locale === "en" ? EN[ro] ?? ro : ro);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
