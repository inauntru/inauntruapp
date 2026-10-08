import { PRICING_PLANS } from "@/lib/mockData";

/**
 * Planurile de preț, cu textele și sumele din Admin → Texte site → Prețuri.
 *
 * Până acum câmpurile p1_name, p1_feat1 și celelalte existau în formularul din
 * admin, dar nu erau citite nicăieri: ce se scria acolo nu ajungea pe site.
 * Aici se face legătura, o singură dată, ca pagina Prețuri și secțiunea de
 * prețuri de pe prima pagină să arate întotdeauna la fel.
 *
 * Cheile așteptate, pentru fiecare plan n de la 1 la 3:
 *   pn_name, pn_desc, pn_price, pn_price_annual, pn_cta
 *   pn_feat1 … pn_feat8   (ce e inclus)
 *   pn_miss1 … pn_miss4   (ce nu e inclus)
 *
 * Un câmp lăsat gol înseamnă „păstrează ce era", iar la liste un câmp gol scoate
 * rândul — așa se poate scurta o listă fără să fie nevoie de cod.
 */

export type Plan = (typeof PRICING_PLANS)[number];

const MAX_FEATURES = 8;
const MAX_MISSING = 4;

/** Numărul scris în admin, dacă e un număr valid; altfel valoarea existentă. */
function numar(brut: string | undefined, implicit: number): number {
  if (brut === undefined || brut.trim() === "") return implicit;
  const n = Number(brut.replace(",", ".").trim());
  return Number.isFinite(n) && n >= 0 ? n : implicit;
}

function text(brut: string | undefined, implicit: string): string {
  return brut !== undefined && brut.trim() !== "" ? brut.trim() : implicit;
}

/**
 * Citește o listă numerotată (pn_feat1, pn_feat2, …). Dacă niciun câmp nu e
 * completat, rămâne lista originală — altfel ar dispărea totul la prima salvare.
 */
function lista(
  overrides: Record<string, string>,
  prefix: string,
  cate: number,
  implicita: readonly string[]
): string[] {
  const scrise: string[] = [];
  let areCeva = false;
  for (let i = 1; i <= cate; i++) {
    const v = overrides[`${prefix}${i}`];
    if (v !== undefined && v.trim() !== "") { scrise.push(v.trim()); areCeva = true; }
    else if (v === undefined && i <= implicita.length) scrise.push(implicita[i - 1]);
  }
  return areCeva || scrise.length > 0 ? scrise : [...implicita];
}

export function resolvePlans(overrides: Record<string, string> = {}): Plan[] {
  return PRICING_PLANS.map((plan, index) => {
    const n = index + 1;
    return {
      ...plan,
      name: text(overrides[`p${n}_name`], plan.name),
      description: text(overrides[`p${n}_desc`], plan.description),
      price: numar(overrides[`p${n}_price`], plan.price),
      priceAnnual: numar(overrides[`p${n}_price_annual`], plan.priceAnnual),
      cta: text(overrides[`p${n}_cta`], plan.cta),
      features: lista(overrides, `p${n}_feat`, MAX_FEATURES, plan.features),
      notIncluded: lista(overrides, `p${n}_miss`, MAX_MISSING, plan.notIncluded),
    };
  });
}
