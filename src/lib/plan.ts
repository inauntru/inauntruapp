/** Regula de acces la conținut premium: Standard și Premium deblochează. */
export function hasPremiumAccess(plan: string | null | undefined): boolean {
  return plan === "standard" || plan === "premium";
}
