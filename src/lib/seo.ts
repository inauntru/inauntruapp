/**
 * Imaginea care apare când cineva dă link către site pe WhatsApp, Facebook sau LinkedIn.
 *
 * Fișierul e src/app/opengraph-image.png (1200×630) și se regenerează cu
 * `node scripts/genereaza-og-image.js`.
 *
 * De ce e nevoie de constanta asta: Next.js pune imaginea automat doar pe paginile
 * care NU își declară singure setările de share. Paginile care își scriu propriul
 * titlu de share o pierdeau, așa că o adăugăm explicit la fiecare.
 */
export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "WithIn — Întoarce-te la tine",
} as const;

/** Aceeași imagine, în forma cerută de cardul de Twitter/X. */
export const OG_IMAGE_URL = OG_IMAGE.url;
