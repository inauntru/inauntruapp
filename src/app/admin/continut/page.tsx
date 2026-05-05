"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MagnifyingGlass, Eye, PencilSimple, Trash, X, Check, FilmSlate,
  Upload, ToggleLeft, ToggleRight,
} from "@phosphor-icons/react";
import { ADMIN_CONTENT } from "@/lib/mockData";

const CATEGORIES = ["Toate", "Respirație", "Corp", "Mișcare", "Somn", "Energie", "Voce"];
const STATUSES = ["Toate", "Activ", "Draft"];

type ContentItem = typeof ADMIN_CONTENT[0];

export default function AdminContentPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toate");
  const [status, setStatus] = useState("Toate");
  const [selected, setSelected] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const filtered = ADMIN_CONTENT.filter((c) => {
    if (category !== "Toate" && c.category !== category) return false;
    if (status !== "Toate" && ((status === "Activ" && c.status !== "active") || (status === "Draft" && c.status !== "draft"))) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Conținut</h1>
          <p className="font-body text-body-sm text-secondary-text">{ADMIN_CONTENT.length} practici totale</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} weight="bold" /> Adaugă practică
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-white p-4 mb-4 flex flex-col md:flex-row gap-3">
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
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`filter-pill ${category === c ? "active" : ""}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`filter-pill ${status === s ? "active" : ""}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card bg-forest-green text-white p-3 mb-4 flex items-center gap-4"
          >
            <span className="font-body text-body-sm font-semibold">{selected.length} selectate</span>
            <div className="flex gap-2 ml-auto">
              <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-body text-label-xs transition-colors">Publică</button>
              <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-body text-label-xs transition-colors">Arhivează</button>
              <button className="px-3 py-1.5 bg-red-500/30 hover:bg-red-500/40 rounded-lg font-body text-label-xs transition-colors">Șterge</button>
              <button onClick={() => setSelected([])} className="ml-2 p-1.5 hover:bg-white/20 rounded-lg">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="card bg-white overflow-hidden">
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
                <th>Rating</th>
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
                  <td className="text-secondary-text font-body text-body-sm">{c.facilitator}</td>
                  <td>
                    <span className={`tag ${c.status === "active" ? "bg-forest-green/10 text-forest-green border-forest-green/20 border" : "tag-outline"}`}>
                      {c.status === "active" ? "Activ" : "Draft"}
                    </span>
                  </td>
                  <td className="font-body text-body-sm text-deep-green font-semibold">{c.views.toLocaleString("ro-RO")}</td>
                  <td>
                    {c.rating > 0 ? (
                      <span className="flex items-center gap-1 font-body text-label-xs">
                        <span className="text-terracotta">★</span>
                        <span className="font-semibold text-deep-green">{c.rating}</span>
                      </span>
                    ) : (
                      <span className="text-secondary-text text-label-xs">—</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green transition-colors text-secondary-text hover:text-forest-green">
                        <Eye size={14} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green transition-colors text-secondary-text hover:text-forest-green">
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
      </div>

      {/* Add Practice Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-h3 text-deep-green">Adaugă practică nouă</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Titlu practică</label>
                  <input type="text" placeholder="ex: Respirație pentru anxietate" className="input w-full" />
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Categorie</label>
                  <select className="input w-full">
                    {["Respirație", "Corp", "Mișcare", "Somn", "Energie", "Voce"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Nivel</label>
                  <select className="input w-full">
                    {["Începător", "Intermediar", "Avansat"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">URL Video</label>
                  <input type="url" placeholder="https://..." className="input w-full" />
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Durată (minute)</label>
                  <input type="number" placeholder="10" min="1" className="input w-full" />
                </div>
                <div className="col-span-2">
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Facilitator</label>
                  <select className="input w-full">
                    {["Dr. Ana Ionescu", "Mihai Pop", "Elena Stan", "Cristian Dima"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Descriere</label>
                  <textarea className="input w-full min-h-[80px]" placeholder="Descriere scurtă a practicii..." />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-forest-green" />
                    <span className="font-body text-body-sm text-on-surface">Premium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-forest-green" defaultChecked />
                    <span className="font-body text-body-sm text-on-surface">Publicat</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Anulează</button>
                <button className="btn btn-primary flex-1">Salvează practica</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
