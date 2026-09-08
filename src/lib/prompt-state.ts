/**
 * Starea promptărilor zilnice (check-in + „Respiră"), ținută în localStorage,
 * per browser. Aici stau cheile într-un singur loc, ca resetarea să nu uite
 * niciuna.
 *
 * `V` e versiunea cheilor: ridicată la un deploy, contoarele zilei repornesc
 * pentru toată lumea — utilă la lansarea unei funcționalități noi, ca promptul
 * să fie văzut chiar dacă cineva îl închisese deja azi.
 */

const V = "v3";
const today = () => new Date().toDateString();

/** Câte apariții pe zi are promptul „Respiră" (folosit și de check-in, ca să știe dacă mai urmează). */
export const BREATHING_MAX_APPEARANCES = 2;

export const PROMPT_KEYS = {
  checkinDismissals:  () => `checkin-${V}-dismissals-${today()}`,
  checkinGuestDone:   () => `checkin-${V}-guest-done-${today()}`,
  checkinSnooze:      `checkin-${V}-snooze-until`,
  breathingDone:      () => `breathing-${V}-done-${today()}`,
  breathingDismissals:() => `breathing-${V}-dismissals-${today()}`,
  breathingSnooze:    `breathing-${V}-snooze-until`,
};

/** Șterge contoarele de azi — ca și cum n-ai fi intrat pe site în ziua asta. */
export function resetTodayPrompts() {
  try {
    [
      PROMPT_KEYS.checkinDismissals(),
      PROMPT_KEYS.checkinGuestDone(),
      PROMPT_KEYS.checkinSnooze,
      PROMPT_KEYS.breathingDone(),
      PROMPT_KEYS.breathingDismissals(),
      PROMPT_KEYS.breathingSnooze,
    ].forEach((k) => localStorage.removeItem(k));
  } catch { /* modul privat / stocare blocată */ }
}

/**
 * Mai are promptul „Respiră" o apariție azi? Check-in-ul îl întreabă înainte de
 * a se afișa: „Respiră" are întâietate, deci check-in-ul își amână apariția.
 */
export function breathingPromptPending() {
  try {
    if (localStorage.getItem(PROMPT_KEYS.breathingDone()) === "1") return false;
    return Number(localStorage.getItem(PROMPT_KEYS.breathingDismissals()) || 0) < BREATHING_MAX_APPEARANCES;
  } catch { return false; }
}

/** Ajutor de testare: `?reset=azi` în URL repornește contoarele zilei. */
export function maybeResetFromUrl() {
  if (typeof window === "undefined") return;
  try {
    if (new URLSearchParams(window.location.search).get("reset") === "azi") resetTodayPrompts();
  } catch { /* ignore */ }
}
