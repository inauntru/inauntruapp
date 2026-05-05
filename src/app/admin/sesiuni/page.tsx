"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CalendarBlank, Clock, Users, VideoCamera, X, PencilSimple, Trash, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { LIVE_SESSIONS } from "@/lib/mockData";

const TABS = ["Viitoare", "Trecute", "Anulate"];

const MONTHS = ["Aprilie 2026", "Mai 2026", "Iunie 2026"];

export default function AdminSessionsPage() {
  const [tab, setTab] = useState("Viitoare");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(1);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Sesiuni LIVE</h1>
          <p className="font-body text-body-sm text-secondary-text">{LIVE_SESSIONS.length} sesiuni programate</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-sage-border rounded-full overflow-hidden">
            {["list", "calendar"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as "list" | "calendar")}
                className={`px-4 py-2 font-body text-label-xs transition-all ${view === v ? "bg-forest-green text-white" : "text-secondary-text hover:bg-light-green"}`}
              >
                {v === "list" ? "Listă" : "Calendar"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus size={16} weight="bold" /> Adaugă sesiune
          </button>
        </div>
      </div>

      {/* Calendar view */}
      {view === "calendar" && (
        <div className="card bg-white p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth((m) => Math.max(0, m - 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green">
              <CaretLeft size={16} />
            </button>
            <h3 className="font-heading text-h3 text-deep-green">{MONTHS[currentMonth]}</h3>
            <button onClick={() => setCurrentMonth((m) => Math.min(2, m + 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green">
              <CaretRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"].map((d) => (
              <div key={d} className="py-2 font-body text-label-xs text-secondary-text uppercase tracking-wider">{d}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 2;
              const isSession = [5, 11, 18, 25].includes(day);
              return (
                <div
                  key={i}
                  className={`py-2.5 rounded-xl font-body text-body-sm cursor-pointer transition-colors relative ${
                    day < 1 || day > 31 ? "text-secondary-text/30" :
                    isSession ? "bg-light-green text-forest-green font-semibold hover:bg-forest-green hover:text-white" :
                    "hover:bg-light-green/50 text-on-surface"
                  }`}
                >
                  {day > 0 && day <= 31 ? day : ""}
                  {isSession && day > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-forest-green" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-sage-border mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 font-body text-body-sm font-medium border-b-2 -mb-px transition-all ${
              tab === t ? "border-forest-green text-forest-green" : "border-transparent text-secondary-text hover:text-deep-green"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      <div className="space-y-4">
        {tab === "Viitoare" ? LIVE_SESSIONS.map((s) => (
          <div key={s.id} className="card bg-white p-5 flex flex-col md:flex-row gap-4 md:items-center">
            <div className="w-12 h-12 bg-light-green rounded-xl flex items-center justify-center flex-shrink-0">
              <VideoCamera size={20} weight="regular" className="text-forest-green" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-body font-semibold text-body-md text-deep-green">{s.title}</h3>
                {s.isPremium && <span className="tag tag-green">Premium</span>}
                <span className="tag tag-outline">{s.type}</span>
              </div>
              <p className="font-body text-label-xs text-secondary-text mb-2">{s.facilitator}</p>
              <div className="flex flex-wrap gap-4 text-label-xs text-secondary-text font-body">
                <span className="flex items-center gap-1"><CalendarBlank size={12} />{new Date(s.date).toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" })}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{new Date(s.date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })} · {s.duration} min</span>
                <span className="flex items-center gap-1"><Users size={12} />{s.spotsLeft}/{s.spotsTotal} locuri</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
                <PencilSimple size={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-secondary-text hover:text-terracotta transition-colors">
                <Trash size={14} />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 text-secondary-text font-body text-body-md">
            {tab === "Trecute" ? "3 sesiuni anterioare disponibile" : "Nicio sesiune anulată"}
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-modal w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-h3 text-deep-green">Adaugă sesiune nouă</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Titlu sesiune</label>
                  <input type="text" className="input w-full" placeholder="ex: Reglare somatică de grup" />
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Facilitator</label>
                  <select className="input w-full">
                    {["Dr. Ana Ionescu", "Mihai Pop", "Elena Stan", "Cristian Dima"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-label-sm text-on-surface mb-1.5 block">Data</label>
                    <input type="date" className="input w-full" />
                  </div>
                  <div>
                    <label className="font-body text-label-sm text-on-surface mb-1.5 block">Ora</label>
                    <input type="time" className="input w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-label-sm text-on-surface mb-1.5 block">Durată (minute)</label>
                    <input type="number" className="input w-full" placeholder="60" />
                  </div>
                  <div>
                    <label className="font-body text-label-sm text-on-surface mb-1.5 block">Locuri maxime</label>
                    <input type="number" className="input w-full" placeholder="25" />
                  </div>
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Link Zoom/Meet</label>
                  <input type="url" className="input w-full" placeholder="https://zoom.us/j/..." />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-forest-green" />
                  <span className="font-body text-body-sm text-on-surface">Premium only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-forest-green" />
                  <span className="font-body text-body-sm text-on-surface">Sesiune recurentă (săptămânal)</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Anulează</button>
                <button className="btn btn-primary flex-1">Salvează sesiunea</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
