"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, CircleNotch, Eye, EyeSlash,
  Warning, X, Lock, User, ShieldCheck, Trash,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";

const PLAN_LABEL: Record<string, string> = {
  gratuit: "Gratuit", standard: "Standard", premium: "Premium",
};
const PLAN_CLS: Record<string, string> = {
  gratuit: "bg-sage-border/40 text-secondary-text border-sage-border",
  standard: "bg-forest-green/10 text-forest-green border-forest-green/20",
  premium: "bg-deep-green/10 text-deep-green border-deep-green/20",
};

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-deep-green text-white rounded-xl shadow-modal font-body text-body-sm"
      onAnimationComplete={onDone}
    >
      <Check size={16} weight="bold" className="text-sage-border flex-shrink-0" />
      {msg}
    </motion.div>
  );
}

export default function ContPage() {
  const { profile, user: authUser } = useAuth();
  const router = useRouter();

  const firstName = profile?.first_name || authUser?.user_metadata?.first_name || "";
  const lastName = profile?.last_name || authUser?.user_metadata?.last_name || "";
  const email = authUser?.email || "";
  const plan = profile?.plan || "gratuit";
  const initials = ([firstName?.[0], lastName?.[0]].filter(Boolean).join("") || email?.[0] || "U").toUpperCase();

  // Profile form
  const [pFirst, setPFirst] = useState(firstName);
  const [pLast, setPLast] = useState(lastName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleProfileSave() {
    setProfileSaving(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: pFirst, last_name: pLast }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare");
      showToast("Profilul a fost salvat.");
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave() {
    if (newPass !== confirmPass) { setPassError("Parolele nu coincid."); return; }
    setPassSaving(true);
    setPassError(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare");
      setNewPass("");
      setConfirmPass("");
      showToast("Parola a fost schimbată.");
    } catch (e) {
      setPassError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setPassSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eroare");
      router.push("/");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Eroare");
      setDeleting(false);
    }
  }

  const labelCls = "font-body text-label-xs text-secondary-text uppercase tracking-widest block mb-1.5";

  return (
    <div className="min-h-screen bg-bg-main p-4 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-body text-body-sm text-secondary-text hover:text-deep-green transition-colors mb-8"
        >
          <ArrowLeft size={16} weight="bold" />
          Înapoi la Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-8 mb-8 bg-gradient-to-br from-light-green/80 via-light-green/20 to-transparent"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-deep-green flex items-center justify-center flex-shrink-0 shadow-modal">
              <span className="font-heading text-xl font-bold text-white">{initials}</span>
            </div>
            <div>
              <h1 className="font-heading text-h2 text-deep-green">
                {[firstName, lastName].filter(Boolean).join(" ") || "Contul meu"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-body text-body-sm text-secondary-text">{email}</span>
                <span className={`tag text-[10px] border ${PLAN_CLS[plan] ?? PLAN_CLS.gratuit}`}>
                  {PLAN_LABEL[plan] ?? "Gratuit"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card bg-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-light-green flex items-center justify-center">
                <User size={17} weight="fill" className="text-forest-green" />
              </div>
              <div>
                <h2 className="font-body font-semibold text-body-md text-deep-green">Profil personal</h2>
                <p className="font-body text-label-xs text-secondary-text">Numele tău apare în aplicație și în comunicările noastre.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Prenume</label>
                <input className="input w-full" value={pFirst} onChange={(e) => setPFirst(e.target.value)} placeholder="Ana" />
              </div>
              <div>
                <label className={labelCls}>Nume</label>
                <input className="input w-full" value={pLast} onChange={(e) => setPLast(e.target.value)} placeholder="Popescu" />
              </div>
            </div>

            <div className="mb-5">
              <label className={labelCls}>Email</label>
              <input className="input w-full bg-light-green/40 text-secondary-text cursor-not-allowed" value={email} readOnly />
              <p className="font-body text-label-xs text-secondary-text mt-1.5">Adresa de email nu poate fi schimbată momentan.</p>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600">{profileError}</div>
            )}

            <button
              onClick={handleProfileSave}
              disabled={profileSaving || (!pFirst.trim() || !pLast.trim())}
              className="btn btn-primary btn-sm gap-2 disabled:opacity-40"
            >
              {profileSaving ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} weight="bold" />}
              {profileSaving ? "Se salvează..." : "Salvează modificările"}
            </button>
          </motion.div>

          {/* Password */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-white p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-light flex items-center justify-center">
                <Lock size={17} weight="fill" className="text-indigo" />
              </div>
              <div>
                <h2 className="font-body font-semibold text-body-md text-deep-green">Securitate</h2>
                <p className="font-body text-label-xs text-secondary-text">Schimbă parola contului tău.</p>
              </div>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className={labelCls}>Parolă nouă</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="input w-full pr-12"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Minim 8 caractere"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-deep-green"
                  >
                    {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Confirmă parola nouă</label>
                <input
                  type={showPass ? "text" : "password"}
                  className="input w-full"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repetă parola"
                />
              </div>
            </div>

            {passError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600">{passError}</div>
            )}

            <button
              onClick={handlePasswordSave}
              disabled={passSaving || newPass.length < 8 || !confirmPass}
              className="btn btn-primary btn-sm gap-2 disabled:opacity-40"
            >
              {passSaving ? <CircleNotch size={13} className="animate-spin" /> : <ShieldCheck size={13} weight="bold" />}
              {passSaving ? "Se schimbă..." : "Schimbă parola"}
            </button>
          </motion.div>

          {/* Plan */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-body font-semibold text-body-md text-deep-green mb-1">Plan & Abonament</h2>
                <p className="font-body text-body-sm text-secondary-text">
                  Ești pe planul{" "}
                  <span className={`tag text-[10px] border ml-1 ${PLAN_CLS[plan] ?? PLAN_CLS.gratuit}`}>
                    {PLAN_LABEL[plan] ?? "Gratuit"}
                  </span>
                </p>
              </div>
              {plan === "gratuit" && (
                <Link href="/preturi" className="btn btn-primary btn-sm">
                  Upgrade
                </Link>
              )}
            </div>
            {plan !== "gratuit" && (
              <p className="font-body text-label-xs text-secondary-text mt-4">
                Istoricul plăților și gestionarea abonamentului vor fi disponibile după integrarea Stripe.
              </p>
            )}
          </motion.div>

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card bg-white p-6 border border-red-100">
            <h2 className="font-body font-semibold text-body-md text-red-600 mb-1">Zonă periculoasă</h2>
            <p className="font-body text-body-sm text-secondary-text mb-4">
              Ștergerea contului este permanentă și nu poate fi anulată. Toate datele tale vor fi șterse definitiv.
            </p>
            <button
              onClick={() => setDeleteOpen(true)}
              className="h-9 px-5 rounded-full border border-red-200 text-red-600 font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center gap-2 hover:bg-red-50 transition-colors"
            >
              <Trash size={13} /> Șterge contul definitiv
            </button>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast} onDone={() => {}} />}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setDeleteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6"
            >
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
                <button onClick={() => setDeleteOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-green">
                  <X size={16} />
                </button>
              </div>

              <p className="font-body text-body-sm text-on-surface mb-4">
                Toate datele tale (jurnal, progres, check-in-uri) vor fi șterse permanent. Această acțiune nu poate fi anulată.
              </p>

              <div className="mb-4">
                <label className={labelCls}>Scrie „{email}" pentru a confirma</label>
                <input
                  className="input w-full"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={email}
                />
              </div>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600">{deleteError}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setDeleteOpen(false)} disabled={deleting} className="btn btn-ghost btn-sm flex-1">
                  Anulează
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirm !== email}
                  className="flex-1 h-9 rounded-full bg-red-600 text-white font-ui font-semibold text-label-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-40"
                >
                  {deleting ? <CircleNotch size={13} className="animate-spin" /> : <Trash size={13} />}
                  {deleting ? "Se șterge..." : "Șterge definitiv"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
