"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  Clock,
  VideoCamera,
  BookOpen,
  Notebook,
  ChartLine,
  Play,
  Leaf,
  CalendarBlank,
  ArrowRight,
  Check,
} from "@phosphor-icons/react";
import { CountUp } from "@/components/ui/AnimateIn";
import CheckInModal from "@/components/ui/CheckInModal";
import { LIVE_SESSIONS, PRACTICES } from "@/lib/mockData";

function formatDate() {
  return new Date().toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const QUICK_ACCESS = [
  { icon: BookOpen, label: "Bibliotecă", href: "/biblioteca", color: "bg-light-green text-forest-green" },
  { icon: Notebook, label: "Jurnal", href: "/dashboard/jurnal", color: "bg-rose-powder/30 text-terracotta" },
  { icon: ChartLine, label: "Progresul meu", href: "/dashboard/progres", color: "bg-sage-border text-forest-green" },
  { icon: VideoCamera, label: "Sesiuni live", href: "/sesiuni-live", color: "bg-secondary-container text-on-secondary-container" },
];

const RECENT_PRACTICES = PRACTICES.slice(0, 3);
const UPCOMING_SESSION = LIVE_SESSIONS[0];

export default function DashboardPage() {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("checkin-today") === new Date().toDateString();
    setCheckInDone(done);
    if (!done) {
      const timer = setTimeout(() => setCheckInOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCheckInClose = () => {
    setCheckInOpen(false);
    setCheckInDone(true);
    localStorage.setItem("checkin-today", new Date().toDateString());
  };

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Check-in modal */}
      <CheckInModal isOpen={checkInOpen} onClose={handleCheckInClose} canSkip />

      {/* Sidebar (desktop) + Main content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-deep-green border-r border-white/10 py-8 z-40">
          {/* Logo */}
          <div className="px-6 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-forest-green rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-heading font-bold">I</span>
              </div>
              <span className="font-heading font-bold text-lg text-white">INAUNTRU</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1">
            {[
              { icon: ChartLine, label: "Dashboard", href: "/dashboard", active: true },
              { icon: BookOpen, label: "Bibliotecă", href: "/biblioteca" },
              { icon: VideoCamera, label: "Sesiuni Live", href: "/sesiuni-live" },
              { icon: Notebook, label: "Jurnal", href: "/dashboard/jurnal" },
              { icon: ChartLine, label: "Progresul meu", href: "/dashboard/progres" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-body text-body-sm ${
                    item.active
                      ? "bg-forest-green/30 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} weight="regular" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="px-3 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-forest-green flex items-center justify-center">
                <span className="text-white text-xs font-bold">ED</span>
              </div>
              <div>
                <p className="font-body text-body-sm font-semibold text-white">Elena Dima</p>
                <p className="font-body text-label-xs text-white/40">Premium</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:ml-64 flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading text-h1 text-deep-green">
                  Bună, Elena 🌿
                </h1>
                <p className="font-body text-body-md text-secondary-text capitalize">{formatDate()}</p>
              </div>

              {/* Check-in status */}
              {checkInDone ? (
                <div className="flex items-center gap-2 bg-light-green border border-sage-border rounded-full px-4 py-2">
                  <Check size={14} weight="bold" className="text-forest-green" />
                  <span className="font-body text-label-xs text-forest-green font-semibold">Check-in zilnic completat</span>
                </div>
              ) : (
                <button
                  onClick={() => setCheckInOpen(true)}
                  className="flex items-center gap-2 bg-forest-green/10 border border-forest-green/30 rounded-full px-4 py-2 hover:bg-forest-green/20 transition-colors"
                >
                  <Leaf size={14} weight="fill" className="text-forest-green" />
                  <span className="font-body text-label-xs text-forest-green font-semibold">Check-in zilnic ○</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Flame, label: "Zile consecutive", value: 7, suffix: "" },
              { icon: Clock, label: "Minute practicate", value: 340, suffix: "" },
              { icon: VideoCamera, label: "Sesiuni live", value: 4, suffix: "" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="card p-4 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-light-green flex items-center justify-center mx-auto mb-2">
                    <Icon size={18} weight="fill" className="text-forest-green" />
                  </div>
                  <p className="font-heading text-2xl font-bold text-deep-green">
                    <CountUp to={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="font-body text-label-xs text-secondary-text">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Daily practice recommendation - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recommended practice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card overflow-hidden"
              >
                <div className="relative aspect-video sm:aspect-[21/9] bg-gradient-to-br from-deep-green to-forest-green overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-40 h-40 rounded-full"
                      style={{ background: "radial-gradient(circle, rgba(149,212,177,0.4) 0%, transparent 70%)" }}
                    />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="font-body text-label-xs text-white/70 mb-1">Recomandat pentru tine azi</p>
                      <p className="font-heading text-lg text-white font-bold">Respirație 4-7-8 pentru anxietate</p>
                      <p className="font-body text-label-xs text-white/60 mt-1">10 min · Dr. Ana Ionescu</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-body text-body-sm text-secondary-text">Bazat pe check-in-ul tău</p>
                  </div>
                  <Link href="/biblioteca" className="btn btn-primary btn-sm">
                    <Play size={14} weight="fill" />
                    Începe acum
                  </Link>
                </div>
              </motion.div>

              {/* Quick access */}
              <div>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Acces rapid</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {QUICK_ACCESS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="card card-lift p-4 text-center flex flex-col items-center gap-2 hover:border-forest-green transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                          <Icon size={18} weight="regular" />
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
                  <Link href="/biblioteca" className="font-body text-label-xs text-forest-green hover:underline">
                    Toate <ArrowRight size={12} weight="bold" className="inline" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {RECENT_PRACTICES.map((p) => (
                    <div key={p.id} className="card p-4 flex items-center gap-4 hover:border-forest-green transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-light-green flex items-center justify-center flex-shrink-0">
                        <Play size={18} weight="fill" className="text-forest-green" />
                      </div>
                      <div className="flex-1">
                        <p className="font-body font-semibold text-body-sm text-deep-green line-clamp-1">{p.title}</p>
                        <p className="font-body text-label-xs text-secondary-text">{p.facilitator} · {p.duration} min</p>
                      </div>
                      <span className="tag tag-green flex-shrink-0">{p.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - 1/3 */}
            <div className="space-y-6">
              {/* Upcoming session */}
              <div>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Sesiune Live</h2>
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-forest-green animate-live-pulse" />
                    <span className="font-body text-label-xs text-forest-green uppercase tracking-wider">Urmează</span>
                  </div>
                  <h3 className="font-body font-semibold text-body-sm text-deep-green mb-1 line-clamp-2">
                    {UPCOMING_SESSION.title}
                  </h3>
                  <p className="font-body text-label-xs text-secondary-text mb-3">{UPCOMING_SESSION.facilitator}</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center gap-1 font-body text-label-xs text-secondary-text">
                      <CalendarBlank size={12} />
                      {new Date(UPCOMING_SESSION.date).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
                    </span>
                    <span className="flex items-center gap-1 font-body text-label-xs text-secondary-text">
                      <Clock size={12} />
                      {new Date(UPCOMING_SESSION.date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="h-1.5 bg-light-green rounded-full mb-1 overflow-hidden">
                    <div
                      className="h-full bg-forest-green rounded-full"
                      style={{ width: `${Math.round(((UPCOMING_SESSION.spotsTotal - UPCOMING_SESSION.spotsLeft) / UPCOMING_SESSION.spotsTotal) * 100)}%` }}
                    />
                  </div>
                  <p className="font-body text-label-xs text-secondary-text mb-4">
                    {UPCOMING_SESSION.spotsLeft} locuri rămase
                  </p>
                  <Link href="/sesiuni-live" className="btn btn-primary w-full btn-sm">
                    Rezervă locul <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </div>

              {/* Progress summary */}
              <div>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Progresul tău</h2>
                <div className="card p-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-body text-label-xs text-secondary-text">Practici completate</span>
                      <span className="font-body text-label-xs font-semibold text-deep-green">23/30</span>
                    </div>
                    <div className="h-2 bg-light-green rounded-full overflow-hidden">
                      <div className="h-full bg-forest-green rounded-full" style={{ width: "77%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-body text-label-xs text-secondary-text">Obiectiv săptămânal</span>
                      <span className="font-body text-label-xs font-semibold text-deep-green">5/7 zile</span>
                    </div>
                    <div className="h-2 bg-light-green rounded-full overflow-hidden">
                      <div className="h-full bg-forest-green rounded-full" style={{ width: "71%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-body text-label-xs text-secondary-text">Check-in-uri</span>
                      <span className="font-body text-label-xs font-semibold text-deep-green">12/14 zile</span>
                    </div>
                    <div className="h-2 bg-rose-powder/40 rounded-full overflow-hidden">
                      <div className="h-full bg-terracotta rounded-full" style={{ width: "86%" }} />
                    </div>
                  </div>
                  <Link href="/dashboard/progres" className="font-body text-label-xs text-forest-green hover:underline flex items-center gap-1">
                    Vezi raportul complet <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
