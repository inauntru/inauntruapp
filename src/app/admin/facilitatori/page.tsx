"use client";

/**
 * Admin → Facilitatori. Aceleași obiceiuri ca la blog: listă cu carduri,
 * fereastră de editare, ștergere cu confirmare. Poza se pune cu „Urcă" sau
 * se alege din Library.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Trash, PencilSimple, CircleNotch, Warning,
  UsersThree, MagnifyingGlass, Eye, EyeSlash,
} from "@phosphor-icons/react";
import ImageUploadField from "@/components/ui/ImageUploadField";

interface Facilitator {
  id: number;
  slug: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
  sessions_count: number | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  name: "", specialty: "", bio: "", image_url: "", tags: "",
  sessions_count: "0", is_active: true,
};

export default function AdminFacilitatoriPage() {
  const [items, setItems] = useState<Facilitator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Toți");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Facilitator | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Facilitator | null>(null);

  async function fetchItems() {
    setLoading(true);
    const res = await fetch("/api/admin/facilitators");
    const data = await res.json();
    setItems(data.facilitators ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  function openEdit(f: Facilitator) {
    setEditing(f);
    setForm({
      name: f.name,
      specialty: f.specialty ?? "",
      bio: f.bio ?? "",
      image_url: f.image_url ?? "",
      tags: (f.tags ?? []).join(", "),
      sessions_count: String(f.sessions_count ?? 0),
      is_active: f.is_active,
    });
    setError(null);
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { setError("Numele este obligatoriu"); return; }
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      bio: form.bio.trim(),
      image_url: form.image_url.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      sessions_count: Number(form.sessions_count) || 0,
      is_active: form.is_active,
    };

    const res = editing
      ? await fetch(`/api/admin/facilitators/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/facilitators", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });

    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Salvarea a eșuat"); return; }
    setShowModal(false);
    fetchItems();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/facilitators/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchItems();
  }

  /** Comutare rapidă activ/ascuns, direct din card. */
  async function toggleActive(f: Facilitator) {
    await fetch(`/api/admin/facilitators/${f.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !f.is_active, name: f.name }),
    });
    fetchItems();
  }

  const filtered = items.filter((f) => {
    if (filter === "Activi" && !f.is_active) return false;
    if (filter === "Ascunși" && f.is_active) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const labelCls = "font-body text-label-xs text-secondary-text uppercase tracking-widest block mb-1.5";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Antet */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Facilitatori</h1>
          <p className="font-body text-body-sm text-secondary-text">
            {items.length} în total · {items.filter((f) => f.is_active).length} vizibili pe site
          </p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm gap-1.5">
          <Plus size={14} weight="bold" /> Facilitator nou
        </button>
      </div>

      {/* Filtre */}
      <div className="card bg-white p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input
            type="search" placeholder="Caută după nume..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body focus:outline-none focus:border-forest-green"
          />
        </div>
        <div className="flex gap-2">
          {["Toți", "Activi", "Ascunși"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? "active" : ""}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Listă */}
      {loading ? (
        <div className="flex justify-center py-16"><CircleNotch size={24} className="animate-spin text-forest-green" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UsersThree size={48} className="text-sage-border mb-4" />
          <p className="font-body font-semibold text-body-md text-deep-green mb-1">
            {items.length === 0 ? "Niciun facilitator" : "Niciun rezultat"}
          </p>
          <p className="font-body text-label-xs text-secondary-text mb-4">
            {items.length === 0 ? "Adaugă primul facilitator care apare pe site." : "Schimbă filtrele."}
          </p>
          {items.length === 0 && (
            <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} weight="bold" /> Facilitator nou</button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card bg-white p-5 flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-light-green flex-shrink-0">
                {f.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UsersThree size={20} className="text-sage-border" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`tag text-[10px] ${f.is_active ? "bg-forest-green/10 text-forest-green border-forest-green/20 border" : "tag-outline"}`}>
                    {f.is_active ? "Vizibil" : "Ascuns"}
                  </span>
                </div>
                <h3 className="font-body font-semibold text-body-sm text-deep-green truncate">{f.name}</h3>
                {f.specialty && <p className="font-body text-label-xs text-secondary-text truncate">{f.specialty}</p>}
                {f.bio && <p className="font-body text-label-xs text-secondary-text line-clamp-2 mt-1">{f.bio}</p>}

                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="font-body text-[10px] text-secondary-text truncate">
                    {(f.tags ?? []).slice(0, 3).join(" · ") || "fără etichete"}
                  </p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(f)}
                      title={f.is_active ? "Ascunde de pe site" : "Arată pe site"}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors"
                    >
                      {f.is_active ? <Eye size={13} /> : <EyeSlash size={13} />}
                    </button>
                    <button onClick={() => openEdit(f)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
                      <PencilSimple size={13} />
                    </button>
                    <button onClick={() => setDeleteTarget(f)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-secondary-text hover:text-terracotta transition-colors">
                      <Trash size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Fereastra de editare */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[92vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-sage-border">
                <h3 className="font-heading text-h3 text-deep-green">{editing ? "Editează facilitator" : "Facilitator nou"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green"><X size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600 flex gap-2">
                    <Warning size={14} className="flex-shrink-0 mt-0.5" />{error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nume *</label>
                    <input className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ana Ionescu" />
                  </div>
                  <div>
                    <label className={labelCls}>Specialitate</label>
                    <input className="input w-full" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Terapie Somatică" />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Descriere</label>
                  <textarea
                    className="input w-full" rows={3} value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Facilitator certificat cu 8 ani experiență..."
                  />
                </div>

                <div>
                  <label className={labelCls}>Fotografie</label>
                  <ImageUploadField value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
                </div>

                <div>
                  <label className={labelCls}>Etichete (separate prin virgulă)</label>
                  <input className="input w-full" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Anxietate, Traumă, Respirație" />
                </div>

                <div>
                  <label className={labelCls}>Număr sesiuni afișat</label>
                  <input className="input w-full" type="number" min="0" value={form.sessions_count} onChange={(e) => setForm({ ...form, sessions_count: e.target.value })} />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox" checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 accent-forest-green"
                  />
                  <span className="font-body text-body-sm text-deep-green">Vizibil pe site</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-sage-border">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Anulează</button>
                <button onClick={save} disabled={saving} className="btn btn-primary btn-sm gap-1.5 disabled:opacity-50">
                  {saving && <CircleNotch size={14} className="animate-spin" />}
                  {saving ? "Se salvează..." : "Salvează"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmare ștergere */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} />
            <motion.div
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm p-6 text-center"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            >
              <Warning size={32} className="mx-auto text-terracotta mb-3" />
              <h3 className="font-heading text-h4 text-deep-green mb-2">Ștergi facilitatorul?</h3>
              <p className="font-body text-body-sm text-secondary-text mb-5">
                <strong>{deleteTarget.name}</strong> dispare definitiv de pe site. Dacă vrei doar să nu mai apară o perioadă, folosește mai bine ascunderea.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary btn-sm flex-1">Anulează</button>
                <button onClick={confirmDelete} className="btn btn-sm flex-1 bg-terracotta text-white hover:opacity-90">Șterge</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
