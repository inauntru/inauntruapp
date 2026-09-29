import type { Metadata } from "next";
import { OG_IMAGE, OG_IMAGE_URL } from "@/lib/seo";
import { createServiceClient } from "@/lib/supabase";
import { FACILITATORS } from "@/lib/mockData";
import type { Facilitator } from "@/lib/database.types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://withinapp.ro";

/**
 * Pagina facilitatorului e componentă client (are nevoie de traducerea RO/EN),
 * iar o componentă client nu poate declara titlul paginii. De aceea titlul,
 * descrierea și adresa canonică se declară aici, în layout-ul de deasupra ei.
 */
async function getFacilitator(slug: string) {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("facilitators")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (data) {
      const f = data as Facilitator;
      return {
        name: f.name,
        specialty: f.specialty ?? "",
        bio: f.bio ?? "",
        photo: f.image_url ?? "",
      };
    }
  } catch {}

  const mock = FACILITATORS.find((f) => f.slug === slug);
  if (!mock) return null;
  return { name: mock.name, specialty: mock.title ?? "", bio: mock.bio ?? "", photo: mock.photo ?? "" };
}

/** Taie descrierea la lungimea pe care Google chiar o afișează, fără să rupă un cuvânt. */
function shorten(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const f = await getFacilitator(params.slug);
  if (!f) return { title: "Facilitatorul nu a fost găsit" };

  const url = `${BASE_URL}/facilitatori/${params.slug}`;
  const description = f.bio
    ? shorten(f.bio)
    : `${f.name}${f.specialty ? ` — ${f.specialty}` : ""}. Practici ghidate de meditație și respirație pe WithIn.`;

  return {
    title: f.specialty ? `${f.name} — ${f.specialty}` : f.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title: f.name,
      description,
      url,
      siteName: "WithIn",
      locale: "ro_RO",
      images: f.photo ? [{ url: f.photo, alt: f.name }] : [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: f.name,
      description,
      images: f.photo ? [f.photo] : [OG_IMAGE_URL],
    },
  };
}

export default function FacilitatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
