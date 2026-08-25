/**
 * Locale pentru formatarea datelor, sincronizat cu limba aleasă.
 * Se setează din LanguageProvider înainte de re-render, ca toate
 * componentele să citească valoarea corectă în timpul randării.
 */
let current = "ro-RO";

export function setDateLocale(locale: "ro" | "en") {
  current = locale === "en" ? "en-GB" : "ro-RO";
}

export function dateLocale(): string {
  return current;
}
