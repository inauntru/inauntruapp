import { createServiceClient } from "./supabase";

export async function getSiteContent(page: string): Promise<Record<string, string>> {
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
