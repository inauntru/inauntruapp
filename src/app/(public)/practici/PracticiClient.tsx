"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlass, Lock, Play, Wind, PersonSimpleWalk, Moon, Lightning, Microphone, Star, Clock, SlidersHorizontal, X, CaretDown, Check } from "@phosphor-icons/react";
import AnimateIn from "@/components/ui/AnimateIn";
import { PRACTICES } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremiumAccess } from "@/lib/plan";

type Practice = typeof PRACTICES[0];

function FilterDropdown({ value, options, onChange, isActive }: { value: string; options: string[]; onChange: (v: string) => void; isActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className={`filter-pill flex items-center gap-1.5 ${isActive ? "active" : ""}`}>
        {value}<CaretDown size={12} weight="bold" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.15 }} className="absolute top-full mt-2 left-0 z-50 bg-white border border-sage-border rounded-xl shadow-modal overflow-hidden min-w-[140px]">
            {options.map((opt) => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-body-sm font-body transition-colors text-left ${opt === value ? "bg-light-green text-forest-green font-semibold" : "text-on-surface hover:bg-light-green/50"}`}>
                {opt}{opt === value && <Check size={13} weight="bold" className="text-forest-green flex-shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CATEGORIES = ["Toate", "Suflu", "Prezență", "Fluiditate", "Odihnă", "Vitalitate", "Expresie"];
const DURATIONS = ["Durată", "5 min", "10 min", "20 min+"];
const LEVELS = ["Toate nivelurile", "Începător", "Intermediar", "Avansat"];

interface Props { siteContent: Record<string, string>; }

export default function PracticiClient({ siteContent }: Props) {
  const t = (key: string, fallback: string) => siteContent[key] || fallback;
  const { profile } = useAuth();
  const unlocked = hasPremiumAccess(profile?.plan);
  const [practices, setPractices] = useState<Practice[]>(PRACTICES);
  const [category, setCategory] = useState("Toate");
  const [duration, setDuration] = useState("Durată");
  const [level, setLevel] = useState("Toate nivelurile");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetch("/api/practices")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPractices(data); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => practices.filter((p) => {
    if (category !== "Toate" && p.category !== category) return false;
    if (level !== "Toate nivelurile" && p.level !== level) return false;
    if (duration === "5 min" && p.duration > 5) return false;
    if (duration === "10 min" && (p.duration < 6 || p.duration > 10)) return false;
    if (duration === "20 min+" && p.duration < 20) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [practices, category, duration, level, search]);

  const activeFiltersCount = [category !== "Toate", duration !== "Durată", level !== "Toate nivelurile", search !== ""].filter(Boolean).length;
  const clearFilters = () => { setCategory("Toate"); setDuration("Durată"); setLevel("Toate nivelurile"); setSearch(""); };

  return (
    <div className="min-h-screen bg-bg-main">
      <section className="bg-deep-green py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="max-w-2xl">
              <p className="font-body text-label-sm text-primary-fixed-dim uppercase tracking-widest mb-3">{t("label", "Bibliotecă practici")}</p>
              <h1 className="font-heading text-h1 text-white mb-4">{t("title", "70+ practici somatice")}</h1>
              <p className="font-body text-body-lg text-white/60">{t("subtitle", "Respirație, mișcare, corp și voce — fiecare practică ghidată de experți somatic din România.")}</p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-sage-border shadow-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="hidden md:flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
              <input type="search" placeholder={t("search_placeholder", "De ce ai nevoie acum?")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body bg-white focus:outline-none focus:border-forest-green text-on-surface placeholder-secondary-text" />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((c) => <button key={c} onClick={() => setCategory(c)} className={`filter-pill ${category === c ? "active" : ""}`}>{c}</button>)}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <FilterDropdown value={duration} options={DURATIONS} onChange={setDuration} isActive={duration !== "Durată"} />
              <FilterDropdown value={level} options={LEVELS} onChange={setLevel} isActive={level !== "Toate nivelurile"} />
            </div>
            {activeFiltersCount > 0 && <button onClick={clearFilters} className="flex items-center gap-1 text-label-sm text-terracotta hover:text-terracotta/80 transition-colors font-body whitespace-nowrap"><X size={14} weight="bold" />Resetează ({activeFiltersCount})</button>}
          </div>
          <div className="md:hidden flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
              <input type="search" placeholder={t("search_placeholder", "De ce ai nevoie acum?")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-full border border-sage-border text-body-sm font-body bg-white focus:outline-none focus:border-forest-green" />
            </div>
            <button onClick={() => setFiltersOpen(true)} className={`relative flex items-center gap-2 filter-pill flex-shrink-0 ${activeFiltersCount > 0 ? "active" : ""}`}>
              <SlidersHorizontal size={16} />Filtre
              {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-terracotta rounded-full text-white text-[10px] flex items-center justify-center font-bold">{activeFiltersCount}</span>}
            </button>
          </div>
        </div>
        <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
          {CATEGORIES.map((c) => <button key={c} onClick={() => setCategory(c)} className={`filter-pill flex-shrink-0 ${category === c ? "active" : ""}`}>{c}</button>)}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="font-body text-body-sm text-secondary-text">{filtered.length} practici găsite</p>
        </div>
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div key={`${category}-${duration}-${level}-${search}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((practice, i) => (
                <motion.div key={practice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <Link href={`/practici/${practice.id}`} className="block group card card-lift overflow-hidden h-full">
                    <div className="relative aspect-video overflow-hidden">
                      <Image src={`${practice.image}?w=600&q=80`} alt={practice.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-green/50 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3"><span className="tag tag-green shadow-sm">{practice.category}</span></div>
                      {practice.isPremium && !unlocked && <div className="absolute top-3 right-3"><div className="w-7 h-7 bg-deep-green/80 backdrop-blur rounded-full flex items-center justify-center"><Lock size={13} weight="fill" className="text-white" /></div></div>}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-forest-green rounded-full flex items-center justify-center shadow-button"><Play size={20} weight="fill" className="text-white ml-0.5" /></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-body font-semibold text-body-md text-deep-green mb-1 line-clamp-2 group-hover:text-forest-green transition-colors">{practice.title}</h3>
                      <p className="font-body text-label-xs text-secondary-text mb-3">{practice.facilitator}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-body text-label-xs text-secondary-text"><Clock size={12} weight="regular" />{practice.duration} min</span>
                          <span className="tag tag-outline">{practice.level}</span>
                        </div>
                        {practice.isPremium
                          ? <span className={`tag border-0 ${unlocked ? "bg-forest-green/10 text-forest-green" : "bg-secondary-container text-on-secondary-container"}`}>{unlocked ? "✓ Premium" : "Premium"}</span>
                          : <span className="tag tag-green">Gratuit</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="w-20 h-20 bg-light-green rounded-full flex items-center justify-center mx-auto mb-4"><MagnifyingGlass size={32} weight="regular" className="text-forest-green/50" /></div>
              <h3 className="font-heading text-h3 text-deep-green mb-2">{t("empty_title", "Nicio practică găsită")}</h3>
              <p className="font-body text-body-sm text-secondary-text mb-6">{t("empty_desc", "Încearcă să ajustezi filtrele sau căutarea.")}</p>
              <button onClick={clearFilters} className="btn btn-ghost">Resetează filtrele</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setFiltersOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30 }} className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-h3 text-deep-green">Filtre</h3>
                <button onClick={() => setFiltersOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green"><X size={18} /></button>
              </div>
              <div className="space-y-5">
                <div><p className="font-body text-label-sm text-secondary-text uppercase tracking-widest mb-3">Durată</p><div className="flex flex-wrap gap-2">{DURATIONS.map((d) => <button key={d} onClick={() => setDuration(d)} className={`filter-pill ${duration === d ? "active" : ""}`}>{d}</button>)}</div></div>
                <div><p className="font-body text-label-sm text-secondary-text uppercase tracking-widest mb-3">Nivel</p><div className="flex flex-wrap gap-2">{LEVELS.map((l) => <button key={l} onClick={() => setLevel(l)} className={`filter-pill ${level === l ? "active" : ""}`}>{l}</button>)}</div></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={clearFilters} className="btn btn-ghost flex-1">Resetează</button>
                <button onClick={() => setFiltersOpen(false)} className="btn btn-primary flex-1">Aplică</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
