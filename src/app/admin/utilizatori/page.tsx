"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass, ArrowLeft, X, Check, ShieldCheck,
  Warning, CircleNotch, Trash, Users, Plus,
  EnvelopeSimple, CheckCircle, Clock,
} from "@phosphor-icons/react";

// ── Types ──────────────────────────────────────────────────────────────────

type UserRole = "user" | "moderator" | "admin" | "super_admin";
type UserPlan = "gratuit" | "standard" | "premium";

interface RealUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  plan: UserPlan;
  role: UserRole;
  check_ins_count: number;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PLAN_FILTERS = ["Toți", "Gratuit", "Standard", "Premium"];
const ROLE_FILTERS = ["Toți", "Utilizatori", "Moderatori", "Admini"];

const PLAN_TAG: Record<UserPlan, string> = {
  premium:  "bg-deep-green/10 text-deep-green border border-deep-green/20",
  standard: "bg-forest-green/10 text-forest-green border border-forest-green/20",
  gratuit:  "bg-sage-border/40 text-secondary-text border border-sage-border",
};

const PLAN_LABEL: Record<UserPlan, string> = {
  gratuit: "Gratuit", standard: "Standard", premium: "Premium",
};

const ROLE_LABEL: Record<UserRole, string> = {
  user: "Utilizator", moderator: "Moderator", admin: "Admin", super_admin: "Super Admin",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function initials(user: RealUser) {
  const f = user.first_name?.[0] ?? "";
  const l = user.last_name?.[0] ?? "";
  return (f + l).toUpperCase() || user.email.slice(0, 2).toUpperCase();
}

function fullName(user: RealUser) {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : user.email;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
}

// ── Delete modal ───────────────────────────────────────────────────────────

function DeleteModal({ user, onClose, onDeleted }: { user: RealUser; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare necunoscută");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
      <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Warning size={18} className="text-red-600" weight="fill" />
          </div>
          <div>
            <h3 className="font-heading text-h3 text-deep-green">Șterge cont</h3>
            <p className="font-body text-label-xs text-secondary-text">Această acțiune este ireversibilă</p>
          </div>
        </div>
        <p className="font-body text-body-sm text-on-surface mb-2">
          Ești sigur că vrei să ștergi contul lui <strong>{fullName(user)}</strong>?
        </p>
        <p className="font-body text-label-xs text-secondary-text mb-5">
          {user.email} · Toate datele vor fi șterse permanent.
        </p>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600">{error}</div>}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="btn btn-ghost btn-sm flex-1">Anulează</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 h-9 rounded-full bg-red-600 text-white font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50">
            {loading ? <CircleNotch size={14} className="animate-spin" /> : <Trash size={14} />}
            {loading ? "Se șterge..." : "Șterge definitiv"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Update role ────────────────────────────────────────────────────────────

function RoleCard({ user, onSaved }: { user: RealUser; onSaved: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role }),
      });
      onSaved(role);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card bg-white p-5">
      <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Rol în platformă</h3>
      <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="input w-full mb-3">
        <option value="user">Utilizator</option>
        <option value="moderator">Moderator</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-forest-green/10 border border-forest-green/20 rounded-xl text-forest-green font-body text-label-xs mb-3">
          <Check size={14} weight="bold" /> Rolul a fost salvat.
        </div>
      )}
      <button onClick={handleSave} disabled={saving || role === user.role} className="btn btn-primary btn-sm w-full gap-2 disabled:opacity-40">
        {saving ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
        Salvează rol
      </button>
    </div>
  );
}

// ── Detail view ────────────────────────────────────────────────────────────

