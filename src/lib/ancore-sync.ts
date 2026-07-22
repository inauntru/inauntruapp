/**
 * Sincronizarea ancorelor finalizate.
 * Regula: utilizator logat → Supabase (sursa unică, vizibil pe orice dispozitiv);
 * vizitator nelogat → localStorage (fallback), migrat automat la primul login.
 */

export interface AncoraCompletion {
  id: string;
  name: string;
  categorie: string;
  nivel: string;
  completedAt: string;
}

const LS_KEY = "ancore-completed";

function readLocal(): AncoraCompletion[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Înregistrează o finalizare: API dacă e logat, localStorage altfel. */
export async function recordAncoraCompletion(entry: AncoraCompletion, isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn) {
    try {
      const res = await fetch("/api/ancore/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (res.ok) return;
    } catch { /* cade pe localStorage */ }
  }
  const local = readLocal();
  local.push(entry);
  localStorage.setItem(LS_KEY, JSON.stringify(local));
}

/** Migrează istoricul din localStorage în Supabase (o singură dată, la login). */
export async function migrateLocalAncore(): Promise<void> {
  const local = readLocal();
  if (local.length === 0) return;
  try {
    const res = await fetch("/api/ancore/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: local }),
    });
    if (res.ok) localStorage.removeItem(LS_KEY);
  } catch { /* reîncearcă la următoarea vizită */ }
}

/** Istoricul complet: din Supabase pentru cei logați (după migrare), local pentru vizitatori. */
export async function fetchAncoreCompletions(isLoggedIn: boolean): Promise<AncoraCompletion[]> {
  if (!isLoggedIn) return readLocal();
  await migrateLocalAncore();
  try {
    const res = await fetch("/api/ancore/complete");
    if (!res.ok) return readLocal();
    const data = await res.json();
    return (data.completions ?? []).map((c: { ancora_id: string; name: string; categorie: string | null; nivel: string | null; completed_at: string }) => ({
      id: c.ancora_id,
      name: c.name,
      categorie: c.categorie ?? "",
      nivel: c.nivel ?? "",
      completedAt: c.completed_at,
    }));
  } catch {
    return readLocal();
  }
}
