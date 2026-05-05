"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MagnifyingGlass, PencilSimple, Envelope, ArrowLeft,
  DotsThreeVertical, Clock, Lock,
} from "@phosphor-icons/react";
import { ADMIN_USERS } from "@/lib/mockData";

const PLAN_FILTERS = ["Toți", "Gratuit", "Premium", "Premium+"];

const PLAN_TAG: Record<string, string> = {
  "Premium+": "bg-deep-green/10 text-deep-green border border-deep-green/20",
  "Premium": "bg-forest-green/10 text-forest-green border border-forest-green/20",
  "Gratuit": "bg-sage-border/40 text-secondary-text border border-sage-border",
};

/* ── per-user mock enrichment ── */
function deriveUserDetail(u: typeof ADMIN_USERS[0]) {
  const sessions = Math.round(u.checkIns * 0.9);
  const minutes = sessions * 18;
  const streak = Math.min(Math.round(u.checkIns * 0.15), 21);
  const activeDays = Math.floor(u.checkIns * 0.8);
  const practices = Math.floor(u.checkIns * 1.4);

  const subscriptions =
    u.plan === "Premium+"
      ? [
          { date: "15 Iun 2024", plan: "Premium+", amount: "149 RON", status: "COMPLETAT" },
          { date: "15 Mai 2024", plan: "Premium+", amount: "149 RON", status: "COMPLETAT" },
          { date: "15 Apr 2024", plan: "Standard", amount: "89 RON", status: "COMPLETAT" },
        ]
      : u.plan === "Premium"
      ? [
          { date: "20 Mar 2024", plan: "Premium", amount: "89 RON", status: "COMPLETAT" },
          { date: "20 Feb 2024", plan: "Premium", amount: "89 RON", status: "COMPLETAT" },
        ]
      : [];

  const practices_list = [
    { title: "Reglarea Sistemului Nervos", date: "12 Iun", duration: "15 min", category: "Somatic Grounding", progress: 90 },
    { title: "Eliberarea Tensiunii în Psoas", date: "10 Iun", duration: "24 min", category: "Deep Release", progress: 60 },
    { title: "Respirație 4-7-8", date: "8 Iun", duration: "10 min", category: "Respirație", progress: 100 },
  ].slice(0, u.checkIns > 20 ? 3 : 2);

  const journal = [
    {
      date: "14 Iunie, 2024",
      text: "Astăzi m-am simțit mult mai prezentă în timpul meditației de dimineață. Am observat o ușoară rezistență în umeri, dar am reușit să respir prin...",
    },
    {
      date: "11 Iunie, 2024",
      text: 'O zi dificilă la muncă, dar sesiunea de 5 minute de "Grounding" din pauza de prânz mi-a schimbat complet starea. Simt că încep să...',
    },
  ];

  const somaticQuote =
    u.id % 2 === 0
      ? '"Simt o tensiune ușoară în zona pieptului, dar picioarele sunt mult mai ancorate astăzi."'
      : '"Respir mai ușor. Umerii sunt mai relaxați. Mă simt prezentă în corp."';

  return { sessions, minutes, streak, activeDays, practices, subscriptions, practices_list, journal, somaticQuote };
}

