"use client";

/**
 * Corpul vizibil al paginii de practică — componentă client ca să poată
 * folosi `tr()` (traducere RO/EN). Primește datele deja normalizate din
 * page.tsx (care rămâne server component pentru fetch + static params).
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Lock, Star, ArrowRight } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { GatedPlayer, AccessCard } from "@/components/ui/PracticeAccess";

export type NormalizedPractice = {
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

export type NormalizedFacilitator = {
  slug: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  bio: string;
};

interface Props {
  practice: NormalizedPractice;
  facilitator: NormalizedFacilitator | null;
  related: NormalizedPractice[];
}

const LEVEL_COLOR: Record<string, string> = {
  "Începător": "tag-green",
  "Intermediar": "bg-amber-100 text-amber-700",
  "Avansat": "bg-rose-100 text-terracotta",
};

const FALLBACK_HERO = "https://images.unsplash.com/photo-1506126613408-eca07ce68773";

export default function PracticeDetailClient({ practice, facilitator, related }: Props) {
  const { tr } = useLanguage();

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero */}
      <div className="relative h-[52vh] lg:h-[62vh] overflow-hidden">
        <Image
          src={practice.image ? `${practice.image}?w=1400&q=85` : `${FALLBACK_HERO}?w=1400&q=85`}
          alt={tr(practice.title)}
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
            {tr("Practici")}
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 lg:px-8 pb-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="tag tag-green">{tr(practice.category)}</span>
            {practice.isPremium
              ? <span className="tag bg-amber-100/20 text-amber-200 border border-amber-200/30">{tr("Premium")}</span>
              : <span className="tag bg-primary-fixed-dim/20 text-primary-fixed-dim border border-primary-fixed-dim/30">{tr("Gratuit")}</span>
            }
          </div>
          <h1 className="font-heading text-h1 text-white mb-3 max-w-2xl">{tr(practice.title)}</h1>
          <div className="flex flex-wrap items-center gap-5 text-white/60 font-ui text-body-sm">
            <span className="flex items-center gap-1.5">
              <Clock size={15} weight="regular" />
              {practice.duration} min
            </span>
            <span className={`tag ${LEVEL_COLOR[practice.level] ?? "tag-outline"}`}>{tr(practice.level)}</span>
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
              title={tr(practice.title)}
              duration={practice.duration}
              isPremium={practice.isPremium}
              tier={practice.tier}
              mediaType={practice.mediaType as "audio" | "video"}
              practiceId={practice.id}
            />

            <div>
              <h2 className="font-heading text-h3 text-deep-green mb-4">{tr("Despre această practică")}</h2>
              <p className="font-body text-body-lg text-secondary-text leading-relaxed">
                {tr(practice.longDescription)}
              </p>
            </div>

            <div>
              <p className="font-ui text-label-xs text-secondary-text uppercase tracking-widest mb-3">{tr("Etichete")}</p>
              <div className="flex flex-wrap gap-2">
                {practice.tags.map((tag) => (
                  <span key={tag} className="tag tag-outline">{tr(tag)}</span>
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
              <p className="font-ui text-label-xs text-secondary-text uppercase tracking-widest mb-1">{tr("Detalii practică")}</p>
              {[
                { label: tr("Durată"), value: `${practice.duration} ${tr("minute")}` },
                { label: tr("Nivel"), value: tr(practice.level) },
                { label: tr("Categorie"), value: tr(practice.category) },
                { label: tr("Format"), value: practice.mediaType === "video" ? tr("Video ghidat") : tr("Audio ghidat") },
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
                <p className="font-ui text-label-xs text-secondary-text uppercase tracking-widest mb-4">{tr("Facilitator")}</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-light-green border-2 border-sage-border flex items-center justify-center flex-shrink-0 font-heading text-forest-green text-lg font-bold">
                    {facilitator.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-body-md text-deep-green">{facilitator.name}</p>
                    <p className="font-body text-label-xs text-secondary-text">{tr(facilitator.title)}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} weight="fill" className="text-amber-400" />
                      <span className="font-ui text-[11px] text-secondary-text">{facilitator.rating} ({facilitator.reviews} {tr("recenzii")})</span>
                    </div>
                  </div>
                </div>
                <p className="font-body text-body-sm text-secondary-text line-clamp-3 mb-4">{tr(facilitator.bio)}</p>
                <Link
                  href={`/facilitatori/${facilitator.slug}`}
                  className="inline-flex items-center gap-1 font-ui text-body-sm text-forest-green hover:text-deep-green transition-colors"
                >
                  {tr("Vezi profil complet")} <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Related practices */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-sage-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-h2 text-deep-green">{tr("Practici recomandate")}</h2>
              <Link href="/practici" className="font-ui text-body-sm text-forest-green hover:text-deep-green transition-colors flex items-center gap-1">
                {tr("Vezi toate")} <ArrowRight size={13} weight="bold" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/practici/${p.id}`} className="block group card card-lift overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={p.image ? `${p.image}?w=600&q=80` : `${FALLBACK_HERO}?w=600&q=80`}
                      alt={tr(p.title)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-green/50 to-transparent" />
                    <span className="absolute top-3 left-3 tag tag-green">{tr(p.category)}</span>
                    {p.isPremium && (
                      <div className="absolute top-3 right-3 w-7 h-7 bg-deep-green/80 backdrop-blur rounded-full flex items-center justify-center">
                        <Lock size={13} weight="fill" className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-body font-semibold text-body-md text-deep-green mb-1 line-clamp-2 group-hover:text-forest-green transition-colors">
                      {tr(p.title)}
                    </h3>
                    <p className="font-body text-label-xs text-secondary-text mb-2">{p.facilitator}</p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-body text-label-xs text-secondary-text">
                        <Clock size={11} /> {p.duration} min
                      </span>
                      <span className="tag tag-outline">{tr(p.level)}</span>
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
