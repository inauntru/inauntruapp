"use client";

/**
 * Pagina Somn — „Lasă ziua să se încheie."
 * Integrare a machetei „within-somn-v4": ilustrații SVG desenate (luna peste
 * mare, simbolurile stărilor, scenele recomandărilor), adaptate la brandul
 * WithIN — font Sentient/Inter și paleta verde–indigo din manualul de brand.
 * Funcțional: stări de seară → recomandări (carusel cu swipe), ritualul de
 * seară, evaluarea somnului, mixerul de sunete (marcat „în curând").
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoonStars, Headphones, Play, Clock, Sparkle, Leaf, CloudMoon, Waves,
  ArrowRight, ShuffleAngular, Heart, PencilSimple, CheckCircle,
  SmileySad, SmileyNervous, SmileyMeh, Smiley, SmileyWink, CaretLeft, CaretRight,
} from "@phosphor-icons/react";
import AnimateIn from "@/components/ui/AnimateIn";
import {
  ArtMinte, ArtFulger, ArtCeata, ArtFrunza,
  ArtCopaci, ArtMuzica, ArtUnde, ArtInele,
} from "@/components/ui/ArtIcons";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── Luna peste mare — arta din hero (din macheta v4) ────────────────────── */
function HeroArt() {
  return (
    <svg viewBox="0 0 1200 480" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs>
        <linearGradient id="somn-skyG" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#0A1220" /><stop offset="52%" stopColor="#14263C" />
          <stop offset="78%" stopColor="#22394F" /><stop offset="100%" stopColor="#2C4257" />
        </linearGradient>
        <linearGradient id="somn-seaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#263B4F" /><stop offset="100%" stopColor="#0B1421" />
        </linearGradient>
        <clipPath id="somn-seaClip"><rect x="0" y="300" width="1200" height="180" /></clipPath>
      </defs>

      <rect width="1200" height="480" fill="url(#somn-skyG)" />

      {/* stele */}
      <g fill="#EFE8D8">
        <circle cx="120" cy="60" r="1.3" opacity=".7" /><circle cx="240" cy="112" r="1" opacity=".45" />
        <circle cx="330" cy="44" r="1.5" opacity=".8" /><circle cx="470" cy="96" r="1" opacity=".4" />
        <circle cx="560" cy="38" r="1.2" opacity=".6" /><circle cx="700" cy="132" r="1" opacity=".35" />
        <circle cx="820" cy="52" r="1.4" opacity=".7" /><circle cx="960" cy="118" r="1" opacity=".4" />
        <circle cx="1080" cy="70" r="1.3" opacity=".62" /><circle cx="1150" cy="160" r="1" opacity=".33" />
        <circle cx="60" cy="180" r="1" opacity=".3" /><circle cx="410" cy="176" r="1.1" opacity=".38" />
        <circle cx="640" cy="196" r="1" opacity=".28" /><circle cx="900" cy="206" r="1.1" opacity=".3" />
      </g>

      {/* halo + lună */}
      <circle cx="838" cy="152" r="190" fill="url(#art-gHalo)" />
      <circle cx="838" cy="152" r="60" fill="url(#art-gMoonFace)" />
      <g fill="#B6A484" opacity=".30" filter="url(#art-soft)">
        <ellipse cx="820" cy="134" rx="17" ry="13" />
        <ellipse cx="853" cy="160" rx="12" ry="10" />
        <ellipse cx="826" cy="174" rx="9" ry="7" />
        <ellipse cx="862" cy="128" rx="7" ry="6" />
        <ellipse cx="806" cy="160" rx="6" ry="5" />
      </g>
      <circle cx="838" cy="152" r="60" fill="none" stroke="#FFF6E4" strokeOpacity=".28" strokeWidth="1" />

      {/* ceață la orizont */}
      <rect x="0" y="252" width="1200" height="70" fill="#3C566E" opacity=".28" filter="url(#art-softer)" />

      {/* marea + dâra lunii */}
      <rect x="0" y="300" width="1200" height="180" fill="url(#somn-seaG)" />
      <g clipPath="url(#somn-seaClip)" fill="#F0E4C8">
        <rect x="806" y="306" width="64" height="2" rx="1" opacity=".55" />
        <rect x="790" y="316" width="96" height="2.5" rx="1.2" opacity=".42" />
        <rect x="812" y="326" width="52" height="2" rx="1" opacity=".5" />
        <rect x="776" y="338" width="124" height="3" rx="1.5" opacity=".34" />
        <rect x="800" y="352" width="76" height="2.5" rx="1.2" opacity=".4" />
        <rect x="762" y="366" width="150" height="3" rx="1.5" opacity=".26" />
        <rect x="808" y="382" width="60" height="2.5" rx="1.2" opacity=".33" />
        <rect x="744" y="398" width="186" height="3.5" rx="1.7" opacity=".2" />
        <rect x="794" y="416" width="90" height="3" rx="1.5" opacity=".25" />
        <rect x="724" y="436" width="226" height="4" rx="2" opacity=".15" />
        <rect x="784" y="458" width="112" height="3" rx="1.5" opacity=".18" />
      </g>
      <g clipPath="url(#somn-seaClip)" fill="#7E93A8" opacity=".2">
        <rect x="0" y="322" width="1200" height="1.5" /><rect x="0" y="356" width="1200" height="1.5" />
        <rect x="0" y="400" width="1200" height="2" /><rect x="0" y="448" width="1200" height="2" />
      </g>

      <rect width="1200" height="480" filter="url(#art-grain)" opacity=".16" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}

/* ── Scenele ilustrate ale recomandărilor (stilul machetei v4) ───────────── */
function SceneRain() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-rainG" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#3A5A70" /><stop offset="100%" stopColor="#132433" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-rainG)" />
      <g fill="#DCEAF2" opacity=".22" filter="url(#art-soft)">
        <circle cx="60" cy="70" r="26" /><circle cx="190" cy="40" r="34" /><circle cx="250" cy="150" r="30" />
      </g>
      <g stroke="#EAF3F8" strokeLinecap="round">
        <path d="M40 20v34" strokeWidth="2" opacity=".5" /><path d="M78 60v46" strokeWidth="2.5" opacity=".42" />
        <path d="M118 10v30" strokeWidth="1.8" opacity=".55" /><path d="M156 90v52" strokeWidth="2.6" opacity=".35" />
        <path d="M196 130v40" strokeWidth="2" opacity=".45" /><path d="M232 40v36" strokeWidth="2.2" opacity=".4" />
        <path d="M268 96v44" strokeWidth="2.4" opacity=".33" /><path d="M20 140v38" strokeWidth="2" opacity=".38" />
        <path d="M100 170v40" strokeWidth="2.3" opacity=".3" /><path d="M174 186v38" strokeWidth="2" opacity=".33" />
      </g>
      <g fill="#EAF3F8" opacity=".38">
        <circle cx="52" cy="118" r="4" /><circle cx="140" cy="72" r="5.5" /><circle cx="214" cy="196" r="4.5" />
        <circle cx="86" cy="200" r="3.5" /><circle cx="262" cy="66" r="3" />
      </g>
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".2" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
function SceneDune() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-duneG" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#9C7A92" /><stop offset="100%" stopColor="#3E2E42" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-duneG)" />
      <path d="M0 168c50-34 92-10 140-34s110-14 160 12v94H0z" fill="#57415C" opacity=".72" />
      <path d="M0 200c62-28 108 4 156-16s96-4 144 22v34H0z" fill="#3A2B40" opacity=".85" />
      <ellipse cx="212" cy="60" rx="46" ry="46" fill="#F3DCE4" opacity=".18" filter="url(#art-softer)" />
      <path d="M20 120c40-22 70 6 108-12" stroke="#E7D2DC" strokeWidth="1.4" fill="none" opacity=".3" />
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".22" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
function SceneMunti() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-mntG" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0" stopColor="#8E93BE" /><stop offset="60%" stopColor="#5A5F8C" /><stop offset="100%" stopColor="#2E3255" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-mntG)" />
      <circle cx="228" cy="54" r="20" fill="#F0E9DA" opacity=".5" />
      <circle cx="228" cy="54" r="42" fill="#F0E9DA" opacity=".1" filter="url(#art-softer)" />
      <path d="M0 176l58-52 44 40 40-32 58 50 44-34 56 44v48H0z" fill="#4A4E7A" opacity=".85" />
      <path d="M0 206l70-38 52 30 56-24 60 34 62-20v52H0z" fill="#2C3055" />
      <path d="M58 124l20 18-38 12z" fill="#CDCBDF" opacity=".35" />
      <path d="M200 132l18 16-34 10z" fill="#CDCBDF" opacity=".28" />
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".2" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
function SceneOrizont() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-horG" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0" stopColor="#44586B" /><stop offset="100%" stopColor="#141F2C" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-horG)" />
      <circle cx="150" cy="128" r="70" stroke="#D8E4EA" strokeWidth="1.2" opacity=".18" fill="none" />
      <circle cx="150" cy="128" r="48" stroke="#D8E4EA" strokeWidth="1.2" opacity=".26" fill="none" />
      <circle cx="150" cy="128" r="27" stroke="#D8E4EA" strokeWidth="1.3" opacity=".4" fill="none" />
      <circle cx="150" cy="128" r="9" fill="#E6EEF2" opacity=".7" />
      <circle cx="150" cy="128" r="18" fill="#E6EEF2" opacity=".12" filter="url(#art-soft)" />
      <path d="M0 196h300" stroke="#8CA2B4" strokeWidth="1.2" opacity=".3" />
      <path d="M0 210h300" stroke="#8CA2B4" strokeWidth="1" opacity=".16" />
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".2" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
function SceneScan() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-scanG" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#3C6B52" /><stop offset="100%" stopColor="#122A1C" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-scanG)" />
      <g stroke="#CFE8D8" strokeLinecap="round" fill="none">
        <path d="M30 60c40-18 80 18 120 0s80-18 120 0" strokeWidth="1.6" opacity=".2" />
        <path d="M30 96c40-18 80 18 120 0s80-18 120 0" strokeWidth="1.8" opacity=".3" />
        <path d="M30 132c40-18 80 18 120 0s80-18 120 0" strokeWidth="2" opacity=".42" />
        <path d="M30 168c40-18 80 18 120 0s80-18 120 0" strokeWidth="1.8" opacity=".28" />
        <path d="M30 202c40-18 80 18 120 0s80-18 120 0" strokeWidth="1.6" opacity=".16" />
      </g>
      <circle cx="150" cy="132" r="7" fill="#DFF2E6" opacity=".65" />
      <circle cx="150" cy="132" r="16" fill="#DFF2E6" opacity=".14" filter="url(#art-soft)" />
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".2" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
function SceneLuna() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-lunaG" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#2A3450" /><stop offset="100%" stopColor="#10182B" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-lunaG)" />
      <g fill="#EFE8D8">
        <circle cx="46" cy="46" r="1.4" opacity=".7" /><circle cx="120" cy="30" r="1.1" opacity=".5" />
        <circle cx="256" cy="60" r="1.3" opacity=".6" /><circle cx="80" cy="120" r="1" opacity=".4" />
        <circle cx="230" cy="150" r="1.2" opacity=".45" /><circle cx="150" cy="80" r="1" opacity=".35" />
        <circle cx="40" cy="190" r="1.1" opacity=".4" /><circle cx="270" cy="204" r="1" opacity=".3" />
      </g>
      <circle cx="186" cy="96" r="66" fill="url(#art-gHalo)" />
      <path d="M206 58a44 44 0 10 0 76 52 52 0 01 0-76z" fill="url(#art-gMoonFace)" />
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".2" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
function ScenePovesti() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-povG" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#4B4E92" /><stop offset="100%" stopColor="#22244A" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-povG)" />
      <g fill="#EFE8D8">
        <circle cx="60" cy="40" r="1.4" opacity=".7" /><circle cx="240" cy="34" r="1.2" opacity=".5" />
        <circle cx="180" cy="60" r="1" opacity=".4" /><circle cx="40" cy="120" r="1.1" opacity=".4" />
        <circle cx="270" cy="120" r="1.2" opacity=".45" />
      </g>
      <path d="M70 170c26-16 54-16 80-4 26-12 54-12 80 4v-72c-26-16-54-16-80-4-26-12-54-12-80 4z" fill="#E9E4F5" opacity=".9" />
      <path d="M150 94v72" stroke="#8B87BC" strokeWidth="1.6" opacity=".7" />
      <g stroke="#8B87BC" strokeWidth="1.2" opacity=".5">
        <path d="M86 112c18-8 36-9 54-2M86 130c18-8 36-9 54-2M86 148c18-8 36-9 54-2" fill="none" />
        <path d="M160 110c18-7 36-6 54 2M160 128c18-7 36-6 54 2M160 146c18-7 36-6 54 2" fill="none" />
      </g>
      <circle cx="150" cy="60" r="14" fill="#F0E9DA" opacity=".5" />
      <circle cx="150" cy="60" r="28" fill="#F0E9DA" opacity=".1" filter="url(#art-soft)" />
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".2" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
function SceneNoise() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-noiG" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0" stopColor="#4E5A66" /><stop offset="100%" stopColor="#171E26" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-noiG)" />
      <g stroke="#D7E2EA" strokeLinecap="round" fill="none">
        <path d="M20 56c20-16 30 16 50 0s30 16 50 0 30 16 50 0 30 16 50 0 30 16 50 0" strokeWidth="2" opacity=".16" />
        <path d="M20 100c20-16 30 16 50 0s30 16 50 0 30 16 50 0 30 16 50 0 30 16 50 0" strokeWidth="2.4" opacity=".28" />
        <path d="M20 144c20-16 30 16 50 0s30 16 50 0 30 16 50 0 30 16 50 0 30 16 50 0" strokeWidth="2.8" opacity=".4" />
        <path d="M20 188c20-16 30 16 50 0s30 16 50 0 30 16 50 0 30 16 50 0 30 16 50 0" strokeWidth="2.4" opacity=".22" />
      </g>
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".24" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
function SceneFrecvente() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <defs><linearGradient id="somn-freG" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#5A4E8E" /><stop offset="100%" stopColor="#241E44" /></linearGradient></defs>
      <rect width="300" height="240" fill="url(#somn-freG)" />
      <circle cx="150" cy="120" r="8" fill="#EFE3C2" opacity=".85" />
      <circle cx="150" cy="120" r="26" stroke="#E4D9F2" strokeWidth="1.8" opacity=".55" fill="none" />
      <circle cx="150" cy="120" r="48" stroke="#E4D9F2" strokeWidth="1.6" opacity=".38" fill="none" />
      <circle cx="150" cy="120" r="74" stroke="#E4D9F2" strokeWidth="1.4" opacity=".24" fill="none" />
      <circle cx="150" cy="120" r="102" stroke="#E4D9F2" strokeWidth="1.2" opacity=".13" fill="none" />
      <circle cx="150" cy="120" r="18" fill="#EFE3C2" opacity=".12" filter="url(#art-soft)" />
      <rect width="300" height="240" filter="url(#art-grain)" opacity=".2" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}

