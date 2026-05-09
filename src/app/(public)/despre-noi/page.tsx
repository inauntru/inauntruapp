"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Leaf, MapPin, ArrowRight, Globe, Check } from "@phosphor-icons/react";
import AnimateIn, { StaggerChildren } from "@/components/ui/AnimateIn";
import { FACILITATORS } from "@/lib/mockData";

const TIMELINE = [
  { year: "2026", location: "România", desc: "Lansare platformă cu 70+ practici, sesiuni live și facilitatori certificați. Primii 5.000 utilizatori." },
  { year: "2027", location: "Europa de Est", desc: "Expansiune în Bulgaria, Ungaria și Moldova. Conținut în 4 limbi, 20+ facilitatori internaționali." },
  { year: "2028+", location: "Global", desc: "Ecosistem complet de somatic wellness: formare facilitatori, certificare, parteneriate clinice." },
];

const VALUES = [
  { icon: Heart, title: "Compasiune", desc: "Fiecare persoană merită acces la practici de bunăstare, indiferent de context sau resurse." },
  { icon: Leaf, title: "Fundamentare", desc: "Toate practicile sunt bazate pe cercetări validare în neuroștiință și psihoterapie somatică." },
  { icon: Globe, title: "Accesibilitate", desc: "Credem că vindecarea este un drept, nu un privilegiu rezervat celor cu resurse financiare mari." },
  { icon: Check, title: "Autenticitate", desc: "Facilitatorii noștri sunt practicieni reali cu experiență clinică verificată, nu actori sau influenceri." },
];

export default function DespreNoiPage() {
  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-light-green">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateIn from="bottom">
              <p className="section-label">Despre noi</p>
              <h1 className="font-heading text-h1 text-deep-green mb-5">
                Cultivăm echilibrul prin știința somatizării și căldura comunității.
              </h1>
              <p className="font-body text-body-lg text-secondary-text leading-relaxed">
                INAUNTRU s-a născut din convingerea că fiecare persoană din România merită acces la practici de reglare somatică de calitate — disponibile oricând, oriunde.
              </p>
            </AnimateIn>
            <AnimateIn from="scale">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-card-hover">
                <Image
                  src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80"
                  alt="Sabina, co-fondator INAUNTRU"
                  fill
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute inset-0 bg-deep-green/10" />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Founder story */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimateIn from="scale">
              <div className="aspect-square rounded-card overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80"
                  alt="Sabina, co-fondator INAUNTRU"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-deep-green/15" />
                {/* Quote floating */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur rounded-xl p-4 shadow-card">
                  <p className="font-heading text-forest-green text-body-sm italic">
                    "Am construit INAUNTRU pentru că eu însămi am căutat ani de zile un loc sigur să mă vindec."
                  </p>
                  <p className="font-body text-label-xs text-secondary-text mt-2">— Sabina, Co-Founder</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn from="right">
              <p className="section-label">Povestea fondatorului</p>
              <h2 className="font-heading text-h2 text-deep-green mb-4">De ce am creat INAUNTRU</h2>
              <div className="space-y-4 text-secondary-text font-body text-body-md leading-relaxed">
                <p>
                  În 2022, după un burnout sever, am început să înțeleg că corpul meu purta povești pe care mintea refuza să le proceseze. Am descoperit terapia somatică și a schimbat tot.
                </p>
                <p>
                  Dar accesul era limitat: sesiuni individuale costisitoare, resurse în engleză, facilitatori fără experiență cu specificul cultural românesc. Am știut atunci că trebuie să existe o alternativă.
                </p>
                <p>
                  INAUNTRU este răspunsul nostru: o platformă care aduce știința somatică în viața cotidiană a românilor, cu practici accesibile, facilitatori locali certificați și un sistem inteligent de personalizare.
                </p>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="text-center mb-12">
              <p className="section-label">Valorile noastre</p>
              <h2 className="section-title">Ce ne ghidează</h2>
            </div>
          </AnimateIn>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card card-lift p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} weight="regular" className="text-forest-green" />
                  </div>
                  <h3 className="font-heading text-h3 text-deep-green mb-2">{v.title}</h3>
                  <p className="font-body text-body-sm text-secondary-text">{v.desc}</p>
                </div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="text-center mb-10">
              <p className="section-label">Echipa</p>
              <h2 className="section-title">Facilitatorii noștri</h2>
            </div>
          </AnimateIn>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {FACILITATORS.map((f) => (
              <Link key={f.id} href={`/facilitatori/${f.slug}`} className="card card-lift group text-center p-6 block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-forest-green/20 to-deep-green/10 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="font-heading text-2xl font-bold text-forest-green/60">
                    {f.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-body font-semibold text-body-sm text-deep-green mb-0.5">{f.name}</h3>
                <p className="font-body text-label-xs text-secondary-text mb-3">{f.title}</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {f.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag tag-green">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-bg-main text-center">
        <AnimateIn from="bottom">
          <div className="max-w-xl mx-auto px-4">
            <h2 className="font-heading text-h2 text-deep-green mb-4">Vino alături de noi</h2>
            <p className="font-body text-body-lg text-secondary-text mb-8">
              Fie că ești utilizator, facilitator sau partener corporativ — există un loc pentru tine în INAUNTRU.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn btn-primary">Creează cont gratuit <ArrowRight size={16} weight="bold" /></Link>
              <Link href="/facilitatori" className="btn btn-ghost">Explorează facilitatorii</Link>
            </div>
          </div>
        </AnimateIn>
      </section>
    </div>
  );
}
