"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  BookOpen,
  Certificate,
  ArrowRight,
  Play,
} from "@phosphor-icons/react";
import { FACILITATORS, PRACTICES } from "@/lib/mockData";
import { getFacilitators } from "@/lib/getFacilitators";
import { useUsers } from "@/contexts/UsersContext";

export default function FacilitatorPage({ params }: { params: { slug: string } }) {
  const { users } = useUsers();
  const adminFacilitators = getFacilitators(users);

  const facilitator =
    FACILITATORS.find((f) => f.slug === params.slug) ||
    adminFacilitators.find((f) => f.slug === params.slug) ||
    FACILITATORS[0];

  const practices = PRACTICES.filter((p) => p.facilitator === facilitator.name);

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/facilitatori" className="inline-flex items-center gap-2 text-secondary-text hover:text-forest-green transition-colors font-body text-body-sm">
          <ArrowLeft size={16} weight="bold" />
          Toți facilitatorii
        </Link>
      </div>

      {/* Profile header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Photo + quick stats */}
          <div className="lg:col-span-1">
            <div className="card p-6 text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden relative">
                <Image
                  src={facilitator.photo}
                  alt={facilitator.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="font-heading text-h3 text-deep-green mb-1">{facilitator.name}</h1>
              <p className="font-body text-body-sm text-secondary-text mb-3">{facilitator.title}</p>

              <div className="flex items-center justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    weight={i < Math.floor(facilitator.rating) ? "fill" : "regular"}
                    className="text-terracotta"
                  />
                ))}
                <span className="font-body text-label-xs text-secondary-text ml-1">
                  {facilitator.rating} ({facilitator.reviews} recenzii)
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                {facilitator.tags.map((tag) => (
                  <span key={tag} className="tag tag-green">{tag}</span>
                ))}
              </div>

              <Link href="/register" className="btn btn-primary w-full">
                Accesează practicile <ArrowRight size={16} weight="bold" />
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="card p-4 text-center">
                <p className="font-heading text-2xl font-bold text-forest-green">{facilitator.practiceDuration}</p>
                <p className="font-body text-label-xs text-secondary-text">Experiență</p>
              </div>
              <div className="card p-4 text-center">
                <p className="font-heading text-2xl font-bold text-forest-green">{practices.length}</p>
                <p className="font-body text-label-xs text-secondary-text">Practici</p>
              </div>
            </div>
          </div>

          {/* Bio + certifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="card p-6">
              <h2 className="font-heading text-h3 text-deep-green mb-4">Despre {facilitator.name.split(" ")[0]}</h2>
              <p className="font-body text-body-md text-secondary-text leading-relaxed">{facilitator.bio}</p>
            </div>

            {/* Video intro placeholder */}
            <div className="card overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-deep-green/20 to-forest-green/10 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-forest-green flex items-center justify-center shadow-button cursor-pointer hover:scale-105 transition-transform">
                  <Play size={28} weight="fill" className="text-white ml-1" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <p className="font-body text-label-xs text-white/60">Intro video · 2 min</p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            {facilitator.certifications.length > 0 && (
              <div className="card p-6">
                <h3 className="font-heading text-h3 text-deep-green mb-4 flex items-center gap-2">
                  <Certificate size={20} weight="regular" className="text-forest-green" />
                  Certificări
                </h3>
                <ul className="space-y-2">
                  {facilitator.certifications.map((cert) => (
                    <li key={cert} className="flex items-start gap-2 font-body text-body-sm text-secondary-text">
                      <div className="w-1.5 h-1.5 rounded-full bg-forest-green mt-2 flex-shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Practices by this facilitator */}
      {practices.length > 0 && (
        <section className="py-12 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-h2 text-deep-green mb-8 flex items-center gap-2">
              <BookOpen size={24} weight="regular" className="text-forest-green" />
              Practicile lui {facilitator.name.split(" ")[0]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {practices.map((p) => (
                <div key={p.id} className="card card-lift p-5">
                  <div className="aspect-video bg-gradient-to-br from-forest-green/15 to-deep-green/10 rounded-xl mb-4 flex items-center justify-center">
                    <Play size={24} weight="fill" className="text-forest-green/50" />
                  </div>
                  <span className="tag tag-green mb-2">{p.category}</span>
                  <h3 className="font-body font-semibold text-body-sm text-deep-green mb-1">{p.title}</h3>
                  <p className="font-body text-label-xs text-secondary-text">{p.duration} min · {p.level}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
