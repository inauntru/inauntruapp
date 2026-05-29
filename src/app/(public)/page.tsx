"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  Moon,
  Wind,
  Sun,
  Heartbeat,
  Sparkle,
  Star,
  Check,
  X,
  Play,
  BookOpen,
  VideoCamera,
  ChartLine,
  ShieldCheck,
  CaretDown,
  Brain,
  BatteryLow,
  Waves,
  NotePencil,
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import AnimateIn, { StaggerChildren } from "@/components/ui/AnimateIn";

const CheckInModal = dynamic(() => import("@/components/ui/CheckInModal"), {
  ssr: false,
});
import {
  TESTIMONIALS,
  PRICING_PLANS,
  FAQ_ITEMS,
  INTENT_CARDS,
} from "@/lib/mockData";
import { FACILITATORS_DATA } from "@/lib/facilitators";

const INTENT_ICONS: Record<string, React.ElementType> = {
  Leaf, Moon, Wind, Sun, Heartbeat, Sparkle,
};

const PROBLEM_CARDS = [
  { icon: Waves, title: "Tensiune Musculară", desc: "Gât, umeri și maxilar mereu încordate fără un motiv aparent." },
  { icon: Moon, title: "Insomnie Alertă", desc: "Ești obosit, dar corpul tău refuză să intre în starea de repaus." },
  { icon: Brain, title: "Deconectare", desc: "Simți că trăiești de la gât în sus, ignorând semnalele corpului." },
  { icon: BatteryLow, title: "Burnout Emoțional", desc: "Reacții disproporționate la stresori mici de zi cu zi." },
];

const SOLUTION_CARDS = [
  { icon: Brain, title: "Bazat pe neuroștiință", desc: "Folosim Teoria Polivagală pentru a trece corpul din starea de 'Luptă sau Fugi' în cea de 'Siguranță și Conectare'." },
  { icon: Heartbeat, title: "Eliberare Profundă", desc: "Lucrăm cu fascia și memoria celulară pentru a elibera tensiunile pe care mintea conștientă nu le poate accesa." },
  { icon: Leaf, title: "Reziliență Durabilă", desc: "Îți antrenezi corpul să gestioneze stresul viitor cu o capacitate crescută de reglare autonomă." },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Evaluare Inițială", desc: "Identificăm unde este blocată energia în corpul tău printr-un chestionar de autodescoperire ghidat.", icon: Heartbeat },
  { step: "2", title: "Practică Zilnică", desc: "Primești un program personalizat de 10–20 minute cu exerciții de respirație, mișcare și conștientizare.", icon: Play },
  { step: "3", title: "Monitorizare Progres", desc: "Urmărești cum se schimbă starea ta de bine prin jurnalul de senzații și check-in-uri zilnice.", icon: ChartLine },
];

const PLATFORM_FEATURES = [
  { icon: BookOpen, title: "Biblioteca", desc: "70+ sesiuni audio și video de la facilitatori certificați, disponibile oricând." },
  { icon: VideoCamera, title: "Sesiuni LIVE", desc: "Cercuri de vindecare și workshop-uri interactive săptămânale cu facilitatorii noștri." },
  { icon: Heartbeat, title: "Check-in Zilnic", desc: "Sistem inteligent care îți recomandă practica potrivită stării tale de azi." },
  { icon: NotePencil, title: "Monitorizarea progresului", desc: "Notează cum te simți și urmărește-ți evoluția pas cu pas." },
];

const COMPARISON_ROWS = [
  { feature: "Abordare Somatică", inauntru: true, clasic: false },
  { feature: "Acces 24/7 Biblioteca", inauntru: true, clasic: false },
  { feature: "Check-in Zilnic de Stare", inauntru: true, clasic: false },
  { feature: "Practici bazate pe neuroștiință", inauntru: true, clasic: true },
  { feature: "Facilitatori certificați din România", inauntru: true, clasic: true },
  { feature: "Preț accesibil (de la 49 RON/lună)", inauntru: true, clasic: false },
];

