"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, CircleNotch, Eye, EyeSlash,
  Warning, X, Lock, User, ShieldCheck, Trash,
  Bell, CreditCard, Shield, Question, ArrowRight,
  Export, SignOut,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "profil" | "abonament" | "notificari" | "securitate" | "confidentialitate" | "ajutor";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profil",            label: "Profil",           icon: User },
  { id: "abonament",         label: "Abonament",        icon: CreditCard },
  { id: "notificari",        label: "Notificări",       icon: Bell },
  { id: "securitate",        label: "Securitate",       icon: Lock },
  { id: "confidentialitate", label: "Confidențialitate",icon: Shield },
  { id: "ajutor",            label: "Ajutor",           icon: Question },
];

const PLAN_LABEL: Record<string, string> = { gratuit: "Gratuit", standard: "Standard", premium: "Premium" };
const PLAN_CLS: Record<string, string> = {
  gratuit:  "bg-sage-border/40 text-secondary-text border-sage-border",
  standard: "bg-forest-green/10 text-forest-green border-forest-green/20",
  premium:  "bg-deep-green/10 text-deep-green border-deep-green/20",
};

// ── Helpers ────────────────────────────────────────────────────────────────

const labelCls = "font-body text-label-xs text-secondary-text uppercase tracking-widest block mb-1.5";

function SaveBtn({ loading, disabled, label = "Salvează" }: { loading: boolean; disabled?: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading || disabled} className="btn btn-primary btn-sm gap-2 disabled:opacity-40">
      {loading ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
      {loading ? "Se salvează..." : label}
    </button>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600">{msg}</div>;
}

function SuccessBox({ msg }: { msg: string }) {
  return (
    <div className="mb-4 p-3 bg-light-green border border-sage-border rounded-xl font-body text-label-xs text-forest-green flex items-center gap-2">
      <Check size={14} weight="bold" /> {msg}
    </div>
  );
}

// ── Tab: Profil ────────────────────────────────────────────────────────────

const GOALS = [
  "Reducerea anxietății",
  "Somn mai bun",
  "Gestionarea stresului",
  "Reconectare cu sinele",
  "Reglarea sistemului nervos",
  "Mindfulness zilnic",
];

function ProfilTab({ profile, authUser }: { profile: ReturnType<typeof useAuth>["profile"]; authUser: ReturnType<typeof useAuth>["user"] }) {
  const fn = profile?.first_name || authUser?.user_metadata?.first_name || "";
  const ln = profile?.last_name  || authUser?.user_metadata?.last_name  || "";
  const [pFirst, setPFirst] = useState(fn);
  const [pLast,  setPLast]  = useState(ln);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [ok,     setOk]     = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setOk(false);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: pFirst, last_name: pLast }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Eroare"); } else { setOk(true); setTimeout(() => setOk(false), 3000); }
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h2 className="font-heading text-h3 text-deep-green mb-1">Profil personal</h2>
        <p className="font-body text-body-sm text-secondary-text">Informațiile tale de bază în aplicație.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Prenume</label><input className="input w-full" value={pFirst} onChange={e => setPFirst(e.target.value)} placeholder="Ana" required /></div>
        <div><label className={labelCls}>Nume</label><input className="input w-full" value={pLast} onChange={e => setPLast(e.target.value)} placeholder="Popescu" required /></div>
      </div>

      <div>
        <label className={labelCls}>Email</label>
        <input className="input w-full bg-light-green/40 text-secondary-text cursor-not-allowed" value={authUser?.email || ""} readOnly />
        <p className="font-body text-label-xs text-secondary-text mt-1.5">Adresa de email nu poate fi modificată momentan.</p>
      </div>

      <div className="pt-2 border-t border-sage-border/40">
        <label className={labelCls + " mb-3"}>Obiectivele tale</label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(g => (
            <span key={g} className="tag bg-light-green text-forest-green border border-sage-border/60 cursor-default">{g}</span>
          ))}
        </div>
        <p className="font-body text-label-xs text-secondary-text mt-2">Personalizarea obiectivelor vine în curând.</p>
      </div>

      {error && <ErrorBox msg={error} />}
      {ok    && <SuccessBox msg="Profilul a fost salvat cu succes." />}
      <SaveBtn loading={saving} disabled={!pFirst.trim() || !pLast.trim()} />
    </form>
  );
}

// ── Tab: Abonament ─────────────────────────────────────────────────────────

