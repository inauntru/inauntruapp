"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { CalendarBlank, Users, Clock, Video, Lock, ArrowRight, Play, Star, CaretLeft, CaretRight, Check, CaretDown, X } from "@phosphor-icons/react";
import AnimateIn, { StaggerChildren } from "@/components/ui/AnimateIn";
import { LIVE_SESSIONS, PAST_RECORDINGS } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremiumAccess } from "@/lib/plan";

const WEEK_DAYS = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

interface Props { siteContent: Record<string, string>; }

export default function SesiuniLiveClient({ siteContent }: Props) {
  const t = (key: string, fallback: string) => siteContent[key] || fallback;
  const { user, profile } = useAuth();
  const unlocked = hasPremiumAccess(profile?.plan);
  const [sessions, setSessions] = useState(LIVE_SESSIONS);
  const [selectedDay, setSelectedDay] = useState(0);
  const [reserved, setReserved] = useState<number[]>([]);
  const [cancelMenuFor, setCancelMenuFor] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setSessions(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let fromApi: number[] = [];
    let fromLocal: number[] = [];
    try { fromLocal = JSON.parse(localStorage.getItem("sessions-reserved") || "[]"); } catch { /* ignore */ }
    if (!user) { setReserved(fromLocal); return; }
    fetch("/api/sessions/reserve")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.reserved) fromApi = d.reserved;
        setReserved(Array.from(new Set([...fromApi, ...fromLocal])));
      })
      .catch(() => setReserved(fromLocal));
  }, [user]);

  async function reserve(id: number) {
    // Optimist: marchează imediat, API-ul confirmă în fundal
    setReserved(prev => [...prev, id]);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, spotsLeft: Math.max(0, s.spotsLeft - 1) } : s));

    try {
      const res = await fetch("/api/sessions/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      if (res.status === 404) {
        // Sesiune demo (nu e în DB) — păstrează rezervarea local
        const local = JSON.parse(localStorage.getItem("sessions-reserved") || "[]");
        localStorage.setItem("sessions-reserved", JSON.stringify(Array.from(new Set([...local, id]))));
      } else if (!res.ok) {
        // Rollback dacă rezervarea a eșuat (ex: nu mai sunt locuri)
        setReserved(prev => prev.filter(r => r !== id));
        setSessions(prev => prev.map(s => s.id === id ? { ...s, spotsLeft: s.spotsLeft + 1 } : s));
      }
    } catch { /* offline — rămâne optimist */ }
  }

  // Anularea e permisă doar până cu 20 min înainte de start
  function canCancel(dateStr: string) {
    return Date.now() < new Date(dateStr).getTime() - 20 * 60 * 1000;
  }

  // Click pe "Rezervat" deschide un mic meniu cu opțiunea de anulare
  useEffect(() => {
    function close(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-cancel-menu]")) setCancelMenuFor(null);
    }
    if (cancelMenuFor !== null) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [cancelMenuFor]);

  async function cancelReservation(id: number) {
    setReserved(prev => prev.filter(r => r !== id));
    setSessions(prev => prev.map(s => s.id === id ? { ...s, spotsLeft: Math.min(s.spotsTotal, s.spotsLeft + 1) } : s));
    try {
      const local: number[] = JSON.parse(localStorage.getItem("sessions-reserved") || "[]");
      localStorage.setItem("sessions-reserved", JSON.stringify(local.filter(r => r !== id)));
    } catch { /* ignore */ }
    try {
      const res = await fetch("/api/sessions/reserve", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      if (res.status === 403) {
        // Prea târziu — serverul a refuzat, restaurăm rezervarea
        setReserved(prev => Array.from(new Set([...prev, id])));
        setSessions(prev => prev.map(s => s.id === id ? { ...s, spotsLeft: Math.max(0, s.spotsLeft - 1) } : s));
      }
    } catch { /* offline — rămâne anulat local */ }
  }

  const featured = sessions[0];
  const upcoming = sessions.slice(1);
  const spotsPercent = (s: typeof featured) => Math.round(((s.spotsTotal - s.spotsLeft) / s.spotsTotal) * 100);

  return (
    <div className="min-h-screen bg-bg-main">
      <section className="bg-deep-green py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <p className="font-body text-label-sm text-primary-fixed-dim uppercase tracking-widest mb-6">
              {t("title", "Urmează în curând")}
            </p>
          </AnimateIn>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <AnimateIn from="left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-live-pulse" />
                <span className="font-body text-label-sm text-primary-fixed-dim">LIVE</span>
              </div>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">{featured.title}</h1>
              <p className="font-body text-body-md text-white/60 mb-6">{featured.description}</p>
              <div className="flex flex-wrap gap-4 mb-6 text-white/70 font-body text-body-sm">
                <span className="flex items-center gap-2"><CalendarBlank size={16} weight="regular" />{formatDate(featured.date)}</span>
                <span className="flex items-center gap-2"><Clock size={16} weight="regular" />{formatTime(featured.date)} · {featured.duration} min</span>
                <span className="flex items-center gap-2"><Users size={16} weight="regular" />{featured.spotsLeft} locuri rămase din {featured.spotsTotal}</span>
              </div>
              <div className="mb-6">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-powder rounded-full transition-all duration-500" style={{ width: `${spotsPercent(featured)}%` }} />
                </div>
                <p className="font-body text-label-xs text-white/40 mt-1">{spotsPercent(featured)}% ocupat</p>
              </div>
              <div className="flex gap-4">
                {!user ? (
                  <Link href="/register" className="btn btn-rose">Rezervă locul tău <ArrowRight size={16} weight="bold" /></Link>
                ) : featured.isPremium && !unlocked ? (
                  <Link href="/preturi" className="btn bg-white/15 text-white border border-white/25 hover:bg-white/25 gap-2">
                    <Lock size={16} weight="fill" /> Necesită abonament
                  </Link>
                ) : reserved.includes(featured.id) ? (
                  <div className="relative" data-cancel-menu>
                    <button
                      onClick={() => setCancelMenuFor(p => p === featured.id ? null : featured.id)}
                      className="btn bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-colors gap-2"
                    >
                      <Check size={16} weight="bold" /> Loc rezervat
                      <CaretDown size={12} weight="bold"
                        className={`transition-transform duration-200 ${cancelMenuFor === featured.id ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {cancelMenuFor === featured.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-[calc(100%+6px)] left-0 z-30 min-w-[230px] rounded-xl bg-white shadow-modal border border-sage-border/50 overflow-hidden"
                        >
                          {canCancel(featured.date) ? (
                            <button
                              onClick={() => { setCancelMenuFor(null); cancelReservation(featured.id); }}
                              className="w-full flex items-center gap-2.5 px-4 py-3 font-body text-body-sm text-terracotta hover:bg-red-50 transition-colors text-left"
                            >
                              <X size={15} weight="bold" /> Anulează rezervarea
                            </button>
                          ) : (
                            <p className="px-4 py-3 font-body text-label-xs text-secondary-text">
                              Nu se mai poate anula — sesiunea începe în mai puțin de 20 de minute.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button onClick={() => reserve(featured.id)} className="btn btn-rose">
                    Rezervă locul tău <ArrowRight size={16} weight="bold" />
                  </button>
                )}
                <span className="flex items-center gap-2 font-body text-body-sm text-white/50"><Video size={16} weight="regular" />{featured.type}</span>
              </div>
            </AnimateIn>
            <AnimateIn from="scale" className="hidden lg:block">
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80" alt="Sesiune live meditație" fill className="object-cover" />
                <div className="absolute inset-0 bg-deep-green/30" />
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5 backdrop-blur">
                  <div className="w-2 h-2 rounded-full bg-rose-powder animate-live-pulse" />
                  <span className="font-body text-label-xs text-white">Starts {formatTime(featured.date)}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="font-heading text-white text-body-md">{featured.facilitator}</p>
                  <p className="font-body text-white/60 text-label-xs">Facilitator principal</p>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-sage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green transition-colors"><CaretLeft size={16} weight="bold" className="text-secondary-text" /></button>
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() + i);
                const day = d.getDate(); const weekDay = WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
                return (
                  <button key={i} onClick={() => setSelectedDay(i)} className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl flex-shrink-0 transition-all duration-200 min-w-[60px] ${selectedDay === i ? "bg-forest-green text-white" : "hover:bg-light-green text-secondary-text"}`}>
                    <span className="font-body text-label-xs">{weekDay}</span>
                    <span className="font-heading font-bold text-lg">{day}</span>
                    {i < 4 && <div className={`w-1.5 h-1.5 rounded-full ${selectedDay === i ? "bg-white" : "bg-forest-green"}`} />}
                  </button>
                );
              })}
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green transition-colors"><CaretRight size={16} weight="bold" className="text-secondary-text" /></button>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom"><h2 className="font-heading text-h2 text-deep-green mb-8">Sesiuni viitoare</h2></AnimateIn>
          <StaggerChildren className="flex flex-col gap-4" staggerDelay={0.1}>
            {upcoming.map((session) => (
              <div key={session.id} className="card card-lift p-6">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="w-14 h-14 rounded-xl bg-light-green flex items-center justify-center flex-shrink-0"><Video size={24} weight="regular" className="text-forest-green" /></div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-body font-semibold text-body-md text-deep-green">{session.title}</h3>
                      {session.isPremium && <span className="tag bg-secondary-container text-on-secondary-container border-0">Premium</span>}
                      <span className="tag tag-green">{session.type}</span>
                    </div>
                    <p className="font-body text-label-xs text-secondary-text mb-2">{session.facilitator}</p>
                    <div className="flex flex-wrap gap-4 text-secondary-text font-body text-label-xs">
                      <span className="flex items-center gap-1"><CalendarBlank size={12} />{formatDate(session.date)}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{formatTime(session.date)} · {session.duration} min</span>
                      <span className="flex items-center gap-1"><Users size={12} />{session.spotsLeft} locuri rămase</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {session.isPremium && !unlocked ? (
                      <Link href={user ? "/preturi" : "/register"} className="btn btn-ghost btn-sm gap-2">
                        <Lock size={14} weight="fill" /> Premium
                      </Link>
                    ) : !user ? (
                      <Link href="/register" className="btn btn-primary btn-sm">Rezervă <ArrowRight size={14} weight="bold" /></Link>
                    ) : reserved.includes(session.id) ? (
                      <div className="relative" data-cancel-menu>
                        <button
                          onClick={() => setCancelMenuFor(p => p === session.id ? null : session.id)}
                          className="btn btn-sm gap-1.5 bg-light-green text-forest-green border border-sage-border hover:border-forest-green/50 transition-colors"
                        >
                          <Check size={14} weight="bold" /> Rezervat
                          <CaretDown size={11} weight="bold"
                            className={`transition-transform duration-200 ${cancelMenuFor === session.id ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {cancelMenuFor === session.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.97 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-[calc(100%+6px)] right-0 z-30 min-w-[210px] rounded-xl bg-white shadow-modal border border-sage-border/50 overflow-hidden"
                            >
                              {canCancel(session.date) ? (
                                <button
                                  onClick={() => { setCancelMenuFor(null); cancelReservation(session.id); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-3 font-body text-body-sm text-terracotta hover:bg-red-50 transition-colors text-left"
                                >
                                  <X size={14} weight="bold" /> Anulează rezervarea
                                </button>
                              ) : (
                                <p className="px-4 py-3 font-body text-label-xs text-secondary-text">
                                  Nu se mai poate anula — sesiunea începe în mai puțin de 20 de minute.
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <button onClick={() => reserve(session.id)} className="btn btn-primary btn-sm">
                        Rezervă <ArrowRight size={14} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-sage-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-label-xs text-secondary-text">Locuri ocupate</span>
                    <span className="font-body text-label-xs text-secondary-text">{session.spotsTotal - session.spotsLeft}/{session.spotsTotal}</span>
                  </div>
                  <div className="h-1.5 bg-light-green rounded-full overflow-hidden">
                    <div className="h-full bg-forest-green rounded-full" style={{ width: `${spotsPercent(session)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="flex items-end justify-between mb-8">
              <div><p className="section-label">Înregistrări</p><h2 className="font-heading text-h2 text-deep-green">Sesiuni anterioare</h2></div>
            </div>
          </AnimateIn>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {PAST_RECORDINGS.map((rec) => (
              <div key={rec.id} className="card card-lift group overflow-hidden">
                <div className="relative aspect-video bg-gradient-to-br from-deep-green/20 to-forest-green/10 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-deep-green/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {rec.isPremium ? <Lock size={24} weight="fill" className="text-white/60" /> : <Play size={24} weight="fill" className="text-forest-green/70" />}
                    </div>
                  </div>
                  {rec.isPremium && <div className="absolute top-3 right-3"><span className="tag bg-deep-green/70 text-white border-0 backdrop-blur">Premium</span></div>}
                </div>
                <div className="p-4">
                  <h3 className="font-body font-semibold text-body-sm text-deep-green mb-1 line-clamp-2">{rec.title}</h3>
                  <p className="font-body text-label-xs text-secondary-text mb-2">{rec.facilitator}</p>
                  <div className="flex items-center justify-between text-label-xs text-secondary-text font-body">
                    <span className="flex items-center gap-1"><Clock size={11} />{rec.duration} min</span>
                    <span>{rec.views} vizionări</span>
                    <span>{new Date(rec.date).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>
    </div>
  );
}
