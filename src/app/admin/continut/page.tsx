"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MagnifyingGlass, Eye, PencilSimple, Trash, X, FilmSlate,
} from "@phosphor-icons/react";

const DB_CATEGORIES = ["Suflu", "Prezență", "Fluiditate", "Odihnă", "Vitalitate", "Expresie"];
const LEVELS = ["Începător", "Intermediar", "Avansat"];
const MEDIA_TYPES = ["audio", "video"];

interface Practice {
  id: number;
  title: string;
  category: string;
  facilitator_name: string | null;
  facilitator_slug: string | null;
  duration: number;
  level: string;
  is_premium: boolean;
  media_type: string | null;
  image_url: string | null;
  description: string | null;
  tags: string[];
  status: "active" | "draft";
  views_count: number;
}

const EMPTY_FORM = {
  title: "",
  category: "Suflu",
  level: "Începător",
  duration: 10,
  facilitator_name: "",
  facilitator_slug: "",
  is_premium: false,
  media_type: "audio",
  image_url: "",
  description: "",
  tags: "",
  status: "draft" as "active" | "draft",
};

export default function AdminContentPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toate");
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [selected, setSelected] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Practice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchPractices() {
    setLoading(true);
    const res = await fetch("/api/admin/practices");
    if (res.ok) setPractices(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchPractices(); }, []);

  const filtered = practices.filter((c) => {
    if (categoryFilter !== "Toate" && c.category !== categoryFilter) return false;
    if (statusFilter === "Activ" && c.status !== "active") return false;
    if (statusFilter === "Draft" && c.status !== "draft") return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(p: Practice) {
    setEditTarget(p);
    setForm({
      title: p.title,
      category: p.category,
      level: p.level,
      duration: p.duration,
      facilitator_name: p.facilitator_name ?? "",
      facilitator_slug: p.facilitator_slug ?? "",
      is_premium: p.is_premium,
      media_type: p.media_type ?? "audio",
      image_url: p.image_url ?? "",
      description: p.description ?? "",
      tags: p.tags?.join(", ") ?? "",
      status: p.status,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Titlul este obligatoriu"); return; }
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      duration: Number(form.duration),
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      facilitator_slug: form.facilitator_slug || null,
    };
    const url = editTarget ? `/api/admin/practices/${editTarget.id}` : "/api/admin/practices";
    const method = editTarget ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowModal(false);
      fetchPractices();
    } else {
      const data = await res.json();
      setError(data.error ?? "Eroare la salvare");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/practices/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPractices((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteTarget(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Conținut</h1>
          <p className="font-body text-body-sm text-secondary-text">{practices.length} practici totale</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm">
          <Plus size={16} weight="bold" /> Adaugă practică
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-white p-4 mb-4 flex flex-col md:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input
            type="search"
            placeholder="Caută practici..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body focus:outline-none focus:border-forest-green"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Toate", ...DB_CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={`filter-pill ${categoryFilter === c ? "active" : ""}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {["Toate", "Activ", "Draft"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`filter-pill ${statusFilter === s ? "active" : ""}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card bg-forest-green text-white p-3 mb-4 flex items-center gap-4"
          >
            <span className="font-body text-body-sm font-semibold">{selected.length} selectate</span>
            <button onClick={() => setSelected([])} className="ml-auto p-1.5 hover:bg-white/20 rounded-lg">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="card bg-white overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-body text-secondary-text">Se încarcă...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-light-green rounded-2xl flex items-center justify-center mb-4">
              <FilmSlate size={28} className="text-forest-green" />
            </div>
            <h3 className="font-heading text-h3 text-deep-green mb-2">Nicio practică găsită</h3>
            <p className="font-body text-body-sm text-secondary-text mb-4">
              {search || categoryFilter !== "Toate" ? "Modifică filtrele sau" : "Adaugă prima ta"} practică.
            </p>
            <button onClick={openAdd} className="btn btn-primary btn-sm">
              <Plus size={14} weight="bold" /> Adaugă practică
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="w-8">
                    <input
                      type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map((c) => c.id))}
                      className="w-4 h-4 accent-forest-green"
                    />
                  </th>
                  <th>Practică</th>
                  <th>Categorie</th>
                  <th>Facilitator</th>
                  <th>Status</th>
                  <th>Vizionări</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className={selected.includes(c.id) ? "bg-light-green/50" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="w-4 h-4 accent-forest-green"
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-light-green rounded-lg flex-shrink-0 flex items-center justify-center">
                          <FilmSlate size={14} weight="regular" className="text-forest-green" />
                        </div>
                        <span className="font-body text-body-sm font-medium text-deep-green line-clamp-1 max-w-[200px]">{c.title}</span>
                      </div>
                    </td>
                    <td><span className="tag tag-green">{c.category}</span></td>
                    <td className="text-secondary-text font-body text-body-sm">{c.facilitator_name ?? "—"}</td>
                    <td>
                      <span className={`tag ${c.status === "active" ? "bg-forest-green/10 text-forest-green border-forest-green/20 border" : "tag-outline"}`}>
                        {c.status === "active" ? "Activ" : "Draft"}
                      </span>
                    </td>
                    <td className="font-body text-body-sm text-deep-green font-semibold">{(c.views_count ?? 0).toLocaleString("ro-RO")}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green transition-colors text-secondary-text hover:text-forest-green"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-secondary-text hover:text-terracotta"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Practice Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-h3 text-deep-green">
                  {editTarget ? "Editează practica" : "Adaugă practică nouă"}
                </h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Titlu practică *</label>
                  <input
                    type="text"
                    placeholder="ex: Respirație pentru anxietate"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Categorie</label>
                  <select className="input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {DB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Nivel</label>
                  <select className="input w-full" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Tip media</label>
                  <select className="input w-full" value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value })}>
                    {MEDIA_TYPES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Durată (minute)</label>
                  <input
                    type="number"
                    placeholder="10"
                    min="1"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Facilitator</label>
                  <input
                    type="text"
                    placeholder="Numele facilitatorului"
                    value={form.facilitator_name}
                    onChange={(e) => setForm({ ...form, facilitator_name: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">URL imagine</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Descriere</label>
                  <textarea
                    className="input w-full min-h-[80px]"
                    placeholder="Descriere scurtă..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Taguri (separate prin virgulă)</label>
                  <input
                    type="text"
                    placeholder="Anxietate, Relaxare, Respirație"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-forest-green"
                      checked={form.is_premium}
                      onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                    />
                    <span className="font-body text-body-sm text-on-surface">Premium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-forest-green"
                      checked={form.status === "active"}
                      onChange={(e) => setForm({ ...form, status: e.target.checked ? "active" : "draft" })}
                    />
                    <span className="font-body text-body-sm text-on-surface">Publicat</span>
                  </label>
                </div>
              </div>

              {error && (
                <p className="mt-4 font-body text-body-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Anulează</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 disabled:opacity-50">
                  {saving ? "Se salvează..." : "Salvează practica"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash size={20} className="text-terracotta" />
              </div>
              <h3 className="font-heading text-h3 text-deep-green mb-2">Ștergi practica?</h3>
              <p className="font-body text-body-sm text-secondary-text mb-6">Această acțiune nu poate fi anulată.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost flex-1">Anulează</button>
                <button onClick={() => handleDelete(deleteTarget)} className="btn flex-1 bg-terracotta text-white hover:bg-terracotta/90">
                  Șterge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
