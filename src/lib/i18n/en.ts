/**
 * Dicționarul englez — cheia este textul românesc exact.
 * Organizat pe module; totul se combină aici într-un singur obiect.
 */
import { EN_HOME } from "./en-home";
import { EN_AUTH } from "./en-auth";

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
};
