"use client";

/**
 * Pagina Somn — „Lasă ziua să se încheie."
 * Hero nocturn compozit (lună reală + cer în degrade + stele CSS), stări de
 * seară cu recomandări, biblioteca de adormire, ritualul de seară, modul
 * neghidat și mixerul de sunete (marcat „în curând" până urcăm audio).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoonStars, Headphones, Play, Clock, Brain, Lightning, CloudMoon, Bed,
  Sparkle, MusicNotes, Leaf, WaveSine, Spiral, BookOpen, ArrowRight,
  ShuffleAngular, Waves, Fire, PianoKeys, Heart, PencilSimple, CheckCircle,
} from "@phosphor-icons/react";
import AnimateIn from "@/components/ui/AnimateIn";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── Imagini (verificate vizual) ─────────────────────────────────────────── */
const IMG = {
  moon: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=900&q=80",
  rain: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=900&q=80",
  dusk: "https://images.unsplash.com/photo-1500817487388-039e623edc21?w=900&q=80",
  piano: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=900&q=80",
  sleep: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=900&q=80",
  scan: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80",
  lotus: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=900&q=80",
  stars: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=900&q=80",
  galaxy: "https://images.unsplash.com/photo-1515705576963-95cad62945b6?w=900&q=80",
};

/* Stele fixe (poziții deterministe — nu folosim Math.random la render) */
const STARS = [
  [4, 12], [9, 34], [13, 7], [17, 55], [22, 21], [26, 74], [31, 9], [35, 42],
  [40, 63], [44, 16], [49, 81], [53, 28], [58, 6], [62, 49], [67, 70], [71, 13],
  [76, 37], [81, 58], [86, 24], [90, 77], [94, 45], [97, 10], [7, 88], [20, 92],
  [46, 95], [64, 90], [83, 93], [12, 66], [29, 52], [55, 68], [73, 85], [88, 8],
] as const;

/* ── Stările de seară ────────────────────────────────────────────────────── */
const MOODS = [
  { key: "minte",  Icon: Brain,     bg: "from-purple-100 to-purple-50",  title: "Mintea mea nu se oprește",    desc: "Am prea multe gânduri." },
  { key: "corp",   Icon: Lightning, bg: "from-amber-100 to-orange-50",   title: "Corpul meu e încă în alertă", desc: "Sunt obosită, dar încă simt tensiune." },
  { key: "adorm",  Icon: CloudMoon, bg: "from-sky-100 to-indigo-50",     title: "Vreau doar să adorm",         desc: "Nu vreau să fac nimic. Doar play." },
  { key: "trezit", Icon: Bed,       bg: "from-emerald-100 to-teal-50",   title: "Mă trezesc în timpul nopții", desc: "Am nevoie de ceva blând care să mă țină în somn." },
  { key: "noapte", Icon: Sparkle,   bg: "from-slate-200 to-slate-100",   title: "Vreau un sunet pentru toată noaptea", desc: "Fără ghidaj. Fără efort." },
] as const;

type MoodKey = typeof MOODS[number]["key"] | null;

/* ── Recomandări ─────────────────────────────────────────────────────────── */
interface Rec { tag: string; title: string; dur: string; img: string; href?: string; soon?: boolean }

const POOL: Record<string, Rec> = {
  rain:    { tag: "Natură",   title: "Ploaie la fereastră",              dur: "8 ore",   img: IMG.rain,  soon: true },
  ritual:  { tag: "Practică", title: "Lasă ziua să plece",               dur: "10 min",  img: IMG.dusk,  href: "/practici/4" },
  soft:    { tag: "Muzică",   title: "Soft Landing",                     dur: "45 min",  img: IMG.piano, soon: true },
  nsdr:    { tag: "Practică", title: "NSDR — repaus profund non-somn",   dur: "20 min",  img: IMG.lotus, href: "/practici/9" },
  scan:    { tag: "Practică", title: "Scanarea corpului",                dur: "15 min",  img: IMG.scan,  href: "/practici/2" },
  sleep:   { tag: "Practică", title: "Ritual de adormire",               dur: "10 min",  img: IMG.sleep, href: "/practici/4" },
  stories: { tag: "Povești",  title: "Povești de adormit",               dur: "30 min",  img: IMG.moon,  soon: true },
  noise:   { tag: "Noise",    title: "Deep Brown Noise",                 dur: "toată noaptea", img: IMG.stars,  soon: true },
  freq:    { tag: "Frecvențe", title: "Unde Delta — somn profund",       dur: "toată noaptea", img: IMG.galaxy, soon: true },
};

