"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Trash, PencilSimple, CircleNotch, Check, Warning,
  MagnifyingGlass, Anchor, UploadSimple, DownloadSimple,
} from "@phosphor-icons/react";
import {
  CATEGORIE_CONFIG,
  NIVEL_CONFIG,
  type AncoreExercise,
  type AncoreCategorie,
  type AncoreNivel,
} from "@/lib/ancore";

const ALL_CATEGORII: AncoreCategorie[] = ["ALERTĂ", "BLOCATĂ", "OBOSEALĂ", "LINIȘTIRE", "CONECTARE"];
const ALL_NIVELE: AncoreNivel[] = ["SOS", "REGLEAZĂ", "APROFUNDEAZĂ"];

const EMPTY_FORM: Partial<AncoreExercise> & { pasi_text: string; context_text: string } = {
  nume: "",
  categorie: "ALERTĂ",
  nivel: "SOS",
  energie: "",
  durata_sec: 30,
  descriere_scurta: "",
  trigger_text: "",
  pasi_text: "",
  context_text: "",
  ancora_text: "",
  inchidere_text: "",
  stare_interna: "",
  obiectiv_neurofiziologic: "",
  surse_teoretice: "",
  contraindicatii: "",
  v1_selectat: false,
  prioritate: 2,
};

const labelCls = "font-body text-label-xs text-secondary-text uppercase tracking-widest block mb-1.5";
const inputCls = "input w-full";

