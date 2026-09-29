import { MetadataRoute } from "next";
import { SESIUNI_LIVE_PAGE_ENABLED, SOMN_PAGE_ENABLED } from "@/lib/features";
import { createServiceClient } from "@/lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.ro";

/**
 * Harta site-ului pentru Google. Pe lângă paginile fixe, include acum și fiecare
 * articol, practică și facilitator — altfel Google nu avea de unde ști că există.
 * Dacă baza de date nu răspunde, rămân paginile fixe; o hartă parțială e mai bună
 * decât una lipsă.
 */
async function dynamicEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createServiceClient();

    const [posts, practices, facilitators] = await Promise.all([
      supabase.from("blog_posts").select("slug, updated_at, published_at").eq("published", true),
      supabase.from("practices").select("id, updated_at").eq("status", "active"),
      supabase.from("facilitators").select("slug, created_at").eq("is_active", true),
    ]);

    const when = (v: unknown) => (typeof v === "string" ? new Date(v) : new Date());

    return [
      ...((posts.data ?? []) as { slug: string; updated_at?: string; published_at?: string }[]).map((p) => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: when(p.updated_at ?? p.published_at),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...((practices.data ?? []) as { id: number; updated_at?: string }[]).map((p) => ({
        url: `${BASE_URL}/practici/${p.id}`,
        lastModified: when(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...((facilitators.data ?? []) as { slug: string; created_at?: string }[]).map((f) => ({
        url: `${BASE_URL}/facilitatori/${f.slug}`,
        lastModified: when(f.created_at),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const fixed: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/practici`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/ancore`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...(SOMN_PAGE_ENABLED
      ? [{ url: `${BASE_URL}/somn`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    ...(SESIUNI_LIVE_PAGE_ENABLED
      ? [{ url: `${BASE_URL}/sesiuni-live`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 }]
      : []),
    { url: `${BASE_URL}/facilitatori`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/preturi`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/despre-noi`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  return [...fixed, ...(await dynamicEntries())];
}
