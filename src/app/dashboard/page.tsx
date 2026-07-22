"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Clock, VideoCamera, BookOpen, Notebook, ChartLine, Play, Leaf,
  CalendarBlank, ArrowRight, Check, List, X, Anchor, PencilSimple, GearSix,
  CaretDown, Users,
} from "@phosphor-icons/react";
import { CountUp } from "@/components/ui/AnimateIn";
import CheckInModal from "@/components/ui/CheckInModal";
import { useAuth } from "@/contexts/AuthContext";
import { getDailyQuote } from "@/lib/quotes";
import DailyInfluence, { DailyInfluencePlaceholder } from "@/components/ui/DailyInfluence";

function formatDate() {
  return new Date().toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function streakMessage(streak: number): string {
  if (streak === 0) return "Prima zi e întotdeauna un nou început.";
  if (streak <= 2)  return "Ai început! Fiecare zi contează.";
  if (streak <= 6)  return "Ești pe drumul cel bun. Continuă!";
  if (streak <= 13) return `${streak} zile consecutive — ești în ritm.`;
  return `${streak} zile — un angajament real față de tine.`;
}

const QUICK_ACCESS = [
  { icon: BookOpen, label: "Bibliotecă",  href: "/practici",         iconCls: "bg-forest-green/20 text-forest-green", cardCls: "bg-light-green border-sage-border/40" },
  { icon: Anchor,   label: "Ancore",      href: "/ancore",           iconCls: "bg-indigo/10 text-indigo",             cardCls: "bg-indigo-light border-indigo/10" },
  { icon: Notebook, label: "Jurnal",      href: "/dashboard/jurnal", iconCls: "bg-indigo-mid/15 text-indigo-mid",     cardCls: "bg-indigo-bg border-indigo/10" },
  { icon: Users,    label: "Sesiuni",     href: "/sesiuni-live",     iconCls: "bg-deep-green/10 text-deep-green",     cardCls: "bg-light-green/60 border-sage-border/30" },
];

type PracticeItem = { id: number; title: string; facilitator: string; duration: number; category: string };
type SessionItem  = { title: string; facilitator: string; date: string; spotsTotal: number; spotsLeft: number };

export default function DashboardPage() {
  const { profile, user: authUser } = useAuth();
  const dateOfBirth = authUser?.user_metadata?.date_of_birth as string | undefined;
  const { quote: dailyQuote, sign: zodiacSign } = getDailyQuote(dateOfBirth);

  const [checkInOpen,     setCheckInOpen]     = useState(false);
  const [recentPractices, setRecentPractices] = useState<PracticeItem[]>([]);
  const [upcomingSession, setUpcomingSession] = useState<SessionItem | null>(null);
  const [checkInDone,     setCheckInDone]     = useState(false);
  const [stats,           setStats]           = useState({ streak: 0, minutesPracticed: 0, checkInsCount: 0, practicesCompleted: 0, checkInsThisWeek: 0, journalCount: 0 });
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [sessionExpanded, setSessionExpanded] = useState(false);
  const [ancoreCount,     setAncoreCount]     = useState(0);
  const sessionRef = useRef<HTMLDivElement>(null);

  const firstName = profile?.first_name || authUser?.user_metadata?.first_name || "acolo";
  const lastName  = profile?.last_name  || authUser?.user_metadata?.last_name  || "";
  const initials  = ([firstName?.[0], lastName?.[0]].filter(Boolean).join("") || "U").toUpperCase();
  const fullName  = [firstName, lastName].filter(Boolean).join(" ").replace(" acolo", "") || "Utilizator";
  const planLabel = profile?.plan === "premium" ? "Premium" : profile?.plan === "standard" ? "Standard" : "Gratuit";

  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/practices").then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setRecentPractices(d.slice(0, 3)); }).catch(() => {});
    fetch("/api/sessions").then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setUpcomingSession(d[0]); }).catch(() => {});
  }, []);

  useEffect(() => {
    const done = localStorage.getItem("checkin-today") === new Date().toDateString();
    setCheckInDone(done);
    if (!done) { const t = setTimeout(() => setCheckInOpen(true), 3000); return () => clearTimeout(t); }
  }, []);

  useEffect(() => {
    const arr = JSON.parse(localStorage.getItem("ancore-completed") || "[]");
    setAncoreCount(arr.length);
  }, []);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (sessionRef.current && !sessionRef.current.contains(e.target as Node)) setSessionExpanded(false);
    }
    if (sessionExpanded) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [sessionExpanded]);

  function handleCheckInClose() {
    setCheckInOpen(false); setCheckInDone(true);
    localStorage.setItem("checkin-today", new Date().toDateString());
  }

  const progressRows = [
    { label: "Zile consecutive",      value: stats.streak,           max: 30,  pct: Math.min(100, stats.streak / 30 * 100),            bar: "bg-terracotta",   track: "bg-rose-powder/40", text: "text-terracotta",   icon: Flame,   hint: "Obiectiv: 30 de zile" },
    { label: "Minute practicate",     value: stats.minutesPracticed, max: 300, pct: Math.min(100, stats.minutesPracticed / 300 * 100), bar: "bg-forest-green", track: "bg-light-green",    text: "text-forest-green", icon: Clock,   hint: "Obiectiv: 300 min / lună" },
    { label: "Check-in-uri (săpt.)", value: stats.checkInsThisWeek, max: 7,   pct: Math.round(stats.checkInsThisWeek / 7 * 100),      bar: "bg-indigo",       track: "bg-indigo-light",   text: "text-indigo",       icon: Check,   hint: `${7 - stats.checkInsThisWeek} ${7 - stats.checkInsThisWeek === 1 ? "zi rămasă" : "zile rămase"}` },
    { label: "Ancore completate",     value: ancoreCount,            max: 20,  pct: Math.min(100, ancoreCount / 20 * 100),             bar: "bg-deep-green",   track: "bg-light-green/60", text: "text-deep-green",   icon: Anchor,  hint: "Practici de reglare a sistemului nervos" },
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      <CheckInModal isOpen={checkInOpen} onClose={handleCheckInClose} canSkip />

      {/* Sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Session expanded backdrop */}
      <AnimatePresence>
        {sessionExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[3px]"
            onClick={() => setSessionExpanded(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-screen w-64 bg-deep-green border-r border-white/10 py-8 z-50 flex flex-col">
            <div className="px-4 mb-8 flex items-center justify-between">
              <Link href="/" onClick={() => setSidebarOpen(false)}>
                <Image src="/logo-orizontal-alb.png" alt="WithIn" width={90} height={25} className="object-contain" priority />
              </Link>
              <button onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <X size={16} weight="bold" />
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {[
                { icon: ChartLine,   label: "Dashboard",     href: "/dashboard",         active: true },
                { icon: BookOpen,    label: "Bibliotecă",    href: "/practici" },
                { icon: Anchor,      label: "Ancore",        href: "/ancore" },
                { icon: VideoCamera, label: "Sesiuni Live",  href: "/sesiuni-live" },
                { icon: Notebook,    label: "Jurnal",        href: "/dashboard/jurnal" },
                { icon: ChartLine,   label: "Progresul meu", href: "/dashboard/progres" },
                { icon: GearSix,     label: "Contul meu",    href: "/dashboard/cont" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-body text-body-sm ${item.active ? "bg-forest-green/30 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
                    <Icon size={18} weight="regular" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 pt-6 border-t border-white/10">
              <Link href="/dashboard/cont" onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-forest-green flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-body-sm font-semibold text-white truncate">{fullName}</p>
                  <p className="font-body text-label-xs text-white/40">{planLabel}</p>
                </div>
                <GearSix size={14} className="text-white/30 flex-shrink-0" />
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">

          {/* Welcome header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-8 bg-gradient-to-br from-light-green/80 via-light-green/20 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <button onClick={() => setSidebarOpen(true)}
                  className="mt-1.5 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-sage-border text-deep-green hover:bg-light-green hover:border-forest-green transition-colors flex-shrink-0 shadow-sm"
                  aria-label="Meniu">
                  <List size={18} weight="bold" />
                </button>
                <div>
                  <h1 className="font-heading text-h2 text-deep-green">Bună, {firstName} 🌿</h1>
                  <p className="font-body text-body-sm text-secondary-text capitalize">{formatDate()}</p>
                </div>
              </div>

              {/* Right header area — session pill + check-in */}
              <div className="flex flex-col items-end gap-2">

                {/* Live session pill */}
                {upcomingSession && (
                  <div ref={sessionRef} className="relative z-40">
                    <button onClick={() => setSessionExpanded(p => !p)}
                      className="flex items-center gap-2.5 bg-deep-green text-white rounded-full px-4 py-2 hover:bg-forest-green transition-colors shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-body text-label-xs font-semibold leading-tight">Sesiune Live</p>
                        <p className="font-body text-[10px] text-white/60 leading-tight">
                          {new Date(upcomingSession.date).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
                          {" · "}
                          {new Date(upcomingSession.date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <CaretDown size={11} weight="bold"
                        className={`text-white/60 transition-transform duration-200 ${sessionExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {sessionExpanded && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.18 }}
                          className="absolute top-[calc(100%+8px)] right-0 w-80 rounded-2xl bg-white border border-sage-border/50 shadow-modal overflow-hidden"
                          style={{ borderTop: "3px solid #2B8C5C" }}>
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 rounded-full bg-forest-green animate-live-pulse" />
                              <span className="font-body text-label-xs text-forest-green uppercase tracking-wider font-semibold">Urmează</span>
                            </div>
                            <h3 className="font-body font-semibold text-body-md text-deep-green mb-1 leading-snug">{upcomingSession.title}</h3>
                            <p className="font-body text-label-xs text-secondary-text mb-4">{upcomingSession.facilitator}</p>
                            <div className="flex items-center gap-4 mb-4">
                              <span className="flex items-center gap-1.5 font-body text-label-xs text-secondary-text">
                                <CalendarBlank size={13} className="text-forest-green" />
                                {new Date(upcomingSession.date).toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" })}
                              </span>
                              <span className="flex items-center gap-1.5 font-body text-label-xs text-secondary-text">
                                <Clock size={13} className="text-forest-green" />
                                {new Date(upcomingSession.date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="mb-5">
                              <div className="flex justify-between font-body text-label-xs text-secondary-text mb-1.5">
                                <span>Locuri disponibile</span>
                                <span className="font-semibold text-forest-green">{upcomingSession.spotsLeft} rămase</span>
                              </div>
                              <div className="h-1.5 bg-light-green rounded-full overflow-hidden">
                                <motion.div className="h-full bg-forest-green rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.round(((upcomingSession.spotsTotal - upcomingSession.spotsLeft) / upcomingSession.spotsTotal) * 100)}%` }}
                                  transition={{ duration: 0.6, ease: "easeOut" }} />
                              </div>
                            </div>
                            <Link href="/sesiuni-live" onClick={() => setSessionExpanded(false)}
                              className="btn btn-primary w-full btn-sm">
                              Rezervă locul <ArrowRight size={14} weight="bold" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Check-in status */}
                {checkInDone ? (
                  <div className="flex items-center gap-2 bg-light-green border border-sage-border rounded-full px-3 py-1.5">
                    <Check size={13} weight="bold" className="text-forest-green" />
                    <span className="font-body text-[11px] text-forest-green font-semibold">Check-in completat</span>
                  </div>
                ) : (
                  <button onClick={() => setCheckInOpen(true)}
                    className="flex items-center gap-2 bg-forest-green/10 border border-forest-green/30 rounded-full px-3 py-1.5 hover:bg-forest-green/20 transition-colors">
                    <Leaf size={13} weight="fill" className="text-forest-green" />
                    <span className="font-body text-[11px] text-forest-green font-semibold">Check-in zilnic ○</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Two-column grid */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── LEFT column (2/3) ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Stats bar — same width as the player below */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
                className="bg-deep-green rounded-2xl grid grid-cols-3 overflow-hidden shadow-card">
                {[
                  { icon: Flame,  label: "Zile consecutive",  value: stats.streak },
                  { icon: Clock,  label: "Minute practicate", value: stats.minutesPracticed },
                  { icon: Check,  label: "Check-in-uri",      value: stats.checkInsCount },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={`flex items-center justify-center gap-3 py-3.5 px-4 ${i < 2 ? "border-r border-white/10" : ""}`}>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={13} weight="fill" className="text-sage-border" />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <p className="font-heading text-lg font-bold text-white leading-none"><CountUp to={stat.value} /></p>
                        <p className="font-body text-[11px] text-white/50 leading-none">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Recommended practice player */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl overflow-hidden shadow-modal">
                <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #0F2E1A 0%, #1a4a2a 50%, #2B8C5C 100%)" }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="w-56 h-56 rounded-full"
                      style={{ background: "radial-gradient(circle, rgba(168,223,192,0.35) 0%, transparent 70%)" }} />
                  </div>
                  <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                    className="absolute top-4 right-8 w-32 h-32 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(168,223,192,0.25) 0%, transparent 70%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-4"
                    style={{ background: "linear-gradient(to top, rgba(15,46,26,0.85) 0%, transparent 100%)" }}>
                    <div className="px-1 pb-1">
                      <p className="font-body text-label-xs text-sage-border/80 mb-1 uppercase tracking-wider">Recomandat pentru tine azi</p>
                      <p className="font-heading text-xl text-white font-bold leading-tight">Respirație 4-7-8 pentru anxietate</p>
                      <p className="font-body text-label-xs text-white/50 mt-1">10 min · Dr. Ana Ionescu</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between bg-white">
                  <p className="font-body text-body-sm text-secondary-text">Bazat pe check-in-ul tău</p>
                  <Link href="/practici" className="btn btn-primary btn-sm shadow-button">
                    <Play size={14} weight="fill" /> Începe acum
                  </Link>
                </div>
              </motion.div>

              {/* Quick access */}
              <div>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Acces rapid</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {QUICK_ACCESS.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href}
                        className={`rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 border transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 ${item.cardCls}`}>
                        <div className={`w-11 h-11 rounded-xl ${item.iconCls} flex items-center justify-center`}>
                          <Icon size={20} weight="fill" />
                        </div>
                        <span className="font-body text-label-xs font-semibold text-on-surface">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Recent practices */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-h3 text-deep-green">Continuă de unde ai rămas</h2>
                  <Link href="/practici" className="font-body text-label-xs text-forest-green hover:underline">
                    Toate <ArrowRight size={12} weight="bold" className="inline" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentPractices.length === 0 ? (
                    <p className="font-body text-body-sm text-secondary-text py-4 text-center">Nicio practică încă</p>
                  ) : recentPractices.map(p => (
                    <Link key={p.id} href={`/practici/${p.id}`}
                      className="rounded-2xl bg-white border border-sage-border/30 p-4 flex items-center gap-4 hover:border-forest-green hover:shadow-card-hover transition-all">
                      <div className="w-12 h-12 rounded-xl bg-light-green flex items-center justify-center flex-shrink-0">
                        <Play size={18} weight="fill" className="text-forest-green" />
                      </div>
                      <div className="flex-1">
                        <p className="font-body font-semibold text-body-sm text-deep-green line-clamp-1">{p.title}</p>
                        <p className="font-body text-label-xs text-secondary-text">{p.facilitator} · {p.duration} min</p>
                      </div>
                      <span className="tag tag-green flex-shrink-0">{p.category}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT column (1/3) ────────────────────────────────── */}
            <div className="space-y-6">

              {/* 1. Progress */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Progresul tău</h2>
                <div className="rounded-2xl bg-white border border-sage-border/30 shadow-card overflow-hidden">
                  {/* Narrative header */}
                  <div className="px-5 pt-5 pb-4 border-b border-sage-border/20"
                    style={{ background: "linear-gradient(135deg, rgba(168,223,192,0.18) 0%, rgba(255,255,255,0) 100%)" }}>
                    <p className="font-body text-label-xs font-semibold text-secondary-text uppercase tracking-widest mb-1">
                      {stats.streak >= 7 ? "🔥 Seria continuă" : "Statistici"}
                    </p>
                    <p className="font-body text-body-sm text-deep-green">{streakMessage(stats.streak)}</p>
                  </div>
                  {/* Animated rows */}
                  <div className="px-5 py-4 space-y-4">
                    {progressRows.map((row, i) => {
                      const Icon = row.icon;
                      return (
                        <motion.div key={row.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.08 }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Icon size={13} weight="fill" className={row.text} />
                              <span className="font-body text-label-xs text-secondary-text">{row.label}</span>
                            </div>
                            <span className={`font-body text-label-xs font-bold tabular-nums ${row.text}`}>
                              {row.label.includes("Check-in") ? `${row.value}/7` : row.value}
                            </span>
                          </div>
                          <div className={`h-2 ${row.track} rounded-full overflow-hidden`}>
                            <motion.div className={`h-full ${row.bar} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${row.pct}%` }}
                              transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: "easeOut" }} />
                          </div>
                          <p className="font-body text-[10px] text-secondary-text/60 mt-0.5">{row.hint}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="px-5 pb-5">
                    <Link href="/dashboard/progres"
                      className="font-body text-label-xs text-forest-green hover:underline flex items-center gap-1">
                      Raport complet <ArrowRight size={12} weight="bold" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* 2. Journal */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Jurnal</h2>
                <div className="rounded-2xl overflow-hidden border border-rose-powder/40 shadow-card"
                  style={{ background: "linear-gradient(145deg, rgba(255,228,220,0.3) 0%, rgba(255,255,255,1) 55%)" }}>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-powder/40 flex items-center justify-center">
                        <PencilSimple size={15} weight="fill" className="text-terracotta" />
                      </div>
                      <span className="font-body text-label-xs text-terracotta font-semibold uppercase tracking-wider">
                        {stats.journalCount > 0 ? `${stats.journalCount} ${stats.journalCount === 1 ? "notă" : "note"}` : "Azi"}
                      </span>
                    </div>
                    <p className="font-body text-body-sm text-on-surface mb-3">
                      {checkInDone
                        ? "Ai completat check-in-ul. Dacă vrei, notează câteva gânduri despre cum te simți acum."
                        : "Un moment de reflecție scrisă poate clarifica mult din ce simți."}
                    </p>
                    <blockquote className="border-l-2 border-terracotta/40 pl-3 mb-4">
                      <p className="font-body text-label-xs text-secondary-text italic leading-relaxed">
                        &ldquo;{dailyQuote.text}&rdquo;
                      </p>
                      <p className="font-body text-label-xs text-terracotta/70 mt-1">— {dailyQuote.author}</p>
                    </blockquote>
                    <Link href="/dashboard/jurnal"
                      className="w-full h-9 rounded-full bg-terracotta/90 hover:bg-terracotta text-white font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors">
                      <PencilSimple size={13} weight="bold" />
                      Deschide jurnalul
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* 3. Daily Influences */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                {dateOfBirth && zodiacSign
                  ? <DailyInfluence sign={zodiacSign} dateOfBirth={dateOfBirth} />
                  : <DailyInfluencePlaceholder />}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
