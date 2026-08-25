import { createServiceClient } from "./supabase";

/**
 * Suprascrierea textelor din Admin → Texte site.
 * DEZACTIVAT (2026-08): textele editate din admin nu se traduc în EN (sunt
 * scrise diferit față de dicționar), așa că textele vin exclusiv din cod,
 * unde au și traducere. Pune true ca să reactivezi funcția.
 */
export const SITE_CONTENT_OVERRIDES_ENABLED = false;

export async function getSiteContent(page: string): Promise<Record<string, string>> {
  if (!SITE_CONTENT_OVERRIDES_ENABLED) return {};
  try {
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("settings")
      .select("value")
      .eq("key", "site_content")
      .maybeSingle();
    if (data?.value?.[page]) {
      return data.value[page] as Record<string, string>;
    }
  } catch {
    // build-time network error — use component fallbacks
  }
  return {};
}
