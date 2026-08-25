import { notFound } from "next/navigation";
import { PRACTICES, FACILITATORS } from "@/lib/mockData";
import { createServiceClient } from "@/lib/supabase";
import type { Practice, Facilitator } from "@/lib/database.types";
import PracticeDetailClient, {
  type NormalizedPractice,
  type NormalizedFacilitator,
} from "./PracticeDetailClient";

export const dynamicParams = true;

export async function generateStaticParams() {
  return PRACTICES.map((p) => ({ id: String(p.id) }));
}

async function getPractice(id: number): Promise<NormalizedPractice | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("practices")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      const p = data as Practice;
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        facilitator: p.facilitator_name ?? "",
        facilitatorSlug: p.facilitator_slug ?? "",
        duration: p.duration,
        level: p.level,
        isPremium: p.is_premium,
        tier: ((p as Practice & { tier?: string }).tier ?? (p.is_premium ? "premium" : "gratuit")) as NormalizedPractice["tier"],
        mediaType: p.media_type ?? "audio",
        image: p.image_url ?? "",
        tags: p.tags ?? [],
        longDescription: p.long_description ?? p.description ?? "",
      };
    }
  } catch {}

  const mock = PRACTICES.find((p) => p.id === id);
  return mock ? (mock as unknown as NormalizedPractice) : null;
}

async function getFacilitatorBySlug(slug: string): Promise<NormalizedFacilitator | null> {
  if (!slug) return null;
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("facilitators")
      .select("*")
      .eq("slug", slug)
      .single();

    if (data) {
      const f = data as Facilitator;
      return {
        slug: f.slug,
        name: f.name,
        title: f.specialty ?? "",
        rating: f.rating ?? 5.0,
        reviews: f.sessions_count ?? 0,
        bio: f.bio ?? "",
      };
    }
  } catch {}

  const mock = FACILITATORS.find((f) => f.slug === slug);
  return mock ? (mock as unknown as NormalizedFacilitator) : null;
}

async function getRelated(id: number, category: string): Promise<NormalizedPractice[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("practices")
      .select("*")
      .eq("status", "active")
      .eq("category", category)
      .neq("id", id)
      .limit(3);

    if (data && data.length > 0) {
      return (data as Practice[]).map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        facilitator: p.facilitator_name ?? "",
        facilitatorSlug: p.facilitator_slug ?? "",
        duration: p.duration,
        level: p.level,
        isPremium: p.is_premium,
        mediaType: p.media_type ?? "audio",
        image: p.image_url ?? "",
        tags: p.tags ?? [],
        longDescription: p.long_description ?? "",
      }));
    }
  } catch {}

  const related = PRACTICES.filter((p) => p.id !== id && p.category === category).slice(0, 3);
  if (related.length > 0) return related as unknown as NormalizedPractice[];
  return PRACTICES.filter((p) => p.id !== id).slice(0, 3) as unknown as NormalizedPractice[];
}

export default async function PracticeDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const practice = await getPractice(id);
  if (!practice) notFound();

  const facilitator = await getFacilitatorBySlug(practice.facilitatorSlug);
  const related = await getRelated(id, practice.category);

  // Randarea vizibilă e în componenta client, ca textele să poată fi traduse RO/EN.
  return <PracticeDetailClient practice={practice} facilitator={facilitator} related={related} />;
}