/* ── Stările de seară ────────────────────────────────────────────────────── */
const MOODS = [
  { key: "minte",  Art: ArtMinte,   bg: "from-[#F3F0FA] to-[#E6E0F3]", title: "Mintea mea nu se oprește",     desc: "Am prea multe gânduri.",                    tag: "ALERTĂ · minte" },
  { key: "corp",   Art: ArtFulger,   bg: "from-[#FDF3E4] to-[#F8E5CC]", title: "Corpul meu e încă în alertă",  desc: "Sunt obosită, dar încă simt tensiune.",     tag: "ALERTĂ · corp" },
  { key: "adorm",  Art: ArtCeata,   bg: "from-[#EDF2F7] to-[#DEE8F0]", title: "Sunt epuizată, dar nu adorm",  desc: "Nu mai am energie și totuși somnul nu vine.", tag: "OBOSEALĂ" },
  { key: "noapte", Art: ArtFrunza,  bg: "from-[#EDF4EE] to-[#DDEBE0]", title: "Vreau doar liniște",           desc: "Nimic de făcut. Doar ceva care ține companie.", tag: "LINIȘTIRE" },
] as const;

type MoodKey = typeof MOODS[number]["key"] | null;

/* ── Recomandări ─────────────────────────────────────────────────────────── */
interface Rec { tag: string; title: string; dur: string; Scene: React.ElementType; href?: string; soon?: boolean }

