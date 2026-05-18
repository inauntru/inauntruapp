"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Envelope, ArrowRight, ArrowLeft, Check } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
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
                <h1 className="font-heading text-h2 text-deep-green mb-2">Ai uitat parola?</h1>
                <p className="font-body text-body-sm text-secondary-text">
                  Introdu email-ul asociat contului și îți trimitem un link de resetare.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-body text-label-sm text-on-surface mb-1.5 block">Email</label>
                  <div className="relative">
                    <Envelope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplu.ro"
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <p className="font-body text-body-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                )}

                <button type="submit" disabled={loading || !email} className="btn btn-primary w-full disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Se trimite...
                    </span>
                  ) : (
                    <>Trimite link de resetare <ArrowRight size={16} weight="bold" /></>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link href="/login" className="inline-flex items-center gap-2 font-body text-body-sm text-secondary-text hover:text-forest-green transition-colors">
                  <ArrowLeft size={14} weight="bold" />
                  Înapoi la autentificare
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
              <h2 className="font-heading text-h2 text-deep-green mb-3">Email trimis!</h2>
              <p className="font-body text-body-md text-secondary-text mb-6">
                Am trimis un link de resetare la <strong className="text-deep-green">{email}</strong>. Verifică și folderul de spam.
              </p>
              <Link href="/login" className="btn btn-primary w-full">
                Înapoi la autentificare
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
