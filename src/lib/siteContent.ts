import { createServiceClient } from "./supabase";

/**
 * Suprascrierea textelor din Admin → Texte site.
 * REACTIVAT (2026-09): site-ul rulează doar în română (I18N_ENABLED = false),
 * deci textele editate din admin nu mai intră în conflict cu traducerea EN.
 */
export const SITE_CONTENT_OVERRIDES_ENABLED = true;

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