export default function AdminAncorePage() {
  const [exercises, setExercises] = useState<AncoreExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<"Toate" | AncoreCategorie>("Toate");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AncoreExercise | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AncoreExercise | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function fetchExercises() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ancore");
      const data = await res.json();
      setExercises(data.exercises ?? []);
    } catch {
      setExercises([]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchExercises(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  function openEdit(ex: AncoreExercise) {
    setEditing(ex);
    setForm({
      ...ex,
      pasi_text: ex.pasi.join("\n"),
      context_text: ex.context.join(", "),
    });
    setError(null);
    setShowModal(true);
  }

  function upd(field: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.nume?.trim()) { setError("Numele este obligatoriu"); return; }
    setSaving(true); setError(null);

    const payload: Partial<AncoreExercise> = {
      nume: form.nume,
      categorie: form.categorie,
      nivel: form.nivel,
      energie: form.energie ?? "",
      durata_sec: Number(form.durata_sec) || 30,
      descriere_scurta: form.descriere_scurta ?? "",
      trigger_text: form.trigger_text ?? "",
      pasi: (form.pasi_text ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
      context: (form.context_text ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      ancora_text: form.ancora_text ?? "",
      inchidere_text: form.inchidere_text ?? "",
      stare_interna: form.stare_interna ?? "",
      obiectiv_neurofiziologic: form.obiectiv_neurofiziologic ?? "",
      surse_teoretice: form.surse_teoretice ?? "",
      contraindicatii: form.contraindicatii ?? "",
      v1_selectat: form.v1_selectat ?? false,
      prioritate: Number(form.prioritate) || 2,
      ochi_deschisi: form.ochi_deschisi ?? null,
    };

    const url = editing ? `/api/admin/ancore/${editing.id}` : "/api/admin/ancore";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Eroare la salvare"); setSaving(false); return; }
    await fetchExercises();
    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(ex: AncoreExercise) {
    await fetch(`/api/admin/ancore/${ex.id}`, { method: "DELETE" });
    setExercises((prev) => prev.filter((e) => e.id !== ex.id));
    setDeleteTarget(null);
  }

  function handleExport() {
    const json = JSON.stringify(exercises, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ancore-exercises.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    setImportMsg(null);

    try {
      const text = await file.text();
      let parsed: AncoreExercise[];

      if (file.name.endsWith(".json")) {
        parsed = JSON.parse(text);
      } else {
        // Extract array from .ts file: find content between first [ and last ]
        const match = text.match(/ANCORE_DATA[^=]*=\s*(\[[\s\S]*\]);?\s*$/m) ||
                      text.match(/=\s*(\[[\s\S]+\])\s*;?\s*$/m);
        if (!match) throw new Error("Nu am găsit un array valid în fișier.");
        // eslint-disable-next-line no-new-func
        parsed = new Function("return " + match[1])();
      }

      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Fișierul nu conține exerciții valide.");

      // Send to API — replace all exercises
      const res = await fetch("/api/admin/ancore/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare la import");

      await fetchExercises();
      setImportMsg({ type: "ok", text: `${parsed.length} exerciții importate cu succes.` });
    } catch (err) {
      setImportMsg({ type: "err", text: err instanceof Error ? err.message : "Eroare la import" });
    }
    setImporting(false);
  }

  const filtered = exercises.filter((ex) => {
    if (filterCat !== "Toate" && ex.categorie !== filterCat) return false;
    if (search && !ex.nume.toLowerCase().includes(search.toLowerCase()) && !ex.descriere_scurta.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Ancore</h1>
          <p className="font-body text-body-sm text-secondary-text">{exercises.length} exerciții total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn btn-ghost btn-sm gap-1.5" title="Exportă toate exercițiile ca JSON">
            <DownloadSimple size={14} weight="bold" /> Export
          </button>
          <label className={`btn btn-ghost btn-sm gap-1.5 cursor-pointer ${importing ? "opacity-50 pointer-events-none" : ""}`} title="Importă exerciții din fișier .json sau .ts">
            {importing ? <CircleNotch size={14} className="animate-spin" /> : <UploadSimple size={14} weight="bold" />}
            Import
            <input type="file" accept=".json,.ts" className="hidden" onChange={handleImportFile} disabled={importing} />
          </label>
          <button onClick={openAdd} className="btn btn-primary btn-sm gap-1.5">
            <Plus size={14} weight="bold" /> Exercițiu nou
          </button>
        </div>
      </div>

      {importMsg && (
        <div className={`mb-4 p-3 rounded-xl font-body text-label-xs flex items-center gap-2 ${
          importMsg.type === "ok"
            ? "bg-forest-green/10 border border-forest-green/20 text-forest-green"
            : "bg-red-50 border border-red-200 text-red-600"
        }`}>
          {importMsg.type === "ok" ? <Check size={14} weight="bold" /> : <Warning size={14} />}
          {importMsg.text}
          <button onClick={() => setImportMsg(null)} className="ml-auto"><X size={12} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="card bg-white p-4 mb-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
            <input
              type="search" placeholder="Caută exercițiu..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body focus:outline-none focus:border-forest-green"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterCat("Toate")} className={`filter-pill ${filterCat === "Toate" ? "active" : ""}`}>Toate</button>
            {ALL_CATEGORII.map((c) => (
              <button key={c} onClick={() => setFilterCat(c)}
                className="text-[10px] font-body font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all"
                style={filterCat === c
                  ? { backgroundColor: CATEGORIE_CONFIG[c].bg, color: CATEGORIE_CONFIG[c].text, borderColor: CATEGORIE_CONFIG[c].border }
                  : { backgroundColor: "transparent", color: "#6B7280", borderColor: "#D1D5DB" }}
              >
                {CATEGORIE_CONFIG[c].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><CircleNotch size={24} className="animate-spin text-forest-green" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Anchor size={48} className="text-sage-border mb-4" />
          <p className="font-body font-semibold text-body-md text-deep-green mb-1">
            {exercises.length === 0 ? "Niciun exercițiu" : "Niciun rezultat"}
          </p>
          <p className="font-body text-label-xs text-secondary-text mb-4">
            {exercises.length === 0 ? "Adaugă primul exercițiu." : "Schimbă filtrele."}
          </p>
          {exercises.length === 0 && (
            <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} weight="bold" /> Exercițiu nou</button>
          )}
        </div>
      ) : (
        <div className="card bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sage-border bg-bg-main">
                  <th className="text-left px-4 py-3 font-body text-label-xs text-secondary-text uppercase tracking-widest">ID</th>
                  <th className="text-left px-4 py-3 font-body text-label-xs text-secondary-text uppercase tracking-widest">Nume</th>
                  <th className="text-left px-4 py-3 font-body text-label-xs text-secondary-text uppercase tracking-widest hidden md:table-cell">Categorie</th>
                  <th className="text-left px-4 py-3 font-body text-label-xs text-secondary-text uppercase tracking-widest hidden lg:table-cell">Nivel</th>
                  <th className="text-left px-4 py-3 font-body text-label-xs text-secondary-text uppercase tracking-widest hidden xl:table-cell">Durată</th>
                  <th className="text-left px-4 py-3 font-body text-label-xs text-secondary-text uppercase tracking-widest hidden xl:table-cell">Pași</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ex, i) => {
                  const cat = CATEGORIE_CONFIG[ex.categorie];
                  const niv = NIVEL_CONFIG[ex.nivel];
                  return (
                    <motion.tr key={ex.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-sage-border/50 hover:bg-bg-main/50 transition-colors">
                      <td className="px-4 py-3 font-body text-label-xs text-secondary-text font-mono">{ex.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-body text-body-sm text-deep-green font-medium">{ex.nume}</p>
                          <p className="font-body text-[10px] text-secondary-text line-clamp-1 mt-0.5 hidden sm:block">{ex.descriere_scurta}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-[10px] font-body font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                          style={{ backgroundColor: cat.bg, color: cat.text, borderColor: cat.border }}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-[10px] font-body font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: niv.bg, color: niv.text }}>
                          {niv.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body text-label-xs text-secondary-text hidden xl:table-cell">
                        {ex.durata_sec < 60 ? `${ex.durata_sec}s` : `${Math.round(ex.durata_sec / 60)} min`}
                      </td>
                      <td className="px-4 py-3 font-body text-label-xs text-secondary-text hidden xl:table-cell">
                        {ex.pasi.length}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(ex)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
                            <PencilSimple size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(ex)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-secondary-text hover:text-terracotta transition-colors">
                            <Trash size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[92vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-sage-border">
                <h3 className="font-heading text-h3 text-deep-green">{editing ? `Editează: ${editing.id}` : "Exercițiu nou"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green"><X size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600 flex gap-2">
                    <Warning size={14} className="flex-shrink-0 mt-0.5" />{error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Nume *</label>
                    <input className={inputCls} value={form.nume ?? ""} onChange={(e) => upd("nume", e.target.value)} placeholder="Numele exercițiului" />
                  </div>
                  <div>
                    <label className={labelCls}>Categorie</label>
                    <select className={inputCls} value={form.categorie ?? "ALERTĂ"} onChange={(e) => upd("categorie", e.target.value)}>
                      {ALL_CATEGORII.map((c) => <option key={c} value={c}>{CATEGORIE_CONFIG[c].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Nivel</label>
                    <select className={inputCls} value={form.nivel ?? "SOS"} onChange={(e) => upd("nivel", e.target.value)}>
                      {ALL_NIVELE.map((n) => <option key={n} value={n}>{NIVEL_CONFIG[n].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Durată (secunde)</label>
                    <input type="number" className={inputCls} value={form.durata_sec ?? 30} onChange={(e) => upd("durata_sec", e.target.value)} min={5} />
                  </div>
                  <div>
                    <label className={labelCls}>Energie / Timp afișat</label>
                    <input className={inputCls} value={form.energie ?? ""} onChange={(e) => upd("energie", e.target.value)} placeholder="ex: 30s, 1min" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Context (separate prin virgulă)</label>
                    <input className={inputCls} value={form.context_text ?? ""} onChange={(e) => upd("context_text", e.target.value)} placeholder="Acasă, Birou, Public" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Descriere scurtă</label>
                    <textarea className={`${inputCls} min-h-[60px]`} value={form.descriere_scurta ?? ""} onChange={(e) => upd("descriere_scurta", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Trigger text (introducere)</label>
                    <textarea className={`${inputCls} min-h-[60px]`} value={form.trigger_text ?? ""} onChange={(e) => upd("trigger_text", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Pași (câte un pas pe linie)</label>
                    <textarea className={`${inputCls} min-h-[100px]`} value={form.pasi_text ?? ""} onChange={(e) => upd("pasi_text", e.target.value)} placeholder={"Pasul 1\nPasul 2\nPasul 3"} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Ancora text (final)</label>
                    <textarea className={`${inputCls} min-h-[60px]`} value={form.ancora_text ?? ""} onChange={(e) => upd("ancora_text", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Text închidere</label>
                    <textarea className={`${inputCls} min-h-[60px]`} value={form.inchidere_text ?? ""} onChange={(e) => upd("inchidere_text", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Stare internă</label>
                    <input className={inputCls} value={form.stare_interna ?? ""} onChange={(e) => upd("stare_interna", e.target.value)} placeholder="Furtună, Ceață, Lumină..." />
                  </div>
                  <div>
                    <label className={labelCls}>Prioritate (1-3)</label>
                    <input type="number" className={inputCls} value={form.prioritate ?? 2} onChange={(e) => upd("prioritate", e.target.value)} min={1} max={3} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Obiectiv neurofiziologic</label>
                    <textarea className={`${inputCls} min-h-[60px]`} value={form.obiectiv_neurofiziologic ?? ""} onChange={(e) => upd("obiectiv_neurofiziologic", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Surse teoretice</label>
                    <input className={inputCls} value={form.surse_teoretice ?? ""} onChange={(e) => upd("surse_teoretice", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Contraindicații</label>
                    <input className={inputCls} value={form.contraindicatii ?? ""} onChange={(e) => upd("contraindicatii", e.target.value)} />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-light-green/50 transition-colors border border-sage-border">
                  <input type="checkbox" checked={form.v1_selectat ?? false} onChange={(e) => upd("v1_selectat", e.target.checked)} className="w-4 h-4 accent-forest-green" />
                  <span className="font-body text-body-sm text-on-surface">Selectat pentru V1 (afișat prioritar)</span>
                </label>
              </div>

              <div className="p-5 border-t border-sage-border flex gap-3">
                <button onClick={() => setShowModal(false)} disabled={saving} className="btn btn-ghost flex-1">Anulează</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 gap-2">
                  {saving ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
                  {saving ? "Se salvează..." : (editing ? "Salvează" : "Adaugă exercițiu")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} />
            <motion.div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Warning size={18} className="text-red-600" weight="fill" /></div>
                <div>
                  <h3 className="font-heading text-h3 text-deep-green">Șterge exercițiul</h3>
                  <p className="font-body text-label-xs text-secondary-text">Acțiune ireversibilă</p>
                </div>
              </div>
              <p className="font-body text-body-sm text-on-surface mb-5">
                Ești sigur că vrei să ștergi <strong>{deleteTarget.nume}</strong>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-sm flex-1">Anulează</button>
                <button onClick={() => handleDelete(deleteTarget)} className="flex-1 h-9 rounded-full bg-red-600 text-white font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-700">
                  <Trash size={13} /> Șterge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