const RECS_BY_MOOD: Record<string, Rec[]> = {
  default: [POOL.rain, POOL.ritual, POOL.soft],
  minte:   [POOL.nsdr, POOL.rain, POOL.soft],
  corp:    [POOL.scan, POOL.sleep, POOL.rain],
  adorm:   [POOL.sleep, POOL.rain, POOL.soft],
  trezit:  [POOL.nsdr, POOL.stories, POOL.noise],
  noapte:  [POOL.rain, POOL.noise, POOL.freq],
};

/* ── Biblioteca de adormire ──────────────────────────────────────────────── */
interface LibraryTile {
  Icon: React.ElementType;
  img: string;
  /** voalul de culoare peste imagine — accentul fiecărei categorii */
  tint: string;
  /** fundalul pastel al zonei de text */
  bg: string;
  title: string;
  desc: string;
  soon?: boolean;
  href?: string;
}

const LIBRARY: LibraryTile[] = [
  { Icon: MusicNotes, img: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80", tint: "from-purple-600/45 via-purple-400/15 to-transparent",  bg: "from-purple-50 to-white",  title: "Muzică",               desc: "Compoziții ambientale pentru somn",             soon: true },
  { Icon: Leaf,       img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80", tint: "from-emerald-700/45 via-emerald-400/15 to-transparent", bg: "from-emerald-50 to-white", title: "Natură",               desc: "Sunetele naturii care te liniștesc",            soon: true },
  { Icon: WaveSine,   img: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=600&q=80", tint: "from-slate-700/50 via-slate-400/15 to-transparent",     bg: "from-slate-50 to-white",   title: "Noise",                desc: "Sunete constante care te ajută să te relaxezi", soon: true },
  { Icon: Spiral,     img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80", tint: "from-sky-600/45 via-indigo-400/15 to-transparent",      bg: "from-sky-50 to-white",     title: "Frecvențe",            desc: "Frecvențe blânde și texturi sonore",            soon: true },
  { Icon: MoonStars,  img: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600&q=80", tint: "from-indigo-700/45 via-purple-400/15 to-transparent",   bg: "from-indigo-50 to-white",  title: "Povești",              desc: "Povești de adormit, citite lent",               soon: true },
  { Icon: BookOpen,   img: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=600&q=80", tint: "from-amber-600/40 via-orange-400/15 to-transparent",    bg: "from-amber-50 to-white",   title: "Practici pentru somn", desc: "Practici ghidate pentru relaxare profundă",     href: "/practici" },
];

const SLEEP_EMOJIS = ["😣", "😕", "😐", "🙂", "😊"] as const;

interface Props { siteContent: Record<string, string> }

export default function SomnClient({ siteContent }: Props) {
  const { tr } = useLanguage();
  const t = (key: string, fallback: string) => tr(siteContent[key] || fallback);

  const [mood, setMood] = useState<MoodKey>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [mix, setMix] = useState({ ploaie: 70, ocean: 40, foc: 20, pian: 55 });

  const recs = useMemo(() => RECS_BY_MOOD[mood ?? "default"] ?? RECS_BY_MOOD.default, [mood]);

  function surprise() {
    const pick = MOODS[Math.floor(Math.random() * MOODS.length)].key;
    setMood(pick);
  }

  function rate(i: number) {
    setRating(i);
    try { localStorage.setItem(`somn-rating-${new Date().toISOString().slice(0, 10)}`, String(i)); } catch {}
  }

  return (
    <div className="min-h-screen bg-bg-main">
      {/* ── HERO nocturn ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg,#070d1d 0%,#0b1428 46%,#12203f 78%,#0a1122 100%)" }}>
        {/* stele */}
        {STARS.map(([x, y], i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${x}%`, top: `${y}%`,
              width: i % 5 === 0 ? 2.5 : 1.5, height: i % 5 === 0 ? 2.5 : 1.5,
              opacity: i % 3 === 0 ? 0.9 : 0.45,
            }}
          />
        ))}
        {/* luna — fotografie reală pe negru, integrată prin blend „screen" */}
        <div className="absolute right-[6%] top-14 lg:top-20 w-44 h-44 lg:w-64 lg:h-64 pointer-events-none select-none">
          <Image src={IMG.moon} alt="" fill priority className="object-cover" style={{ mixBlendMode: "screen", opacity: 0.95 }} />
        </div>
        {/* reflexia lunii pe apă */}
        <div className="absolute right-[6%] bottom-6 w-44 lg:w-64 pointer-events-none" aria-hidden>
          <div className="mx-auto h-16 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="mx-auto mt-1 h-[2px] w-32 bg-white/15 blur-[1px]" />
          <div className="mx-auto mt-2 h-[2px] w-20 bg-white/10 blur-[1px]" />
          <div className="mx-auto mt-2 h-[2px] w-24 bg-white/5 blur-[2px]" />
        </div>
        {/* linia apei */}
        <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none" style={{ background: "linear-gradient(180deg,transparent,#060b18)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <AnimateIn from="bottom">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-label-sm font-body font-semibold uppercase tracking-[0.2em] text-white/70 mb-5">
                <MoonStars size={16} weight="fill" className="text-amber-200" />
                {t("label", "Somn")}
              </p>
              <h1 className="font-heading text-h1 lg:text-display text-white leading-[1.05] mb-6">
                {t("title", "Lasă ziua să se încheie.")}
              </h1>
              <p className="font-body text-body-lg text-white/75 leading-relaxed mb-8 max-w-md">
                {t("subtitle", "Sunete, muzică și practici blânde pentru serile în care corpul s-a oprit, dar mintea încă nu.")}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link href="/practici/4" className="btn btn-primary gap-2">
                  <Play size={16} weight="fill" />
                  {t("cta1", "Începe seara")}
                </Link>
                <a href="#biblioteca" className="btn gap-2 border border-white/30 text-white hover:bg-white/10 rounded-full px-6 py-3 font-body text-body-sm font-semibold transition-colors">
                  {t("cta2", "Explorează sunetele")}
                </a>
              </div>
              <p className="flex items-center gap-2 font-body text-label-sm text-white/50">
                <Headphones size={15} />
                {t("note", "Recomandăm căști pentru anumite experiențe audio.")}
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Cum e seara ta? ────────────────────────────────────────────── */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-heading text-h1 text-deep-green mb-2">{tr("Cum e seara ta?")}</h2>
                <p className="font-body text-body-md text-secondary-text">{tr("Alege ce se apropie cel mai mult de cum te simți acum.")}</p>
              </div>
              <button onClick={surprise} className="filter-pill flex items-center gap-2">
                <ShuffleAngular size={14} weight="bold" />
                {tr("Nu știu, surprinde-mă")}
              </button>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOODS.map((m, i) => (
              <AnimateIn key={m.key} from="bottom" delay={i * 0.05}>
                <button
                  onClick={() => setMood(mood === m.key ? null : m.key)}
                  className={`card card-lift w-full h-full text-left p-5 bg-gradient-to-br ${m.bg} border-2 transition-colors ${
                    mood === m.key ? "border-forest-green" : "border-transparent"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-white/70 flex items-center justify-center mb-4">
                    <m.Icon size={22} weight="duotone" className="text-deep-green" />
                  </div>
                  <p className="font-body font-semibold text-body-sm text-deep-green mb-1 leading-snug">{tr(m.title)}</p>
                  <p className="font-body text-label-xs text-secondary-text">{tr(m.desc)}</p>
                  {mood === m.key && (
                    <p className="flex items-center gap-1 mt-3 text-label-xs font-body font-semibold text-forest-green">
                      <CheckCircle size={13} weight="fill" /> {tr("Ales")}
                    </p>
                  )}
                </button>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recomandări ────────────────────────────────────────────────── */}
      <section className="py-4 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <h2 className="font-heading text-h1 text-deep-green">{tr("Pentru seara asta, încearcă...")}</h2>
            <Link href="/practici" className="font-body text-body-sm font-semibold text-forest-green hover:text-deep-green flex items-center gap-1 transition-colors">
              {tr("Vezi toate recomandările")} <ArrowRight size={15} weight="bold" />
            </Link>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mood ?? "default"}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {recs.map((r) => {
                const inner = (
                  <div className="relative aspect-[16/10] rounded-card overflow-hidden group">
                    <Image src={r.img} alt={tr(r.title)} fill className="object-cover brightness-[0.72] group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
                    <span className="absolute top-4 left-4 tag bg-white/20 text-white border border-white/25 backdrop-blur-sm text-[10px] uppercase tracking-wider">{tr(r.tag)}</span>
                    {r.soon && (
                      <span className="absolute top-4 right-4 tag bg-amber-300/90 text-deep-green text-[10px] font-semibold">{tr("În curând")}</span>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-heading text-h3 text-white leading-snug mb-1">{tr(r.title)}</p>
                        <p className="flex items-center gap-1.5 font-body text-label-xs text-white/75"><Clock size={12} /> {tr(r.dur)}</p>
                      </div>
                      <span className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0 group-hover:bg-forest-green transition-colors">
                        <Play size={16} weight="fill" className="text-white ml-0.5" />
                      </span>
                    </div>
                  </div>
                );
                return r.href ? (
                  <Link key={r.title} href={r.href}>{inner}</Link>
                ) : (
                  <div key={r.title} className="cursor-default">{inner}</div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Biblioteca de adormire ─────────────────────────────────────── */}
      <section id="biblioteca" className="py-14 lg:py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <h2 className="font-heading text-h1 text-deep-green mb-2">{tr("Alege cum vrei să adormi")}</h2>
            <p className="font-body text-body-md text-secondary-text mb-8">{tr("Explorează biblioteca noastră pentru somn.")}</p>
          </AnimateIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {LIBRARY.map((c, i) => {
              const body = (
                <div className="card card-lift h-full overflow-hidden text-left relative">
                  <div className="relative aspect-[4/3]">
                    <Image src={c.img} alt={tr(c.title)} fill className="object-cover" sizes="(max-width: 768px) 50vw, 200px" />
                    {/* voalul de culoare al categoriei, peste imagine */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${c.tint}`} />
                    <span className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center">
                      <c.Icon size={16} weight="duotone" className="text-deep-green" />
                    </span>
                    {c.soon && <span className="absolute top-2.5 right-2.5 tag bg-white/85 backdrop-blur-sm text-deep-green text-[9px] uppercase tracking-wide">{tr("În curând")}</span>}
                  </div>
                  <div className={`p-4 bg-gradient-to-br ${c.bg}`}>
                    <p className="font-body font-semibold text-body-sm text-deep-green mb-1">{tr(c.title)}</p>
                    <p className="font-body text-label-xs text-secondary-text leading-relaxed">{tr(c.desc)}</p>
                  </div>
                </div>
              );
              return (
                <AnimateIn key={c.title} from="bottom" delay={i * 0.04}>
                  {c.href ? <Link href={c.href} className="block h-full">{body}</Link> : body}
                </AnimateIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Ritualul de seară ──────────────────────────────────────────── */}
      <section className="py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <h2 className="font-heading text-h1 text-deep-green mb-2">{tr("Continuă ritualul tău")}</h2>
            <p className="font-body text-body-md text-secondary-text mb-8">{tr("De unde ai rămas seara trecută.")}</p>
          </AnimateIn>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimateIn from="bottom" className="lg:col-span-2">
              <div className="card p-6 lg:p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-body font-semibold text-body-md text-deep-green">{tr("Ritualul meu de seară")}</p>
                  <span className="flex items-center gap-1.5 font-body text-label-xs text-secondary-text"><Clock size={13} /> ~35 {tr("min")}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
                  {[
                    { Icon: Leaf,      title: "Din alertă spre liniște", sub: "Scanarea corpului · 15 min", href: "/practici/2" },
                    { Icon: CloudMoon, title: "Ritual de adormire",      sub: "Practică ghidată · 10 min",  href: "/practici/4" },
                    { Icon: Waves,     title: "Ploaie la fereastră",     sub: "Sunet · 8 ore · în curând" },
                  ].map((s, i) => (
                    <div key={s.title} className="relative">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-light-green flex items-center justify-center flex-shrink-0">
                          <s.Icon size={18} weight="duotone" className="text-forest-green" />
                        </div>
                        <div>
                          <p className="font-body font-semibold text-body-sm text-deep-green leading-snug">{tr(s.title)}</p>
                          <p className="font-body text-label-xs text-secondary-text mt-0.5">{tr(s.sub)}</p>
                        </div>
                      </div>
                      {i < 2 && <div className="hidden sm:block absolute top-5 -right-2 w-4 border-t border-dashed border-sage-border" aria-hidden />}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/practici/2" className="btn btn-primary gap-2">
                    <Play size={15} weight="fill" /> {tr("Continuă ritualul")}
                  </Link>
                  <span className="flex items-center gap-1.5 font-body text-body-sm text-secondary-text/70 cursor-not-allowed" title={tr("În curând")}>
                    <PencilSimple size={14} /> {tr("Editează ritualul")} · {tr("în curând")}
                  </span>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn from="bottom" delay={0.08}>
              <div className="card p-6 h-full flex flex-col gap-5">
                <div>
                  <p className="font-body text-label-sm text-secondary-text mb-2">{tr("Ultimul sunet ascultat")}</p>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-sage-border">
                    <div>
                      <p className="font-body font-semibold text-body-sm text-deep-green">{tr("Ploaie la fereastră")}</p>
                      <p className="font-body text-label-xs text-secondary-text">8 {tr("ore")} · {tr("în curând")}</p>
                    </div>
                    <span className="w-9 h-9 rounded-full bg-light-green flex items-center justify-center flex-shrink-0">
                      <Play size={14} weight="fill" className="text-forest-green ml-0.5" />
                    </span>
                  </div>
                </div>
                <div className="border-t border-sage-border pt-5">
                  <p className="font-body text-label-sm text-secondary-text mb-3">{tr("Cum ai dormit?")}</p>
                  {rating === null ? (
                    <div className="flex items-center justify-between">
                      {SLEEP_EMOJIS.map((e, i) => (
                        <button
                          key={i}
                          onClick={() => rate(i)}
                          aria-label={`${tr("Notează somnul")} ${i + 1}/5`}
                          className="w-10 h-10 rounded-full text-xl hover:bg-light-green hover:scale-110 transition-all"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-body-sm text-forest-green flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" /> {tr("Mulțumim! Ne ajută să-ți recomandăm serile potrivite.")} {SLEEP_EMOJIS[rating]}
                    </p>
                  )}
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Neghidat ───────────────────────────────────────────────────── */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <h2 className="font-heading text-h1 text-deep-green mb-2">{tr("În seara asta nu vreau să mă ghideze nimeni.")}</h2>
            <p className="font-body text-body-md text-secondary-text mb-8">{tr("Doar apasă play.")}</p>
          </AnimateIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { Icon: Leaf,       bg: "from-emerald-50 to-teal-50",   title: "Natură" },
              { Icon: MusicNotes, bg: "from-purple-50 to-purple-100", title: "Muzică" },
              { Icon: WaveSine,   bg: "from-amber-50 to-orange-50",   title: "Noise" },
              { Icon: Spiral,     bg: "from-sky-50 to-indigo-50",     title: "Frecvențe" },
            ].map((qp, i) => (
              <AnimateIn key={qp.title} from="bottom" delay={i * 0.05}>
                <div className={`card p-5 bg-gradient-to-r ${qp.bg} flex items-center gap-3 relative`}>
                  <span className="absolute top-2.5 right-3 font-body text-[9px] uppercase tracking-wide text-secondary-text/60">{tr("În curând")}</span>
                  <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0">
                    <qp.Icon size={19} weight="duotone" className="text-deep-green" />
                  </div>
                  <p className="font-body font-semibold text-body-sm text-deep-green">{tr(qp.title)}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mixerul de sunete ──────────────────────────────────────────── */}
      <section className="py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimateIn from="bottom">
              <div className="card p-6 h-full bg-gradient-to-br from-light-green to-surface-container-low">
                <p className="font-heading text-h2 text-deep-green mb-2">{tr("Creează-ți sunetul")}</p>
                <p className="font-body text-body-sm text-secondary-text mb-4">{tr("Fă-ți seara să sune exact cum îți place.")}</p>
                <span className="tag bg-amber-200/50 text-deep-green border border-amber-300/70 text-[11px] font-semibold">{tr("Disponibil în curând")}</span>
              </div>
            </AnimateIn>
            <AnimateIn from="bottom" delay={0.06}>
              <div className="card p-6 h-full space-y-5">
                {[
                  { key: "ploaie" as const, Icon: Waves,     label: "Ploaie" },
                  { key: "ocean"  as const, Icon: WaveSine,  label: "Ocean" },
                  { key: "foc"    as const, Icon: Fire,      label: "Foc" },
                  { key: "pian"   as const, Icon: PianoKeys, label: "Pian" },
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-light-green flex items-center justify-center flex-shrink-0">
                      <s.Icon size={15} weight="duotone" className="text-forest-green" />
                    </div>
                    <span className="font-body text-body-sm text-deep-green w-14">{tr(s.label)}</span>
                    <input
                      type="range" min={0} max={100} value={mix[s.key]}
                      onChange={(e) => setMix({ ...mix, [s.key]: Number(e.target.value) })}
                      className="flex-1 accent-forest-green"
                      aria-label={tr(s.label)}
                    />
                  </div>
                ))}
              </div>
            </AnimateIn>
            <AnimateIn from="bottom" delay={0.12}>
              <div className="card p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-body font-semibold text-body-md text-deep-green">{tr("Salvează mixul tău preferat")}</p>
                  <Heart size={18} weight="duotone" className="text-forest-green" />
                </div>
                <p className="font-body text-label-xs text-secondary-text mb-4">{tr("Numește-l și îl regăsești în serile următoare.")}</p>
                <input className="input w-full mb-3" placeholder={tr("Numește-ți mixul")} disabled />
                <button className="btn btn-primary w-full opacity-50 cursor-not-allowed" disabled>{tr("Salvează")}</button>
                <p className="font-body text-[10px] text-secondary-text/70 mt-2 text-center uppercase tracking-wide">{tr("În curând")}</p>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Banda finală ───────────────────────────────────────────────── */}
      <section className="py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="card p-8 lg:p-10 bg-gradient-to-r from-light-green via-surface-container-low to-indigo-light flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0">
                  <MoonStars size={22} weight="duotone" className="text-forest-green" />
                </div>
                <div>
                  <p className="font-heading text-h3 text-deep-green">{t("band_title", "Somnul face parte din echilibru.")}</p>
                  <p className="font-body text-body-sm text-secondary-text">{t("band_sub", "Ai grijă de ziua ta. Noi avem grijă de serile tale.")}</p>
                </div>
              </div>
              <Link href="/dashboard" className="btn btn-primary gap-2">
                {t("band_cta", "Explorează WithIn")} <ArrowRight size={15} weight="bold" />
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>
    </div>
  );
}
