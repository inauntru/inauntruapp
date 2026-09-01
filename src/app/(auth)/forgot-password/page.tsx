"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Envelope, ArrowRight, ArrowLeft, Check } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ForgotPasswordPage() {
  const { tr } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  // Venit aici cu un link de resetare expirat → explicăm de ce
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("expired") === "1") setExpired(true);
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (authError) {
      // Mesajele Supabase vin în engleză — le traducem pe cele întâlnite des
      const m = authError.message;
      const seconds = m.match(/after (\d+) second/)?.[1];
      if (/security purposes|rate limit|too many/i.test(m)) {
        setError(
          seconds
            ? `Din motive de securitate, mai așteaptă ${seconds} secunde și încearcă din nou.`
            : "Prea multe încercări — mai așteaptă câteva secunde și încearcă din nou."
        );
      } else if (/invalid/i.test(m)) {
        setError("Adresa de email nu pare validă — verific-o și încearcă din nou.");
      } else {
        setError(m);
      }
    } else {
      setSent(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="card p-8 md:p-10">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-light-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Envelope size={24} weight="regular" className="text-forest-green" />
                </div>
                <h1 className="font-heading text-h2 text-deep-green mb-2">{tr("Ai uitat parola?")}</h1>
                <p className="font-body text-body-sm text-secondary-text">
                  {tr("Introdu email-ul asociat contului și îți trimitem un link de resetare.")}
                </p>
              </div>

              {expired && (
                <p className="font-body text-body-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                  {tr("Linkul de resetare a expirat (e valabil o oră). Introdu adresa și îți trimitem unul nou.")}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">{tr("Email")}</label>
                  <div className="relative">
                    <Envelope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tr("email@exemplu.ro")}
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <p className="font-body text-body-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{tr(error)}</p>
                )}

                <button type="submit" disabled={loading || !email} className="btn btn-primary w-full disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {tr("Se trimite...")}
                    </span>
                  ) : (
                    <>{tr("Trimite link de resetare")} <ArrowRight size={16} weight="bold" /></>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link href="/login" className="inline-flex items-center gap-2 font-body text-body-sm text-secondary-text hover:text-forest-green transition-colors">
                  <ArrowLeft size={14} weight="bold" />
                  {tr("Înapoi la autentificare")}
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-light-green rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={28} weight="bold" className="text-forest-green" />
              </div>
              <h2 className="font-heading text-h2 text-deep-green mb-3">{tr("Email trimis!")}</h2>
              <p className="font-body text-body-md text-secondary-text mb-6">
                {tr("Am trimis un link de resetare la")} <strong className="text-deep-green">{email}</strong>. {tr("Verifică și folderul de spam.")}
              </p>
              <Link href="/login" className="btn btn-primary w-full">
                {tr("Înapoi la autentificare")}
              </Link>
              <button
                onClick={() => { setSent(false); setError(""); }}
                className="mt-4 font-body text-body-sm text-secondary-text hover:text-forest-green transition-colors"
              >
                {tr("Ai greșit adresa? Trimite din nou")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