/* ── main page ── */
export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("Toți");
  const [selectedUser, setSelectedUser] = useState<typeof ADMIN_USERS[0] | null>(null);

  const filtered = ADMIN_USERS.filter((u) => {
    if (plan !== "Toți" && u.plan !== plan) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <AnimatePresence mode="wait">
        {!selectedUser ? (
          /* ══ LIST VIEW ══ */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading text-h2 text-deep-green">Utilizatori</h1>
                <p className="font-body text-body-sm text-secondary-text">{ADMIN_USERS.length} utilizatori total</p>
              </div>
              <button className="btn btn-ghost btn-sm">Export CSV</button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", value: "1.547" },
                { label: "Activi azi", value: "234" },
                { label: "Premium", value: "89" },
                { label: "Premium+", value: "223" },
              ].map((s) => (
                <div key={s.label} className="card bg-white p-4">
                  <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="font-heading text-2xl font-bold text-deep-green">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="card bg-white p-4 mb-4 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
                <input
                  type="search"
                  placeholder="Caută după nume sau email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body focus:outline-none focus:border-forest-green"
                />
              </div>
              <div className="flex gap-2">
                {PLAN_FILTERS.map((p) => (
                  <button key={p} onClick={() => setPlan(p)} className={`filter-pill ${plan === p ? "active" : ""}`}>{p}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="card bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Utilizator</th>
                      <th>Plan</th>
                      <th>Înregistrat</th>
                      <th>Ultima activitate</th>
                      <th>Check-in-uri</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="cursor-pointer" onClick={() => setSelectedUser(u)}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-light-green flex items-center justify-center flex-shrink-0">
                              <span className="font-body text-xs font-bold text-forest-green">{u.avatar}</span>
                            </div>
                            <div>
                              <p className="font-body text-body-sm font-semibold text-deep-green">{u.name}</p>
                              <p className="font-body text-[10px] text-secondary-text">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`tag ${PLAN_TAG[u.plan]}`}>{u.plan}</span>
                        </td>
                        <td className="text-secondary-text font-body text-body-sm">{u.joinDate}</td>
                        <td className="text-secondary-text font-body text-body-sm">{u.lastActive}</td>
                        <td>
                          <span className="font-body font-semibold text-body-sm text-deep-green">{u.checkIns}</span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
                              <PencilSimple size={13} />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
                              <Envelope size={13} />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
                              <DotsThreeVertical size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ══ DETAIL VIEW ══ */
          <UserDetailView user={selectedUser} onBack={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── detail page component ── */
function UserDetailView({ user, onBack }: { user: typeof ADMIN_USERS[0]; onBack: () => void }) {
  const d = deriveUserDetail(user);
  const isOnline = user.lastActive === "2026-04-30";

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.28 }}
    >
      {/* ── TOP BAR ── */}
      <div className="card bg-white p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>

          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center">
              <span className="font-heading text-lg font-bold text-forest-green">{user.avatar}</span>
            </div>
            {isOnline && (
              <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-forest-green border-2 border-white" />
            )}
          </div>

          {/* Name + meta */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-heading text-h3 text-deep-green">{user.name}</h2>
              <span className={`tag text-[10px] ${PLAN_TAG[user.plan]}`}>{user.plan}</span>
            </div>
            <p className="font-body text-body-sm text-secondary-text">
              {user.email} · Membru din {new Date(user.joinDate).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-sm gap-2">
            <Envelope size={15} /> Mesaj
          </button>
          <button className="btn btn-primary btn-sm gap-2">
            <PencilSimple size={15} /> Editează Profil
          </button>
        </div>
      </div>

      {/* ── BODY GRID ── */}
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Harta Somatică */}
          <div className="card bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-body-md text-deep-green font-semibold">Harta Somatică</h3>
              <span className="font-body text-label-xs text-secondary-text">Ultima actualizare: Ieri</span>
            </div>

            <div className="relative w-full aspect-[3/4] max-w-[200px] mx-auto mb-4 rounded-xl overflow-hidden bg-gradient-to-b from-light-green/60 to-surface-container-low">
              {/* Body silhouette placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 200" className="w-24 opacity-20" fill="currentColor">
                  <circle cx="50" cy="20" r="14" className="text-deep-green" />
                  <path d="M30 40 Q50 34 70 40 L75 100 Q50 108 25 100Z" className="text-deep-green" />
                  <path d="M30 42 L15 90 Q12 95 18 96 L32 50Z" className="text-deep-green" />
                  <path d="M70 42 L85 90 Q88 95 82 96 L68 50Z" className="text-deep-green" />
                  <path d="M38 100 L35 160 Q34 168 42 168 L46 110Z" className="text-deep-green" />
                  <path d="M62 100 L65 160 Q66 168 58 168 L54 110Z" className="text-deep-green" />
                </svg>
              </div>
              {/* Tension dot */}
              <div className="absolute top-[28%] left-[42%] w-3 h-3 rounded-full bg-terracotta/70 border-2 border-white shadow-sm" />
              {/* Relaxation dot */}
              <div className="absolute top-[65%] left-[38%] w-3 h-3 rounded-full bg-forest-green/70 border-2 border-white shadow-sm" />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 mb-4 font-body text-label-xs text-secondary-text">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-green/70 inline-block" /> Relaxare
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta/70 inline-block" /> Tensiune
              </span>
            </div>

            <p className="font-body text-body-sm text-secondary-text italic text-center border-t border-sage-border/40 pt-4 leading-relaxed">
              {d.somaticQuote}
            </p>
          </div>

          {/* Practici Vizionate */}
          <div className="card bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-body-md text-deep-green font-semibold">Practici Vizionate</h3>
              <button className="font-body text-label-xs text-forest-green hover:underline">Vezi Tot</button>
            </div>
            <div className="flex flex-col gap-3">
              {d.practices_list.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-light-green flex-shrink-0 overflow-hidden relative">
                    <div className="absolute inset-0 bg-forest-green/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-xs font-bold text-forest-green">{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-body-sm font-semibold text-deep-green truncate">{p.title}</p>
                    <p className="font-body text-label-xs text-secondary-text">
                      {p.date} · {p.duration} · {p.category}
                    </p>
                    <div className="mt-1.5 h-1 bg-light-green rounded-full overflow-hidden">
                      <div className="h-full bg-forest-green rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#c8ebd3" }}>
              <p className="font-body text-label-xs text-forest-green/70 uppercase tracking-wider mb-1">Sesiuni</p>
              <p className="font-heading text-3xl font-bold text-deep-green">{d.sessions}</p>
            </div>
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#c8ebd3" }}>
              <p className="font-body text-label-xs text-forest-green/70 uppercase tracking-wider mb-1">Minute</p>
              <p className="font-heading text-3xl font-bold text-deep-green">{d.minutes.toLocaleString("ro-RO")}</p>
            </div>
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#f8d7c8" }}>
              <p className="font-body text-label-xs text-terracotta/70 uppercase tracking-wider mb-1">Zile Consec.</p>
              <p className="font-heading text-3xl font-bold text-deep-green">{d.streak}</p>
            </div>
          </div>

          {/* Istoric Abonament */}
          <div className="card bg-white p-5">
            <h3 className="font-heading text-body-md text-deep-green font-semibold mb-4">Istoric Abonament</h3>
            {d.subscriptions.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sage-border/60">
                    <th className="text-left font-body text-label-xs text-secondary-text uppercase tracking-wide pb-2">Dată</th>
                    <th className="text-left font-body text-label-xs text-secondary-text uppercase tracking-wide pb-2">Plan</th>
                    <th className="text-left font-body text-label-xs text-secondary-text uppercase tracking-wide pb-2">Sumă</th>
                    <th className="text-left font-body text-label-xs text-secondary-text uppercase tracking-wide pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d.subscriptions.map((s, i) => (
                    <tr key={i} className="border-b border-sage-border/30 last:border-0">
                      <td className="py-3 font-body text-body-sm text-secondary-text">{s.date}</td>
                      <td className="py-3 font-body text-body-sm font-semibold text-deep-green">{s.plan}</td>
                      <td className="py-3 font-body text-body-sm text-secondary-text">{s.amount}</td>
                      <td className="py-3">
                        <span className="tag bg-forest-green/10 text-forest-green border border-forest-green/20 text-[10px] tracking-wider">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="font-body text-body-sm text-secondary-text text-center py-6">Niciun abonament activ</p>
            )}
          </div>

          {/* Intrări în Jurnal */}
          <div className="card bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-body-md text-deep-green font-semibold">Intrări în Jurnal</h3>
              <button className="font-body text-label-xs text-forest-green hover:underline">Descarcă PDF</button>
            </div>
            <div className="flex flex-col gap-3">
              {d.journal.map((j, i) => (
                <div key={i} className="rounded-xl p-4" style={{ backgroundColor: "#e8f5ec" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-label-xs font-semibold text-forest-green">{j.date}</span>
                    <Lock size={13} className="text-secondary-text" />
                  </div>
                  <p className="font-body text-body-sm text-secondary-text leading-relaxed line-clamp-3">{j.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