const POOL: Record<string, Rec> = {
  rain:    { tag: "Natură",    title: "Ploaie la fereastră",            dur: "8 ore",         Scene: SceneRain,      soon: true },
  ritual:  { tag: "Practică",  title: "Lasă ziua să plece",             dur: "10 min",        Scene: SceneDune,      href: "/practici/4" },
  soft:    { tag: "Muzică",    title: "Soft Landing",                   dur: "45 min",        Scene: SceneMunti,     soon: true },
  nsdr:    { tag: "Practică",  title: "NSDR — repaus profund non-somn", dur: "20 min",        Scene: SceneOrizont,   href: "/practici/9" },
  scan:    { tag: "Practică",  title: "Scanarea corpului",              dur: "15 min",        Scene: SceneScan,      href: "/practici/2" },
  sleep:   { tag: "Practică",  title: "Ritual de adormire",             dur: "10 min",        Scene: SceneLuna,      href: "/practici/4" },
  stories: { tag: "Povești",   title: "Povești de adormit",             dur: "30 min",        Scene: ScenePovesti,   soon: true },
  noise:   { tag: "Noise",     title: "Deep Brown Noise",               dur: "toată noaptea", Scene: SceneNoise,     soon: true },
  freq:    { tag: "Frecvențe", title: "Unde Delta — somn profund",      dur: "toată noaptea", Scene: SceneFrecvente, soon: true },
};

