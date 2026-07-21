"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  List,
  X,
  Anchor,
  PencilSimple,
  GearSix,
} from "@phosphor-icons/react";
import { CountUp } from "@/components/ui/AnimateIn";
import CheckInModal from "@/components/ui/CheckInModal";
import { useAuth } from "@/contexts/AuthContext";
import { getDailyQuote, type ZodiacSign } from "@/lib/quotes";

const ZODIAC_EMOJI: Record<ZodiacSign, string> = {
  Berbec: "♈", Taur: "♉", Gemeni: "♊", Rac: "♋", Leu: "♌", Fecioară: "♍",
  Balanță: "♎", Scorpion: "♏", Săgetător: "♐", Capricorn: "♑", Vărsător: "♒", Pești: "♓",
};
function formatDate() {
  return new Date().toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const QUICK_ACCESS = [
  { icon: BookOpen,    label: "Bibliotecă",   href: "/practici",       iconCls: "bg-forest-green/20 text-forest-green", cardCls: "bg-light-green border-sage-border/40" },
  { icon: Anchor,      label: "Ancore",        href: "/ancore",         iconCls: "bg-indigo/10 text-indigo",             cardCls: "bg-indigo-light border-indigo/10" },
  { icon: Notebook,    label: "Jurnal",        href: "/dashboard/jurnal", iconCls: "bg-indigo-mid/15 text-indigo-mid",  cardCls: "bg-indigo-bg border-indigo/10" },
  { icon: VideoCamera, label: "Sesiuni live",  href: "/sesiuni-live",   iconCls: "bg-deep-green/10 text-deep-green",    cardCls: "bg-light-green/60 border-sage-border/30" },
];

type PracticeItem = { id: number; title: string; facilitator: string; duration: number; category: string; };
type SessionItem = { title: string; facilitator: string; date: string; spotsTotal: number; spotsLeft: number; };

export default function DashboardPage() {
  const { profile, user: authUser } = useAuth();
  const dateOfBirth = authUser?.user_metadata?.date_of_birth as string | undefined;
  const { quote: dailyQuote, sign: zodiacSign } = getDailyQuote(dateOfBirth);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [recentPractices, setRecentPractices] = useState<PracticeItem[]>([]);
  const [upcomingSession, setUpcomingSession] = useState<SessionItem | null>(null);
  const [checkInDone, setCheckInDone] = useState(false);
  const [stats, setStats] = useState({ streak: 0, minutesPracticed: 0, checkInsCount: 0, practicesCompleted: 0, checkInsThisWeek: 0, journalCount: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstName = profile?.first_name || authUser?.user_metadata?.first_name || "acolo";
  const lastName = profile?.last_name || authUser?.user_metadata?.last_name || "";
  const initials = ([firstName?.[0], lastName?.[0]].filter(Boolean).join("") || "U").toUpperCase();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").replace(" acolo", "") || "Utilizator";
  const planLabel = profile?.plan === "premium" ? "Premium" : profile?.plan === "standard" ? "Standard" : "Gratuit";

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setStats(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/practices")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setRecentPractices(data.slice(0, 3)); })
      .catch(() => {});
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setUpcomingSession(data[0]); })
      .catch(() => {});
  }, []);

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

      {/* Sidebar overlay backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-screen w-64 bg-deep-green border-r border-white/10 py-8 z-50 flex flex-col"
          >
            {/* Close + Logo */}
            <div className="px-4 mb-8 flex items-center justify-between">
              <Link href="/" onClick={() => setSidebarOpen(false)}>
                <Image src="/logo-orizontal-alb.png" alt="WithIn" width={90} height={25} className="object-contain" priority />
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-1">
              {[
                { icon: ChartLine, label: "Dashboard", href: "/dashboard", active: true },
                { icon: BookOpen, label: "Bibliotecă", href: "/practici" },
                { icon: Anchor, label: "Ancore", href: "/ancore" },
                { icon: VideoCamera, label: "Sesiuni Live", href: "/sesiuni-live" },
                { icon: Notebook, label: "Jurnal", href: "/dashboard/jurnal" },
                { icon: ChartLine, label: "Progresul meu", href: "/dashboard/progres" },
                { icon: GearSix, label: "Contul meu", href: "/dashboard/cont" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-body text-body-sm ${
                      item.active
                        ? "bg-forest-green/30 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
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
              <Link
                href="/dashboard/cont"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
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

      {/* Main content */}
      <div className="flex">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-8 bg-gradient-to-br from-light-green/80 via-light-green/20 to-transparent"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mt-1.5 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-sage-border text-deep-green hover:bg-light-green hover:border-forest-green transition-colors flex-shrink-0 shadow-sm"
                  aria-label="Meniu"
                >
                  <List size={18} weight="bold" />
                </button>
                <div>
                  <h1 className="font-heading text-h1 text-deep-green">
                    Bună, {firstName} 🌿
                  </h1>
                  <p className="font-body text-body-md text-secondary-text capitalize">{formatDate()}</p>
                </div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-deep-green rounded-2xl mb-8 grid grid-cols-3 overflow-hidden shadow-modal"
          >
            {[
              { icon: Flame,       label: "Zile consecutive",  value: stats.streak },
              { icon: Clock,       label: "Minute practicate", value: stats.minutesPracticed },
              { icon: VideoCamera, label: "Check-in-uri",      value: stats.checkInsCount },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`text-center py-6 px-4 ${i < 2 ? "border-r border-white/10" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} weight="fill" className="text-sage-border" />
                  </div>
                  <p className="font-heading text-3xl font-bold text-white">
                    <CountUp to={stat.value} />
                  </p>
                  <p className="font-body text-label-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Daily practice recommendation - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recommended practice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl overflow-hidden shadow-modal"
              >
                <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2E1A 0%, #1a4a2a 50%, #2B8C5C 100%)" }}>
                  {/* Ambient glow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="w-56 h-56 rounded-full"
                      style={{ background: "radial-gradient(circle, rgba(168,223,192,0.35) 0%, transparent 70%)" }}
                    />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                    className="absolute top-4 right-8 w-32 h-32 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(168,223,192,0.25) 0%, transparent 70%)" }}
                  />
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, rgba(15,46,26,0.85) 0%, transparent 100%)" }}>
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
                    <Play size={14} weight="fill" />
                    Începe acum
                  </Link>
                </div>
              </motion.div>

              {/* Quick access */}
              <div>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Acces rapid</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {QUICK_ACCESS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 border transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 ${item.cardCls}`}
                      >
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
                  ) : recentPractices.map((p) => (
                    <Link key={p.id} href={`/practici/${p.id}`} className="rounded-2xl bg-white border border-sage-border/30 p-4 flex items-center gap-4 hover:border-forest-green hover:shadow-card-hover transition-all cursor-pointer">
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

            {/* Right column - 1/3 */}
            <div className="space-y-6">
              {/* Upcoming session */}
              <div>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Sesiune Live</h2>
                {upcomingSession ? (
                  <div className="rounded-2xl bg-white border border-sage-border/30 p-5 shadow-card" style={{ borderTop: "3px solid #2B8C5C" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-forest-green animate-live-pulse" />
                      <span className="font-body text-label-xs text-forest-green uppercase tracking-wider">Urmează</span>
                    </div>
                    <h3 className="font-body font-semibold text-body-sm text-deep-green mb-1 line-clamp-2">
                      {upcomingSession.title}
                    </h3>
                    <p className="font-body text-label-xs text-secondary-text mb-3">{upcomingSession.facilitator}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center gap-1 font-body text-label-xs text-secondary-text">
                        <CalendarBlank size={12} />
                        {new Date(upcomingSession.date).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
                      </span>
                      <span className="flex items-center gap-1 font-body text-label-xs text-secondary-text">
                        <Clock size={12} />
                        {new Date(upcomingSession.date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="h-1.5 bg-light-green rounded-full mb-1 overflow-hidden">
                      <div
                        className="h-full bg-forest-green rounded-full"
                        style={{ width: `${Math.round(((upcomingSession.spotsTotal - upcomingSession.spotsLeft) / upcomingSession.spotsTotal) * 100)}%` }}
                      />
                    </div>
                    <p className="font-body text-label-xs text-secondary-text mb-4">
                      {upcomingSession.spotsLeft} locuri rămase
                    </p>
                    <Link href="/sesiuni-live" className="btn btn-primary w-full btn-sm">
                      Rezervă locul <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                ) : (
                  <div className="card p-5 text-center">
                    <p className="font-body text-body-sm text-secondary-text">Nicio sesiune programată</p>
                    <Link href="/sesiuni-live" className="btn btn-secondary w-full btn-sm mt-3">
                      Vezi toate sesiunile
                    </Link>
                  </div>
                )}
              </div>

              {/* Progress summary */}
              <div>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Progresul tău</h2>
                <div className="rounded-2xl bg-white border border-sage-border/30 p-5 space-y-4 shadow-card">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-label-xs text-secondary-text">Practici completate</span>
                      <span className="font-body text-label-xs font-bold text-deep-green">
                        <CountUp to={stats.practicesCompleted} />
                      </span>
                    </div>
                    <div className="h-3 bg-light-green rounded-full overflow-hidden">
                      <div className="h-full bg-forest-green rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, stats.practicesCompleted * 10)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-label-xs text-secondary-text">Check-in-uri săptămâna aceasta</span>
                      <span className="font-body text-label-xs font-bold text-deep-green">
                        <CountUp to={stats.checkInsThisWeek} />/7 zile
                      </span>
                    </div>
                    <div className="h-3 bg-light-green rounded-full overflow-hidden">
                      <div className="h-full bg-forest-green rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((stats.checkInsThisWeek / 7) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-label-xs text-secondary-text">Total check-in-uri</span>
                      <span className="font-body text-label-xs font-bold text-deep-green">
                        <CountUp to={stats.checkInsCount} />
                      </span>
                    </div>
                    <div className="h-3 bg-indigo-light rounded-full overflow-hidden">
                      <div className="h-full bg-indigo rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, stats.checkInsCount * 5)}%` }} />
                    </div>
                  </div>
                  <Link href="/dashboard/progres" className="font-body text-label-xs text-forest-green hover:underline flex items-center gap-1">
                    Vezi raportul complet <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>

              {/* Journal reminder */}
              <div>
                <h2 className="font-heading text-h3 text-deep-green mb-4">Jurnal</h2>
                <div className="card p-5 bg-rose-powder/10 border-rose-powder/30">
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
                    {zodiacSign && (
                      <p className="font-body text-label-xs text-terracotta/60 uppercase tracking-widest mb-1.5">
                        {ZODIAC_EMOJI[zodiacSign]} {zodiacSign}
                      </p>
                    )}
                    <p className="font-body text-label-xs text-secondary-text italic leading-relaxed">
                      &ldquo;{dailyQuote.text}&rdquo;
                    </p>
                    <p className="font-body text-label-xs text-terracotta/70 mt-1">— {dailyQuote.author}</p>
                  </blockquote>
                  <Link href="/dashboard/jurnal" className="w-full h-9 rounded-full bg-terracotta/90 hover:bg-terracotta text-white font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors">
                    <PencilSimple size={13} weight="bold" />
                    Deschide jurnalul
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

