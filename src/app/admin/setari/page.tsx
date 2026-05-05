"use client";

import { useState } from "react";
import {
  Check, Warning, Plus, Trash, Eye, EyeSlash, Upload,
  Link, EnvelopeSimple, Shield, Users, CreditCard, Gear,
} from "@phosphor-icons/react";

const TABS = [
  { id: "platforma", label: "Platformă", icon: Gear },
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

const ADMIN_USERS_LIST = [
  { id: 1, name: "Sabina Blendea", email: "sabina@inauntru.ro", role: "Super Admin", avatar: "SB" },
  { id: 2, name: "Mihai Pop", email: "mihai@inauntru.ro", role: "Admin Conținut", avatar: "MP" },
  { id: 3, name: "Elena Stan", email: "elena@inauntru.ro", role: "Admin Sesiuni", avatar: "ES" },
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

function PlatformTab() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

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
            <input type="text" defaultValue="INAUNTRU" className="input w-full max-w-sm" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Tagline</label>
            <input type="text" defaultValue="Primul ecosistem de terapie somatică din România" className="input w-full max-w-lg" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Descriere scurtă (SEO)</label>
            <textarea
              defaultValue="INAUNTRU este platforma care îți oferă acces la practici somatice ghidate, sesiuni LIVE și suport pentru bunăstarea ta."
              className="input w-full max-w-lg min-h-[80px]"
            />
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
            <input type="email" defaultValue="suport@inauntru.ro" className="input w-full" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Email facturare</label>
            <input type="email" defaultValue="facturare@inauntru.ro" className="input w-full" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">CUI</label>
            <input type="text" defaultValue="RO12345678" className="input w-full" />
          </div>
          <div>
            <label className="font-body text-label-sm text-on-surface mb-1.5 block">Adresă sediu</label>
            <input type="text" defaultValue="Cluj-Napoca, România" className="input w-full" />
          </div>
        </div>
      </div>

      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Funcționalități platformă</h3>
        <div className="space-y-3">
          {[
            { label: "Înregistrări noi", desc: "Permite utilizatorilor noi să se înregistreze", defaultChecked: true },
            { label: "Modul de probă gratuit", desc: "Afișează planul gratuit la înregistrare", defaultChecked: true },
            { label: "Check-in zilnic obligatoriu", desc: "Cere utilizatorilor să completeze check-in-ul la prima autentificare", defaultChecked: false },
            { label: "Notificări push web", desc: "Trimite notificări browser pentru sesiuni LIVE", defaultChecked: true },
          ].map((f) => (
            <label key={f.label} className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-light-green/50 transition-colors">
              <div>
                <p className="font-body text-body-sm text-on-surface font-medium">{f.label}</p>
                <p className="font-body text-label-xs text-secondary-text">{f.desc}</p>
              </div>
              <input type="checkbox" className="w-4 h-4 accent-forest-green" defaultChecked={f.defaultChecked} />
            </label>
          ))}
        </div>
      </div>

      <SaveBar onSave={handleSave} />
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
              <input type="text" className="input w-full" defaultValue={`[INAUNTRU] ${EMAIL_TEMPLATES.find((t) => t.id === selected)?.label}`} />
            </div>
            <div>
              <label className="font-body text-label-sm text-on-surface mb-1.5 block">Conținut (HTML)</label>
              <textarea
                className="input w-full min-h-[120px] font-mono text-xs"
                defaultValue={`<h1>Bun venit la INAUNTRU!</h1>\n<p>Dragă {{name}},</p>\n<p>Suntem bucuroși că ești alături de noi...</p>`}
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

function AdminsTab() {
  const [showInvite, setShowInvite] = useState(false);

  const ROLES = ["Super Admin", "Admin Conținut", "Admin Sesiuni", "Cititor"];

  return (
    <div className="space-y-6">
      <div className="card bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-body font-semibold text-body-md text-deep-green">Utilizatori admin</h3>
          <button onClick={() => setShowInvite(!showInvite)} className="btn btn-primary btn-sm">
            <Plus size={14} weight="bold" /> Invită admin
          </button>
        </div>

        {showInvite && (
          <div className="mb-4 p-4 bg-light-green rounded-xl border border-sage-border">
            <h4 className="font-body text-body-sm font-semibold text-deep-green mb-3">Invitație nouă</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="email" placeholder="Email admin" className="input w-full" />
              <select className="input w-full">
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <button className="btn btn-primary btn-sm">Trimite invitație</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {ADMIN_USERS_LIST.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-light-green/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-deep-green flex items-center justify-center flex-shrink-0">
                  <span className="font-body text-xs font-bold text-white">{u.avatar}</span>
                </div>
                <div>
                  <p className="font-body text-body-sm font-semibold text-deep-green">{u.name}</p>
                  <p className="font-body text-[10px] text-secondary-text">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  defaultValue={u.role}
                  className="border border-sage-border rounded-lg px-3 py-1.5 font-body text-label-xs text-on-surface focus:outline-none focus:border-forest-green bg-white"
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
                {u.id !== 1 && (
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-secondary-text hover:text-terracotta transition-colors">
                    <Trash size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Permisiuni pe rol</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left font-body text-label-xs text-secondary-text uppercase tracking-wider pb-3 pr-6">Permisiune</th>
                {ROLES.map((r) => (
                  <th key={r} className="font-body text-label-xs text-secondary-text uppercase tracking-wider pb-3 px-4 text-center">{r.replace("Admin ", "")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Gestionare utilizatori", perms: [true, false, false, false] },
                { label: "Adăugare conținut", perms: [true, true, false, false] },
                { label: "Gestionare sesiuni LIVE", perms: [true, false, true, false] },
                { label: "Vizualizare statistici", perms: [true, true, true, true] },
                { label: "Editare setări", perms: [true, false, false, false] },
                { label: "Gestionare abonamente", perms: [true, false, false, false] },
              ].map((row) => (
                <tr key={row.label} className="border-t border-sage-border/40">
                  <td className="py-2 pr-6 font-body text-body-sm text-on-surface">{row.label}</td>
                  {row.perms.map((p, i) => (
                    <td key={i} className="py-2 px-4 text-center">
                      {p ? (
                        <Check size={14} weight="bold" className="text-forest-green mx-auto" />
                      ) : (
                        <span className="text-secondary-text/40 text-body-sm">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("platforma");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-h2 text-deep-green">Setări</h1>
        <p className="font-body text-body-sm text-secondary-text">Configurare platformă și integrări</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-sage-border mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
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
      {activeTab === "preturi" && <PricingTab />}
      {activeTab === "email" && <EmailTab />}
      {activeTab === "integrari" && <IntegrationsTab />}
      {activeTab === "gdpr" && <GdprTab />}
      {activeTab === "admini" && <AdminsTab />}
    </div>
  );
}