/* 8 recomandări per stare (2 „pagini" de câte 4 în carusel), cele mai potrivite primele */
const RECS_BY_MOOD: Record<string, Rec[]> = {
  default: [POOL.rain, POOL.ritual, POOL.soft, POOL.nsdr, POOL.scan, POOL.stories, POOL.noise, POOL.freq],
  minte:   [POOL.nsdr, POOL.rain, POOL.soft, POOL.ritual, POOL.stories, POOL.noise, POOL.scan, POOL.freq],
  corp:    [POOL.scan, POOL.sleep, POOL.rain, POOL.nsdr, POOL.soft, POOL.noise, POOL.stories, POOL.freq],
  adorm:   [POOL.sleep, POOL.rain, POOL.soft, POOL.stories, POOL.nsdr, POOL.noise, POOL.freq, POOL.scan],
  noapte:  [POOL.rain, POOL.noise, POOL.freq, POOL.stories, POOL.soft, POOL.nsdr, POOL.sleep, POOL.scan],
};
const PAGE_SIZE = 4;

/* ── Categoriile „doar play" ─────────────────────────────────────────────── */
const CHIPS = [
  { Art: ArtCopaci, title: "Natură", desc: "ploaie, ocean, pădure" },
  { Art: ArtMuzica, title: "Muzică", desc: "compoziții lente" },
  { Art: ArtUnde,   title: "Noise",  desc: "alb, roz, brown" },
  { Art: ArtInele,  title: "Tonuri", desc: "sunete constante" },
] as const;

