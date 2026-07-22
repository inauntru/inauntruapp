import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PRACTICES, FACILITATORS } from "@/lib/mockData";
import { createServiceClient } from "@/lib/supabase";
import type { Practice, Facilitator } from "@/lib/database.types";
import { GatedPlayer, AccessCard } from "@/components/ui/PracticeAccess";
import {
  ArrowLeft,
  Clock,
  Lock,
  CheckCircle,
  Star,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

export const dynamicParams = true;

export async function generateStaticParams() {
  return PRACTICES.map((p) => ({ id: String(p.id) }));
}

type NormalizedPractice = {
  id: number;
  title: string;
  category: string;
  facilitator: string;
  facilitatorSlug: string;
  duration: number;
  level: string;
  isPremium: boolean;
  tier?: "gratuit" | "standard" | "premium";
  mediaType: string;
  image: string;
  tags: string[];
  longDescription: string;
};

type NormalizedFacilitator = {
  slug: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  bio: string;
};

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
  const fallbackRelated = await getRelated(id, practice.category);

  const levelColor: Record<string, string> = {
    "Începător": "tag-green",
    "Intermediar": "bg-amber-100 text-amber-700",
    "Avansat": "bg-rose-100 text-terracotta",
  };

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero */}
      <div className="relative h-[52vh] lg:h-[62vh] overflow-hidden">
        <Image
          src={practice.image ? `${practice.image}?w=1400&q=85` : "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400&q=85"}
          alt={practice.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/90 via-deep-green/40 to-deep-green/10" />

        {/* Back button */}
        <div className="absolute top-6 left-4 lg:left-8">
          <Link
            href="/practici"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-ui text-body-sm bg-black/25 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft size={15} weight="bold" />
            Practici
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 lg:px-8 pb-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="tag tag-green">{practice.category}</span>
            {practice.isPremium
              ? <span className="tag bg-amber-100/20 text-amber-200 border border-amber-200/30">Premium</span>
              : <span className="tag bg-primary-fixed-dim/20 text-primary-fixed-dim border border-primary-fixed-dim/30">Gratuit</span>
            }
          </div>
          <h1 className="font-heading text-h1 text-white mb-3 max-w-2xl">{practice.title}</h1>
          <div className="flex flex-wrap items-center gap-5 text-white/60 font-ui text-body-sm">
            <span className="flex items-center gap-1.5">
              <Clock size={15} weight="regular" />
              {practice.duration} min
            </span>
            <span className={`tag ${levelColor[practice.level] ?? "tag-outline"}`}>{practice.level}</span>
            {facilitator && (
              <span className="flex items-center gap-1.5">
                <Star size={14} weight="fill" className="text-amber-400" />
                {facilitator.rating} · {facilitator.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">

          {/* Left: Player + Description + Tags */}
          <div className="lg:col-span-2 space-y-8">
            <GatedPlayer
              title={practice.title}
              duration={practice.duration}
              isPremium={practice.isPremium}
              tier={practice.tier}
              mediaType={practice.mediaType as "audio" | "video"}
              practiceId={practice.id}
            />

            <div>
              <h2 className="font-heading text-h3 text-deep-green mb-4">Despre această practică</h2>
              <p className="font-body text-body-lg text-secondary-text leading-relaxed">
                {practice.longDescription}
              </p>
            </div>

            <div>
              <p className="font-ui text-label-xs text-secondary-text uppercase tracking-widest mb-3">Etichete</p>
              <div className="flex flex-wrap gap-2">
                {practice.tags.map((tag) => (
                  <span key={tag} className="tag tag-outline">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: CTA + Facilitator + Quick info */}
          <div className="space-y-5">
            {/* CTA card — se adaptează la planul utilizatorului */}
            <AccessCard isPremium={practice.isPremium} tier={practice.tier} />

            {/* Quick info */}
            <div className="card p-5 space-y-3">
              <p className="font-ui text-label-xs text-secondary-text uppercase tracking-widest mb-1">Detalii practică</p>
              {[
                { label: "Durată", value: `${practice.duration} minute` },
                { label: "Nivel", value: practice.level },
                { label: "Categorie", value: practice.category },
                { label: "Format", value: practice.mediaType === "video" ? "Video ghidat" : "Audio ghidat" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-ui text-body-sm text-secondary-text">{label}</span>
                  <span className="font-ui text-body-sm font-medium text-deep-green">{value}</span>
                </div>
              ))}
            </div>

            {/* Facilitator card */}
            {facilitator && (
              <div className="card p-5">
                <p className="font-ui text-label-xs text-secondary-text uppercase tracking-widest mb-4">Facilitator</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-light-green border-2 border-sage-border flex items-center justify-center flex-shrink-0 font-heading text-forest-green text-lg font-bold">
                    {facilitator.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-body-md text-deep-green">{facilitator.name}</p>
                    <p className="font-body text-label-xs text-secondary-text">{facilitator.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} weight="fill" className="text-amber-400" />
                      <span className="font-ui text-[11px] text-secondary-text">{facilitator.rating} ({facilitator.reviews} recenzii)</span>
                    </div>
                  </div>
                </div>
                <p className="font-body text-body-sm text-secondary-text line-clamp-3 mb-4">{facilitator.bio}</p>
                <Link
                  href={`/facilitatori/${facilitator.slug}`}
                  className="inline-flex items-center gap-1 font-ui text-body-sm text-forest-green hover:text-deep-green transition-colors"
                >
                  Vezi profil complet <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Related practices */}
        {fallbackRelated.length > 0 && (
          <div className="mt-16 pt-10 border-t border-sage-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-h2 text-deep-green">Practici recomandate</h2>
              <Link href="/practici" className="font-ui text-body-sm text-forest-green hover:text-deep-green transition-colors flex items-center gap-1">
                Vezi toate <ArrowRight size={13} weight="bold" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fallbackRelated.map((p) => (
                <Link key={p.id} href={`/practici/${p.id}`} className="block group card card-lift overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={p.image ? `${p.image}?w=600&q=80` : "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80"}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-green/50 to-transparent" />
                    <span className="absolute top-3 left-3 tag tag-green">{p.category}</span>
                    {p.isPremium && (
                      <div className="absolute top-3 right-3 w-7 h-7 bg-deep-green/80 backdrop-blur rounded-full flex items-center justify-center">
                        <Lock size={13} weight="fill" className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-body font-semibold text-body-md text-deep-green mb-1 line-clamp-2 group-hover:text-forest-green transition-colors">
                      {p.title}
                    </h3>
                    <p className="font-body text-label-xs text-secondary-text mb-2">{p.facilitator}</p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-body text-label-xs text-secondary-text">
                        <Clock size={11} /> {p.duration} min
                      </span>
                      <span className="tag tag-outline">{p.level}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