function UserDetail({ user, onBack, onDelete, onRoleUpdate }: { user: RealUser; onBack: () => void; onDelete: () => void; onRoleUpdate: (role: UserRole) => void }) {
  return (
    <motion.div key="detail" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.25 }}>
      {/* Top bar */}
      <div className="card bg-white p-5 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
            <ArrowLeft size={18} weight="bold" />
          </button>
          <div className="w-14 h-14 rounded-full bg-light-green flex items-center justify-center">
            <span className="font-heading text-lg font-bold text-forest-green">{initials(user)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h2 className="font-heading text-h3 text-deep-green">{fullName(user)}</h2>
              <span className={`tag text-[10px] ${PLAN_TAG[user.plan]}`}>{PLAN_LABEL[user.plan]}</span>
              {user.role !== "user" && (
                <span className="tag bg-blue-50 text-blue-600 border border-blue-200 text-[10px]">{ROLE_LABEL[user.role]}</span>
              )}
            </div>
            <p className="font-body text-body-sm text-secondary-text">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Info card */}
          <div className="card bg-white p-5 space-y-3">
            <h3 className="font-body font-semibold text-body-md text-deep-green">Detalii cont</h3>
            <div className="space-y-2 text-label-xs font-body">
              <div className="flex justify-between">
                <span className="text-secondary-text">Email</span>
                <span className="text-on-surface font-medium truncate ml-3 max-w-[180px]">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">Înregistrat</span>
                <span className="text-on-surface">{formatDate(user.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">Ultima autentificare</span>
                <span className="text-on-surface">{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">Email confirmat</span>
                <span className={user.email_confirmed ? "text-forest-green font-semibold" : "text-amber-600 font-semibold"}>
                  {user.email_confirmed ? "Da" : "Nu"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">Check-in-uri</span>
                <span className="text-on-surface font-semibold">{user.check_ins_count}</span>
              </div>
            </div>
          </div>

          <RoleCard user={user} onSaved={onRoleUpdate} />

          {/* Danger zone */}
          <div className="card bg-white p-5 border border-red-100">
            <h3 className="font-body font-semibold text-body-md text-red-600 mb-1">Zonă periculoasă</h3>
            <p className="font-body text-label-xs text-secondary-text mb-4">Acțiunile de mai jos sunt permanente.</p>
            <button onClick={onDelete} className="w-full h-9 rounded-full border border-red-200 text-red-600 font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
              <Trash size={13} /> Șterge contul definitiv
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card bg-white p-5 text-center">
              <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-2">Plan</p>
              <p className="font-heading text-2xl font-bold text-deep-green">{PLAN_LABEL[user.plan]}</p>
            </div>
            <div className="card bg-white p-5 text-center">
              <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-2">Check-in-uri</p>
              <p className="font-heading text-2xl font-bold text-deep-green">{user.check_ins_count}</p>
            </div>
            <div className="card bg-white p-5 text-center">
              <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-2">Rol</p>
              <p className="font-heading text-lg font-bold text-deep-green">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>

          {/* Abonament */}
          <div className="card bg-white p-5">
            <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Abonament</h3>
            {user.plan === "gratuit" ? (
              <p className="font-body text-body-sm text-secondary-text text-center py-6">Utilizator pe planul Gratuit — fără abonament activ.</p>
            ) : (
              <p className="font-body text-body-sm text-secondary-text text-center py-6">Istoricul de plăți va fi disponibil după integrarea Stripe.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Add user modal ─────────────────────────────────────────────────────────

function AddUserModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", plan: "gratuit", role: "user", emailConfirm: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function upd(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.email || !form.password) { setError("Email și parola sunt obligatorii"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, first_name: form.firstName || null, last_name: form.lastName || null, plan: form.plan, role: form.role, email_confirm: form.emailConfirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare");
      onAdded();
    } catch (err) { setError(err instanceof Error ? err.message : "Eroare"); setLoading(false); }
  }

  const labelCls = "font-body text-label-xs text-secondary-text uppercase tracking-widest block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
      <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-h3 text-deep-green">Adaugă utilizator</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green"><X size={16} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Prenume</label><input className="input w-full" value={form.firstName} onChange={(e) => upd("firstName", e.target.value)} placeholder="Ana" /></div>
            <div><label className={labelCls}>Nume</label><input className="input w-full" value={form.lastName} onChange={(e) => upd("lastName", e.target.value)} placeholder="Popescu" /></div>
          </div>
          <div><label className={labelCls}>Email *</label><input type="email" className="input w-full" value={form.email} onChange={(e) => upd("email", e.target.value)} placeholder="ana@example.com" /></div>
          <div><label className={labelCls}>Parolă temporară *</label><input type="password" className="input w-full" value={form.password} onChange={(e) => upd("password", e.target.value)} placeholder="Min. 8 caractere" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Plan</label>
              <select className="input w-full" value={form.plan} onChange={(e) => upd("plan", e.target.value)}>
                <option value="gratuit">Gratuit</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Rol</label>
              <select className="input w-full" value={form.role} onChange={(e) => upd("role", e.target.value)}>
                <option value="user">Utilizator</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.emailConfirm} onChange={(e) => upd("emailConfirm", e.target.checked)} className="w-4 h-4 accent-forest-green" />
            <span className="font-body text-body-sm text-on-surface">Confirmă emailul automat (fără email de verificare)</span>
          </label>
        </div>
        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600">{error}</div>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={loading} className="btn btn-ghost btn-sm flex-1">Anulează</button>
          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary btn-sm flex-1 gap-2">
            {loading ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
            {loading ? "Se creează..." : "Creează cont"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── List view ──────────────────────────────────────────────────────────────

function ListView({ users, loading, onSelect, onRefresh }: { users: RealUser[]; loading: boolean; onSelect: (u: RealUser) => void; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("Toți");
  const [roleFilter, setRoleFilter] = useState("Toți");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = users.filter((u) => {
    if (planFilter !== "Toți" && PLAN_LABEL[u.plan] !== planFilter) return false;
    if (roleFilter === "Utilizatori" && u.role !== "user") return false;
    if (roleFilter === "Moderatori" && u.role !== "moderator") return false;
    if (roleFilter === "Admini" && !["admin", "super_admin"].includes(u.role)) return false;
    const name = fullName(u).toLowerCase();
    if (search && !name.includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Utilizatori</h1>
          <p className="font-body text-body-sm text-secondary-text">{users.length} înregistrați total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="btn btn-ghost btn-sm">Reîncarcă</button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm gap-1.5">
            <Plus size={14} weight="bold" /> Adaugă utilizator
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: users.length },
          { label: "Confirmați", value: users.filter((u) => u.email_confirmed).length },
          { label: "Premium/Standard", value: users.filter((u) => u.plan !== "gratuit").length },
          { label: "Check-in-uri totale", value: users.reduce((s, u) => s + u.check_ins_count, 0) },
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
            <input type="search" placeholder="Caută după nume sau email..." value={search} onChange={(e) => setSearch(e.target.value)}
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <CircleNotch size={24} className="animate-spin text-forest-green" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={40} className="text-sage-border mb-3" />
            <p className="font-body font-semibold text-body-md text-deep-green mb-1">
              {users.length === 0 ? "Niciun utilizator înregistrat încă" : "Niciun rezultat găsit"}
            </p>
            <p className="font-body text-label-xs text-secondary-text">
              {users.length === 0 ? "Utilizatorii vor apărea aici după ce se înregistrează." : "Încearcă alte filtre."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Utilizator</th>
                  <th>Rol</th>
                  <th>Plan</th>
                  <th>Confirmat</th>
                  <th>Înregistrat</th>
                  <th>Check-in-uri</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="cursor-pointer" onClick={() => onSelect(u)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-light-green flex items-center justify-center flex-shrink-0">
                          <span className="font-body text-xs font-bold text-forest-green">{initials(u)}</span>
                        </div>
                        <div>
                          <p className="font-body text-body-sm font-semibold text-deep-green">{fullName(u)}</p>
                          <p className="font-body text-[10px] text-secondary-text">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.role !== "user" && (
                        <span className="tag bg-blue-50 text-blue-600 border border-blue-200 text-[10px]">{ROLE_LABEL[u.role]}</span>
                      )}
                    </td>
                    <td><span className={`tag ${PLAN_TAG[u.plan]}`}>{PLAN_LABEL[u.plan]}</span></td>
                    <td>
                      {u.email_confirmed
                        ? <CheckCircle size={16} className="text-forest-green" weight="fill" />
                        : <Clock size={16} className="text-amber-500" />}
                    </td>
                    <td className="text-secondary-text font-body text-body-sm">{formatDate(u.created_at)}</td>
                    <td><span className="font-body font-semibold text-body-sm text-deep-green">{u.check_ins_count}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onAdded={() => { setShowAddModal(false); onRefresh(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RealUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RealUser | null>(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/list");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <AnimatePresence mode="wait">
        {!selected ? (
          <ListView key="list" users={users} loading={loading} onSelect={setSelected} onRefresh={fetchUsers} />
        ) : (
          <UserDetail
            key="detail"
            user={selected}
            onBack={() => setSelected(null)}
            onDelete={() => setDeleteTarget(selected)}
            onRoleUpdate={(role) => {
              setSelected((prev) => prev ? { ...prev, role } : prev);
              setUsers((prev) => prev.map((u) => u.id === selected.id ? { ...u, role } : u));
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={() => {
              setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
              setDeleteTarget(null);
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
