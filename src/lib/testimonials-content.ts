import { TESTIMONIALS } from "@/lib/mockData";

/**
 * Recenziile de pe prima pagină, cu textele din Admin → Texte site → Acasă.
 *
 * Până acum se putea edita doar titlul secțiunii; recenziile în sine erau scrise
 * în cod. Acum fiecare are patru câmpuri, pentru fiecare poziție n de la 1 la 6:
 *   tn_name, tn_city, tn_stars, tn_quote
 *
 * O recenzie al cărei citat e șters nu mai apare pe site. Așa se pot afișa trei
 * recenzii în loc de șase fără să fie nevoie de cod.
 */

export interface Testimonial {
  id: number;
  name: string;
  city: string;
  stars: number;
  quote: string;
}

export const MAX_TESTIMONIALE = 6;

/** Numărul de stele, limitat la intervalul care se poate desena. */
function stele(brut: string | undefined, implicit: number): number {
  if (brut === undefined || brut.trim() === "") return implicit;
  const n = Math.round(Number(brut.trim()));
  if (!Number.isFinite(n)) return implicit;
  return Math.min(5, Math.max(1, n));
}

function text(brut: string | undefined, implicit: string): string {
  return brut !== undefined && brut.trim() !== "" ? brut.trim() : implicit;
}

export function resolveTestimonials(overrides: Record<string, string> = {}): Testimonial[] {
  const rezultat: Testimonial[] = [];

  for (let i = 1; i <= MAX_TESTIMONIALE; i++) {
    const implicit = TESTIMONIALS[i - 1];
    const citatScris = overrides[`t${i}_quote`];

    // Citat sters dinadins → recenzia nu se mai afiseaza
    if (citatScris !== undefined && citatScris.trim() === "") continue;

    const quote = text(citatScris, implicit?.quote ?? "");
    if (!quote) continue;

    rezultat.push({
      id: i,
      name: text(overrides[`t${i}_name`], implicit?.name ?? ""),
      city: text(overrides[`t${i}_city`], implicit?.city ?? ""),
      stars: stele(overrides[`t${i}_stars`], implicit?.stars ?? 5),
      quote,
    });
  }

  return rezultat;
}

/** Inițialele afișate în bulina de lângă nume. */
export function initiale(nume: string): string {
  return nume
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("");
}
