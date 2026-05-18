"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import AnimateIn from "@/components/ui/AnimateIn";
import { FACILITATORS_DATA } from "@/lib/facilitators";

const ALL_SPECIALTIES = ["Toți", "Traumă", "Anxietate", "Burnout", "Somn", "Energie", "Mișcare", "Respirație", "Relații", "Meditație", "Reglare", "Corp", "Stres", "Claritate"];

type Facilitator = typeof FACILITATORS_DATA[0];

export default function FacilitatoriPage() {
  const [facilitators, setFacilitators] = useState<Facilitator[]>(FACILITATORS_DATA);
  const [specialty, setSpecialty] = useState("Toți");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/facilitators")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalize API shape to match FACILITATORS_DATA shape
          setFacilitators(data.map((f) => ({
            id: f.id,
            slug: f.slug,
            name: f.name,
            specialty: f.title ?? f.specialty ?? "",
            bio: f.bio ?? "",
            image: f.photo ?? f.image ?? "",
            rating: f.rating ?? 5.0,
            sessions: f.reviews ?? f.sessions ?? 0,
            tags: f.tags ?? [],
          })));
        }
      })
      .catch(() => {});
  }, []);

  const filtered = facilitators.filter((f) => {
    if (specialty !== "Toți" && !f.tags.includes(specialty)) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero */}
      <section className="bg-light-green py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="max-w-2xl">
              <p className="section-label">Ghizi experți</p>
              <h1 className="font-heading text-h1 text-deep-green mb-4">
                Echipa de facilitatori
              </h1>
              <p className="font-body text-body-lg text-secondary-text">
                Psihoterapeuți, practicieni somatic și specialiști certificați, formați în România și internațional.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-sage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
              <input
                type="search"
                placeholder="Caută facilitator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body bg-white focus:outline-none focus:border-forest-green w-full md:w-48"
              />
            </div>
            {/* Specialty pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {ALL_SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecialty(s)}
                  className={`filter-pill flex-shrink-0 ${specialty === s ? "active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${specialty}-${search}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
          >
            {filtered.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="h-full"
              >
                <Link href={`/facilitatori/${f.slug}`} className="card card-lift group block overflow-hidden flex flex-col h-full">
                  {/* Photo */}
                  <div className="aspect-square overflow-hidden relative">
                    <Image
                      src={f.image}
                      alt={f.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-deep-green/5" />
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-body font-semibold text-body-md text-deep-green mb-0.5 group-hover:text-forest-green transition-colors">
                      {f.name}
                    </h3>
                    <p className="font-body text-label-xs text-secondary-text mb-3">{f.specialty}</p>
                    <p className="font-body text-body-sm text-secondary-text mb-4 line-clamp-2 flex-1">{f.bio}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {f.tags.map((tag) => (
                        <span key={tag} className="tag tag-green">{tag}</span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1">
                        <Star size={13} weight="fill" className="text-terracotta" />
                        <span className="font-body text-label-xs font-semibold text-deep-green">{f.rating}</span>
                        <span className="font-body text-label-xs text-secondary-text">({f.sessions} sesiuni)</span>
                      </div>
                      <span className="font-body text-label-xs text-forest-green flex items-center gap-1">
                        Vezi profil <ArrowRight size={12} weight="bold" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-body-md text-secondary-text">Niciun facilitator găsit pentru această specialitate.</p>
          </div>
        )}
      </div>

      {/* Become facilitator CTA */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateIn from="bottom">
            <h2 className="font-heading text-h2 text-deep-green mb-3">Ești facilitator?</h2>
            <p className="font-body text-body-lg text-secondary-text mb-8">
              Fii parte din echipa noastră și oferă îndrumare celor care vor să se simtă din nou bine în corpul lor.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Aplică ca facilitator <ArrowRight size={16} weight="bold" />
            </Link>
          </AnimateIn>
        </div>
      </section>
    </div>
  );
}
