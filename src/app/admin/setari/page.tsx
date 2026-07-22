"use client";

import { useState, useEffect } from "react";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
  Check, Warning, Plus, Trash, Eye, EyeSlash, Upload,
  Link, EnvelopeSimple, Shield, Users, CreditCard, Gear, CircleNotch,
  Article,
} from "@phosphor-icons/react";

const TABS = [
  { id: "platforma", label: "Platformă", icon: Gear },
  { id: "texte", label: "Texte site", icon: Article },
  { id: "preturi", label: "Prețuri", icon: CreditCard },
  { id: "email", label: "Email", icon: EnvelopeSimple },
  { id: "integrari", label: "Integrări", icon: Link },
  { id: "gdpr", label: "GDPR", icon: Shield },
  { id: "admini", label: "Admini", icon: Users },
];

const EMAIL_TEMPLATES = [
  { id: "onboarding", label: "Bun venit (Onboarding)", status: "active" },
  { id: "trial_end", label: "Perioadă de trial pe cale să expire", status: "active" },
  { id: "payment_fail", label: "Plată eșuată", status: "active" },
  { id: "subscription_renewal", label: "Confirmare reînnoire abonament", status: "draft" },
  { id: "password_reset", label: "Resetare parolă", status: "active" },
  { id: "session_reminder", label: "Reminder sesiune LIVE", status: "active" },
];

const INTEGRATIONS = [
  { name: "Stripe", description: "Procesare plăți și gestionare abonamente", status: "connected", color: "bg-indigo-500" },
  { name: "Supabase", description: "Bază de date și autentificare", status: "connected", color: "bg-emerald-500" },
  { name: "Zoom", description: "Sesiuni video LIVE", status: "connected", color: "bg-blue-500" },
  { name: "SendGrid", description: "Trimitere emailuri tranzacționale", status: "connected", color: "bg-sky-500" },
  { name: "Google Analytics", description: "Urmărire trafic și conversii", status: "disconnected", color: "bg-orange-500" },
  { name: "Meta Pixel", description: "Publicitate Facebook/Instagram", status: "disconnected", color: "bg-blue-600" },
];

const GDPR_REQUESTS = [
  { id: 1, user: "Maria D.", email: "maria.d@gmail.com", type: "Export date", date: "2026-04-28", status: "pending" },
  { id: 2, user: "Ion P.", email: "ion.p@yahoo.ro", type: "Ștergere cont", date: "2026-04-25", status: "completed" },
  { id: 3, user: "Elena M.", email: "elena.m@gmail.com", type: "Export date", date: "2026-04-20", status: "completed" },
];


function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end mt-6">
      <button onClick={onSave} className="btn btn-primary btn-sm">
        <Check size={14} weight="bold" /> Salvează modificările
      </button>
    </div>
  );
}

const DEFAULT_PLATFORM = {
  name: "WithIn",
  tagline: "Primul ecosistem de terapie somatică din România",
  description: "WithIn este platforma care îți oferă acces la practici somatice ghidate, sesiuni LIVE și suport pentru bunăstarea ta.",
  email_support: "suport@inauntru.ro",
  email_billing: "facturare@inauntru.ro",
  cui: "",
  address: "",
  allow_register: true,
  free_plan: true,
  checkin_required: false,
  push_notifications: true,
};

type PlatformSettings = typeof DEFAULT_PLATFORM;

