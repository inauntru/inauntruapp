"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass, PencilSimple, Envelope, ArrowLeft,
  DotsThreeVertical, Lock, Plus, X, Check, ShieldCheck,
  Plant, UserCircle, CaretDown,
} from "@phosphor-icons/react";
import { type AdminUser, type UserRole } from "@/lib/mockData";
import { useUsers } from "@/contexts/UsersContext";

// ── constants ──────────────────────────────────────────────────────────────

const PLAN_FILTERS = ["Toți", "Gratuit", "Premium", "Premium+"];
const ROLE_FILTERS = ["Toți", "Utilizatori", "Facilitatori", "Admini"];

const PLAN_TAG: Record<string, string> = {
  "Premium+": "bg-deep-green/10 text-deep-green border border-deep-green/20",
  "Premium":  "bg-forest-green/10 text-forest-green border border-forest-green/20",
  "Gratuit":  "bg-sage-border/40 text-secondary-text border border-sage-border",
};

const ROLE_META: Record<UserRole, { label: string; color: string; icon: React.ElementType }> = {
  user:        { label: "Utilizator",  color: "bg-sage-border/40 text-secondary-text border border-sage-border", icon: UserCircle },
  facilitator: { label: "Facilitator", color: "bg-forest-green/10 text-forest-green border border-forest-green/20", icon: Plant },
  moderator:   { label: "Moderator",   color: "bg-blue-50 text-blue-600 border border-blue-200", icon: ShieldCheck },
  editor:      { label: "Editor",      color: "bg-amber-50 text-amber-700 border border-amber-200", icon: ShieldCheck },
  super_admin: { label: "Super Admin", color: "bg-deep-green/10 text-deep-green border border-deep-green/20", icon: ShieldCheck },
};

const ADMIN_ROLES: UserRole[] = ["moderator", "editor", "super_admin"];

// ── mock enrichment ────────────────────────────────────────────────────────

function deriveUserDetail(u: AdminUser) {
  const sessions = Math.round(u.checkIns * 0.9);
  const minutes = sessions * 18;
  const streak = Math.min(Math.round(u.checkIns * 0.15), 21);

  const subscriptions =
    u.plan === "Premium+"
      ? [
          { date: "15 Iun 2024", plan: "Premium+", amount: "149 RON", status: "COMPLETAT" },
          { date: "15 Mai 2024", plan: "Premium+", amount: "149 RON", status: "COMPLETAT" },
          { date: "15 Apr 2024", plan: "Standard",  amount: "89 RON",  status: "COMPLETAT" },
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
    { date: "14 Iunie, 2024", text: "Astăzi m-am simțit mult mai prezentă în timpul meditației de dimineață. Am observat o ușoară rezistență în umeri, dar am reușit să respir prin..." },
    { date: "11 Iunie, 2024", text: 'O zi dificilă la muncă, dar sesiunea de 5 minute de "Grounding" din pauza de prânz mi-a schimbat complet starea. Simt că încep să...' },
  ];

  const somaticQuote = u.id % 2 === 0
    ? '"Simt o tensiune ușoară în zona pieptului, dar picioarele sunt mult mai ancorate astăzi."'
    : '"Respir mai ușor. Umerii sunt mai relaxați. Mă simt prezentă în corp."';

  return { sessions, minutes, streak, subscriptions, practices_list, journal, somaticQuote };
}

// ── add user modal ─────────────────────────────────────────────────────────

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (user: AdminUser) => void;
}

