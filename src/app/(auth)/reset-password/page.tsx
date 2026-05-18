"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Check } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Supabase puts the session tokens in the URL hash after redirect
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Session is set — user can now call updateUser
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Parolele nu coincid.");
      return;
    }
    if (password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
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
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-light-green rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={28} weight="bold" className="text-forest-green" />
            </div>
            <h2 className="font-heading text-h2 text-deep-green mb-3">Parolă actualizată!</h2>
            <p className="font-body text-body-md text-secondary-text">
              Ești redirecționat(ă) la autentificare...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-light-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={24} weight="regular" className="text-forest-green" />
              </div>
              <h1 className="font-heading text-h2 text-deep-green mb-2">Setează parola nouă</h1>
              <p className="font-body text-body-sm text-secondary-text">
                Alege o parolă nouă pentru contul tău.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">Parolă nouă</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minim 6 caractere"
                    required
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">Confirmă parola</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repetă parola"
                    required
                    className="input pl-10"
                  />
                </div>
              </div>

              {error && (
                <p className="font-body text-body-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading || !password || !confirm} className="btn btn-primary w-full disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Se salvează...
                  </span>
                ) : (
                  <>Salvează parola nouă <ArrowRight size={16} weight="bold" /></>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
