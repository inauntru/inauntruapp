/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Dosarele bibliotecii de imagini.
 *
 * Sunt etichete ținute în tabelul `settings`, NU căi reale în stocare. Așa poți
 * muta o poză dintr-un dosar în altul fără să i se schimbe adresa — deci fără
 * să se strice imaginile deja folosite pe site.
 */

export const FOLDERS_KEY = "media_folders";

export interface FoldersState {
  folders: string[];
  /** cale fișier → numele dosarului */
  assign: Record<string, string>;
}

export async function readFolders(service: any): Promise<FoldersState> {
  const { data } = await service.from("settings").select("value").eq("key", FOLDERS_KEY).maybeSingle();
  const value = data?.value ?? {};
  return {
    folders: Array.isArray(value.folders) ? value.folders : [],
    assign: value.assign && typeof value.assign === "object" ? value.assign : {},
  };
}

export async function writeFolders(service: any, state: FoldersState) {
  await service.from("settings").upsert({ key: FOLDERS_KEY, value: state });
}

/** Curăță numele unui dosar: fără spații la capete, lungime rezonabilă. */
export function cleanFolderName(name: unknown): string {
  return typeof name === "string" ? name.trim().slice(0, 40) : "";
}
