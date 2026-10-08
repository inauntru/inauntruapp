"use client";

import { useState, useEffect } from "react";
import ImageUploadField from "@/components/ui/ImageUploadField";
import { TEXTE_IMPLICITE } from "@/lib/site-content-defaults";
import { PRICING_PLANS, TESTIMONIALS, FAQ_ITEMS, INTENT_CARDS } from "@/lib/mockData";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
  Check, Warning, Plus, Trash, Eye, EyeSlash, Upload,
  Link, EnvelopeSimple, Shield, Users, CreditCard, Gear, CircleNotch,
  Article,
} from "@phosphor-icons/react";

const TABS = [
  { id: "platforma", label: "Platformă", icon: Gear },
  { id: "texte", label: "Texte site", icon: Article },
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
  email_support: "suport@withinapp.ro",
  email_billing: "facturare@withinapp.ro",
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

function GdprTab() {
  return (
    <div className="space-y-6">
      <div className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Instrumente GDPR funcționale</h3>
        <p className="font-body text-label-xs text-secondary-text mb-5">
          Acțiunile reale disponibile azi pentru conformitate. Un sistem de cereri GDPR
          automatizat va fi adăugat la lansare.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-sage-border/40">
            <div>
              <p className="font-body font-semibold text-body-sm text-deep-green">Export date utilizatori</p>
              <p className="font-body text-label-xs text-secondary-text">Fișier Excel cu toți utilizatorii și datele lor (acțiune înregistrată în Jurnalul de audit)</p>
            </div>
            <a href="/api/admin/users/export" download className="btn btn-ghost btn-sm border border-sage-border flex-shrink-0">Descarcă</a>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-sage-border/40">
            <div>
              <p className="font-body font-semibold text-body-sm text-deep-green">Ștergere cont utilizator</p>
              <p className="font-body text-label-xs text-secondary-text">La cererea unui utilizator — din pagina Utilizatori, cu toate datele asociate</p>
            </div>
            <a href="/admin/utilizatori" className="btn btn-ghost btn-sm border border-sage-border flex-shrink-0">Deschide</a>
          </div>
          <div className="p-4 rounded-xl bg-light-green/40 border border-sage-border/40">
            <p className="font-body text-label-xs text-secondary-text">
              💡 Utilizatorii își pot șterge singuri contul din Contul meu → Confidențialitate.
              Exportul individual de date („dreptul la portabilitate") e în lista de lansare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const NAV_OPTIONS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "continut", label: "Conținut (Practici)" },
  { id: "blog", label: "Blog" },
  { id: "facilitatori", label: "Facilitatori" },
  { id: "utilizatori", label: "Utilizatori" },
  { id: "sesiuni", label: "Sesiuni LIVE" },
  { id: "abonamente", label: "Abonamente" },
  { id: "emailuri", label: "Emailuri" },
  { id: "statistici", label: "Statistici" },
  { id: "setari", label: "Setări (generale)" },
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  editor: { dashboard: true, continut: true, blog: true, facilitatori: true, sesiuni: true, emailuri: true, statistici: true, setari: true },
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

type FieldType = "input" | "textarea" | "image" | "number";
interface Field {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  /** Ce scrie acum pe site. Apare gri in camp, ca sa se vada ce se inlocuieste. */
  placeholder?: string;
}
interface Section { title: string; fields: Field[]; }
interface PageSchema { id: string; label: string; sections: Section[]; }

const f = (key: string, label: string, type: FieldType = "input", hint?: string, placeholder?: string): Field =>
  ({ key, label, type, hint, placeholder });


/** Intrebarile despre facturare asa cum apar acum pe pagina Preturi. */
const BILLING_FAQ = [
  { q: "Pot anula oricând abonamentul?", a: "Da, poți anula oricând din setările contului tău." },
  { q: "Ce metode de plată acceptați?", a: "Acceptăm card Visa, Mastercard și transfer bancar." },
  { q: "Există perioadă de probă gratuită?", a: "Planul Gratuit este disponibil fără limită de timp." },
  { q: "Pot schimba planul ulterior?", a: "Da, poți face upgrade sau downgrade oricând." },
];

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
          ...INTENT_CARDS.slice(0, 6).map((card, k) =>
            f(`intent${k + 1}_title`, `Card ${k + 1}`, "input", undefined, card.title)),
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
        title: "Recenzii — sterge textul unei recenzii ca sa o ascunzi de pe site",
        fields: TESTIMONIALS.slice(0, 6).flatMap((rec, i) => {
          const n = i + 1;
          return [
            f(`t${n}_name`, `Recenzia ${n} — nume`, "input", undefined, rec.name),
            f(`t${n}_city`, `Recenzia ${n} — oras`, "input", undefined, rec.city),
            f(`t${n}_stars`, `Recenzia ${n} — stele (1-5)`, "input", undefined, String(rec.stars)),
            f(`t${n}_quote`, `Recenzia ${n} — text`, "textarea", undefined, rec.quote),
          ];
        }),
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
          ...Array.from({ length: 8 }, (_, k) => [
            f(`faq${k + 1}_q`, `Intrebare ${k + 1}`, "input", undefined, FAQ_ITEMS[k]?.q),
            f(`faq${k + 1}_a`, `Raspuns ${k + 1}`, "textarea", undefined, FAQ_ITEMS[k]?.a),
          ]).flat()
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
          f("p1_name", "Nume plan", "input", undefined, PRICING_PLANS[0].name),
          f("p1_desc", "Descriere scurta", "input", undefined, PRICING_PLANS[0].description),
          f("p1_price", "Pret lunar", "number", undefined, String(PRICING_PLANS[0].price)),
          f("p1_price_annual", "Pret lunar la plata anuala", "number", undefined, String(PRICING_PLANS[0].priceAnnual)),
          f("p1_cta", "Text buton", "input", undefined, PRICING_PLANS[0].cta),
          ...Array.from({ length: Math.min(8, PRICING_PLANS[0].features.length + 1) }, (_, k) =>
            f(`p1_feat${k + 1}`, `Inclus ${k + 1}`, "input", undefined, PRICING_PLANS[0].features[k])),
          ...Array.from({ length: Math.min(4, PRICING_PLANS[0].notIncluded.length + 1) }, (_, k) =>
            f(`p1_miss${k + 1}`, `Neinclus ${k + 1}`, "input", undefined, PRICING_PLANS[0].notIncluded[k]))
        ],
      },
      {
        title: "Plan 2 — Standard (cel mai popular)",
        fields: [
          f("p2_name", "Nume plan", "input", undefined, PRICING_PLANS[1].name),
          f("p2_desc", "Descriere scurta", "input", undefined, PRICING_PLANS[1].description),
          f("p2_price", "Pret lunar", "number", undefined, String(PRICING_PLANS[1].price)),
          f("p2_price_annual", "Pret lunar la plata anuala", "number", undefined, String(PRICING_PLANS[1].priceAnnual)),
          f("p2_cta", "Text buton", "input", undefined, PRICING_PLANS[1].cta),
          ...Array.from({ length: Math.min(8, PRICING_PLANS[1].features.length + 1) }, (_, k) =>
            f(`p2_feat${k + 1}`, `Inclus ${k + 1}`, "input", undefined, PRICING_PLANS[1].features[k])),
          ...Array.from({ length: Math.min(4, PRICING_PLANS[1].notIncluded.length + 1) }, (_, k) =>
            f(`p2_miss${k + 1}`, `Neinclus ${k + 1}`, "input", undefined, PRICING_PLANS[1].notIncluded[k]))
        ],
      },
      {
        title: "Plan 3 — Premium",
        fields: [
          f("p3_name", "Nume plan", "input", undefined, PRICING_PLANS[2].name),
          f("p3_desc", "Descriere scurta", "input", undefined, PRICING_PLANS[2].description),
          f("p3_price", "Pret lunar", "number", undefined, String(PRICING_PLANS[2].price)),
          f("p3_price_annual", "Pret lunar la plata anuala", "number", undefined, String(PRICING_PLANS[2].priceAnnual)),
          f("p3_cta", "Text buton", "input", undefined, PRICING_PLANS[2].cta),
          ...Array.from({ length: Math.min(8, PRICING_PLANS[2].features.length + 1) }, (_, k) =>
            f(`p3_feat${k + 1}`, `Inclus ${k + 1}`, "input", undefined, PRICING_PLANS[2].features[k])),
          ...Array.from({ length: Math.min(4, PRICING_PLANS[2].notIncluded.length + 1) }, (_, k) =>
            f(`p3_miss${k + 1}`, `Neinclus ${k + 1}`, "input", undefined, PRICING_PLANS[2].notIncluded[k]))
        ],
      },
      {
        title: "FAQ Facturare — 4 intrebari",
        fields: [
          ...BILLING_FAQ.map((item, k) => [
            f(`bfaq${k + 1}_q`, `Intrebare ${k + 1}`, "input", undefined, item.q),
            f(`bfaq${k + 1}_a`, `Raspuns ${k + 1}`, "textarea", undefined, item.a),
          ]).flat(),
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
          f("hero_image", "Poza din dreapta titlului", "image"),
          f("hero_image_alt", "Descrierea pozei", "input", "pentru cititoarele de ecran si pentru Google"),
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
          f("founder_image", "Poza sectiunii", "image"),
          f("founder_image_alt", "Descrierea pozei", "input", "pentru cititoarele de ecran si pentru Google"),
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
      {
        title: "Vino alaturi de noi — sectiunea de la final",
        fields: [
          f("cta_title", "Titlu"),
          f("cta_body", "Text sub titlu", "textarea"),
          f("cta_btn1", "Buton 1 — text"),
          f("cta_btn1_link", "Buton 1 — unde duce", "input", "ex: /register"),
          f("cta_btn2", "Buton 2 — text"),
          f("cta_btn2_link", "Buton 2 — unde duce", "input", "ex: /facilitatori"),
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

/*
 * Aici era o lista de texte implicite scrise de mana, cu care se umplea formularul.
 * Doua probleme: textele erau fara diacritice, iar la fiecare salvare ajungeau in
 * baza de date ca si cum ar fi fost scrise de om, inlocuind textele corecte din pagini.
 *
 * Acum formularul porneste gol, iar ce scrie pe site se vede ca sugestie gri in fiecare
 * camp (TEXTE_IMPLICITE, cules automat din pagini de scripts/genereaza-texte-implicite.js).
 * Asa, in baza de date ajunge doar ce schimbi tu.
 */

function SiteTextTabEditor() {
  const [activePage, setActivePage] = useState("homepage");
  // Porneste gol: in baza de date ajunge doar ce schimbi, nu si textele implicite
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
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
              {section.fields.map((field) => {
                // Sugestia vine din textul scris explicit in schema sau, daca nu exista,
                // din textul implicit cules automat din pagina (site-content-defaults).
                const sugestie = field.placeholder ?? TEXTE_IMPLICITE[activePage]?.[field.key];
                return (
                <div key={field.key}>
                  <label className="font-body text-label-sm text-on-surface mb-1 block">
                    {field.label}
                  </label>
                  {field.hint && (
                    <p className="font-body text-label-xs text-secondary-text mb-1.5">{field.hint}</p>
                  )}
                  {field.type === "number" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={pageContent[field.key] ?? ""}
                        onChange={(e) => handleChange(activePage, field.key, e.target.value)}
                        placeholder={sugestie}
                        className="input w-36"
                      />
                      <span className="font-body text-label-sm text-secondary-text">RON / luna</span>
                    </div>
                  ) : field.type === "image" ? (
                    <ImageUploadField
                      value={pageContent[field.key] ?? ""}
                      onChange={(url) => handleChange(activePage, field.key, url)}
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={pageContent[field.key] ?? ""}
                      onChange={(e) => handleChange(activePage, field.key, e.target.value)}
                      placeholder={sugestie}
                      className="input w-full min-h-[80px] resize-y"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={pageContent[field.key] ?? ""}
                      onChange={(e) => handleChange(activePage, field.key, e.target.value)}
                      placeholder={sugestie}
                      className="input w-full"
                    />
                  )}
                </div>
                );
              })}
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

function SiteTextTab() {
  return <SiteTextTabEditor />;
}

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
      {activeTab === "gdpr" && <GdprTab />}
      {activeTab === "admini" && <AdminsTab />}
    </div>
  );
}
