/**
 * Acordul explicit pentru datele despre starea utilizatorului.
 *
 * Ce notează cineva la check-in (starea emoțională, zonele din corp, intensitatea,
 * notița) și ce scrie în jurnal sunt, în contextul acestei platforme, date privind
 * sănătatea. Regulamentul le tratează ca o categorie specială (art. 9) și cere un
 * acord explicit, dat separat — acceptarea Termenilor la înregistrare nu acoperă
 * această prelucrare.
 *
 * De aceea acordul se cere o singură dată, distinct, înainte de primul check-in și
 * de prima însemnare, se înregistrează cu momentul exact (ca să poată fi dovedit) și
 * poate fi retras oricând din setările contului.
 *
 * Verificarea se face pe server, la scriere. O verificare doar în interfață nu ar fi
 * o garanție: cererea poate fi trimisă și direct.
 */

import { createServiceClient } from "@/lib/supabase";

export interface HealthConsent {
  consented: boolean;
  /** Când a fost dat acordul, dacă e activ. */
  at: string | null;
  /** Când a fost retras ultima dată, dacă s-a întâmplat. */
  withdrawnAt: string | null;
}

export const CONSENT_REQUIRED_CODE = "health_consent_required";

/** Citește starea acordului pentru un utilizator. */
export async function getHealthConsent(userId: string): Promise<HealthConsent> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any;
  const { data } = await service
    .from("profiles")
    .select("health_consent_at, health_consent_withdrawn_at")
    .eq("id", userId)
    .maybeSingle();

  const at = (data?.health_consent_at as string | null) ?? null;
  return {
    consented: !!at,
    at,
    withdrawnAt: (data?.health_consent_withdrawn_at as string | null) ?? null,
  };
}

/** Adevărat dacă utilizatorul poate scrie date despre starea lui. */
export async function hasHealthConsent(userId: string): Promise<boolean> {
  return (await getHealthConsent(userId)).consented;
}

/** Înregistrează acordul. Momentul se păstrează ca dovadă. */
export async function grantHealthConsent(userId: string): Promise<string> {
  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any;
  await service.from("profiles").update({ health_consent_at: now }).eq("id", userId);
  return now;
}

/**
 * Retrage acordul. Datele deja înregistrate rămân până când utilizatorul cere
 * ștergerea lor — retragerea oprește prelucrările viitoare, nu le anulează pe
 * cele făcute legal până atunci.
 */
export async function withdrawHealthConsent(userId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any;
  await service
    .from("profiles")
    .update({ health_consent_at: null, health_consent_withdrawn_at: new Date().toISOString() })
    .eq("id", userId);
}

/** Șterge tot ce a fost înregistrat despre starea utilizatorului. */
export async function deleteHealthData(userId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any;
  await Promise.all([
    service.from("check_ins").delete().eq("user_id", userId),
    service.from("journal_entries").delete().eq("user_id", userId),
  ]);
  await service.from("profiles").update({ check_ins_count: 0 }).eq("id", userId);
}