function AddUserModal({ onClose, onAdd }: AddUserModalProps) {
  const [form, setForm] = useState({
    name: "", email: "", plan: "Gratuit" as string,
    role: "user" as UserRole,
    facTitle: "", facBio: "", facSpecialties: "", facPhoto: "",
  });

  const isFacilitator = form.role === "facilitator";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const initials = form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const newUser: AdminUser = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      plan: form.plan,
      joinDate: new Date().toISOString().slice(0, 10),
      lastActive: new Date().toISOString().slice(0, 10),
      checkIns: 0,
      avatar: initials,
      role: form.role,
      ...(isFacilitator && {
        facilitatorProfile: {
          title: form.facTitle,
          bio: form.facBio,
          specialties: form.facSpecialties.split(",").map((s) => s.trim()).filter(Boolean),
          photo: form.facPhoto,
        },
      }),
    };
    onAdd(newUser);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.22 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-border">
          <h2 className="font-heading text-h3 text-deep-green">Adaugă utilizator</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green text-secondary-text hover:text-deep-green transition-colors">
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-label-sm text-on-surface mb-1.5">Nume complet *</label>
              <input required type="text" className="input w-full" placeholder="ex: Ana Ionescu"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block font-body text-label-sm text-on-surface mb-1.5">Email *</label>
              <input required type="email" className="input w-full" placeholder="ana@exemplu.ro"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="block font-body text-label-sm text-on-surface mb-1.5">Plan abonament</label>
            <select className="input w-full" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              <option>Gratuit</option>
              <option>Premium</option>
              <option>Premium+</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block font-body text-label-sm text-on-surface mb-1.5">Rol</label>
            <select className="input w-full" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              <option value="user">Utilizator</option>
              <option value="facilitator">Facilitator</option>
              <option value="moderator">Admin — Moderator</option>
              <option value="editor">Admin — Editor</option>
              <option value="super_admin">Admin — Super Admin</option>
            </select>
            {ADMIN_ROLES.includes(form.role) && (
              <p className="font-body text-label-xs text-secondary-text mt-1.5">
                Utilizatorul va primi acces la panoul de administrare cu rolul de {ROLE_META[form.role].label}.
              </p>
            )}
          </div>

          {/* Facilitator profile (conditional) */}
          <AnimatePresence>
            {isFacilitator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border border-sage-border rounded-xl p-4 space-y-4 bg-light-green/30">
                  <p className="font-body text-label-xs font-semibold text-forest-green uppercase tracking-widest">Profil facilitator</p>
                  <div>
                    <label className="block font-body text-label-sm text-on-surface mb-1.5">Titlu profesional</label>
                    <input type="text" className="input w-full" placeholder="ex: Terapeut Somatic Certificat"
                      value={form.facTitle} onChange={(e) => setForm({ ...form, facTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-body text-label-sm text-on-surface mb-1.5">Bio scurtă</label>
                    <textarea className="input w-full min-h-[80px]" placeholder="Descriere scurtă a facilitatorului..."
                      value={form.facBio} onChange={(e) => setForm({ ...form, facBio: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-body text-label-sm text-on-surface mb-1.5">Specializări (separate prin virgulă)</label>
                    <input type="text" className="input w-full" placeholder="ex: Anxietate, Traumă, Burnout"
                      value={form.facSpecialties} onChange={(e) => setForm({ ...form, facSpecialties: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-body text-label-sm text-on-surface mb-1.5">URL fotografie</label>
                    <input type="url" className="input w-full" placeholder="https://..."
                      value={form.facPhoto} onChange={(e) => setForm({ ...form, facPhoto: e.target.value })} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">Anulează</button>
            <button type="submit" className="btn btn-primary btn-sm gap-2">
              <Check size={14} weight="bold" /> Adaugă utilizator
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── role badge ─────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const meta = ROLE_META[role];
  if (role === "user") return null;
  return (
    <span className={`tag text-[10px] ${meta.color}`}>{meta.label}</span>
  );
}

// ── list view ──────────────────────────────────────────────────────────────

interface ListViewProps {
  users: AdminUser[];
  onSelect: (u: AdminUser) => void;
  onAdd: () => void;
}

function ListView({ users, onSelect, onAdd }: ListViewProps) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("Toți");
  const [roleFilter, setRoleFilter] = useState("Toți");

  const filtered = users.filter((u) => {
    if (planFilter !== "Toți" && u.plan !== planFilter) return false;
    if (roleFilter === "Utilizatori" && u.role !== "user") return false;
    if (roleFilter === "Facilitatori" && u.role !== "facilitator") return false;
    if (roleFilter === "Admini" && !ADMIN_ROLES.includes(u.role)) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalUsers = users.filter((u) => u.role === "user").length;
  const totalFacilitators = users.filter((u) => u.role === "facilitator").length;
  const totalAdmins = users.filter((u) => ADMIN_ROLES.includes(u.role)).length;
  const totalPremium = users.filter((u) => u.plan !== "Gratuit").length;

  return (
    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Utilizatori</h1>
          <p className="font-body text-body-sm text-secondary-text">{users.length} înregistrați total</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-sm">Export CSV</button>
          <button onClick={onAdd} className="btn btn-primary btn-sm gap-2">
            <Plus size={14} weight="bold" /> Adaugă utilizator
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Utilizatori", value: totalUsers.toString() },
          { label: "Facilitatori", value: totalFacilitators.toString() },
          { label: "Admini", value: totalAdmins.toString() },
          { label: "Abonați", value: totalPremium.toString() },
        ].map((s) => (
          <div key={s.label} className="card bg-white p-4">
            <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-heading text-2xl font-bold text-deep-green">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card bg-white p-4 mb-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
            <input type="search" placeholder="Caută după nume sau email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body focus:outline-none focus:border-forest-green" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {PLAN_FILTERS.map((p) => (
              <button key={p} onClick={() => setPlanFilter(p)} className={`filter-pill ${planFilter === p ? "active" : ""}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`filter-pill ${roleFilter === r ? "active" : ""}`}>{r}</button>
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
                <th>Rol</th>
                <th>Plan</th>
                <th>Înregistrat</th>
                <th>Ultima activitate</th>
                <th>Check-in-uri</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="cursor-pointer" onClick={() => onSelect(u)}>
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
                    <RoleBadge role={u.role} />
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-body text-body-sm text-secondary-text">Niciun utilizator găsit</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ── role management card ───────────────────────────────────────────────────

interface RoleCardProps {
  user: AdminUser;
  onSave: (updates: Partial<AdminUser>) => void;
}

function RoleCard({ user, onSave }: RoleCardProps) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [facTitle, setFacTitle] = useState(user.facilitatorProfile?.title ?? "");
  const [facBio, setFacBio] = useState(user.facilitatorProfile?.bio ?? "");
  const [facSpecialties, setFacSpecialties] = useState(user.facilitatorProfile?.specialties.join(", ") ?? "");
  const [facPhoto, setFacPhoto] = useState(user.facilitatorProfile?.photo ?? "");
  const [saved, setSaved] = useState(false);

  const isFacilitator = role === "facilitator";
  const isAdmin = ADMIN_ROLES.includes(role);
  const hasChanged = role !== user.role;

  function handleSave() {
    const updates: Partial<AdminUser> = { role };
    if (isFacilitator) {
      updates.facilitatorProfile = {
        title: facTitle,
        bio: facBio,
        specialties: facSpecialties.split(",").map((s) => s.trim()).filter(Boolean),
        photo: facPhoto,
      };
    }
    onSave(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="card bg-white p-5">
      <h3 className="font-heading text-body-md text-deep-green font-semibold mb-4">Rol în platformă</h3>

      <div className="space-y-4">
        <div>
          <label className="block font-body text-label-sm text-on-surface mb-1.5">Rol</label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="input w-full appearance-none pr-8"
            >
              <option value="user">Utilizator</option>
              <option value="facilitator">Facilitator</option>
              <option value="moderator">Admin — Moderator</option>
              <option value="editor">Admin — Editor</option>
              <option value="super_admin">Admin — Super Admin</option>
            </select>
            <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
          </div>
        </div>

        {/* Admin info */}
        <AnimatePresence>
          {isAdmin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <ShieldCheck size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="font-body text-label-xs text-blue-700">
                  Utilizatorul va primi acces la panoul de administrare. Nivelul de permisiuni poate fi ajustat ulterior din <strong>Setări → Admini</strong>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Facilitator profile */}
        <AnimatePresence>
          {isFacilitator && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="border border-sage-border rounded-xl p-4 space-y-3 bg-light-green/30">
                <p className="font-body text-label-xs font-semibold text-forest-green uppercase tracking-widest">Profil facilitator</p>
                <div>
                  <label className="block font-body text-label-sm text-on-surface mb-1.5">Titlu profesional</label>
                  <input type="text" className="input w-full" placeholder="ex: Terapeut Somatic Certificat"
                    value={facTitle} onChange={(e) => setFacTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block font-body text-label-sm text-on-surface mb-1.5">Bio scurtă</label>
                  <textarea className="input w-full min-h-[80px]" placeholder="Descriere scurtă..."
                    value={facBio} onChange={(e) => setFacBio(e.target.value)} />
                </div>
                <div>
                  <label className="block font-body text-label-sm text-on-surface mb-1.5">Specializări (separate prin virgulă)</label>
                  <input type="text" className="input w-full" placeholder="ex: Anxietate, Traumă, Burnout"
                    value={facSpecialties} onChange={(e) => setFacSpecialties(e.target.value)} />
                </div>
                <div>
                  <label className="block font-body text-label-sm text-on-surface mb-1.5">URL fotografie</label>
                  <input type="url" className="input w-full" placeholder="https://..."
                    value={facPhoto} onChange={(e) => setFacPhoto(e.target.value)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {saved && (
          <div className="flex items-center gap-2 p-3 bg-forest-green/10 border border-forest-green/20 rounded-xl text-forest-green font-body text-label-xs">
            <Check size={14} weight="bold" /> Rolul a fost salvat.
          </div>
        )}

        <button onClick={handleSave} disabled={!hasChanged && !isFacilitator}
          className="btn btn-primary btn-sm w-full gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <Check size={14} weight="bold" /> Salvează rol
        </button>
      </div>
    </div>
  );
}

// ── detail view ────────────────────────────────────────────────────────────

interface DetailViewProps {
  user: AdminUser;
  onBack: () => void;
  onUpdate: (id: number, updates: Partial<AdminUser>) => void;
}

function UserDetailView({ user, onBack, onUpdate }: DetailViewProps) {
  const d = deriveUserDetail(user);
  const isOnline = user.lastActive === "2026-04-30";

  return (
    <motion.div key="detail" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.28 }}>

      {/* TOP BAR */}
      <div className="card bg-white p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
            <ArrowLeft size={18} weight="bold" />
          </button>
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center">
              <span className="font-heading text-lg font-bold text-forest-green">{user.avatar}</span>
            </div>
            {isOnline && <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-forest-green border-2 border-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-heading text-h3 text-deep-green">{user.name}</h2>
              <span className={`tag text-[10px] ${PLAN_TAG[user.plan]}`}>{user.plan}</span>
              <RoleBadge role={user.role} />
            </div>
            <p className="font-body text-body-sm text-secondary-text">
              {user.email} · Membru din {new Date(user.joinDate).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-sm gap-2"><Envelope size={15} /> Mesaj</button>
          <button className="btn btn-primary btn-sm gap-2"><PencilSimple size={15} /> Editează</button>
        </div>
      </div>

      {/* BODY */}
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6">

        {/* LEFT */}
        <div className="flex flex-col gap-6">

          {/* Harta Somatică */}
          <div className="card bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-body-md text-deep-green font-semibold">Harta Somatică</h3>
              <span className="font-body text-label-xs text-secondary-text">Ultima actualizare: Ieri</span>
            </div>
            <div className="relative w-full aspect-[3/4] max-w-[200px] mx-auto mb-4 rounded-xl overflow-hidden bg-gradient-to-b from-light-green/60 to-surface-container-low">
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
              <div className="absolute top-[28%] left-[42%] w-3 h-3 rounded-full bg-terracotta/70 border-2 border-white shadow-sm" />
              <div className="absolute top-[65%] left-[38%] w-3 h-3 rounded-full bg-forest-green/70 border-2 border-white shadow-sm" />
            </div>
            <div className="flex items-center justify-center gap-5 mb-4 font-body text-label-xs text-secondary-text">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-forest-green/70 inline-block" /> Relaxare</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-terracotta/70 inline-block" /> Tensiune</span>
            </div>
            <p className="font-body text-body-sm text-secondary-text italic text-center border-t border-sage-border/40 pt-4 leading-relaxed">{d.somaticQuote}</p>
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
                  <div className="w-12 h-12 rounded-xl bg-light-green flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-forest-green/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-xs font-bold text-forest-green">{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-body-sm font-semibold text-deep-green truncate">{p.title}</p>
                    <p className="font-body text-label-xs text-secondary-text">{p.date} · {p.duration} · {p.category}</p>
                    <div className="mt-1.5 h-1 bg-light-green rounded-full overflow-hidden">
                      <div className="h-full bg-forest-green rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role card */}
          <RoleCard user={user} onSave={(updates) => onUpdate(user.id, updates)} />
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">
          {/* Stats */}
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
                        <span className="tag bg-forest-green/10 text-forest-green border border-forest-green/20 text-[10px] tracking-wider">{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="font-body text-body-sm text-secondary-text text-center py-6">Niciun abonament activ</p>
            )}
          </div>

          {/* Jurnal */}
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

// ── main page ──────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { users, addUser, updateUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  function handleUpdateUser(id: number, updates: Partial<AdminUser>) {
    updateUser(id, updates);
    if (selectedUser?.id === id) {
      setSelectedUser((prev) => prev ? { ...prev, ...updates } : prev);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <AnimatePresence mode="wait">
        {!selectedUser ? (
          <ListView
            key="list"
            users={users}
            onSelect={setSelectedUser}
            onAdd={() => setShowAddModal(true)}
          />

        ) : (
          <UserDetailView
            key="detail"
            user={selectedUser}
            onBack={() => setSelectedUser(null)}
            onUpdate={handleUpdateUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onAdd={addUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
