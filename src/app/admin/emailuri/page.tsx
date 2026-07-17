"use client";

import { useState, useRef, useEffect } from "react";
import {
  EnvelopeSimple,
  Eye,
  Check,
  PaperPlane,
  CaretRight,
  ShieldCheck,
  UserCircle,
  Sparkle,
  CalendarBlank,
  CreditCard,
  Code,
  ToggleLeft,
  ToggleRight,
  Info,
  CircleNotch,
  PencilSimple,
} from "@phosphor-icons/react";
import { EMAIL_DEFAULTS, SHELL } from "@/lib/email-defaults";
import dynamic from "next/dynamic";
import type { RichTextEditorHandle } from "@/components/ui/RichTextEditor";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailStatus = "activ" | "draft";
type EditorTab = "editare" | "previzualizare" | "cod";

interface EmailTemplate {
  subject: string;
  preheader: string;
  body: string;
  status: EmailStatus;
}

interface EmailDef {
  id: string;
  label: string;
  desc: string;
  isSystem?: boolean;
}

interface Category {
  id: string;
  label: string;
  Icon: React.ElementType;
  emails: EmailDef[];
  note?: string;
}

// ─── Categories & variables ───────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "auth",
    label: "Autentificare (Sistem)",
    Icon: ShieldCheck,
    note: "Emailuri trimise automat de Supabase Auth. Modificările se salvează direct în Supabase la apăsarea butonului Salvează.",
    emails: [
      { id: "verify_email",   label: "Confirmare cont",  desc: "La înregistrare",       isSystem: true },
      { id: "reset_password", label: "Resetare parolă",  desc: "La cerere resetare",    isSystem: true },
      { id: "change_email",   label: "Schimbare email",  desc: "La schimbare adresă",   isSystem: true },
      { id: "invite_user",    label: "Invitație admin",  desc: "La invitare echipă",    isSystem: true },
    ],
  },
  {
    id: "onboarding",
    label: "Onboarding",
    Icon: UserCircle,
    emails: [
      { id: "welcome",         label: "Bun venit",       desc: "Imediat după confirmare cont" },
      { id: "getting_started", label: "Ghid de start",   desc: "A doua zi după înregistrare" },
      { id: "first_checkin",   label: "Primul check-in", desc: "La primul check-in completat" },
    ],
  },
  {
    id: "engagement",
    label: "Progres & Engagement",
    Icon: Sparkle,
    emails: [
      { id: "weekly_summary",  label: "Rezumat săptămânal", desc: "Luni dimineața" },
      { id: "practice_streak", label: "Streak practici",    desc: "La 3/7/30 zile consecutive" },
      { id: "reactivation",    label: "Reactivare",         desc: "După 7 zile inactivitate" },
    ],
  },
  {
    id: "sessions",
    label: "Sesiuni LIVE",
    Icon: CalendarBlank,
    emails: [
      { id: "session_booked",   label: "Confirmare rezervare", desc: "Imediat după rezervare" },
      { id: "session_reminder", label: "Reminder sesiune",     desc: "Cu 24h înainte" },
      { id: "session_followup", label: "Follow-up sesiune",    desc: "La 2h după sesiune" },
    ],
  },
  {
    id: "billing",
    label: "Abonamente",
    Icon: CreditCard,
    emails: [
      { id: "sub_activated",  label: "Abonament activat",       desc: "La upgrade plan" },
      { id: "trial_ending",   label: "Trial pe cale să expire", desc: "Cu 3 zile înainte" },
      { id: "payment_failed", label: "Plată eșuată",            desc: "La plată respinsă" },
      { id: "sub_cancelled",  label: "Abonament anulat",        desc: "La anulare" },
    ],
  },
];

