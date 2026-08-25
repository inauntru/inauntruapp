/**
 * Dicționarul englez — cheia este textul românesc exact.
 * Organizat pe module; totul se combină aici într-un singur obiect.
 */
import { EN_HOME } from "./en-home";
import { EN_AUTH } from "./en-auth";
import { EN_PRACTICI } from "./en-practici";
import { EN_ANCORE } from "./en-ancore";
import { EN_DESCOPERA } from "./en-descopera";
import { EN_DASHBOARD } from "./en-dashboard";
import { EN_CONTENT } from "./en-content";
import { EN_DETAIL } from "./en-detail";
import { EN_QUOTES } from "./en-quotes";

const EN_BASE: Record<string, string> = {
  // ── Navbar ──
  "Practici": "Practices",
  "Ancore": "Anchors",
  "Sesiuni Live": "Live Sessions",
  "Facilitatori": "Facilitators",
  "Prețuri": "Pricing",
  "Inspirație": "Inspiration",
  "Despre noi": "About us",
  "Spațiul meu": "My space",
  "Începe călătoria": "Start your journey",
  "Dashboard": "Dashboard",
  "Contul meu": "My account",
  "Deconectare": "Sign out",
  "Deschide meniu": "Open menu",

  // ── Footer ──
  "Platformă": "Platform",
  "Companie": "Company",
  "Legal": "Legal",
  "Devino facilitator": "Become a facilitator",
  "Parteneriate B2B": "B2B Partnerships",
  "Termeni și condiții": "Terms & Conditions",
  "Politica de confidențialitate": "Privacy Policy",
  "Politica cookies": "Cookie Policy",
  "Practici bazate pe știință pentru echilibrul tău interior. Întoarce-te la tine în mai puțin de 2 minute.":
    "Science-based practices for your inner balance. Come back to yourself in under 2 minutes.",
  "Email-ul tău": "Your email",
  "Te-ai abonat! Ne auzim curând.": "You're subscribed! Talk soon.",
  "Abonează-te": "Subscribe",
  "Linie de criză:": "Crisis line:",
  "Dacă ești în criză, nu folosi această platformă. Sună la": "If you are in crisis, do not use this platform. Call",
  "(gratuit, 24/7)": "(free, 24/7)",
  "© 2026 WithIn. Toate drepturile rezervate.": "© 2026 WithIn. All rights reserved.",

  // ── Comune ──
  "Salvează": "Save",
  "Anulează": "Cancel",
  "Se încarcă...": "Loading...",
  "Se salvează...": "Saving...",
  "Rezervă": "Reserve",
  "Rezervat": "Reserved",
  "Gratuit": "Free",
  "Standard": "Standard",
  "Premium": "Premium",
};

export const EN: Record<string, string> = {
  ...EN_BASE,
  ...EN_HOME,
  ...EN_AUTH,
  ...EN_PRACTICI,
  ...EN_ANCORE,
  ...EN_DESCOPERA,
  ...EN_DASHBOARD,
  ...EN_CONTENT,
  ...EN_DETAIL,
  ...EN_QUOTES,
};

/**
 * Căutare tolerantă: textele editate din admin pot fi scrise fără diacritice
 * sau cu spații ușor diferite. Normalizăm ambele părți ca să se potrivească.
 */
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const EN_NORMALIZED: Record<string, string> = {};
for (const [k, v] of Object.entries(EN)) {
  const nk = normalize(k);
  if (!(nk in EN_NORMALIZED)) EN_NORMALIZED[nk] = v;
}

/** Traducerea unui text românesc: potrivire exactă, apoi normalizată. */
export function translateEn(ro: string): string {
  return EN[ro] ?? EN_NORMALIZED[normalize(ro)] ?? ro;
}
