"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Trash, PencilSimple, BookOpen, SmileyHappy, SmileySad,
  SmileyNervous, SmileyMeh, SmileyWink, CircleNotch, Check, ArrowLeft,
} from "@phosphor-icons/react";
import Link from "next/link";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), { ssr: false });

interface JournalEntry {
  id: number;
  title: string | null;
  content: string;
  mood: string | null;
  created_at: string;
}

interface CheckInEntry {
  id: number;
  mood: string;
  body_zones: string[];
  intensity: string | null;
  note: string | null;
  created_at: string;
}

const MOOD_ICONS: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  happy:   { icon: SmileyHappy,   label: "Bucuros",   color: "text-forest-green" },
  content: { icon: SmileyWink,    label: "Mulțumit",  color: "text-teal-600" },
  neutral: { icon: SmileyMeh,     label: "Neutru",    color: "text-secondary-text" },
  anxious: { icon: SmileyNervous, label: "Anxios",    color: "text-amber-500" },
  sad:     { icon: SmileySad,     label: "Trist",     color: "text-terracotta" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function JurnalPage() {
  const [tab, setTab] = useState<"note" | "checkins">("note");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState({ title: "", content: "", mood: "" });
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/journal").then((r) => r.json()),
      fetch("/api/checkin/history").then((r) => r.json()),
    ]).then(([j, c]) => {
      setEntries(j.entries ?? []);
      setCheckIns(c.checkIns ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ title: "", content: "", mood: "" });
    setShowEditor(true);
  }

  function openEdit(e: JournalEntry) {
    setEditing(e);
    setForm({ title: e.title ?? "", content: e.content, mood: e.mood ?? "" });
    setShowEditor(true);
  }

  async function handleSave() {
    if (!form.content.trim() && !stripHtml(form.content).trim()) return;
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/journal/${editing.id}` : "/api/journal";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title || null, content: form.content, mood: form.mood || null }),
    });
    const res = await fetch("/api/journal");
    const data = await res.json();
    setEntries(data.entries ?? []);
    setSaving(false);
    setSaveOk(true);
    setTimeout(() => { setSaveOk(false); setShowEditor(false); }, 1000);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
          <ArrowLeft size={18} weight="bold" />
        </Link>
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Jurnalul meu</h1>
          <p className="font-body text-body-sm text-secondary-text">Note personale și istoricul check-in-urilor</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-sage-border mb-6">
        {[{ id: "note", label: "Note personale" }, { id: "checkins", label: "Check-in-uri" }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "note" | "checkins")}
            className={`px-4 py-3 font-body text-body-sm font-medium border-b-2 -mb-px transition-all ${
              tab === t.id ? "border-forest-green text-forest-green" : "border-transparent text-secondary-text hover:text-deep-green"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "note" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openNew} className="btn btn-primary btn-sm gap-2">
              <Plus size={14} weight="bold" /> Notă nouă
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><CircleNotch size={24} className="animate-spin text-forest-green" /></div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen size={48} className="text-sage-border mb-4" />
              <p className="font-heading text-h3 text-deep-green mb-2">Nicio notă încă</p>
              <p className="font-body text-body-sm text-secondary-text mb-5">Scrie prima ta notă — gânduri, reflecții, intenții.</p>
              <button onClick={openNew} className="btn btn-primary btn-sm gap-2"><Plus size={14} weight="bold" /> Scrie prima notă</button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const MoodIcon = entry.mood ? MOOD_ICONS[entry.mood]?.icon : null;
                const moodColor = entry.mood ? MOOD_ICONS[entry.mood]?.color : "";
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-white p-5 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openEdit(entry)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {MoodIcon && <MoodIcon size={16} className={moodColor} />}
                          {entry.title && <h3 className="font-body font-semibold text-body-sm text-deep-green truncate">{entry.title}</h3>}
                        </div>
                        <p className="font-body text-body-sm text-secondary-text line-clamp-2">{stripHtml(entry.content)}</p>
                        <p className="font-body text-label-xs text-secondary-text/60 mt-2">{formatDate(entry.created_at)} · {formatTime(entry.created_at)}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={(ev) => { ev.stopPropagation(); openEdit(entry); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors"
                        >
                          <PencilSimple size={13} />
                        </button>
                        <button
                          onClick={(ev) => { ev.stopPropagation(); handleDelete(entry.id); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-secondary-text hover:text-terracotta transition-colors"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "checkins" && (
        <>
          {loading ? (
            <div className="flex justify-center py-16"><CircleNotch size={24} className="animate-spin text-forest-green" /></div>
          ) : checkIns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SmileyMeh size={48} className="text-sage-border mb-4" />
              <p className="font-heading text-h3 text-deep-green mb-2">Niciun check-in încă</p>
              <p className="font-body text-body-sm text-secondary-text">Check-in-urile zilnice vor apărea aici.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkIns.map((ci) => {
                const MoodData = MOOD_ICONS[ci.mood];
                const MoodIcon = MoodData?.icon ?? SmileyMeh;
                return (
                  <div key={ci.id} className="card bg-white p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <MoodIcon size={22} className={MoodData?.color ?? "text-secondary-text"} />
                      <div>
                        <p className="font-body font-semibold text-body-sm text-deep-green">{MoodData?.label ?? ci.mood}</p>
                        <p className="font-body text-label-xs text-secondary-text">{formatDate(ci.created_at)} · {formatTime(ci.created_at)}</p>
                      </div>
                      {ci.intensity && (
                        <span className="ml-auto tag tag-outline">{ci.intensity}</span>
                      )}
                    </div>
                    {ci.body_zones?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ci.body_zones.map((z) => (
                          <span key={z} className="tag bg-light-green text-forest-green text-[10px]">{z}</span>
                        ))}
                      </div>
                    )}
                    {ci.note && <p className="font-body text-body-sm text-secondary-text mt-2 italic">&ldquo;{ci.note}&rdquo;</p>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Editor modal */}
      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditor(false)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-sage-border">
                <h3 className="font-heading text-h3 text-deep-green">{editing ? "Editează nota" : "Notă nouă"}</h3>
                <button onClick={() => setShowEditor(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Titlu (opțional)</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Titlu notă..."
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Stare (opțional)</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(MOOD_ICONS).map(([key, { icon: Icon, label, color }]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, mood: f.mood === key ? "" : key }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-label-xs font-body ${
                          form.mood === key ? "border-forest-green bg-light-green text-deep-green" : "border-sage-border hover:border-forest-green/50"
                        }`}
                      >
                        <Icon size={14} className={color} /> {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Conținut</label>
                  <RichTextEditor
                    content={form.content}
                    onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                    placeholder="Scrie gândurile tale..."
                    minHeight="180px"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-sage-border flex gap-3">
                <button onClick={() => setShowEditor(false)} className="btn btn-ghost flex-1">Anulează</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 gap-2">
                  {saving ? <CircleNotch size={14} className="animate-spin" /> : saveOk ? <Check size={14} weight="bold" /> : null}
                  {saving ? "Se salvează..." : saveOk ? "Salvat!" : "Salvează"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