const VARS_BY_CATEGORY: Record<string, string[]> = {
  auth:       ["{{prenume}}", "{{email}}", "{{link}}", "{{rol}}"],
  onboarding: ["{{prenume}}", "{{email}}", "{{plan}}", "{{link}}"],
  engagement: ["{{prenume}}", "{{nr_practici}}", "{{nr_minute}}", "{{nr_zile}}", "{{streak}}", "{{mesaj_personalizat}}", "{{link}}"],
  sessions:   ["{{prenume}}", "{{sesiune_titlu}}", "{{sesiune_data}}", "{{sesiune_durata}}", "{{facilitator_nume}}", "{{link}}"],
  billing:    ["{{prenume}}", "{{plan}}", "{{suma}}", "{{data_reinnoire}}", "{{data_expirare}}", "{{nr_zile}}", "{{link}}"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialTemplates(): Record<string, EmailTemplate> {
  return Object.fromEntries(
    Object.entries(EMAIL_DEFAULTS).map(([id, tpl]) => [id, { ...tpl, status: "activ" as EmailStatus }])
  );
}

// Extracts the editable inner content from the full SHELL HTML
function getInnerContent(html: string): string {
  if (typeof window === "undefined") return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const wrapper = doc.querySelector("body > div");
    if (!wrapper) return html;
    const hr = wrapper.querySelector("hr");
    if (hr) {
      let sib = hr.nextElementSibling;
      while (sib) { const n = sib.nextElementSibling; sib.remove(); sib = n; }
      hr.remove();
    }
    return wrapper.innerHTML.trim();
  } catch { return ""; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminEmailuriPage() {
  const [selected, setSelected] = useState<{ id: string; categoryId: string } | null>(null);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({ auth: true, onboarding: true });
  const [activeTab, setActiveTab] = useState<EditorTab>("editare");
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>(buildInitialTemplates);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("inauntru.app@gmail.com");
  const [authLoaded, setAuthLoaded] = useState(false);

  const editorRef = useRef<RichTextEditorHandle>(null);

  const currentEmail = selected ? templates[selected.id] : null;
  const currentCategory = selected ? CATEGORIES.find((c) => c.id === selected.categoryId) : null;
  const currentDef = currentCategory?.emails.find((e) => e.id === selected?.id);

  // Load auth templates from Supabase Management API
  useEffect(() => {
    fetch("/api/admin/auth-templates")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setAuthLoaded(true);
        setTemplates((prev) => {
          const updated = { ...prev };
          for (const [id, tpl] of Object.entries(data) as [string, { subject: string; body: string }][]) {
            if (tpl.body && updated[id]) {
              updated[id] = { ...updated[id], subject: tpl.subject || updated[id].subject, body: tpl.body || updated[id].body };
            }
          }
          return updated;
        });
      })
      .catch(() => {});
  }, []);

  // Load saved non-auth templates from settings table
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.email_templates) return;
        setTemplates((prev) => {
          const updated = { ...prev };
          for (const [id, tpl] of Object.entries(data.email_templates) as [string, { subject: string; body: string }][]) {
            if (tpl.body && updated[id]) {
              updated[id] = { ...updated[id], subject: tpl.subject || updated[id].subject, body: tpl.body || updated[id].body };
            }
          }
          return updated;
        });
      })
      .catch(() => {});
  }, []);

  function updateField(field: keyof EmailTemplate, value: string | EmailStatus) {
    if (!selected) return;
    setTemplates((prev) => ({ ...prev, [selected.id]: { ...prev[selected.id], [field]: value } }));
  }

  function insertVariable(v: string) {
    editorRef.current?.insertText(v);
  }

  async function handleSave() {
    if (!selected || !currentEmail) return;
    setSaving(true);
    setSaveError(null);

    if (currentDef?.isSystem) {
      // Auth templates → Supabase Management API
      try {
        const res = await fetch("/api/admin/auth-templates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [selected.id]: { subject: currentEmail.subject, body: currentEmail.body },
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          setSaveError(d.error ?? "Eroare la salvare în Supabase");
          setSaving(false);
          return;
        }
      } catch {
        setSaveError("Eroare de rețea — verifică conexiunea");
        setSaving(false);
        return;
      }
    } else {
      // Non-auth: load existing saved templates, merge only this template, then save back
      let existing: Record<string, { subject: string; body: string }> = {};
      try {
        const getRes = await fetch("/api/admin/settings");
        if (getRes.ok) {
          const data = await getRes.json();
          existing = data?.email_templates ?? {};
        }
      } catch {}

      const merged = {
        ...existing,
        [selected.id]: { subject: currentEmail.subject, body: currentEmail.body },
      };

      try {
        const res = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "email_templates", value: merged }),
        });
        if (!res.ok) {
          const d = await res.json();
          setSaveError(d.error ?? "Eroare la salvare");
          setSaving(false);
          return;
        }
      } catch {
        setSaveError("Eroare de rețea — verifică conexiunea");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTestSend() {
    if (!selected || !currentEmail) return;
    setTestSending(true); setTestSent(false); setTestError(null);
    try {
      const res = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selected.id, subject: currentEmail.subject, body: currentEmail.body, to: testEmail }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Eroare"); }
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3500);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Eroare la trimitere");
      setTimeout(() => setTestError(null), 4000);
    } finally { setTestSending(false); }
  }

  function toggleCat(id: string) { setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] })); }

  const TABS: { id: EditorTab; label: string; Icon: React.ElementType }[] = [
    { id: "editare", label: "Editare", Icon: PencilSimple },
    { id: "previzualizare", label: "Previzualizare", Icon: Eye },
    { id: "cod", label: "Cod HTML", Icon: Code },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full">
      <div className="mb-6">
        <h1 className="font-heading text-h2 text-deep-green">Emailuri</h1>
        <p className="font-body text-body-sm text-secondary-text">Editează toate emailurile trimise automat utilizatorilor</p>
      </div>

      <div className="flex gap-5 items-start">
        {/* ── Left sidebar ─────────────────────────────────────────── */}
        <div className="w-64 flex-shrink-0 space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            const isOpen = expandedCats[cat.id] ?? false;
            return (
              <div key={cat.id}>
                <button onClick={() => toggleCat(cat.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-light-green/60 transition-colors text-left">
                  <Icon size={15} className="text-forest-green flex-shrink-0" weight="bold" />
                  <span className="font-body text-body-sm font-semibold text-deep-green flex-1">{cat.label}</span>
                  <CaretRight size={12} className={`text-secondary-text transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {cat.emails.map((email) => {
                      const isActive = selected?.id === email.id;
                      const tpl = templates[email.id];
                      return (
                        <button key={email.id}
                          onClick={() => { setSelected({ id: email.id, categoryId: cat.id }); setActiveTab("editare"); }}
                          className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left ${isActive ? "bg-forest-green/10 border border-forest-green/20" : "hover:bg-light-green/50"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${tpl?.status === "draft" ? "bg-amber-400" : "bg-forest-green"}`} />
                          <div>
                            <p className={`font-body text-body-sm font-medium leading-tight ${isActive ? "text-forest-green" : "text-on-surface"}`}>{email.label}</p>
                            <p className="font-body text-[11px] text-secondary-text mt-0.5">{email.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Right: editor ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="card bg-white p-12 flex flex-col items-center justify-center text-center">
              <EnvelopeSimple size={40} className="text-sage-border mb-3" />
              <p className="font-body text-body-sm text-secondary-text">Selectează un email din lista din stânga pentru a-l edita.</p>
            </div>
          ) : currentEmail ? (
            <div className="card bg-white overflow-hidden">
              {/* Card header */}
              <div className="px-5 py-4 border-b border-sage-border/60 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-body font-semibold text-body-md text-deep-green">{currentDef?.label}</h2>
                  <p className="font-body text-label-xs text-secondary-text mt-0.5">{currentDef?.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-body text-label-xs text-secondary-text">{currentEmail.status === "activ" ? "Activ" : "Draft"}</span>
                  <button onClick={() => updateField("status", currentEmail.status === "activ" ? "draft" : "activ")} className="text-forest-green">
                    {currentEmail.status === "activ" ? <ToggleRight size={26} weight="fill" /> : <ToggleLeft size={26} className="text-secondary-text" />}
                  </button>
                </div>
              </div>

              {/* System note */}
              {currentDef?.isSystem && (
                <div className={`mx-5 mt-4 flex items-start gap-2.5 p-3 rounded-xl border ${authLoaded ? "bg-forest-green/5 border-forest-green/20" : "bg-amber-50 border-amber-200"}`}>
                  <Info size={14} className={`flex-shrink-0 mt-0.5 ${authLoaded ? "text-forest-green" : "text-amber-600"}`} />
                  <p className={`font-body text-label-xs leading-relaxed ${authLoaded ? "text-forest-green" : "text-amber-700"}`}>
                    {authLoaded
                      ? "Conectat la Supabase. Modificările se salvează automat în Authentication → Email Templates."
                      : "Template-urile Supabase Auth se salvează automat la apăsarea butonului Salvează — nu mai trebuie să copiezi manual."}
                  </p>
                </div>
              )}

              {/* Feedback banners */}
              {saved && (
                <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-forest-green/10 border border-forest-green/20 rounded-xl text-forest-green font-body text-body-sm">
                  <Check size={14} weight="bold" />
                  {currentDef?.isSystem ? "Salvat și trimis automat la Supabase." : "Template salvat cu succes."}
                </div>
              )}
              {saveError && (
                <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 font-body text-body-sm">
                  <Info size={14} /> {saveError}
                </div>
              )}
              {testSent && (
                <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-body text-body-sm">
                  <PaperPlane size={14} /> Email de test trimis la {testEmail}
                </div>
              )}
              {testError && (
                <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 font-body text-body-sm">
                  <Info size={14} /> {testError}
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Subject + Preheader — always visible */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-label-xs text-secondary-text uppercase tracking-widest block mb-1.5">Subiect email</label>
                    <input type="text" value={currentEmail.subject} onChange={(e) => updateField("subject", e.target.value)} className="input w-full" />
                  </div>
                  <div>
                    <label className="font-body text-label-xs text-secondary-text uppercase tracking-widest block mb-1.5">
                      Preheader <span className="normal-case tracking-normal">(previzualizare în inbox)</span>
                    </label>
                    <input type="text" value={currentEmail.preheader} onChange={(e) => updateField("preheader", e.target.value)} className="input w-full" />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 border-b border-sage-border/60">
                  {TABS.map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 font-body text-body-sm font-medium border-b-2 -mb-px transition-all ${
                        activeTab === id ? "border-forest-green text-forest-green" : "border-transparent text-secondary-text hover:text-deep-green"
                      }`}>
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>

                {/* ── Editare (TipTap) ── */}
                {activeTab === "editare" && (
                  <div className="space-y-3">
                    <RichTextEditor
                      ref={editorRef}
                      content={getInnerContent(currentEmail.body)}
                      onChange={(html) => updateField("body", SHELL(html))}
                      placeholder="Scrie conținutul emailului..."
                      minHeight="280px"
                    />

                    {/* Variables */}
                    <div className="flex items-start gap-2.5 p-3 bg-light-green/60 border border-sage-border rounded-xl">
                      <Info size={14} className="text-forest-green flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-body text-label-xs font-semibold text-deep-green mb-1.5">Variabile disponibile — click pentru a insera la cursor</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(VARS_BY_CATEGORY[selected.categoryId] ?? []).map((v) => (
                            <button key={v} onClick={() => insertVariable(v)}
                              className="bg-white border border-sage-border rounded px-1.5 py-0.5 font-mono text-[11px] text-forest-green hover:bg-forest-green hover:text-white transition-colors">
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="email@test.com" className="input text-xs h-9 flex-1 max-w-xs" />
                      <button onClick={handleTestSend} disabled={testSending || !testEmail}
                        className="btn btn-ghost btn-sm gap-1.5 disabled:opacity-50 flex-shrink-0">
                        {testSending ? <CircleNotch size={13} className="animate-spin" /> : <PaperPlane size={13} />}
                        {testSending ? "Se trimite..." : "Trimite test"}
                      </button>
                      <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm ml-auto gap-1.5 disabled:opacity-50">
                        {saving ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
                        {saving ? "Se salvează..." : "Salvează"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Previzualizare ── */}
                {activeTab === "previzualizare" && (
                  <div>
                    <div className="border border-sage-border rounded-xl overflow-hidden" style={{ height: "520px" }}>
                      <iframe srcDoc={currentEmail.body} className="w-full h-full" title="Email preview" sandbox="allow-same-origin" />
                    </div>
                    <p className="font-body text-[11px] text-secondary-text/60 mt-2 text-center">
                      Previzualizare cu variabilele neînlocuite — în producție vor fi completate automat.
                    </p>
                  </div>
                )}

                {/* ── Cod HTML ── */}
                {activeTab === "cod" && (
                  <div>
                    <p className="font-body text-label-xs text-secondary-text mb-2">Pentru utilizatori avansați — editare directă cod HTML.</p>
                    <textarea
                      value={currentEmail.body}
                      onChange={(e) => updateField("body", e.target.value)}
                      className="input w-full font-mono text-xs leading-relaxed"
                      style={{ minHeight: "400px", resize: "vertical" }}
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="email@test.com" className="input text-xs h-9 flex-1 max-w-xs" />
                      <button onClick={handleTestSend} disabled={testSending || !testEmail}
                        className="btn btn-ghost btn-sm gap-1.5 disabled:opacity-50 flex-shrink-0">
                        {testSending ? <CircleNotch size={13} className="animate-spin" /> : <PaperPlane size={13} />}
                        {testSending ? "Se trimite..." : "Trimite test"}
                      </button>
                      <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm ml-auto gap-1.5 disabled:opacity-50">
                        {saving ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
                        {saving ? "Se salvează..." : "Salvează"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
