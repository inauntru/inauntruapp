"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Trash, PencilSimple, BookOpen, Smiley, SmileySad,
  SmileyNervous, SmileyMeh, SmileyWink, CircleNotch, Check, ArrowLeft,
  Anchor, ArrowRight,
} from "@phosphor-icons/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { fetchAncoreCompletions } from "@/lib/ancore-sync";

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

interface AncoreEntry {
  id: string;
  name: string;
  categorie: string;
  nivel: string;
  completedAt: string;
}

const CATEGORIE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "ALERTĂ":    { bg: "#E8EEF2", text: "#2E4A5E", border: "#B8CDD8" },
  "BLOCATĂ":   { bg: "#EDEDED", text: "#3A3A3A", border: "#C8C8C8" },
  "OBOSEALĂ":  { bg: "#FBF4E8", text: "#6B4C1E", border: "#E8D8B8" },
  "LINIȘTIRE": { bg: "#F5EBE8", text: "#6B2E22", border: "#E0C8C0" },
  "CONECTARE": { bg: "#E8F0E5", text: "#1E5C30", border: "#B8D8B0" },
};

const NIVEL_COLORS: Record<string, { bg: string; text: string }> = {
  "SOS":          { bg: "#FEE2E2", text: "#991B1B" },
  "REGLEAZĂ":     { bg: "#E0E7FF", text: "#3730A3" },
  "APROFUNDEAZĂ": { bg: "#D1FAE5", text: "#065F46" },
};

const MOOD_ICONS: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  happy:   { icon: Smiley,         label: "Bucuros",   color: "text-forest-green" },
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
  const [tab, setTab] = useState<"note" | "checkins" | "ancore">("note");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInEntry[]>([]);
  const [ancoreHistory, setAncoreHistory] = useState<AncoreEntry[]>([]);
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

    // Ancore din Supabase (migrează automat istoricul vechi din localStorage)
    fetchAncoreCompletions(true)
      .then(list => setAncoreHistory(list as AncoreEntry[]))
      .catch(() => {});
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
        {[
          { id: "note",     label: "Note personale" },
          { id: "checkins", label: "Check-in-uri" },
          { id: "ancore",   label: `Ancore${ancoreHistory.length > 0 ? ` (${ancoreHistory.length})` : ""}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "note" | "checkins" | "ancore")}
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

      {tab === "ancore" && (
        <>
          {ancoreHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Anchor size={48} className="text-sage-border mb-4" />
              <p className="font-heading text-h3 text-deep-green mb-2">Nicio ancoră finalizată încă</p>
              <p className="font-body text-body-sm text-secondary-text mb-5">
                Când completezi o ancoră, aceasta va apărea aici împreună cu progresul tău.
              </p>
              <Link href="/ancore" className="btn btn-primary btn-sm gap-2">
                <Anchor size={14} /> Mergi la Ancore
              </Link>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Total completate", value: ancoreHistory.length },
                  { label: "Categorii diferite", value: new Set(ancoreHistory.map(a => a.categorie)).size },
                  { label: "Luna aceasta", value: ancoreHistory.filter(a => new Date(a.completedAt).getMonth() === new Date().getMonth()).length },
                ].map(s => (
                  <div key={s.label} className="card bg-white p-4 text-center">
                    <p className="font-heading text-2xl font-bold text-deep-green">{s.value}</p>
                    <p className="font-body text-label-xs text-secondary-text mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Category distribution */}
              <div className="card bg-white p-5 mb-6">
                <h3 className="font-body font-semibold text-body-sm text-deep-green mb-4">Pe categorii</h3>
                <div className="space-y-3">
                  {(["ALERTĂ", "BLOCATĂ", "OBOSEALĂ", "LINIȘTIRE", "CONECTARE"] as const).map(cat => {
                    const count = ancoreHistory.filter(a => a.categorie === cat).length;
                    if (count === 0) return null;
                    const colors = CATEGORIE_COLORS[cat];
                    const pct = Math.round((count / ancoreHistory.length) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-body text-label-xs text-secondary-text"
                            style={{ color: colors.text }}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                          <span className="font-body text-label-xs font-bold text-deep-green">{count}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border + "40" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: colors.text }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* History list */}
              <div className="space-y-3">
                {ancoreHistory.map((entry, i) => {
                  const catColors = CATEGORIE_COLORS[entry.categorie] ?? { bg: "#F5F5F5", text: "#555", border: "#DDD" };
                  const nivColors = NIVEL_COLORS[entry.nivel] ?? { bg: "#F5F5F5", text: "#555" };
                  return (
                    <motion.div key={`${entry.id}-${i}`}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="card bg-white p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: catColors.bg }}>
                        <Anchor size={18} style={{ color: catColors.text }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-body-sm text-deep-green truncate">{entry.name}</p>
                        <p className="font-body text-label-xs text-secondary-text">
                          {formatDate(entry.completedAt)} · {formatTime(entry.completedAt)}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <span className="tag text-[10px]" style={{ backgroundColor: catColors.bg, color: catColors.text, borderColor: catColors.border }}>
                          {entry.categorie.charAt(0) + entry.categorie.slice(1).toLowerCase()}
                        </span>
                        <span className="tag text-[10px]" style={{ backgroundColor: nivColors.bg, color: nivColors.text }}>
                          {entry.nivel === "SOS" ? "Rapid" : entry.nivel === "REGLEAZĂ" ? "Reglează" : "Profund"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <Link href="/ancore" className="inline-flex items-center gap-1.5 font-body text-body-sm text-forest-green hover:underline">
                  Deschide Ancore <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </>
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
