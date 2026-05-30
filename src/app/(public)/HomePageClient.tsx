"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight, Leaf, Moon, Wind, Sun, Heartbeat, Sparkle,
  Star, Check, X, Play, BookOpen, VideoCamera, ChartLine,
  ShieldCheck, CaretDown, Brain, BatteryLow, Waves, NotePencil,
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import AnimateIn, { StaggerChildren } from "@/components/ui/AnimateIn";
import { TESTIMONIALS, PRICING_PLANS, FAQ_ITEMS, INTENT_CARDS } from "@/lib/mockData";
import { FACILITATORS_DATA } from "@/lib/facilitators";

const CheckInModal = dynamic(() => import("@/components/ui/CheckInModal"), { ssr: false });

const INTENT_ICONS: Record<string, React.ElementType> = {
  Leaf, Moon, Wind, Sun, Heartbeat, Sparkle,
};

interface Props { siteContent: Record<string, string>; }

export default function HomePageClient({ siteContent }: Props) {
  const t = (key: string, fallback: string) => siteContent[key] || fallback;

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

  const intentCards = INTENT_CARDS.map((card, i) => ({
    ...card,
    title: t(`intent${i + 1}_title`, card.title),
  }));

  const problemCards = [
    { icon: Waves, title: t("prob_card1_title", "Tensiune Musculară"), desc: t("prob_card1_desc", "Gât, umeri și maxilar mereu încordate fără un motiv aparent.") },
    { icon: Moon,  title: t("prob_card2_title", "Insomnie Alertă"),     desc: t("prob_card2_desc", "Ești obosit, dar corpul tău refuză să intre în starea de repaus.") },
    { icon: Brain, title: t("prob_card3_title", "Deconectare"),          desc: t("prob_card3_desc", "Simți că trăiești de la gât în sus, ignorând semnalele corpului.") },
    { icon: BatteryLow, title: t("prob_card4_title", "Burnout Emoțional"), desc: t("prob_card4_desc", "Reacții disproporționate la stresori mici de zi cu zi.") },
  ];

  const howItWorks = [
    { step: "1", icon: Heartbeat, title: t("step1_title", "Evaluare Inițială"), desc: t("step1_desc", "Identificăm unde este blocată energia în corpul tău printr-un chestionar de autodescoperire ghidat.") },
    { step: "2", icon: Play,      title: t("step2_title", "Practică Zilnică"),  desc: t("step2_desc", "Primești un program personalizat de 10–20 minute cu exerciții de respirație, mișcare și conștientizare.") },
    { step: "3", icon: ChartLine, title: t("step3_title", "Monitorizare Progres"), desc: t("step3_desc", "Urmărești cum se schimbă starea ta de bine prin jurnalul de senzații și check-in-uri zilnice.") },
  ];

  const platformFeatures = [
    { icon: BookOpen,   title: t("feat1_title", "Biblioteca"),               desc: t("feat1_desc", "70+ sesiuni audio și video de la facilitatori certificați, disponibile oricând.") },
    { icon: VideoCamera,title: t("feat2_title", "Sesiuni LIVE"),              desc: t("feat2_desc", "Cercuri de vindecare și workshop-uri interactive săptămânale cu facilitatorii noștri.") },
    { icon: Heartbeat,  title: t("feat3_title", "Check-in Zilnic"),           desc: t("feat3_desc", "Sistem inteligent care îți recomandă practica potrivită stării tale de azi.") },
    { icon: NotePencil, title: t("feat4_title", "Monitorizarea progresului"), desc: t("feat4_desc", "Notează cum te simți și urmărește-ți evoluția pas cu pas.") },
  ];

  const faqItems = Array.from({ length: 8 }, (_, i) => ({
    q: t(`faq${i + 1}_q`, FAQ_ITEMS[i]?.q ?? ""),
    a: t(`faq${i + 1}_a`, FAQ_ITEMS[i]?.a ?? ""),
  })).filter((item) => item.q);

  return (
    <div style={{ overflowX: "clip" }}>
      <CheckInModal isOpen={checkInOpen} onClose={() => setCheckInOpen(false)} canSkip={false} />

      {/* ── HERO ── */}
      <section className="relative sticky top-0 z-0 h-screen min-h-[640px] flex items-center overflow-hidden -mt-16 lg:-mt-20">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/hero-video-2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-deep-green/92 via-deep-green/70 to-deep-green/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "rgba(200,235,211,0.12)", filter: "blur(80px)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
          <div className="max-w-2xl space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-label-sm font-body text-white backdrop-blur-sm">
                {t("hero_badge", "Aici gândurile se așază 🌿")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
            >
              {t("hero_title", "Întoarce-te la tine.")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="font-body text-body-lg max-w-lg"
              style={{ color: "rgba(200,235,211,0.95)", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
            >
              {t("hero_subtitle", "Resetare rapidă în mai puțin de 2 minute. Metode simple pentru momentele când te simți blocat și ai nevoie de un nou început.")}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-body font-semibold text-body-sm bg-white text-forest-green hover:bg-white/90 transition-colors shadow-md">
                Vreau mai multă liniște <ArrowRight size={16} weight="bold" />
              </Link>
              <Link href="#cum-functioneaza" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-body font-semibold text-body-sm text-white border border-white/30 hover:bg-white/15 transition-colors backdrop-blur-sm">
                <Play size={16} weight="fill" /> Cum funcționează?
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center gap-3 pt-2"
              style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
                ].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden flex-shrink-0">
                    <Image src={src} alt="Membru INAUNTRU" width={32} height={32} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
              <p className="font-body text-body-sm">{t("hero_social_proof", "Alătură-te celor 1.500+ membri")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* All sections below scroll over the sticky hero */}
      <div className="relative z-10">

      {/* ── INTENT SELECTOR ── */}
      <section className="py-16 lg:py-20 bg-indigo-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <h2 className="font-heading text-h2 text-deep-green text-center mb-10">
              {t("intent_title", "De ce ai nevoie în acest moment?")}
            </h2>
          </AnimateIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {intentCards.map((card, i) => {
              const Icon = INTENT_ICONS[card.icon] || Leaf;
              const isSelected = selectedIntent === card.id;
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  onClick={() => setSelectedIntent(isSelected ? null : card.id)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={`flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-2xl border transition-colors duration-200 min-h-[90px] sm:min-h-[110px] ${isSelected ? "bg-forest-green border-forest-green" : "bg-white border-sage-border hover:border-forest-green hover:bg-light-green/30"}`}
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
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
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
              <p className="font-ui text-label-sm text-indigo uppercase tracking-widest mb-3">
                {t("problem_label", "Corpul tău îți vorbește")}
              </p>
              <h2 className="font-heading text-h2 text-deep-green mb-4 leading-tight">
                {t("problem_title", "Te simți copleșit de gânduri? Recuperează-ți timpul pierdut în analiză și revino la ce contează pentru tine.")}
              </h2>
              <p className="font-body text-body-lg text-secondary-text mb-8 leading-relaxed">
                {t("problem_body", 'Multe dintre problemele noastre moderne nu sunt "doar in capul nostru". Ele sunt stocate in corp ca tensiune cronica, respiratie superficiala si oboseala persistenta.')}
              </p>
              <Link href="/despre-noi" className="btn btn-outline">
                Descoperă cum funcționează <ArrowRight size={16} weight="bold" />
              </Link>
            </AnimateIn>
            <StaggerChildren once={false} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch" childClassName="h-full" staggerDelay={0.1}>
              {problemCards.map((card) => {
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

      {/* ── HOW IT WORKS ── */}
      <section id="cum-functioneaza" className="py-16 lg:py-24 relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/journey-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(230,245,237,0.45)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateIn once={false} from="bottom">
            <h2 className="font-heading text-h2 text-deep-green text-center mb-10 lg:mb-16" style={{ textShadow: "0 1px 6px rgba(255,255,255,0.8)" }}>
              {t("howto_title", "Călătoria ta spre interior")}
            </h2>
          </AnimateIn>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 bg-white/60" />
            <StaggerChildren once={false} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12" staggerDelay={0.2}>
              {howItWorks.map((step) => (
                <div key={step.step} className="flex flex-row lg:flex-col items-start lg:items-center gap-5 lg:gap-0 text-left lg:text-center">
                  <div className="relative mb-0 lg:mb-8 flex-shrink-0">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-indigo text-white rounded-full flex items-center justify-center font-heading text-xl lg:text-2xl font-bold shadow-button ring-8 ring-white/60">
                      {step.step}
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-5">
                    <h3 className="font-heading text-h3 text-deep-green mb-2 lg:mb-3">{step.title}</h3>
                    <p className="font-body text-body-md text-deep-green/70 max-w-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="py-16 lg:py-24 overflow-hidden" style={{ backgroundColor: "#2B8C5C" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 lg:mb-14 gap-6">
              <div className="max-w-xl">
                <h2 className="font-heading text-h2 text-white mb-3">
                  {t("platform_title", "Tot ce ai nevoie într-un singur loc")}
                </h2>
                <p className="font-body text-body-lg" style={{ color: "rgba(200,235,211,0.85)" }}>
                  {t("platform_subtitle", "Acces instant de pe orice dispozitiv la resurse premium de vindecare somatică.")}
                </p>
              </div>
              <Link href="/practici" className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-forest-green rounded-full font-body font-semibold text-body-sm hover:bg-white/90 transition-colors">
                Explorează biblioteca <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </AnimateIn>
          <StaggerChildren once={false} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" childClassName="h-full" staggerDelay={0.1}>
            {platformFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="h-full bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group cursor-default">
                  <Icon size={36} weight="regular" className="text-white mb-5 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-heading text-h3 text-white mb-2">{f.title}</h3>
                  <p className="font-body text-body-sm" style={{ color: "rgba(200,235,211,0.8)" }}>{f.desc}</p>
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
              {t("testimonials_title", "Povești de transformare")}
            </h2>
          </AnimateIn>
          <StaggerChildren once={false} className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 items-stretch" childClassName="h-full" staggerDelay={0.08}>
            {TESTIMONIALS.map((t_) => (
              <div key={t_.id} className="p-8 bg-surface-container-low rounded-2xl border border-sage-border card-lift flex flex-col h-full">
                <div className="flex items-center gap-0.5 mb-5">
                  {Array.from({ length: t_.stars }).map((_, i) => <Star key={i} size={16} weight="fill" className="text-[#F59E0B]" />)}
                </div>
                <p className="font-body text-body-lg text-secondary-text italic mb-6 leading-relaxed flex-1">&ldquo;{t_.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-light flex items-center justify-center font-bold text-indigo font-body flex-shrink-0">
                    {t_.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-body-sm text-deep-green">{t_.name}</p>
                    <p className="font-body text-label-xs text-secondary-text">{t_.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
          <div className="md:hidden flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {TESTIMONIALS.map((t_) => (
              <div key={t_.id} className="min-w-[280px] bg-surface-container-low rounded-2xl border border-sage-border p-5 flex-shrink-0">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t_.stars }).map((_, i) => <Star key={i} size={14} weight="fill" className="text-[#F59E0B]" />)}
                </div>
                <p className="font-body text-body-sm text-secondary-text italic mb-4">&ldquo;{t_.quote}&rdquo;</p>
                <p className="font-body font-semibold text-body-sm text-deep-green">{t_.name}</p>
                <p className="font-body text-label-xs text-secondary-text">{t_.city}</p>
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
              <p className="section-label">{t("facilitators_label", "Ghizi experți")}</p>
              <h2 className="section-title">{t("facilitators_title", "Ghidat de experți în somatizare")}</h2>
              <p className="font-body text-body-lg text-secondary-text max-w-xl mx-auto">
                {t("facilitators_subtitle", "O echipă de terapeuți, practicieni somatic și specialiști certificați, formați în România și internațional.")}
              </p>
            </div>
          </AnimateIn>
          <StaggerChildren once={false} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {FACILITATORS_DATA.map((f) => (
              <Link key={f.id} href={`/facilitatori/${f.slug}`} className="group block space-y-4">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                  <Image src={f.image} alt={f.name} fill className="object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                </div>
                <div>
                  <h4 className="font-body font-semibold text-body-md text-deep-green group-hover:text-forest-green transition-colors">{f.name}</h4>
                  <p className="font-body text-label-xs text-forest-green">{f.specialty}</p>
                </div>
              </Link>
            ))}
          </StaggerChildren>
          <div className="text-center mt-10">
            <Link href="/facilitatori" className="btn btn-outline">Toți facilitatorii <ArrowRight size={16} weight="bold" /></Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <div className="text-center mb-10">
              <p className="section-label">Investește în tine</p>
              <h2 className="section-title">Planul potrivit pentru tine</h2>
              <div className="flex items-center justify-center gap-4 mt-6">
                <span className={`font-body text-body-sm ${!billingAnnual ? "text-deep-green font-semibold" : "text-secondary-text"}`}>Lunar</span>
                <button onClick={() => setBillingAnnual(!billingAnnual)} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${billingAnnual ? "bg-forest-green" : "bg-sage-border"}`}>
                  <motion.div animate={{ x: billingAnnual ? 28 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm" />
                </button>
                <span className={`font-body text-body-sm ${billingAnnual ? "text-deep-green font-semibold" : "text-secondary-text"}`}>Anual</span>
                <span className="tag tag-green">Economisești 35%</span>
              </div>
            </div>
          </AnimateIn>
          <StaggerChildren once={false} className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.12}>
            {PRICING_PLANS.map((plan) => (
              <div key={plan.id} className={`relative rounded-2xl border p-5 sm:p-8 flex flex-col transition-all duration-200 ${plan.isPopular ? "bg-forest-green border-forest-green text-white shadow-[0_20px_60px_rgba(61,122,92,0.25)] md:scale-105" : "bg-white border-sage-border shadow-card hover:shadow-card-hover"}`}>
                {plan.isPopular && (
                  <div className="absolute -top-4 right-6">
                    <span className="bg-terracotta text-white text-label-xs font-bold px-4 py-1.5 rounded-full">RECOMANDAT</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-heading text-h3 mb-1 ${plan.isPopular ? "text-white" : "text-deep-green"}`}>{plan.name}</h3>
                  <p className={`font-body text-body-sm ${plan.isPopular ? "text-white/70" : "text-secondary-text"}`}>{plan.description}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-heading text-4xl font-bold ${plan.isPopular ? "text-white" : "text-deep-green"}`}>
                      <motion.span key={billingAnnual ? "annual" : "monthly"} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        {billingAnnual ? plan.priceAnnual : plan.price}
                      </motion.span>
                    </span>
                    <span className={`font-body text-body-sm ${plan.isPopular ? "text-white/60" : "text-secondary-text"}`}>RON/lună</span>
                  </div>
                  {billingAnnual && plan.price > 0 && (
                    <p className={`font-body text-label-xs mt-1 ${plan.isPopular ? "text-white/60" : "text-secondary-text"}`}>facturat anual ({plan.priceAnnual * 12} RON/an)</p>
                  )}
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={16} weight="bold" className={`flex-shrink-0 mt-0.5 ${plan.isPopular ? "text-white" : "text-forest-green"}`} />
                      <span className={`font-body text-body-sm ${plan.isPopular ? "text-white/80" : "text-secondary-text"}`}>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 opacity-40">
                      <X size={16} weight="regular" className="flex-shrink-0 mt-0.5" />
                      <span className={`font-body text-body-sm ${plan.isPopular ? "text-white" : "text-secondary-text"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`btn w-full text-center ${plan.isPopular ? "bg-white text-forest-green hover:bg-white/90" : "btn-primary"}`}>{plan.cta}</Link>
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
              {t("guarantee_title", "Testează gratuit timp de 14 zile.")}
            </h2>
            <p className="font-body text-body-lg text-deep-green/70 max-w-xl mx-auto">
              {t("guarantee_subtitle", "Primești acces la toate metodele noastre de recalibrare.")}
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 lg:py-24 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn once={false} from="bottom">
            <h2 className="font-heading text-h2 text-deep-green text-center mb-8 lg:mb-14">Întrebări frecvente</h2>
          </AnimateIn>
          <div className="space-y-0">
            {faqItems.map((item, i) => (
              <AnimateIn once={false} key={i} delay={i * 0.04}>
                <div className="border-b border-sage-border">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left group">
                    <span className="font-heading text-lg text-deep-green pr-4 group-hover:text-forest-green transition-colors">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                      <CaretDown size={18} weight="bold" className="text-secondary-text" />
                    </motion.div>
                  </button>
                  <motion.div initial={false} animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
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
                {t("cta_title", "Alege să te simți mai bine acum.")}
              </h2>
              <p className="font-body text-body-lg" style={{ color: "rgba(200,235,211,0.9)" }}>
                {t("cta_subtitle", "Începe să te simți mai bine imediat. Anulezi oricând, fără bătăi de cap.")}
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-white text-forest-green font-body font-semibold text-body-md sm:text-body-lg hover:bg-white/90 transition-colors shadow-lg">
                Începe acum <ArrowRight size={20} weight="bold" />
              </Link>
            </AnimateIn>
            <AnimateIn once={false} from="right" className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square">
                <div className="w-full h-full rounded-full overflow-hidden relative" style={{ opacity: 0.7, mixBlendMode: "overlay" as const }}>
                  <Image src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80" alt="Meditație somatică" fill className="object-cover" />
                </div>
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 rounded-full border-2" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      </div>
    </div>
  );
}