/* Fețele pentru „Cum ai dormit?" */
const SLEEP_FACES = [SmileySad, SmileyNervous, SmileyMeh, Smiley, SmileyWink] as const;
const SLEEP_LABELS = ["Foarte prost", "Agitat", "Așa și așa", "Bine", "Excelent"] as const;

interface Props { siteContent: Record<string, string> }

export default function SomnClient({ siteContent }: Props) {
  const { tr } = useLanguage();
  const t = (key: string, fallback: string) => tr(siteContent[key] || fallback);

  const [mood, setMoodState] = useState<MoodKey>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [mix, setMix] = useState({ ploaie: 70, ocean: 40, foc: 20, pian: 55 });
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);

  const recs = useMemo(() => RECS_BY_MOOD[mood ?? "default"] ?? RECS_BY_MOOD.default, [mood]);
  const pageCount = Math.ceil(recs.length / PAGE_SIZE);
  const visible = recs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function setMood(next: MoodKey) {
    setMoodState(next);
    setDir(1);
    setPage(0);
  }

  /** Pagina următoare/anterioară în carusel, cu învârtire circulară. */
  function flip(d: 1 | -1) {
    setDir(d);
    setPage((p) => (p + d + pageCount) % pageCount);
  }

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

      {/* ── HERO — luna peste mare ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0C1626]">
        <div className="absolute inset-0" aria-hidden>
          <HeroArt />
        </div>
        {/* voal pentru lizibilitatea textului */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(100deg, rgba(9,17,30,.92) 0%, rgba(9,17,30,.72) 38%, rgba(9,17,30,.12) 66%, rgba(9,17,30,0) 100%)" }}
          aria-hidden
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <AnimateIn from="bottom">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-label-sm font-body font-semibold uppercase tracking-[0.2em] text-white/70 mb-5">
                <MoonStars size={16} weight="fill" className="text-amber-200" />
                {t("label", "Somn")}
              </p>
              <h1 className="font-heading font-normal text-h1 lg:text-display text-white leading-[1.05] mb-6" style={{ textShadow: "0 2px 30px rgba(6,12,22,.55)" }}>
                {t("title", "Lasă ziua să se încheie.")}
              </h1>
              <p className="font-body text-body-lg text-white/75 leading-relaxed mb-8 max-w-md" style={{ textShadow: "0 1px 16px rgba(6,12,22,.5)" }}>
                {t("subtitle", "Sunete, muzică și practici blânde pentru serile în care corpul s-a oprit, dar mintea încă nu.")}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link href="/practici/4" className="rounded-full bg-primary-fixed text-deep-green font-body text-body-sm font-semibold px-6 py-3 inline-flex items-center gap-2 hover:bg-white transition-colors shadow-button">
                  <Play size={15} weight="fill" />
                  {t("cta1", "Începe seara")}
                </Link>
                <a href="#biblioteca" className="border border-white/30 text-white hover:bg-white/10 rounded-full px-6 py-3 font-body text-body-sm font-semibold transition-colors backdrop-blur-sm">
                  {t("cta2", "Explorează sunetele")}
                </a>
              </div>
              <p className="flex items-center gap-2 font-body text-label-sm text-white/50">
                <Headphones size={15} />
                {t("note", "Căștile ajută la unele înregistrări, dar nu sunt necesare.")}
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
                <p className="font-body text-body-md text-secondary-text max-w-xl">{tr("Alege ce se apropie cel mai mult de cum te simți acum. Dacă nimic nu se potrivește, poți sări peste.")}</p>
              </div>
              <button onClick={surprise} className="flex items-center gap-2 rounded-full bg-white border border-sage-border px-5 py-2.5 font-body text-body-sm text-secondary-text hover:border-forest-green hover:text-forest-green transition-colors">
                <ShuffleAngular size={14} weight="bold" />
                {tr("Nu știu, alege tu")}
              </button>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {MOODS.map((m, i) => (
              <AnimateIn key={m.key} from="bottom" delay={i * 0.05}>
                <button
                  onClick={() => setMood(mood === m.key ? null : m.key)}
                  className={`w-full h-full flex flex-col text-left rounded-card p-5 bg-gradient-to-br ${m.bg} border-2 transition-all hover:-translate-y-1 hover:shadow-card-hover ${
                    mood === m.key ? "border-forest-green" : "border-transparent"
                  }`}
                >
                  <m.Art className="w-[60px] h-[60px] mb-4" />
                  <p className="font-heading text-h4 font-normal text-deep-green leading-snug mb-1">{tr(m.title)}</p>
                  <p className="font-body text-body-sm text-secondary-text leading-snug">{tr(m.desc)}</p>
                  <span className="mt-auto pt-4 font-body text-[11px] tracking-wide text-secondary-text/70">
                    {mood === m.key ? (
                      <span className="flex items-center gap-1 text-forest-green font-semibold">
                        <CheckCircle size={13} weight="fill" /> {tr("Ales")}
                      </span>
                    ) : (
                      tr(m.tag)
                    )}
                  </span>
                </button>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recomandări — carusel cu swipe ─────────────────────────────── */}
      <section className="py-4 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <h2 className="font-heading text-h1 text-deep-green">{tr("Pentru seara asta")}</h2>
            <div className="flex items-center gap-3">
              <Link href="/practici" className="font-body text-body-sm font-semibold text-forest-green hover:text-deep-green flex items-center gap-1 transition-colors">
                {tr("Vezi toată biblioteca de somn")} <ArrowRight size={15} weight="bold" />
              </Link>
              <div className="flex items-center gap-2">
                <button onClick={() => flip(-1)} aria-label={tr("Recomandările anterioare")}
                  className="w-10 h-10 rounded-full border border-sage-border bg-white flex items-center justify-center text-deep-green hover:bg-light-green hover:scale-105 active:scale-95 transition-all">
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button onClick={() => flip(1)} aria-label={tr("Următoarele recomandări")}
                  className="w-10 h-10 rounded-full border border-sage-border bg-white flex items-center justify-center text-deep-green hover:bg-light-green hover:scale-105 active:scale-95 transition-all">
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-hidden -mx-2 px-2 pb-2">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={`${mood ?? "default"}-${page}`}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ x: d * 120, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -120, opacity: 0 }),
                }}
                initial="enter" animate="center" exit="exit"
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) flip(1);
                  else if (info.offset.x > 60) flip(-1);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 cursor-grab active:cursor-grabbing"
              >
                {visible.map((r, ri) => {
                  const inner = (
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + ri * 0.06, type: "spring", stiffness: 220, damping: 22 }}
                      whileHover={{ y: -8 }}
                      className="relative aspect-[16/11] rounded-card overflow-hidden group shadow-card"
                    >
                      <div className="absolute inset-0" aria-hidden><r.Scene /></div>
                      {/* voal pentru lizibilitate, ca în machetă */}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,16,26,.86) 0%, rgba(10,16,26,.42) 46%, rgba(10,16,26,.08) 100%)" }} />
                      <span className="absolute top-3 left-3 rounded-full px-2.5 py-1 bg-white/20 text-white border border-white/25 backdrop-blur-sm font-body text-[10px] font-semibold uppercase tracking-wider">{tr(r.tag)}</span>
                      {r.soon && (
                        <span className="absolute top-3 right-3 rounded-full px-2.5 py-1 bg-amber-300/90 text-deep-green font-body text-[10px] font-semibold">{tr("În curând")}</span>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        <div>
                          <p className="font-heading text-body-lg font-medium text-white leading-snug mb-1">{tr(r.title)}</p>
                          <p className="flex items-center gap-1.5 font-body text-label-xs text-white/75"><Clock size={12} /> {tr(r.dur)}</p>
                        </div>
                        <span className="w-9 h-9 rounded-full bg-white/90 text-deep-green flex items-center justify-center flex-shrink-0 shadow group-hover:bg-white transition-colors">
                          <Play size={14} weight="fill" className="ml-0.5" />
                        </span>
                      </div>
                    </motion.div>
                  );
                  return r.href ? (
                    <Link key={r.title} href={r.href} draggable={false}>{inner}</Link>
                  ) : (
                    <div key={r.title} className="cursor-default">{inner}</div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* indicatori de pagină */}
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: pageCount }, (_, i) => (
              <button key={i} onClick={() => { setDir(i > page ? 1 : -1); setPage(i); }} aria-label={`${tr("Pagina")} ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === page ? "w-6 bg-forest-green" : "w-2 bg-sage-border hover:bg-forest-green/40"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Doar apasă play ────────────────────────────────────────────── */}
      <section id="biblioteca" className="py-14 lg:py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <h2 className="font-heading text-h1 text-deep-green mb-2">{tr("În seara asta nu vreau să mă ghideze nimeni.")}</h2>
            <p className="font-body text-body-md text-secondary-text mb-8">{tr("Doar apasă play.")}</p>
          </AnimateIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CHIPS.map((c, i) => (
              <AnimateIn key={c.title} from="bottom" delay={i * 0.05}>
                <div className="h-full rounded-card bg-white border border-sage-border/60 p-5 relative transition-all hover:-translate-y-1 hover:shadow-card-hover">
                  <span className="absolute top-3 right-3.5 font-body text-[9px] uppercase tracking-wide text-secondary-text/60">{tr("În curând")}</span>
                  <c.Art className="w-[52px] h-[52px] mb-3" />
                  <p className="font-body font-semibold text-body-md text-deep-green">{tr(c.title)}</p>
                  <p className="font-body text-label-xs text-secondary-text mt-0.5">{tr(c.desc)}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
          <p className="font-body text-body-sm text-secondary-text/80 max-w-2xl leading-relaxed mt-6">
            {tr("Tonurile sunt sunete constante pe care unii oameni le găsesc utile la adormire. Dovezile sunt mixte și efectul diferă mult de la om la om. Dacă nu îți face nimic, e în regulă — încearcă altceva.")}
          </p>
        </div>
      </section>

      {/* ── Ritualul de seară ──────────────────────────────────────────── */}
      <section className="py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <h2 className="font-heading text-h1 text-deep-green mb-2">{tr("Ritualul tău de seară")}</h2>
            <p className="font-body text-body-md text-secondary-text mb-8">{tr("De unde ai rămas seara trecută.")}</p>
          </AnimateIn>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimateIn from="bottom" className="lg:col-span-2">
              <div className="rounded-card bg-white shadow-card p-6 lg:p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-heading text-h3 text-deep-green">{tr("Ritualul meu de seară")}</p>
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
                        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "radial-gradient(circle at 34% 30%, #F0F8F3, #DDEDE4)", boxShadow: "inset 0 -2px 5px rgba(43,140,92,.10)" }}>
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
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Link href="/practici/2" className="rounded-full bg-forest-green text-white font-body text-body-sm font-semibold px-6 py-3 inline-flex items-center gap-2 hover:bg-deep-green transition-colors">
                    <Play size={15} weight="fill" /> {tr("Pornește ritualul")}
                  </Link>
                  <span className="flex items-center gap-1.5 font-body text-body-sm text-forest-green/70 cursor-not-allowed" title={tr("În curând")}>
                    <PencilSimple size={14} /> {tr("Editează ritualul")} →
                  </span>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn from="bottom" delay={0.08}>
              <div className="rounded-card bg-white shadow-card p-6 h-full flex flex-col gap-5">
                <div>
                  <p className="font-body text-label-sm text-secondary-text mb-2">{tr("Ultimul sunet ascultat")}</p>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-light-green/60 border border-sage-border">
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
                      {SLEEP_FACES.map((Face, i) => (
                        <button
                          key={i}
                          onClick={() => rate(i)}
                          aria-label={tr(SLEEP_LABELS[i])}
                          title={tr(SLEEP_LABELS[i])}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:scale-110 transition-all"
                        >
                          <Face size={26} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-body-sm text-forest-green flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" /> {tr("Mulțumim! Ne ajută să-ți recomandăm serile potrivite.")}
                    </p>
                  )}
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Mixerul de sunete ──────────────────────────────────────────── */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <h2 className="font-heading text-h1 text-deep-green mb-2">{tr("Creează-ți sunetul")}</h2>
            <p className="font-body text-body-md text-secondary-text mb-8">{tr("Dacă vrei, poți face seara să sune exact cum îți place.")}</p>
          </AnimateIn>
          <AnimateIn from="bottom" delay={0.06}>
            <div className="rounded-card bg-white shadow-card p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              <div className="space-y-5">
                {[
                  { key: "ploaie" as const, label: "Ploaie", art: <svg className="w-[26px] h-[26px] flex-shrink-0" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M18 11a6 6 0 10-11 3" stroke="url(#art-gBlue)" strokeWidth="1.8" strokeLinecap="round" /><path d="M9 17v4M14 16v5M19 18v3" stroke="url(#art-gBlue)" strokeWidth="1.8" strokeLinecap="round" opacity=".7" /></svg> },
                  { key: "ocean"  as const, label: "Ocean",  art: <svg className="w-[26px] h-[26px] flex-shrink-0" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M3 11c3-3.5 6 3.5 9 0s6-3.5 9 0M3 17c3-3.5 6 3.5 9 0s6-3.5 9 0" stroke="url(#art-gBlue)" strokeWidth="1.8" strokeLinecap="round" /></svg> },
                  { key: "foc"    as const, label: "Foc",    art: <svg className="w-[26px] h-[26px] flex-shrink-0" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M13 3c4 6 7 7 7 12a7 7 0 11-14 0c0-3 2-4 3-7 1 3 4 2 4-5z" fill="url(#art-gAmber)" /></svg> },
                  { key: "pian"   as const, label: "Pian",   art: <svg className="w-[26px] h-[26px] flex-shrink-0" viewBox="0 0 26 26" fill="none" aria-hidden="true"><rect x="4" y="7" width="18" height="12" rx="2" stroke="url(#art-gInd)" strokeWidth="1.7" /><path d="M9 7v12M13 7v12M17 7v12" stroke="url(#art-gInd)" strokeWidth="1.3" opacity=".6" /></svg> },
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-4">
                    {s.art}
                    <span className="font-body text-body-sm text-secondary-text w-14">{tr(s.label)}</span>
                    <input
                      type="range" min={0} max={100} value={mix[s.key]}
                      onChange={(e) => setMix({ ...mix, [s.key]: Number(e.target.value) })}
                      className="flex-1 accent-forest-green"
                      aria-label={tr(s.label)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-body font-semibold text-body-md text-deep-green">{tr("Salvează mixul tău preferat")}</p>
                  <Heart size={18} weight="duotone" className="text-forest-green" />
                </div>
                <p className="font-body text-body-sm text-secondary-text mb-4">{tr("Numește-l și îl regăsești direct data viitoare.")}</p>
                <div className="flex gap-2.5 mb-3">
                  <input className="flex-1 rounded-xl border border-sage-border bg-bg-main/60 px-4 py-2.5 font-body text-body-sm text-deep-green placeholder:text-secondary-text/60" placeholder={tr("Numește-ți mixul")} disabled />
                  <button className="rounded-xl border border-sage-border px-5 py-2.5 font-body text-body-sm text-secondary-text opacity-60 cursor-not-allowed" disabled>{tr("Salvează")}</button>
                </div>
                <span className="self-start rounded-full px-3 py-1 bg-amber-200/60 text-amber-900 border border-amber-300/70 font-body text-[11px] font-semibold">{tr("Disponibil în curând")}</span>
                <p className="font-body text-label-xs text-secondary-text/70 mt-auto pt-4">{tr("Mixul rămâne pe telefonul tău. Poți să îl ștergi oricând.")}</p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Banda de noapte ────────────────────────────────────────────── */}
      <section className="py-2 lg:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="relative overflow-hidden rounded-card min-h-[120px] p-6 lg:p-7 flex flex-wrap items-center gap-5 text-white">
              <div className="absolute inset-0" aria-hidden>
                <svg viewBox="0 0 900 140" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
                  <defs><linearGradient id="somn-nbG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#101E31" /><stop offset="100%" stopColor="#25405A" /></linearGradient></defs>
                  <rect width="900" height="140" fill="url(#somn-nbG)" />
                  <circle cx="740" cy="46" r="26" fill="#EFE2C6" opacity=".55" />
                  <circle cx="740" cy="46" r="60" fill="#EFE2C6" opacity=".1" filter="url(#art-softer)" />
                  <g fill="#EFE8D8"><circle cx="620" cy="30" r="1.4" opacity=".6" /><circle cx="828" cy="96" r="1.2" opacity=".45" />
                    <circle cx="560" cy="98" r="1.1" opacity=".4" /><circle cx="866" cy="34" r="1.3" opacity=".5" /></g>
                  <rect width="900" height="140" filter="url(#art-grain)" opacity=".18" style={{ mixBlendMode: "overlay" }} />
                </svg>
              </div>
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,14,24,.9), rgba(8,14,24,.55))" }} aria-hidden />
              <div className="relative">
                <p className="font-heading text-h4 font-normal mb-1 flex items-center gap-2">
                  <Sparkle size={16} weight="fill" className="text-amber-200" />
                  {tr("Te trezești în timpul nopții?")}
                </p>
                <p className="font-body text-body-sm text-white/70 max-w-lg">{tr("Pregătim un mod de noapte: ecran aproape negru, un singur buton și volum foarte jos.")}</p>
              </div>
              <span className="relative ml-auto rounded-full border border-white/30 px-5 py-2.5 font-body text-body-sm text-white/85 backdrop-blur-sm">{tr("În curând")}</span>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ── Banda finală ───────────────────────────────────────────────── */}
      <section className="py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="rounded-card shadow-card p-8 lg:p-10 bg-indigo-light flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0">
                  <MoonStars size={22} weight="duotone" className="text-indigo" />
                </div>
                <div>
                  <p className="font-heading text-h3 text-deep-green">{t("band_title", "Somnul face parte din echilibru.")}</p>
                  <p className="font-body text-body-sm text-secondary-text">{t("band_sub", "Ai grijă de tine ziua. Noi avem grijă de serile tale.")}</p>
                </div>
              </div>
              <Link href="/dashboard" className="rounded-full bg-indigo text-white font-body text-body-sm font-semibold px-6 py-3 inline-flex items-center gap-2 hover:bg-indigo-dark transition-colors">
                {t("band_cta", "Explorează WithIn")} <ArrowRight size={15} weight="bold" />
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>
    </div>
  );
}