export default function HomePage() {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("checkin-seen");
    if (!seen) {
      const timer = setTimeout(() => {
        setCheckInOpen(true);
        sessionStorage.setItem("checkin-seen", "1");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div style={{ overflowX: "clip" }}>
      <CheckInModal isOpen={checkInOpen} onClose={() => setCheckInOpen(false)} canSkip={false} />

      {/* ── HERO ── */}
      <section className="relative sticky top-0 z-0 min-h-[700px] lg:min-h-[820px] flex items-center overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay — left side darker for text readability, right reveals video */}
        <div className="absolute inset-0 bg-gradient-to-r from-deep-green/92 via-deep-green/70 to-deep-green/30 pointer-events-none" />
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/60 via-transparent to-transparent pointer-events-none" />

        {/* Subtle light glow top-left */}
        <div
          className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "rgba(200, 235, 211, 0.12)", filter: "blur(80px)" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
          <div className="max-w-2xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-label-sm font-body text-white backdrop-blur-sm">
                Aici gândurile se așază 🌿
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Întoarce-te<br className="hidden sm:block" /> la tine.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="font-body text-body-lg max-w-lg"
              style={{ color: "rgba(200, 235, 211, 0.92)" }}
            >
              Resetare rapidă în mai puțin de 2 minute. Metode simple pentru momentele când te simți blocat și ai nevoie de un nou început.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-body font-semibold text-body-sm bg-white text-forest-green hover:bg-white/90 transition-colors shadow-md"
              >
                Vreau mai multă liniște
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link
                href="#cum-functioneaza"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-body font-semibold text-body-sm text-white border border-white/30 hover:bg-white/15 transition-colors backdrop-blur-sm"
              >
                <Play size={16} weight="fill" />
                Cum funcționează?
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center gap-3 pt-2"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
                ].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden flex-shrink-0">
                    <Image src={src} alt="" width={32} height={32} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
              <p className="font-body text-body-sm">
                Alătură-te celor <strong className="text-white">1.500+</strong> membri
              </p>
            </motion.div>
          </div>
        </div>

        {/* Floating "Sesiune Live" card — bottom right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="absolute bottom-8 right-8 lg:right-14 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl max-w-[220px] z-10 hidden lg:block"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-powder animate-live-pulse" />
            <span className="font-body text-label-xs text-forest-green font-semibold">Sesiune Live Acum</span>
          </div>
          <p className="font-heading text-body-sm text-deep-green leading-snug">Reglarea sistemului nervos cu Elena</p>
        </motion.div>
      </section>

      {/* All sections below scroll over the sticky hero */}
      <div className="relative z-10">

      {/* ── INTENT SELECTOR ── */}
      <section className="py-16 lg:py-20 bg-indigo-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <h2 className="font-heading text-h2 text-deep-green text-center mb-10">
              De ce ai nevoie în acest moment?
            </h2>
          </AnimateIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {INTENT_CARDS.map((card, i) => {
              const Icon = INTENT_ICONS[card.icon] || Leaf;
              const isSelected = selectedIntent === card.id;
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  onClick={() => setSelectedIntent(isSelected ? null : card.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-2xl border transition-colors duration-200 min-h-[90px] sm:min-h-[110px] ${
                    isSelected
                      ? "bg-forest-green border-forest-green"
                      : "bg-white border-sage-border hover:border-forest-green hover:bg-light-green/30"
                  }`}
                >
                  <Icon size={26} weight="regular" className={isSelected ? "text-white" : "text-forest-green"} />
                  <span className={`font-body text-label-sm font-semibold text-center leading-snug min-h-[2.5em] flex items-center justify-center ${isSelected ? "text-white" : "text-deep-green"}`}>
                    {card.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
          {selectedIntent && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <Link href={`/practici?intent=${selectedIntent}`} className="btn btn-primary">
                Arată practici pentru tine <ArrowRight size={18} weight="bold" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <AnimateIn once={false} from="left">
              <p className="font-ui text-label-sm text-indigo uppercase tracking-widest mb-3">Corpul tău îți vorbește</p>
              <h2 className="font-heading text-h2 text-deep-green mb-4 leading-tight">
                Te simți copleșit de gânduri?<br />
                <span className="text-indigo">Recuperează-ți timpul pierdut în analiză și revino la ce contează pentru tine.</span>
              </h2>
              <p className="font-body text-body-lg text-secondary-text mb-8 leading-relaxed">
                Multe dintre problemele noastre moderne nu sunt „doar în capul nostru". Ele sunt stocate în corp ca tensiune cronică, respirație superficială și oboseală persistentă.
              </p>
              <Link href="/despre-noi" className="btn btn-outline">
                Descoperă cum funcționează <ArrowRight size={16} weight="bold" />
              </Link>
            </AnimateIn>
            <StaggerChildren once={false} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch" childClassName="h-full" staggerDelay={0.1}>
              {PROBLEM_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="p-6 bg-white border border-indigo-light rounded-2xl flex flex-col h-full card-lift">
                    <div className="w-10 h-10 rounded-xl bg-indigo-light flex items-center justify-center mb-3 flex-shrink-0">
                      <Icon size={22} weight="regular" className="text-indigo" />
                    </div>
                    <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">{card.title}</h3>
                    <p className="font-body text-body-sm text-secondary-text flex-1">{card.desc}</p>
                  </div>
                );
              })}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ── SOLUTION (why somatic) — dezactivat temporar ── */}
      {/* <section className="py-16 lg:py-24 bg-indigo-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-forest-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-14">
              <p className="section-label">De ce practici somatice</p>
              <h2 className="section-title">Vindecarea prin corp</h2>
              <p className="font-body text-body-lg text-secondary-text">
                Somatic înseamnă „al corpului". Spre deosebire de terapia prin vorbire, practicile somatice lucrează direct cu sistemul nervos pentru a elibera trauma și stresul stocat.
              </p>
            </div>
          </AnimateIn>
          <StaggerChildren once={false} className="grid md:grid-cols-3 gap-8" staggerDelay={0.12}>
            {SOLUTION_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-white/70 backdrop-blur-sm p-5 sm:p-8 rounded-2xl border border-white card-lift">
                  <div className="w-12 h-12 bg-forest-green rounded-xl flex items-center justify-center text-white mb-6">
                    <Icon size={24} weight="regular" />
                  </div>
                  <h3 className="font-heading text-h3 text-deep-green mb-3">{card.title}</h3>
                  <p className="font-body text-body-md text-secondary-text leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </StaggerChildren>
        </div>
      </section> */}

      {/* ── HOW IT WORKS ── */}
      <section id="cum-functioneaza" className="py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <h2 className="font-heading text-h2 text-deep-green text-center mb-10 lg:mb-16">
              Călătoria ta spre interior
            </h2>
          </AnimateIn>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 bg-indigo-light" />
            <StaggerChildren once={false} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12" staggerDelay={0.2}>
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="flex flex-row lg:flex-col items-start lg:items-center gap-5 lg:gap-0 text-left lg:text-center">
                  <div className="relative mb-0 lg:mb-8 flex-shrink-0">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-indigo text-white rounded-full flex items-center justify-center font-heading text-xl lg:text-2xl font-bold shadow-button ring-8 ring-indigo-bg">
                      {step.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-h3 text-deep-green mb-2 lg:mb-3">{step.title}</h3>
                    <p className="font-body text-body-md text-secondary-text max-w-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES (dark green) ── */}
      <section className="py-16 lg:py-24 overflow-hidden" style={{ backgroundColor: "#2B8C5C" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 lg:mb-14 gap-6">
              <div className="max-w-xl">
                <h2 className="font-heading text-h2 text-white mb-3">
                  Tot ce ai nevoie într-un singur loc
                </h2>
                <p className="font-body text-body-lg" style={{ color: "rgba(200, 235, 211, 0.85)" }}>
                  Acces instant de pe orice dispozitiv la resurse premium de vindecare somatică.
                </p>
              </div>
              <Link
                href="/practici"
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-forest-green rounded-full font-body font-semibold text-body-sm hover:bg-white/90 transition-colors"
              >
                Explorează biblioteca <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </AnimateIn>
          <StaggerChildren once={false} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" childClassName="h-full" staggerDelay={0.1}>
            {PLATFORM_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="h-full bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group cursor-default"
                >
                  <Icon
                    size={36}
                    weight="regular"
                    className="text-white mb-5 group-hover:scale-110 transition-transform duration-300"
                  />
                  <h3 className="font-heading text-h3 text-white mb-2">{f.title}</h3>
                  <p className="font-body text-body-sm" style={{ color: "rgba(200, 235, 211, 0.8)" }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 lg:py-24 bg-indigo-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <h2 className="font-heading text-h2 text-deep-green text-center mb-8 lg:mb-14">
              Povești de transformare
            </h2>
          </AnimateIn>
          <StaggerChildren
            once={false}
            className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
            childClassName="h-full"
            staggerDelay={0.08}
          >
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="p-8 bg-surface-container-low rounded-2xl border border-sage-border card-lift flex flex-col h-full">
                <div className="flex items-center gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={16} weight="fill" className="text-[#F59E0B]" />
                  ))}
                </div>
                <p className="font-body text-body-lg text-secondary-text italic mb-6 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-light flex items-center justify-center font-bold text-indigo font-body flex-shrink-0">
                    {t.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-body-sm text-deep-green">{t.name}</p>
                    <p className="font-body text-label-xs text-secondary-text">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
          {/* Mobile carousel */}
          <div className="md:hidden flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="min-w-[280px] bg-surface-container-low rounded-2xl border border-sage-border p-5 flex-shrink-0">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} weight="fill" className="text-[#F59E0B]" />
                  ))}
                </div>
                <p className="font-body text-body-sm text-secondary-text italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-body font-semibold text-body-sm text-deep-green">{t.name}</p>
                <p className="font-body text-label-xs text-secondary-text">{t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FACILITATORS ── */}
      <section className="py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <div className="text-center mb-8 lg:mb-14">
              <p className="section-label">Ghizi experți</p>
              <h2 className="section-title">Ghidat de experți în somatizare</h2>
              <p className="font-body text-body-lg text-secondary-text max-w-xl mx-auto">
                O echipă de terapeuți, practicieni somatic și specialiști certificați, formați în România și internațional.
              </p>
            </div>
          </AnimateIn>
          <StaggerChildren once={false} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {FACILITATORS_DATA.map((f) => (
              <Link key={f.id} href={`/facilitatori/${f.slug}`} className="group block space-y-4">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                  <Image
                    src={f.image}
                    alt={f.name}
                    fill
                    className="object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <div>
                  <h4 className="font-body font-semibold text-body-md text-deep-green group-hover:text-forest-green transition-colors">
                    {f.name}
                  </h4>
                  <p className="font-body text-label-xs text-forest-green">{f.specialty}</p>
                </div>
              </Link>
            ))}
          </StaggerChildren>
          <div className="text-center mt-10">
            <Link href="/facilitatori" className="btn btn-outline">
              Toți facilitatorii <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </section>


      {/* ── COMPARISON — dezactivat temporar, reactivează dacă e nevoie ── */}
      {/* <section className="py-16 lg:py-24 bg-indigo-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <h2 className="font-heading text-h2 text-deep-green text-center mb-8 lg:mb-14">
              De ce să alegi INAUNTRU?
            </h2>
          </AnimateIn>
          <div className="overflow-hidden border border-sage-border rounded-2xl shadow-card">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="py-3 px-3 sm:p-6 font-body text-xs sm:text-label-sm text-secondary-text w-1/2">Funcționalitate</th>
                  <th className="py-3 px-2 sm:p-6 font-heading font-bold text-forest-green text-xs sm:text-body-md text-center w-1/4">INAUNTRU</th>
                  <th className="py-3 px-2 sm:p-6 font-body text-xs sm:text-body-sm text-secondary-text text-center w-1/4 leading-snug">
                    Terapie Tradițională
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-border/50">
                {COMPARISON_ROWS.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: i * 0.06 }}
                    className={i % 2 === 0 ? "bg-white" : "bg-bg-main/50"}
                  >
                    <td className="py-3 px-3 sm:py-4 sm:px-6 font-body text-xs sm:text-body-sm text-deep-green">{row.feature}</td>
                    <td className="py-3 px-2 sm:py-4 sm:px-6 text-center">
                      {row.inauntru
                        ? <Check size={16} weight="bold" className="text-forest-green mx-auto" />
                        : <X size={16} weight="regular" className="text-terracotta/50 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 sm:py-4 sm:px-6 text-center">
                      {row.clasic
                        ? <Check size={16} weight="bold" className="text-secondary-text mx-auto" />
                        : <X size={16} weight="regular" className="text-terracotta/50 mx-auto" />}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section> */}

      {/* ── PRICING ── */}
      <section className="py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <div className="text-center mb-10">
              <p className="section-label">Investește în tine</p>
              <h2 className="section-title">Planul potrivit pentru tine</h2>
              <div className="flex items-center justify-center gap-4 mt-6">
                <span className={`font-body text-body-sm ${!billingAnnual ? "text-deep-green font-semibold" : "text-secondary-text"}`}>
                  Lunar
                </span>
                <button
                  onClick={() => setBillingAnnual(!billingAnnual)}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${billingAnnual ? "bg-forest-green" : "bg-sage-border"}`}
                >
                  <motion.div
                    animate={{ x: billingAnnual ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
                <span className={`font-body text-body-sm ${billingAnnual ? "text-deep-green font-semibold" : "text-secondary-text"}`}>
                  Anual
                </span>
                <span className="tag tag-green">Economisești 35%</span>
              </div>
            </div>
          </AnimateIn>
          <StaggerChildren once={false} className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.12}>
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 sm:p-8 flex flex-col transition-all duration-200 ${
                  plan.isPopular
                    ? "bg-forest-green border-forest-green text-white shadow-[0_20px_60px_rgba(61,122,92,0.25)] md:scale-105"
                    : "bg-white border-sage-border shadow-card hover:shadow-card-hover"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 right-6">
                    <span className="bg-terracotta text-white text-label-xs font-bold px-4 py-1.5 rounded-full">
                      RECOMANDAT
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-heading text-h3 mb-1 ${plan.isPopular ? "text-white" : "text-deep-green"}`}>
                    {plan.name}
                  </h3>
                  <p className={`font-body text-body-sm ${plan.isPopular ? "text-white/70" : "text-secondary-text"}`}>
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-heading text-4xl font-bold ${plan.isPopular ? "text-white" : "text-deep-green"}`}>
                      <motion.span
                        key={billingAnnual ? "annual" : "monthly"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {billingAnnual ? plan.priceAnnual : plan.price}
                      </motion.span>
                    </span>
                    <span className={`font-body text-body-sm ${plan.isPopular ? "text-white/60" : "text-secondary-text"}`}>
                      RON/lună
                    </span>
                  </div>
                  {billingAnnual && plan.price > 0 && (
                    <p className={`font-body text-label-xs mt-1 ${plan.isPopular ? "text-white/60" : "text-secondary-text"}`}>
                      facturat anual ({plan.priceAnnual * 12} RON/an)
                    </p>
                  )}
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={16} weight="bold" className={`flex-shrink-0 mt-0.5 ${plan.isPopular ? "text-white" : "text-forest-green"}`} />
                      <span className={`font-body text-body-sm ${plan.isPopular ? "text-white/80" : "text-secondary-text"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 opacity-40">
                      <X size={16} weight="regular" className="flex-shrink-0 mt-0.5" />
                      <span className={`font-body text-body-sm ${plan.isPopular ? "text-white" : "text-secondary-text"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`btn w-full text-center ${
                    plan.isPopular ? "bg-white text-forest-green hover:bg-white/90" : "btn-primary"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: "#EAEBFF" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateIn once={false} from="scale">
            <div className="flex items-center justify-center mb-4">
              <ShieldCheck size={48} weight="fill" className="text-deep-green" />
            </div>
            <h2 className="font-heading text-h2 text-deep-green mb-3">
              Testează gratuit timp de 14 zile.
            </h2>
            <p className="font-body text-body-lg text-deep-green/70 max-w-xl mx-auto">
              Primești acces la toate metodele noastre de recalibrare.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <h2 className="font-heading text-h2 text-deep-green text-center mb-8 lg:mb-14">
              Întrebări frecvente
            </h2>
          </AnimateIn>
          <div className="space-y-0">
            {FAQ_ITEMS.map((item, i) => (
              <AnimateIn once={false} key={i} delay={i * 0.04}>
                <div className="border-b border-sage-border">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 text-left group"
                  >
                    <span className="font-heading text-lg text-deep-green pr-4 group-hover:text-forest-green transition-colors">
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <CaretDown size={18} weight="bold" className="text-secondary-text" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-5">
                      <p className="font-body text-body-md text-secondary-text leading-relaxed">{item.a}</p>
                    </div>
                  </motion.div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 lg:py-24 relative overflow-hidden" style={{ backgroundColor: "#2B8C5C" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14 lg:gap-20">
            <AnimateIn once={false} from="left" className="md:w-1/2 space-y-7">
              <h2 className="font-heading text-4xl lg:text-5xl text-white leading-tight font-bold">
                Alege să te simți mai bine acum.
              </h2>
              <p className="font-body text-body-lg" style={{ color: "rgba(200, 235, 211, 0.9)" }}>
                Începe să te simți mai bine imediat. Anulezi oricând, fără bătăi de cap.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-white text-forest-green font-body font-semibold text-body-md sm:text-body-lg hover:bg-white/90 transition-colors shadow-lg"
              >
                Începe acum <ArrowRight size={20} weight="bold" />
              </Link>
            </AnimateIn>
            <AnimateIn once={false} from="right" className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square">
                <div className="w-full h-full rounded-full overflow-hidden relative" style={{ opacity: 0.7, mixBlendMode: "overlay" as const }}>
                  <Image
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80"
                    alt="Meditație somatică"
                    fill
                    className="object-cover"
                  />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
                />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      </div>{/* end relative z-10 wrapper */}
    </div>
  );
}