function PlatformTab() {
  const [form, setForm] = useState<PlatformSettings>(DEFAULT_PLATFORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.platform) setForm({ ...DEFAULT_PLATFORM, ...(data.platform as Partial<PlatformSettings>) });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function upd(key: keyof PlatformSettings, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "platform", value: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <div className="flex justify-center py-12"><CircleNotch size={24} className="animate-spin text-forest-green" /></div>;

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-forest-green/10 border border-forest-green/20 rounded-xl text-forest-green font-body text-body-sm">
          <Check size={16} weight="bold" /> Modificările au fost salvate cu succes.
        </div>
      )}

      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Identitate platformă</h3>
        <div className="space-y-4">
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Numele platformei</label>
            <input type="text" value={form.name} onChange={(e) => upd("name", e.target.value)} className="input w-full max-w-sm" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Tagline</label>
            <input type="text" value={form.tagline} onChange={(e) => upd("tagline", e.target.value)} className="input w-full max-w-lg" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Descriere scurtă (SEO)</label>
            <textarea value={form.description} onChange={(e) => upd("description", e.target.value)} className="input w-full max-w-lg min-h-[80px]" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-deep-green flex items-center justify-center">
                <span className="font-heading text-white font-bold text-lg">IN</span>
              </div>
              <button className="btn btn-ghost btn-sm gap-2">
                <Upload size={14} /> Încarcă logo nou
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Contact și legal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Email suport</label>
            <input type="email" value={form.email_support} onChange={(e) => upd("email_support", e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Email facturare</label>
            <input type="email" value={form.email_billing} onChange={(e) => upd("email_billing", e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">CUI</label>
            <input type="text" value={form.cui} onChange={(e) => upd("cui", e.target.value)} className="input w-full" placeholder="RO12345678" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Adresă sediu</label>
            <input type="text" value={form.address} onChange={(e) => upd("address", e.target.value)} className="input w-full" placeholder="Cluj-Napoca, România" />
          </div>
        </div>
      </div>

      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Funcționalități platformă</h3>
        <div className="space-y-3">
          {([
            { key: "allow_register" as const, label: "Înregistrări noi", desc: "Permite utilizatorilor noi să se înregistreze" },
            { key: "free_plan" as const, label: "Modul de probă gratuit", desc: "Afișează planul gratuit la înregistrare" },
            { key: "checkin_required" as const, label: "Check-in zilnic obligatoriu", desc: "Cere utilizatorilor să completeze check-in-ul la prima autentificare" },
            { key: "push_notifications" as const, label: "Notificări push web", desc: "Trimite notificări browser pentru sesiuni LIVE" },
          ]).map((f) => (
            <label key={f.key} className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-light-green/50 transition-colors">
              <div>
                <p className="font-body text-body-sm text-on-surface font-medium">{f.label}</p>
                <p className="font-body text-label-xs text-secondary-text">{f.desc}</p>
              </div>
              <input type="checkbox" className="w-4 h-4 accent-forest-green" checked={form[f.key] as boolean} onChange={(e) => upd(f.key, e.target.checked)} />
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm gap-2 disabled:opacity-50">
          {saving ? <CircleNotch size={14} className="animate-spin" /> : <Check size={14} weight="bold" />}
          {saving ? "Se salvează..." : "Salvează modificările"}
        </button>
      </div>
    </div>
  );
}

function PricingTab() {
  const [saved, setSaved] = useState(false);
  const [annualDiscount, setAnnualDiscount] = useState(20);

  const plans = [
    { name: "Gratuit", monthly: 0, desc: "Acces limitat la practici și o sesiune LIVE/lună" },
    { name: "Premium", monthly: 59, desc: "Acces complet la practici, 4 sesiuni LIVE/lună" },
    { name: "Premium+", monthly: 89, desc: "Acces nelimitat, sesiuni prioritare, coaching 1:1" },
  ];

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-forest-green/10 border border-forest-green/20 rounded-xl text-forest-green font-body text-body-sm">
          <Check size={16} weight="bold" /> Prețurile au fost actualizate.
        </div>
      )}

      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Planuri și prețuri</h3>
        <p className="font-body text-label-xs text-secondary-text mb-4">Modificările intră în vigoare pentru abonamentele noi. Abonamentele existente nu sunt afectate.</p>
        <div className="space-y-4">
          {plans.map((p) => (
            <div key={p.name} className="border border-sage-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-body font-semibold text-body-sm text-deep-green">{p.name}</h4>
                  <p className="font-body text-label-xs text-secondary-text">{p.desc}</p>
                </div>
                {p.monthly > 0 && (
                  <span className="tag tag-green">Activ</span>
                )}
              </div>
              {p.monthly > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-label-xs text-secondary-text mb-1 block">Preț lunar (RON)</label>
                    <input type="number" defaultValue={p.monthly} className="input w-full" />
                  </div>
                  <div>
                    <label className="font-body text-label-xs text-secondary-text mb-1 block">Preț anual (RON/an)</label>
                    <input type="number" defaultValue={Math.round(p.monthly * 12 * (1 - annualDiscount / 100))} className="input w-full" />
                  </div>
                </div>
              ) : (
                <p className="font-body text-label-xs text-secondary-text">Planul gratuit nu are prețuri configurabile.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Reducere abonament anual</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Procent reducere (%)</label>
            <input
              type="number"
              value={annualDiscount}
              onChange={(e) => setAnnualDiscount(Number(e.target.value))}
              min={0}
              max={50}
              className="input w-full"
            />
          </div>
          <div className="p-4 bg-light-green rounded-xl">
            <p className="font-body text-label-xs text-secondary-text">Exemplu Premium</p>
            <p className="font-heading text-xl font-bold text-deep-green">{Math.round(59 * 12 * (1 - annualDiscount / 100))} RON/an</p>
            <p className="font-body text-label-xs text-forest-green">economisești {Math.round(59 * 12 * annualDiscount / 100)} RON</p>
          </div>
        </div>
      </div>

      <SaveBar onSave={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} />
    </div>
  );
}

function EmailTab() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Template-uri email</h3>
        <p className="font-body text-label-xs text-secondary-text mb-4">Personalizează emailurile trimise automat utilizatorilor.</p>
        <div className="space-y-2">
          {EMAIL_TEMPLATES.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelected(selected === t.id ? null : t.id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                selected === t.id ? "bg-light-green border border-sage-border" : "hover:bg-light-green/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <EnvelopeSimple size={16} className="text-forest-green flex-shrink-0" />
                <span className="font-body text-body-sm text-on-surface">{t.label}</span>
              </div>
              <span className={`tag ${t.status === "active" ? "bg-forest-green/10 text-forest-green border-forest-green/20 border" : "tag-outline"}`}>
                {t.status === "active" ? "Activ" : "Draft"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body font-semibold text-body-md text-deep-green">
              Editare: {EMAIL_TEMPLATES.find((t) => t.id === selected)?.label}
            </h3>
            <button onClick={() => setSelected(null)} className="font-body text-label-xs text-secondary-text hover:text-deep-green">Închide</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-body text-label-sm text-on-surface mb-1.5 block">Subiect email</label>
              <input type="text" className="input w-full" defaultValue={`[WithIn] ${EMAIL_TEMPLATES.find((t) => t.id === selected)?.label}`} />
            </div>
            <div>
              <label className="font-body text-label-sm text-on-surface mb-1.5 block">Conținut (HTML)</label>
              <textarea
                className="input w-full min-h-[120px] font-mono text-xs"
                defaultValue={`<h1>Bun venit la WithIn!</h1>\n<p>Dragă {{name}},</p>\n<p>Suntem bucuroși că ești alături de noi...</p>`}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <Warning size={14} className="text-amber-600 flex-shrink-0" />
              <p className="font-body text-label-xs text-amber-700">Variabile disponibile: {'{{name}}'}, {'{{email}}'}, {'{{plan}}'}, {'{{link}}'}</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost btn-sm">Previzualizare</button>
              <button className="btn btn-ghost btn-sm">Trimite test</button>
              <button className="btn btn-primary btn-sm ml-auto">
                <Check size={14} weight="bold" /> Salvează template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationsTab() {
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((intg) => (
          <div key={intg.name} className="card bg-white p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${intg.color} rounded-xl flex items-center justify-center`}>
                <span className="font-body text-white font-bold text-xs">{intg.name.slice(0, 2)}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-body font-semibold text-body-sm text-deep-green">{intg.name}</h4>
                <p className="font-body text-label-xs text-secondary-text">{intg.description}</p>
              </div>
              <span className={`tag ${intg.status === "connected" ? "bg-forest-green/10 text-forest-green border-forest-green/20 border" : "tag-outline"}`}>
                {intg.status === "connected" ? "Conectat" : "Deconectat"}
              </span>
            </div>
            {intg.status === "connected" ? (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showKey[intg.name] ? "text" : "password"}
                    defaultValue="sk_live_xxxxxxxxxxxxxxxxxxxx"
                    className="input w-full pr-10 text-xs"
                    readOnly
                  />
                  <button
                    onClick={() => setShowKey((prev) => ({ ...prev, [intg.name]: !prev[intg.name] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-deep-green"
                  >
                    {showKey[intg.name] ? <EyeSlash size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button className="font-body text-label-xs text-terracotta hover:underline">Deconectează</button>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm w-full">
                <Link size={14} /> Conectează
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GdprTab() {
  return (
    <div className="space-y-6">
      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Cereri GDPR</h3>
        <p className="font-body text-label-xs text-secondary-text mb-4">Cereri de export sau ștergere a datelor de la utilizatori.</p>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Utilizator</th>
                <th>Tip cerere</th>
                <th>Data</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {GDPR_REQUESTS.map((r) => (
                <tr key={r.id}>
                  <td>
                    <p className="font-body text-body-sm font-semibold text-deep-green">{r.user}</p>
                    <p className="font-body text-[10px] text-secondary-text">{r.email}</p>
                  </td>
                  <td className="font-body text-body-sm text-on-surface">{r.type}</td>
                  <td className="font-body text-body-sm text-secondary-text">{r.date}</td>
                  <td>
                    <span className={`tag ${r.status === "completed" ? "bg-forest-green/10 text-forest-green border-forest-green/20 border" : "bg-amber-50 text-amber-700 border-amber-200 border"}`}>
                      {r.status === "completed" ? "Rezolvat" : "În așteptare"}
                    </span>
                  </td>
                  <td>
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm text-xs py-1">Export</button>
                        <button className="font-body text-label-xs text-terracotta hover:underline">Șterge</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Politici și retenție date</h3>
        <div className="space-y-4">
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Retenție date utilizatori inactivi (luni)</label>
            <input type="number" defaultValue={24} className="input w-full max-w-xs" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Link Politică de confidențialitate</label>
            <input type="url" defaultValue="https://inauntru.ro/confidentialitate" className="input w-full max-w-lg" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Link Termeni și condiții</label>
            <input type="url" defaultValue="https://inauntru.ro/termeni" className="input w-full max-w-lg" />
          </div>
        </div>
        <SaveBar onSave={() => {}} />
      </div>
    </div>
  );
}

const NAV_OPTIONS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "continut", label: "Conținut (Practici)" },
  { id: "blog", label: "Blog" },
  { id: "utilizatori", label: "Utilizatori" },
  { id: "sesiuni", label: "Sesiuni LIVE" },
  { id: "abonamente", label: "Abonamente" },
  { id: "emailuri", label: "Emailuri" },
  { id: "statistici", label: "Statistici" },
  { id: "setari", label: "Setări (generale)" },
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  editor: { dashboard: true, continut: true, blog: true, sesiuni: true, emailuri: true, statistici: true, setari: true },
  moderator: { dashboard: true, utilizatori: true, statistici: true },
};

interface AdminUserEntry { email: string; role: string; name: string; }

function AdminsTab() {
  const [showInvite, setShowInvite] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUserEntry[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteSaving, setInviteSaving] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [permSaving, setPermSaving] = useState(false);
  const [permSaved, setPermSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.admin_permissions) setPermissions(d.admin_permissions);
        if (d.admin_users) setAdminUsers(d.admin_users);
      })
      .catch(() => {});
  }, []);

  async function saveAdminUsers(users: AdminUserEntry[]) {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "admin_users", value: users }),
    });
  }

  async function handleAddAdmin() {
    if (!inviteEmail.trim()) { setInviteError("Emailul este obligatoriu."); return; }
    if (adminUsers.find((u) => u.email === inviteEmail.trim())) {
      setInviteError("Acest email are deja acces."); return;
    }
    setInviteSaving(true);
    setInviteError("");
    const updated = [...adminUsers, { email: inviteEmail.trim(), name: inviteName.trim() || inviteEmail.trim(), role: inviteRole }];
    await saveAdminUsers(updated);
    setAdminUsers(updated);
    setInviteEmail(""); setInviteName(""); setInviteRole("editor");
    setShowInvite(false);
    setInviteSaving(false);
  }

  async function handleChangeRole(email: string, role: string) {
    const updated = adminUsers.map((u) => u.email === email ? { ...u, role } : u);
    setAdminUsers(updated);
    await saveAdminUsers(updated);
  }

  async function handleRemove(email: string) {
    const updated = adminUsers.filter((u) => u.email !== email);
    setAdminUsers(updated);
    await saveAdminUsers(updated);
  }

  function togglePerm(role: string, item: string) {
    setPermissions((prev) => ({
      ...prev,
      [role]: { ...(prev[role] ?? {}), [item]: !(prev[role]?.[item] ?? false) },
    }));
  }

  async function savePermissions() {
    setPermSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "admin_permissions", value: permissions }),
    });
    setPermSaving(false);
    setPermSaved(true);
    setTimeout(() => setPermSaved(false), 2500);
  }


  return (
    <div className="space-y-6">
      <div className="card bg-white p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-body font-semibold text-body-md text-deep-green">Conturi cu acces admin</h3>
          <button onClick={() => { setShowInvite(!showInvite); setInviteError(""); }} className="btn btn-primary btn-sm">
            <Plus size={14} weight="bold" /> Adaugă cont
          </button>
        </div>
        <p className="font-body text-label-xs text-secondary-text mb-4">
          Contul backup (username/parolă) are mereu Super Admin și nu apare aici. Adaugă conturi de pe platformă folosind emailul lor.
        </p>

        {showInvite && (
          <div className="mb-4 p-4 bg-light-green rounded-xl border border-sage-border space-y-3">
            <h4 className="font-body text-body-sm font-semibold text-deep-green">Cont nou cu acces admin</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="email"
                placeholder="Email (de pe platformă)"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input w-full"
              />
              <input
                type="text"
                placeholder="Nume afișat (opțional)"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="input w-full"
              />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="input w-full">
                <option value="super_admin">Super Admin</option>
                <option value="editor">Editor</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            {inviteError && <p className="font-body text-label-xs text-red-600">{inviteError}</p>}
            <div className="flex gap-2">
              <button onClick={handleAddAdmin} disabled={inviteSaving} className="btn btn-primary btn-sm disabled:opacity-50">
                {inviteSaving ? "Se salvează..." : "Salvează accesul"}
              </button>
              <button onClick={() => setShowInvite(false)} className="btn btn-ghost btn-sm">Anulează</button>
            </div>
          </div>
        )}

        {adminUsers.length === 0 ? (
          <p className="font-body text-body-sm text-secondary-text text-center py-6">
            Niciun cont adăugat încă. Apasă „Adaugă cont" pentru a da acces unui utilizator din platformă.
          </p>
        ) : (
          <div className="space-y-2">
            {adminUsers.map((u) => (
              <div key={u.email} className="flex items-center justify-between p-3 rounded-xl hover:bg-light-green/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-deep-green flex items-center justify-center flex-shrink-0">
                    <span className="font-body text-xs font-bold text-white">
                      {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-body text-body-sm font-semibold text-deep-green">{u.name}</p>
                    <p className="font-body text-[10px] text-secondary-text">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u.email, e.target.value)}
                    className="border border-sage-border rounded-lg px-3 py-1.5 font-body text-label-xs text-on-surface focus:outline-none focus:border-forest-green bg-white"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="editor">Editor</option>
                    <option value="moderator">Moderator</option>
                  </select>
                  <button
                    onClick={() => handleRemove(u.email)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-secondary-text hover:text-terracotta transition-colors"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card bg-white p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-body font-semibold text-body-md text-deep-green">Acces secțiuni per rol</h3>
          <p className="font-body text-label-xs text-secondary-text">Super Admin are mereu acces la tot.</p>
        </div>
        <p className="font-body text-label-xs text-secondary-text mb-4">Bifează ce secțiuni din meniu poate vedea fiecare rol.</p>

        {permSaved && (
          <div className="flex items-center gap-2 p-3 bg-forest-green/10 border border-forest-green/20 rounded-xl text-forest-green font-body text-body-sm mb-4">
            <Check size={14} weight="bold" /> Permisiunile au fost salvate.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left font-body text-label-xs text-secondary-text uppercase tracking-wider pb-3 pr-6">Secțiune</th>
                <th className="font-body text-label-xs text-secondary-text uppercase tracking-wider pb-3 px-6 text-center">Super Admin</th>
                <th className="font-body text-label-xs text-secondary-text uppercase tracking-wider pb-3 px-6 text-center">Editor</th>
                <th className="font-body text-label-xs text-secondary-text uppercase tracking-wider pb-3 px-6 text-center">Moderator</th>
              </tr>
            </thead>
            <tbody>
              {NAV_OPTIONS.map((item) => (
                <tr key={item.id} className="border-t border-sage-border/40">
                  <td className="py-2.5 pr-6 font-body text-body-sm text-on-surface">{item.label}</td>
                  <td className="py-2.5 px-6 text-center">
                    <Check size={14} weight="bold" className="text-forest-green mx-auto" />
                  </td>
                  <td className="py-2.5 px-6 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-forest-green cursor-pointer"
                      checked={permissions.editor?.[item.id] ?? false}
                      onChange={() => togglePerm("editor", item.id)}
                    />
                  </td>
                  <td className="py-2.5 px-6 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-forest-green cursor-pointer"
                      checked={permissions.moderator?.[item.id] ?? false}
                      onChange={() => togglePerm("moderator", item.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={savePermissions} disabled={permSaving} className="btn btn-primary btn-sm gap-2 disabled:opacity-50">
            {permSaving ? <CircleNotch size={14} className="animate-spin" /> : <Check size={14} weight="bold" />}
            {permSaving ? "Se salvează..." : "Salvează permisiunile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SITE TEXT EDITOR ─────────────────────────────────────────────────────────

type FieldType = "input" | "textarea";
interface Field { key: string; label: string; type: FieldType; hint?: string; }
interface Section { title: string; fields: Field[]; }
interface PageSchema { id: string; label: string; sections: Section[]; }

const f = (key: string, label: string, type: FieldType = "input", hint?: string): Field => ({ key, label, type, hint });

const SITE_SCHEMA: PageSchema[] = [
  {
    id: "homepage", label: "Acasă",
    sections: [
      {
        title: "Hero",
        fields: [
          f("hero_badge", "Text badge", "input", "ex: Aici gandurile se aseaza"),
          f("hero_title", "Titlu principal"),
          f("hero_subtitle", "Subtitlu", "textarea"),
          f("hero_social_proof", "Text social proof (sub butoane)", "input", "ex: Alatura-te celor 1.500+ membri"),
        ],
      },
      {
        title: "De ce ai nevoie — titlu + 6 carduri",
        fields: [
          f("intent_title", "Titlu sectiune"),
          f("intent1_title", "Card 1"),
          f("intent2_title", "Card 2"),
          f("intent3_title", "Card 3"),
          f("intent4_title", "Card 4"),
          f("intent5_title", "Card 5"),
          f("intent6_title", "Card 6"),
        ],
      },
      {
        title: "Sectiunea problema — text",
        fields: [
          f("problem_label", "Label mic (deasupra titlului)"),
          f("problem_title", "Titlu", "textarea"),
          f("problem_body", "Paragraf explicativ", "textarea"),
        ],
      },
      {
        title: "Sectiunea problema — 4 carduri",
        fields: [
          f("prob_card1_title", "Card 1 — titlu"),
          f("prob_card1_desc", "Card 1 — descriere", "textarea"),
          f("prob_card2_title", "Card 2 — titlu"),
          f("prob_card2_desc", "Card 2 — descriere", "textarea"),
          f("prob_card3_title", "Card 3 — titlu"),
          f("prob_card3_desc", "Card 3 — descriere", "textarea"),
          f("prob_card4_title", "Card 4 — titlu"),
          f("prob_card4_desc", "Card 4 — descriere", "textarea"),
        ],
      },
      {
        title: "Cum functioneaza — titlu + 3 pasi",
        fields: [
          f("howto_title", "Titlu sectiune"),
          f("step1_title", "Pasul 1 — titlu"),
          f("step1_desc", "Pasul 1 — descriere", "textarea"),
          f("step2_title", "Pasul 2 — titlu"),
          f("step2_desc", "Pasul 2 — descriere", "textarea"),
          f("step3_title", "Pasul 3 — titlu"),
          f("step3_desc", "Pasul 3 — descriere", "textarea"),
        ],
      },
      {
        title: "Platforma WithIn — titlu + 4 functionalitati",
        fields: [
          f("platform_title", "Titlu sectiune"),
          f("platform_subtitle", "Subtitlu", "textarea"),
          f("feat1_title", "Functionalitate 1 — titlu"),
          f("feat1_desc", "Functionalitate 1 — descriere", "textarea"),
          f("feat2_title", "Functionalitate 2 — titlu"),
          f("feat2_desc", "Functionalitate 2 — descriere", "textarea"),
          f("feat3_title", "Functionalitate 3 — titlu"),
          f("feat3_desc", "Functionalitate 3 — descriere", "textarea"),
          f("feat4_title", "Functionalitate 4 — titlu"),
          f("feat4_desc", "Functionalitate 4 — descriere", "textarea"),
        ],
      },
      {
        title: "Testimoniale",
        fields: [
          f("testimonials_title", "Titlu sectiune"),
        ],
      },
      {
        title: "Facilitatori",
        fields: [
          f("facilitators_label", "Label mic (deasupra titlului)"),
          f("facilitators_title", "Titlu sectiune"),
          f("facilitators_subtitle", "Subtitlu", "textarea"),
        ],
      },
      {
        title: "Garantie 14 zile",
        fields: [
          f("guarantee_title", "Titlu"),
          f("guarantee_subtitle", "Subtitlu", "textarea"),
        ],
      },
      {
        title: "Call to action final",
        fields: [
          f("cta_title", "Titlu"),
          f("cta_subtitle", "Subtitlu", "textarea"),
        ],
      },
      {
        title: "Intrebari frecvente — 8 intrebari",
        fields: [
          f("faq1_q", "Intrebare 1"), f("faq1_a", "Raspuns 1", "textarea"),
          f("faq2_q", "Intrebare 2"), f("faq2_a", "Raspuns 2", "textarea"),
          f("faq3_q", "Intrebare 3"), f("faq3_a", "Raspuns 3", "textarea"),
          f("faq4_q", "Intrebare 4"), f("faq4_a", "Raspuns 4", "textarea"),
          f("faq5_q", "Intrebare 5"), f("faq5_a", "Raspuns 5", "textarea"),
          f("faq6_q", "Intrebare 6"), f("faq6_a", "Raspuns 6", "textarea"),
          f("faq7_q", "Intrebare 7"), f("faq7_a", "Raspuns 7", "textarea"),
          f("faq8_q", "Intrebare 8"), f("faq8_a", "Raspuns 8", "textarea"),
        ],
      },
    ],
  },
  {
    id: "preturi", label: "Preturi",
    sections: [
      {
        title: "Header pagina",
        fields: [
          f("label", "Label mic (deasupra titlului)"),
          f("title", "Titlu pagina"),
          f("subtitle", "Subtitlu", "textarea"),
          f("savings_badge", "Badge reducere anuala"),
        ],
      },
      {
        title: "Plan 1 — Gratuit",
        fields: [
          f("p1_name", "Nume plan"),
          f("p1_desc", "Descriere scurta"),
          f("p1_feat1", "Inclus 1"), f("p1_feat2", "Inclus 2"), f("p1_feat3", "Inclus 3"),
          f("p1_feat4", "Inclus 4"), f("p1_feat5", "Inclus 5"),
          f("p1_miss1", "Neinclus 1"), f("p1_miss2", "Neinclus 2"),
          f("p1_miss3", "Neinclus 3"), f("p1_miss4", "Neinclus 4"),
        ],
      },
      {
        title: "Plan 2 — Standard (cel mai popular)",
        fields: [
          f("p2_name", "Nume plan"),
          f("p2_desc", "Descriere scurta"),
          f("p2_feat1", "Inclus 1"), f("p2_feat2", "Inclus 2"), f("p2_feat3", "Inclus 3"),
          f("p2_feat4", "Inclus 4"), f("p2_feat5", "Inclus 5"), f("p2_feat6", "Inclus 6"),
          f("p2_feat7", "Inclus 7"),
          f("p2_miss1", "Neinclus 1"), f("p2_miss2", "Neinclus 2"),
        ],
      },
      {
        title: "Plan 3 — Premium",
        fields: [
          f("p3_name", "Nume plan"),
          f("p3_desc", "Descriere scurta"),
          f("p3_feat1", "Inclus 1"), f("p3_feat2", "Inclus 2"), f("p3_feat3", "Inclus 3"),
          f("p3_feat4", "Inclus 4"), f("p3_feat5", "Inclus 5"), f("p3_feat6", "Inclus 6"),
          f("p3_feat7", "Inclus 7"),
        ],
      },
      {
        title: "FAQ Facturare — 4 intrebari",
        fields: [
          f("bfaq1_q", "Intrebare 1"), f("bfaq1_a", "Raspuns 1", "textarea"),
          f("bfaq2_q", "Intrebare 2"), f("bfaq2_a", "Raspuns 2", "textarea"),
          f("bfaq3_q", "Intrebare 3"), f("bfaq3_a", "Raspuns 3", "textarea"),
          f("bfaq4_q", "Intrebare 4"), f("bfaq4_a", "Raspuns 4", "textarea"),
        ],
      },
    ],
  },
  {
    id: "despre_noi", label: "Despre noi",
    sections: [
      {
        title: "Header pagina",
        fields: [
          f("label", "Label mic (deasupra titlului)"),
          f("title", "Titlu principal"),
          f("body", "Paragraf sub titlu", "textarea"),
        ],
      },
      {
        title: "Povestea fondatorului",
        fields: [
          f("founder_label", "Label mic"),
          f("founder_title", "Titlu sectiune"),
          f("founder_body1", "Paragraf 1", "textarea"),
          f("founder_body2", "Paragraf 2", "textarea"),
          f("founder_body3", "Paragraf 3", "textarea"),
          f("founder_quote", "Citat (in card)", "textarea"),
          f("founder_quote_author", "Autor citat"),
        ],
      },
      {
        title: "Valorile noastre — 4 carduri",
        fields: [
          f("val1_title", "Valoare 1 — titlu"), f("val1_desc", "Valoare 1 — descriere", "textarea"),
          f("val2_title", "Valoare 2 — titlu"), f("val2_desc", "Valoare 2 — descriere", "textarea"),
          f("val3_title", "Valoare 3 — titlu"), f("val3_desc", "Valoare 3 — descriere", "textarea"),
          f("val4_title", "Valoare 4 — titlu"), f("val4_desc", "Valoare 4 — descriere", "textarea"),
        ],
      },
      {
        title: "Viziune — 3 etape",
        fields: [
          f("tl1_year", "Etapa 1 — an"), f("tl1_location", "Etapa 1 — locatie"), f("tl1_desc", "Etapa 1 — descriere", "textarea"),
          f("tl2_year", "Etapa 2 — an"), f("tl2_location", "Etapa 2 — locatie"), f("tl2_desc", "Etapa 2 — descriere", "textarea"),
          f("tl3_year", "Etapa 3 — an"), f("tl3_location", "Etapa 3 — locatie"), f("tl3_desc", "Etapa 3 — descriere", "textarea"),
        ],
      },
    ],
  },
  {
    id: "practici", label: "Practici",
    sections: [
      {
        title: "Header pagina",
        fields: [
          f("label", "Label mic (deasupra titlului)"),
          f("title", "Titlu principal"),
          f("subtitle", "Subtitlu", "textarea"),
          f("search_placeholder", "Placeholder cautare"),
          f("empty_title", "Titlu cand nu sunt rezultate"),
          f("empty_desc", "Descriere cand nu sunt rezultate", "textarea"),
        ],
      },
    ],
  },
  {
    id: "inspiratie", label: "Inspiratie (Blog)",
    sections: [
      {
        title: "Header pagina",
        fields: [
          f("label", "Label mic (deasupra titlului)"),
          f("title", "Titlu principal"),
          f("subtitle", "Subtitlu", "textarea"),
        ],
      },
    ],
  },
  {
    id: "sesiuni_live", label: "Sesiuni Live",
    sections: [
      {
        title: "Header pagina",
        fields: [
          f("title", "Titlu pagina"),
          f("subtitle", "Subtitlu", "textarea"),
          f("empty_state", "Text cand nu sunt sesiuni disponibile"),
        ],
      },
    ],
  },
  {
    id: "facilitatori", label: "Facilitatori",
    sections: [
      {
        title: "Header pagina",
        fields: [
          f("label", "Label mic (deasupra titlului)"),
          f("title", "Titlu pagina"),
          f("subtitle", "Subtitlu", "textarea"),
        ],
      },
    ],
  },
  {
    id: "ancore", label: "Ancore",
    sections: [
      {
        title: "Hero pagina",
        fields: [
          f("label", "Label mic (deasupra titlului)", "input", "ex: Exerciții de reglare"),
          f("title", "Titlu principal", "input", "ex: Ancore"),
          f("subtitle", "Subtitlu", "textarea", "ex: Trei întrebări scurte. Ancora potrivită pentru tine acum."),
          f("cta_button", "Text buton CTA", "input", "ex: Descoperă ancora ta"),
        ],
      },
    ],
  },
];

const DEFAULT_SITE_CONTENT: Record<string, Record<string, string>> = {
  homepage: {
    hero_badge: "Aici gandurile se aseaza",
    hero_title: "Intoarce-te la tine.",
    hero_subtitle: "Resetare rapida in mai putin de 2 minute. Metode simple pentru momentele cand te simti blocat si ai nevoie de un nou inceput.",
    hero_social_proof: "Alatura-te celor 1.500+ membri",
    intent_title: "De ce ai nevoie in acest moment?",
    intent1_title: "Pauza de reincarcare",
    intent2_title: "Somn odihnitor",
    intent3_title: "Eliberare de presiune si agitatie",
    intent4_title: "Prezenta si claritate mentala",
    intent5_title: "Recalibrare si echilibru interior",
    intent6_title: "Explorare si crestere",
    problem_label: "Corpul tau iti vorbeste",
    problem_title: "Te simti coplesit de ganduri? Recupereaza-ti timpul pierdut in analiza si revino la ce conteaza pentru tine.",
    problem_body: "Multe dintre problemele noastre moderne nu sunt doar in capul nostru. Ele sunt stocate in corp ca tensiune cronica, respiratie superficiala si oboseala persistenta.",
    prob_card1_title: "Tensiune Musculara",
    prob_card1_desc: "Gat, umeri si maxilar mereu incordate fara un motiv aparent.",
    prob_card2_title: "Insomnie Alerta",
    prob_card2_desc: "Esti obosit, dar corpul tau refuza sa intre in starea de repaus.",
    prob_card3_title: "Deconectare",
    prob_card3_desc: "Simti ca traiesti de la gat in sus, ignorand semnalele corpului.",
    prob_card4_title: "Burnout Emotional",
    prob_card4_desc: "Reactii disproportionate la stresori mici de zi cu zi.",
    howto_title: "Calatoria ta spre interior",
    step1_title: "Evaluare Initiala",
    step1_desc: "Identificam unde este blocata energia in corpul tau printr-un chestionar de autodescoperire ghidat.",
    step2_title: "Practica Zilnica",
    step2_desc: "Primesti un program personalizat de 10-20 minute cu exercitii de respiratie, miscare si constientizare.",
    step3_title: "Monitorizare Progres",
    step3_desc: "Urmaresti cum se schimba starea ta de bine prin jurnalul de senzatii si check-in-uri zilnice.",
    platform_title: "Tot ce ai nevoie intr-un singur loc",
    platform_subtitle: "Acces instant de pe orice dispozitiv la resurse premium de vindecare somatica.",
    feat1_title: "Biblioteca",
    feat1_desc: "70+ sesiuni audio si video de la facilitatori certificati, disponibile oricand.",
    feat2_title: "Sesiuni LIVE",
    feat2_desc: "Cercuri de vindecare si workshop-uri interactive saptamanale cu facilitatorii nostri.",
    feat3_title: "Check-in Zilnic",
    feat3_desc: "Sistem inteligent care iti recomanda practica potrivita starii tale de azi.",
    feat4_title: "Monitorizarea progresului",
    feat4_desc: "Noteaza cum te simti si urmareste-ti evolutia pas cu pas.",
    testimonials_title: "Povesti de transformare",
    facilitators_label: "Ghizi experti",
    facilitators_title: "Ghidat de experti in somatizare",
    facilitators_subtitle: "O echipa de terapeuti, practicieni somatic si specialisti certificati, formati in Romania si international.",
    guarantee_title: "Testeaza gratuit timp de 14 zile.",
    guarantee_subtitle: "Primesti acces la toate metodele noastre de recalibrare.",
    cta_title: "Alege sa te simti mai bine acum.",
    cta_subtitle: "Incepe sa te simti mai bine imediat. Anulezi oricand, fara batai de cap.",
    faq1_q: "Ce este terapia somatica si cu ce difera de meditatie?",
    faq1_a: "Terapia somatica se concentreaza pe senzatiile corporale si cum acestea poarta amprenta experientelor noastre emotionale si traumatice. Spre deosebire de meditatie (care lucreaza cu mintea), terapia somatica lucreaza direct cu corpul ca intrare in sistemul nervos.",
    faq2_q: "Am nevoie de experienta anterioara?",
    faq2_a: "Nu. Platforma este conceputa pentru toate nivelurile, de la absolute beginner la practicieni cu experienta. Fiecare sesiune indica nivelul recomandat.",
    faq3_q: "Cat timp dureaza o practica?",
    faq3_a: "Practicile variaza de la 5 minute (tehnici rapide de ancorare) la 30+ minute (sesiuni profunde de corp). Majoritatea utilizatorilor practica 10-20 de minute pe zi.",
    faq4_q: "Poate inlocui WithIn terapia clasica?",
    faq4_a: "WithIn este un instrument de suport, nu un substitut pentru psihoterapie. Daca ai nevoie de suport terapeutic individual, te incurajam sa lucrezi si cu un terapeut calificat.",
    faq5_q: "Cum functioneaza perioada gratuita de 14 zile?",
    faq5_a: "Primele 14 zile sunt complet gratuite si iti ofera acces la planul Premium pentru a testa experienta. Nu ai nevoie de card pentru a incepe.",
    faq6_q: "Pot descarca practicile pentru utilizare offline?",
    faq6_a: "Descarcarea offline este disponibila pentru abonantii Premium+. Planurile Gratuit si Premium necesita conexiune internet.",
    faq7_q: "Sesiunile live sunt inregistrate?",
    faq7_a: "Da, toate sesiunile live sunt inregistrate si disponibile in biblioteca de replay in termen de 24 de ore.",
    faq8_q: "Exista optiuni corporate / B2B?",
    faq8_a: "Da! Oferim pachete corporate pentru companii care doresc sa investeasca in bunastarea angajatilor. Contactati-ne la business@inauntru.ro pentru un demo.",
  },
  preturi: {
    label: "Alege claritatea.",
    title: "Planuri pentru echilibru zilnic.",
    subtitle: "Redescopera-ti starea de bine. Alege varianta care ti se potriveste. E mai simplu decat crezi sa te simti din nou tu.",
    savings_badge: "Economisesti 35%",
    p1_name: "Gratuit", p1_desc: "Recalibrare rapida",
    p1_feat1: "5 practici gratuite pe luna", p1_feat2: "1 sesiune live pe luna",
    p1_feat3: "Check-in zilnic", p1_feat4: "Acces la blog si resurse", p1_feat5: "Monitorizarea progresului",
    p1_miss1: "Biblioteca completa (70+ practici)", p1_miss2: "Sesiuni live nelimitate",
    p1_miss3: "Progres personalizat", p1_miss4: "Suport dedicat",
    p2_name: "Standard", p2_desc: "Claritate si echilibru",
    p2_feat1: "Acces nelimitat la toate practicile", p2_feat2: "Sesiuni live nelimitate",
    p2_feat3: "Check-in zilnic + harta corpului", p2_feat4: "Progres personalizat",
    p2_feat5: "Monitorizarea progresului", p2_feat6: "Recomandari bazate pe check-in",
    p2_feat7: "Suport email 48h",
    p2_miss1: "Sesiuni 1:1 cu facilitatorul", p2_miss2: "Program corporativ",
    p3_name: "Premium", p3_desc: "Transformare profunda",
    p3_feat1: "Tot ce include Premium", p3_feat2: "1 sesiune 1:1 pe luna cu facilitatorul",
    p3_feat3: "Program personalizat de 30 zile", p3_feat4: "Acces anticipat la continut nou",
    p3_feat5: "Grup privat de suport", p3_feat6: "Suport prioritar 24h",
    p3_feat7: "Download practici offline",
    bfaq1_q: "Pot anula oricand abonamentul?", bfaq1_a: "Da, poti anula oricand din setarile contului tau. Nu exista penalitati sau taxe de anulare.",
    bfaq2_q: "Ce metode de plata acceptati?", bfaq2_a: "Acceptam card Visa, Mastercard si plata prin transfer bancar pentru planurile anuale.",
    bfaq3_q: "Exista perioada de proba gratuita?", bfaq3_a: "Planul Gratuit este disponibil fara limita de timp. Nu cerem card de credit.",
    bfaq4_q: "Pot schimba planul ulterior?", bfaq4_a: "Da, poti face upgrade sau downgrade oricand. Diferenta se calculeaza proportional.",
  },
  despre_noi: {
    label: "Despre noi",
    title: "Cultivam echilibrul prin stiinta somatizarii si caldura comunitatii.",
    body: "WithIn s-a nascut din convingerea ca fiecare persoana din Romania merita acces la practici de reglare somatica de calitate - disponibile oricand, oriunde.",
    founder_label: "Povestea fondatorului",
    founder_title: "De ce am creat WithIn",
    founder_body1: "",
    founder_body2: "",
    founder_body3: "",
    founder_quote: "Am construit WithIn pentru ca eu insami am cautat ani de zile un loc sigur sa ma vindec.",
    founder_quote_author: "Sabina, Co-Founder",
    val1_title: "Compasiune", val1_desc: "Fiecare persoana merita acces la practici de bunastare, indiferent de context sau resurse.",
    val2_title: "Fundamentare", val2_desc: "Toate practicile sunt bazate pe cercetari validate in neurostiinta si psihoterapie somatica.",
    val3_title: "Accesibilitate", val3_desc: "Credem ca vindecarea este un drept, nu un privilegiu rezervat celor cu resurse financiare mari.",
    val4_title: "Autenticitate", val4_desc: "Facilitatorii nostri sunt practicieni reali cu experienta clinica verificata, nu actori sau influenceri.",
    tl1_year: "2026", tl1_location: "Romania", tl1_desc: "Lansare platforma cu 70+ practici, sesiuni live si facilitatori certificati. Primii 5.000 utilizatori.",
    tl2_year: "2027", tl2_location: "Europa de Est", tl2_desc: "Expansiune in Bulgaria, Ungaria si Moldova. Continut in 4 limbi, 20+ facilitatori internationali.",
    tl3_year: "2028+", tl3_location: "Global", tl3_desc: "Ecosistem complet de somatic wellness: formare facilitatori, certificare, parteneriate clinice.",
  },
  practici: {
    label: "Biblioteca practici",
    title: "70+ practici somatice",
    subtitle: "Respiratie, miscare, corp si voce — fiecare practica ghidata de experti somatic din Romania.",
    search_placeholder: "De ce ai nevoie acum?",
    empty_title: "Nicio practica gasita",
    empty_desc: "Incearca sa modifici filtrele sau cauta altceva.",
  },
  inspiratie: {
    label: "Resurse & Educatie",
    title: "Centrul de Educatie Somatica",
    subtitle: "Stiinta somatica, practici ghidate si perspective de la facilitatorii nostri.",
  },
  sesiuni_live: {
    title: "Sesiuni Live",
    subtitle: "Conecteaza-te in timp real cu facilitatorii nostri certificati.",
    empty_state: "Nu exista sesiuni programate momentan.",
  },
  facilitatori: {
    label: "Echipa noastra",
    title: "Facilitatorii nostri",
    subtitle: "Profesionisti in terapie somatica, gata sa te ghideze spre echilibru interior.",
  },
  ancore: {
    label: "Exercitii de reglare",
    title: "Ancore",
    subtitle: "Trei intrebari scurte. Ancora potrivita pentru tine acum.",
    cta_button: "Descopera ancora ta",
  },
};

function SiteTextTab() {
  const [activePage, setActivePage] = useState("homepage");
  const [content, setContent] = useState<Record<string, Record<string, string>>>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
    setTimeout(() => setToast(null), 4500);
  }

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.site_content) {
          setContent((prev) => {
            const merged: Record<string, Record<string, string>> = { ...prev };
            for (const pageId of Object.keys(data.site_content)) {
              merged[pageId] = { ...(prev[pageId] ?? {}), ...(data.site_content[pageId] ?? {}) };
            }
            return merged;
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleChange(pageId: string, key: string, value: string) {
    setContent((prev) => ({
      ...prev,
      [pageId]: { ...(prev[pageId] ?? {}), [key]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "site_content", value: content }),
    });
    setSaving(false);
    showToast("Textele salvate — site-ul se actualizează în ~2 minute.");

    setDeploying(true);
    await fetch("/api/admin/deploy", { method: "POST" });
    setDeploying(false);
  }

  const activePage_ = SITE_SCHEMA.find((p) => p.id === activePage)!;
  const pageContent = content[activePage] ?? {};

  if (loading) return <div className="flex justify-center py-12"><CircleNotch size={24} className="animate-spin text-forest-green" /></div>;

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-deep-green text-white rounded-xl shadow-lg font-body text-body-sm transition-all duration-500 ${
            toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <Check size={16} weight="bold" className="text-forest-green flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* Page selector */}
      <div className="flex gap-2 flex-wrap">
        {SITE_SCHEMA.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePage(p.id)}
            className={`px-4 py-2 rounded-full font-body text-body-sm font-medium transition-all ${
              activePage === p.id
                ? "bg-forest-green text-white shadow-sm"
                : "bg-white border border-sage-border text-secondary-text hover:border-forest-green hover:text-deep-green"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {activePage_.sections.map((section) => (
          <div key={section.title} className="card bg-white p-5">
            <h3 className="font-body font-semibold text-body-sm text-deep-green mb-4 pb-3 border-b border-sage-border/60">
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="font-body text-label-sm text-on-surface mb-1 block">
                    {field.label}
                  </label>
                  {field.hint && (
                    <p className="font-body text-label-xs text-secondary-text mb-1.5">{field.hint}</p>
                  )}
                  {field.type === "textarea" ? (
                    <textarea
                      value={pageContent[field.key] ?? ""}
                      onChange={(e) => handleChange(activePage, field.key, e.target.value)}
                      className="input w-full min-h-[80px] resize-y"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={pageContent[field.key] ?? ""}
                      onChange={(e) => handleChange(activePage, field.key, e.target.value)}
                      className="input w-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving || deploying} className="btn btn-primary btn-sm gap-2 disabled:opacity-50">
          {(saving || deploying) ? <CircleNotch size={14} className="animate-spin" /> : <Check size={14} weight="bold" />}
          {saving ? "Se salvează..." : deploying ? "Se publică..." : "Salvează și publică"}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("platforma");
  const { isSuperAdmin } = useAdminRole();

  const visibleTabs = TABS.filter((t) => {
    if (t.id === "texte") return isSuperAdmin;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-h2 text-deep-green">Setări</h1>
        <p className="font-body text-body-sm text-secondary-text">Configurare platformă și integrări</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-sage-border mb-6 overflow-x-auto no-scrollbar">
        {visibleTabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 font-body text-body-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? "border-forest-green text-forest-green"
                  : "border-transparent text-secondary-text hover:text-deep-green"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "platforma" && <PlatformTab />}
      {activeTab === "texte" && <SiteTextTab />}
      {activeTab === "preturi" && <PricingTab />}
      {activeTab === "email" && <EmailTab />}
      {activeTab === "integrari" && <IntegrationsTab />}
      {activeTab === "gdpr" && <GdprTab />}
      {activeTab === "admini" && <AdminsTab />}
    </div>
  );
}
