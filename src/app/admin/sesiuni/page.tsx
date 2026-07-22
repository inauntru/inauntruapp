"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CalendarBlank, Clock, Users, VideoCamera, X, PencilSimple, Trash } from "@phosphor-icons/react";

interface LiveSession {
  id: number;
  title: string;
  facilitator_name: string | null;
  scheduled_at: string;
  duration: number;
  spots_total: number;
  spots_left: number;
  is_premium: boolean;
  meeting_url: string | null;
  status: string;
}

interface Participant {
  name: string;
  email: string;
  plan: string;
  registeredAt: string;
}

const EMPTY_FORM = {
  title: "",
  facilitator_name: "",
  date: "",
  time: "",
  duration: 60,
  spots_total: 25,
  is_premium: false,
  meeting_url: "",
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<LiveSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [participantsFor, setParticipantsFor] = useState<LiveSession | null>(null);
  const [participants, setParticipants] = useState<Participant[] | null>(null);

  async function openParticipants(s: LiveSession) {
    setParticipantsFor(s);
    setParticipants(null);
    const res = await fetch(`/api/admin/sessions/${s.id}/registrations`);
    if (res.ok) {
      const data = await res.json();
      setParticipants(data.participants ?? []);
    } else {
      setParticipants([]);
    }
  }

  async function fetchSessions() {
    setLoading(true);
    const res = await fetch("/api/admin/sessions");
    if (res.ok) setSessions(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchSessions(); }, []);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(s: LiveSession) {
    setEditTarget(s);
    const dt = new Date(s.scheduled_at);
    setForm({
      title: s.title,
      facilitator_name: s.facilitator_name ?? "",
      date: dt.toISOString().split("T")[0],
      time: dt.toTimeString().slice(0, 5),
      duration: s.duration,
      spots_total: s.spots_total,
      is_premium: s.is_premium,
      meeting_url: s.meeting_url ?? "",
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date || !form.time) {
      setError("Titlul, data și ora sunt obligatorii");
      return;
    }
    setSaving(true);
    setError("");
    const scheduled_at = new Date(`${form.date}T${form.time}:00`).toISOString();
    const payload = {
      title: form.title,
      facilitator_name: form.facilitator_name || null,
      scheduled_at,
      duration: Number(form.duration),
      spots_total: Number(form.spots_total),
      spots_left: editTarget ? editTarget.spots_left : Number(form.spots_total),
      is_premium: form.is_premium,
      meeting_url: form.meeting_url || null,
    };

    const url = editTarget ? `/api/admin/sessions/${editTarget.id}` : "/api/admin/sessions";
    const method = editTarget ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowModal(false);
      fetchSessions();
    } else {
      const data = await res.json();
      setError(data.error ?? "Eroare la salvare");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Sesiuni LIVE</h1>
          <p className="font-body text-body-sm text-secondary-text">
            {loading ? "Se încarcă..." : `${sessions.length} sesiuni programate`}
          </p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm">
          <Plus size={16} weight="bold" /> Adaugă sesiune
        </button>
      </div>

      {/* Sessions list */}
      {!loading && sessions.length === 0 ? (
        <div className="card bg-white p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-light-green rounded-2xl flex items-center justify-center mb-4">
            <VideoCamera size={28} className="text-forest-green" />
          </div>
          <h3 className="font-heading text-h3 text-deep-green mb-2">Nicio sesiune programată</h3>
          <p className="font-body text-body-sm text-secondary-text max-w-sm mb-6">
            Adaugă prima sesiune LIVE cu un facilitator.
          </p>
          <button onClick={openAdd} className="btn btn-primary btn-sm">
            <Plus size={14} weight="bold" /> Adaugă prima sesiune
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => {
            const dt = new Date(s.scheduled_at);
            const booked = s.spots_total - s.spots_left;
            return (
              <div key={s.id} className="card bg-white p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-light-green rounded-xl flex-shrink-0 flex items-center justify-center">
                  <VideoCamera size={20} className="text-forest-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-body font-semibold text-body-sm text-deep-green line-clamp-1">{s.title}</h3>
                    {s.is_premium && <span className="tag tag-green text-xs">Premium</span>}
                    <span className={`tag text-xs ${s.status === "live" ? "bg-red-100 text-red-600 border-red-200 border" : "bg-forest-green/10 text-forest-green border-forest-green/20 border"}`}>
                      {s.status === "live" ? "LIVE" : s.status === "upcoming" ? "Programat" : s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-body text-label-xs text-secondary-text">
                    <span className="flex items-center gap-1"><CalendarBlank size={12} />{dt.toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{dt.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })} · {s.duration} min</span>
                    <button
                      onClick={() => openParticipants(s)}
                      className="flex items-center gap-1 hover:text-forest-green transition-colors underline decoration-dotted underline-offset-2"
                      title="Vezi participanții"
                    >
                      <Users size={12} />{booked}/{s.spots_total} înscriși
                    </button>
                    {s.facilitator_name && <span>{s.facilitator_name}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green transition-colors text-secondary-text hover:text-forest-green"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-secondary-text hover:text-terracotta"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Session Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-modal w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-h3 text-deep-green">
                  {editTarget ? "Editează sesiunea" : "Adaugă sesiune nouă"}
                </h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Titlu sesiune *</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="ex: Reglare somatică de grup"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Facilitator</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Numele facilitatorului"
                    value={form.facilitator_name}
                    onChange={(e) => setForm({ ...form, facilitator_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-label-sm text-on-surface mb-1.5 block">Data *</label>
                    <input
                      type="date"
                      className="input w-full"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-body text-label-sm text-on-surface mb-1.5 block">Ora *</label>
                    <input
                      type="time"
                      className="input w-full"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-label-sm text-on-surface mb-1.5 block">Durată (minute)</label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="60"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="font-body text-label-sm text-on-surface mb-1.5 block">Locuri maxime</label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="25"
                      value={form.spots_total}
                      onChange={(e) => setForm({ ...form, spots_total: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Link Zoom / Meet</label>
                  <input
                    type="url"
                    className="input w-full"
                    placeholder="https://zoom.us/j/..."
                    value={form.meeting_url}
                    onChange={(e) => setForm({ ...form, meeting_url: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-forest-green"
                    checked={form.is_premium}
                    onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                  />
                  <span className="font-body text-body-sm text-on-surface">Doar pentru abonați Premium</span>
                </label>
              </div>

              {error && (
                <p className="mt-4 font-body text-body-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn btn-ghost flex-1">Anulează</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 disabled:opacity-50">
                  {saving ? "Se salvează..." : "Salvează sesiunea"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Participants modal */}
      <AnimatePresence>
        {participantsFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setParticipantsFor(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-md max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 pb-4 border-b border-sage-border/40">
                <div>
                  <h3 className="font-heading text-h3 text-deep-green">Participanți</h3>
                  <p className="font-body text-label-xs text-secondary-text line-clamp-1">{participantsFor.title}</p>
                </div>
                <button onClick={() => setParticipantsFor(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green flex-shrink-0"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 pt-4">
                {participants === null ? (
                  <p className="font-body text-body-sm text-secondary-text text-center py-8">Se încarcă...</p>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-light-green rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users size={20} className="text-forest-green" />
                    </div>
                    <p className="font-body text-body-sm text-secondary-text">Nicio înscriere încă.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {participants.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-sage-border/40">
                        <div className="w-9 h-9 rounded-full bg-forest-green flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {p.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-body-sm text-deep-green truncate">{p.name}</p>
                          <p className="font-body text-label-xs text-secondary-text truncate">{p.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="tag tag-green text-[10px] capitalize">{p.plan}</span>
                          <p className="font-body text-[10px] text-secondary-text mt-1">
                            {new Date(p.registeredAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {participants !== null && participants.length > 0 && (
                <div className="p-4 border-t border-sage-border/40 text-center">
                  <p className="font-body text-label-xs text-secondary-text">
                    {participants.length} {participants.length === 1 ? "participant înscris" : "participanți înscriși"} · {participantsFor.spots_left} locuri libere
                  </p>
                </div>
              )}
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
              <h3 className="font-heading text-h3 text-deep-green mb-2">Ștergi sesiunea?</h3>
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
