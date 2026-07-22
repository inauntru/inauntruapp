/**
 * Niveluri de acces la conținut: gratuit < standard < premium.
 * Un utilizator vede conținutul dacă planul lui e cel puțin egal cu
 * nivelul cerut de conținut. Premium are acces la tot.
 */

export type ContentTier = "gratuit" | "standard" | "premium";

const RANK: Record<string, number> = { gratuit: 0, standard: 1, premium: 2 };

export function canAccess(plan: string | null | undefined, tier: string | null | undefined): boolean {
  return (RANK[plan ?? "gratuit"] ?? 0) >= (RANK[tier ?? "gratuit"] ?? 0);
}

/** Compat: adevărat dacă planul deblochează măcar nivelul standard. */
export function hasPremiumAccess(plan: string | null | undefined): boolean {
  return canAccess(plan, "standard");
}

export const TIER_LABEL: Record<ContentTier, string> = {
  gratuit: "Gratuit",
  standard: "Standard",
  premium: "Premium",
};

/** Nivelul unui conținut, cu fallback pentru datele vechi care au doar isPremium. */
export function contentTier(item: { tier?: string | null; isPremium?: boolean; is_premium?: boolean }): ContentTier {
  if (item.tier === "gratuit" || item.tier === "standard" || item.tier === "premium") return item.tier;
  return (item.isPremium ?? item.is_premium) ? "premium" : "gratuit";
}