function AbonamentTab({ profile }: { profile: ReturnType<typeof useAuth>["profile"] }) {
  const plan = profile?.plan || "gratuit";
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-h3 text-deep-green mb-1">Abonament</h2>
        <p className="font-body text-body-sm text-secondary-text">Planul tău curent și opțiunile de upgrade.</p>
      </div>

      <div className="rounded-2xl border border-sage-border/40 p-5 flex items-center justify-between">
        <div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-widest mb-1">Plan curent</p>
          <div className="flex items-center gap-2">
            <span className="font-heading text-h3 text-deep-green">{PLAN_LABEL[plan] ?? "Gratuit"}</span>
            <span className={`tag text-[10px] border ${PLAN_CLS[plan] ?? PLAN_CLS.gratuit}`}>{PLAN_LABEL[plan] ?? "Gratuit"}</span>
          </div>
        </div>
        {plan === "gratuit" && (
          <Link href="/preturi" className="btn btn-primary btn-sm gap-1.5">
            Upgrade <ArrowRight size={13} weight="bold" />
          </Link>
        )}
      </div>

      {plan === "gratuit" && (
        <div className="space-y-3">
          {[
            { name: "Standard", price: "49 RON/lună", features: ["Acces complet la bibliotecă", "Sesiuni Live incluse", "Jurnal nelimitat", "Rezumat săptămânal"] },
            { name: "Premium",  price: "89 RON/lună", features: ["Tot ce include Standard", "Sesiuni 1-la-1 cu facilitatori", "Program personalizat", "Suport prioritar"] },
          ].map(p => (
            <div key={p.name} className="rounded-2xl border border-sage-border/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-body font-semibold text-body-md text-deep-green">{p.name}</span>
                  <span className="font-body text-label-xs text-secondary-text ml-2">{p.price}</span>
                </div>
                <Link href="/preturi" className="btn btn-ghost btn-sm">Vezi detalii</Link>
              </div>
              <ul className="space-y-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 font-body text-body-sm text-on-surface">
                    <Check size={13} weight="bold" className="text-forest-green flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {plan !== "gratuit" && (
        <div className="rounded-2xl bg-light-green/50 border border-sage-border/40 p-5 text-center">
          <p className="font-body text-body-sm text-secondary-text">Gestionarea facturării și istoricul plăților vor fi disponibile după integrarea Stripe.</p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Notificări ────────────────────────────────────────────────────────

function NotificariTab() {
  const [notifs, setNotifs] = useState({
    weeklyDigest: true,
    sessionReminders: true,
    newContent: false,
    promotions: false,
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  const items = [
    { key: "weeklyDigest",      label: "Rezumat săptămânal",         desc: "Progresul tău și recomandări personalizate" },
    { key: "sessionReminders",  label: "Reminder sesiuni live",      desc: "Cu 24h înainte de o sesiune la care ești înscris" },
    { key: "newContent",        label: "Conținut nou",               desc: "Când adăugăm practici sau facilitatori noi" },
    { key: "promotions",        label: "Oferte și noutăți",          desc: "Promoții, evenimente speciale, anunțuri" },
  ] as const;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h2 className="font-heading text-h3 text-deep-green mb-1">Notificări</h2>
        <p className="font-body text-body-sm text-secondary-text">Controlează ce emailuri primești de la noi.</p>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <label key={item.key} className="flex items-start gap-4 p-4 rounded-2xl border border-sage-border/40 bg-white hover:border-forest-green/30 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={notifs[item.key]}
              onChange={e => setNotifs(prev => ({ ...prev, [item.key]: e.target.checked }))}
              className="mt-0.5 w-4 h-4 accent-forest-green flex-shrink-0"
            />
            <div>
              <p className="font-body font-semibold text-body-sm text-deep-green">{item.label}</p>
              <p className="font-body text-label-xs text-secondary-text">{item.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <p className="font-body text-label-xs text-secondary-text">Notificările push vor fi disponibile în versiunea mobilă.</p>
      {ok && <SuccessBox msg="Preferințele au fost salvate." />}
      <SaveBtn loading={saving} />
    </form>
  );
}

// ── Tab: Securitate ────────────────────────────────────────────────────────

function SecuritateTab() {
  const { signOut } = useAuth();
  const [newPass, setNewPass]       = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [ok, setOk]                 = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== confirmPass) { setError("Parolele nu coincid."); return; }
    setSaving(true); setError(null);
    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPass }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Eroare"); }
    else { setNewPass(""); setConfirmPass(""); setOk(true); setTimeout(() => setOk(false), 3000); }
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-h3 text-deep-green mb-1">Securitate</h2>
        <p className="font-body text-body-sm text-secondary-text">Gestionează accesul la contul tău.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-8 border-b border-sage-border/40">
        <h3 className="font-body font-semibold text-body-md text-deep-green">Schimbă parola</h3>
        <div>
          <label className={labelCls}>Parolă nouă</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} className="input w-full pr-12" value={newPass}
              onChange={e => setNewPass(e.target.value)} placeholder="Minim 8 caractere" minLength={8} required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-deep-green">
              {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls}>Confirmă parola nouă</label>
          <input type={showPass ? "text" : "password"} className="input w-full" value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)} placeholder="Repetă parola" required />
        </div>
        {error && <ErrorBox msg={error} />}
        {ok    && <SuccessBox msg="Parola a fost schimbată." />}
        <SaveBtn loading={saving} disabled={newPass.length < 8 || !confirmPass} label="Schimbă parola" />
      </form>

      <div className="space-y-3">
        <h3 className="font-body font-semibold text-body-md text-deep-green">Sesiuni active</h3>
        <p className="font-body text-body-sm text-secondary-text">Deconectează-te de pe toate dispozitivele.</p>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 h-9 px-5 rounded-full border border-sage-border text-secondary-text font-ui font-semibold text-label-xs uppercase tracking-wide hover:border-deep-green hover:text-deep-green transition-colors"
        >
          <SignOut size={14} /> Deconectare completă
        </button>
      </div>
    </div>
  );
}

// ── Tab: Confidențialitate ─────────────────────────────────────────────────

function ConfidentialitateTab({ authUser }: { authUser: ReturnType<typeof useAuth>["user"] }) {
  const router = useRouter();
  const email = authUser?.email || "";
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true); setDeleteError(null);
    const res = await fetch("/api/user/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });
    const data = await res.json();
    if (!res.ok) { setDeleteError(data.error ?? "Eroare"); setDeleting(false); }
    else { router.push("/"); }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-h3 text-deep-green mb-1">Confidențialitate</h2>
        <p className="font-body text-body-sm text-secondary-text">Datele tale și drepturile GDPR.</p>
      </div>

      <div className="space-y-4 pb-8 border-b border-sage-border/40">
        <h3 className="font-body font-semibold text-body-md text-deep-green">Export date</h3>
        <p className="font-body text-body-sm text-secondary-text">
          Conform GDPR, ai dreptul să descarci toate datele tale stocate în platformă (jurnal, check-in-uri, progres).
        </p>
        <button
          className="flex items-center gap-2 h-9 px-5 rounded-full border border-sage-border text-secondary-text font-ui font-semibold text-label-xs uppercase tracking-wide hover:border-forest-green hover:text-forest-green transition-colors"
          onClick={() => alert("Export date — disponibil în curând.")}
        >
          <Export size={14} /> Descarcă datele mele
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-body font-semibold text-body-md text-red-600">Ștergere cont</h3>
        <p className="font-body text-body-sm text-secondary-text">
          Ștergerea contului este permanentă. Toate datele (jurnal, progres, check-in-uri) vor fi eliminate definitiv.
        </p>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-2 h-9 px-5 rounded-full border border-red-200 text-red-600 font-ui font-semibold text-label-xs uppercase tracking-wide hover:bg-red-50 transition-colors"
        >
          <Trash size={13} /> Șterge contul definitiv
        </button>
      </div>

      <AnimatePresence>
        {deleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50" onClick={() => setDeleteOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Warning size={18} className="text-red-600" weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-heading text-h3 text-deep-green">Șterge contul</h3>
                    <p className="font-body text-label-xs text-secondary-text">Acțiune ireversibilă</p>
                  </div>
                </div>
                <button onClick={() => { setDeleteOpen(false); setDeletePassword(""); setDeleteError(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green">
                  <X size={16} />
                </button>
              </div>
              <p className="font-body text-body-sm text-on-surface mb-4">
                Contul pentru <strong>{email}</strong> va fi șters permanent împreună cu toate datele tale.
              </p>
              <div className="mb-4">
                <label className={labelCls}>Introdu parola pentru a confirma</label>
                <div className="relative">
                  <input type={showDeletePass ? "text" : "password"} className="input w-full pr-12"
                    value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                    placeholder="Parola contului tău" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowDeletePass(!showDeletePass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-deep-green">
                    {showDeletePass ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {deleteError && <ErrorBox msg={deleteError} />}
              <div className="flex gap-3">
                <button onClick={() => { setDeleteOpen(false); setDeletePassword(""); setDeleteError(null); }}
                  disabled={deleting} className="btn btn-ghost btn-sm flex-1">Anulează</button>
                <button onClick={handleDelete} disabled={deleting || !deletePassword}
                  className="flex-1 h-9 rounded-full bg-red-600 text-white font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-40">
                  {deleting ? <CircleNotch size={13} className="animate-spin" /> : <Trash size={13} />}
                  {deleting ? "Se verifică..." : "Șterge definitiv"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tab: Ajutor ────────────────────────────────────────────────────────────

function AjutorTab() {
  const links = [
    { label: "Centrul de ajutor", desc: "Întrebări frecvente și ghiduri de utilizare", href: "#" },
    { label: "Contactează-ne", desc: "Trimite-ne un mesaj la hello@inauntru.ro", href: "mailto:hello@inauntru.ro" },
    { label: "Termeni și condiții", desc: "Condițiile de utilizare ale platformei", href: "/termeni" },
    { label: "Politica de confidențialitate", desc: "Cum îți protejăm datele", href: "/confidentialitate" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-h3 text-deep-green mb-1">Ajutor</h2>
        <p className="font-body text-body-sm text-secondary-text">Resurse și informații utile.</p>
      </div>
      <div className="space-y-2">
        {links.map(l => (
          <a key={l.label} href={l.href}
            className="flex items-center justify-between p-4 rounded-2xl border border-sage-border/40 bg-white hover:border-forest-green/40 hover:shadow-card transition-all group">
            <div>
              <p className="font-body font-semibold text-body-sm text-deep-green group-hover:text-forest-green transition-colors">{l.label}</p>
              <p className="font-body text-label-xs text-secondary-text">{l.desc}</p>
            </div>
            <ArrowRight size={16} className="text-secondary-text group-hover:text-forest-green transition-colors" weight="bold" />
          </a>
        ))}
      </div>
      <p className="font-body text-label-xs text-secondary-text text-center pt-4">
        WithIn · v1.0 · <Link href="/despre-noi" className="hover:underline">Despre noi</Link>
      </p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ContPage() {
  const { profile, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profil");

  const fn = profile?.first_name || authUser?.user_metadata?.first_name || "";
  const ln = profile?.last_name  || authUser?.user_metadata?.last_name  || "";
  const email = authUser?.email || "";
  const plan = profile?.plan || "gratuit";
  const initials = ([fn?.[0], ln?.[0]].filter(Boolean).join("") || email?.[0] || "U").toUpperCase();
  const fullName = [fn, ln].filter(Boolean).join(" ") || "Contul meu";

  const tabContent: Record<Tab, React.ReactNode> = {
    profil:            <ProfilTab profile={profile} authUser={authUser} />,
    abonament:         <AbonamentTab profile={profile} />,
    notificari:        <NotificariTab />,
    securitate:        <SecuritateTab />,
    confidentialitate: <ConfidentialitateTab authUser={authUser} />,
    ajutor:            <AjutorTab />,
  };

  return (
    <div className="min-h-screen bg-bg-main p-4 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-body text-body-sm text-secondary-text hover:text-deep-green transition-colors mb-8">
          <ArrowLeft size={16} weight="bold" /> Înapoi la Dashboard
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-8 mb-8 bg-gradient-to-br from-light-green/80 via-light-green/20 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-deep-green flex items-center justify-center flex-shrink-0 shadow-modal">
              <span className="font-heading text-xl font-bold text-white">{initials}</span>
            </div>
            <div>
              <h1 className="font-heading text-h2 text-deep-green">{fullName}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-body text-body-sm text-secondary-text">{email}</span>
                <span className={`tag text-[10px] border ${PLAN_CLS[plan] ?? PLAN_CLS.gratuit}`}>{PLAN_LABEL[plan] ?? "Gratuit"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Layout: sidebar nav + content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left nav */}
          <nav className="lg:w-52 flex-shrink-0">
            <ul className="flex lg:flex-col gap-1 flex-wrap">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-body text-body-sm ${
                        active
                          ? "bg-deep-green text-white shadow-card"
                          : "text-secondary-text hover:text-deep-green hover:bg-light-green"
                      }`}
                    >
                      <Icon size={17} weight={active ? "fill" : "regular"} />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="card bg-white p-6"
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
