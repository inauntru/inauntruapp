"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, LockSimple } from "@phosphor-icons/react";

/**
 * Poarta de acces pre-lansare: un singur câmp de parolă, în brandul WithIn.
 * La parolă corectă primim un cookie semnat și mergem mai departe în site.
 */
export default function AccesClient() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/acces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = searchParams.get("next");
        window.location.href = next && next.startsWith("/") ? next : "/";
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Parola nu este corectă.");
    } catch {
      setError("Ceva nu a mers. Încearcă din nou.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-deep-green relative overflow-hidden">
      {/* fundal discret, în tonul paginilor de noapte */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 30%, #2B8C5C 0%, #1E5C3D 45%, #0F2E1A 100%)" }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-modal p-8 text-center"
      >
        <Image
          src="/logo-vertical.png"
          alt="WithIn"
          width={120}
          height={120}
          className="mx-auto mb-6 h-auto w-[104px]"
          priority
        />

        <h1 className="font-heading text-h3 text-deep-green mb-2">
          Site în mentenanță
        </h1>
        <p className="font-body text-body-sm text-secondary-text mb-7 leading-relaxed">
          Lucrăm la WithIn și revenim în curând. Dacă ai o parolă de acces, o poți folosi mai jos.
        </p>

        <form onSubmit={submit} className="text-left">
          <label htmlFor="acces-parola" className="block font-body text-label-xs font-semibold uppercase tracking-wider text-secondary-text mb-2">
            Parolă de acces
          </label>
          <div className="relative mb-4">
            <LockSimple size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
            <input
              id="acces-parola"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              autoFocus
              autoComplete="current-password"
              placeholder="Introdu parola"
              className="w-full rounded-xl border border-sage-border bg-surface-container-low pl-11 pr-4 py-3 font-body text-body-sm text-deep-green placeholder:text-secondary-text/60 focus:outline-none focus:border-forest-green transition-colors"
            />
          </div>

          {error && (
            <p className="font-body text-body-sm text-indigo mb-4" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className={`btn btn-primary w-full justify-center ${loading || !password.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Se verifică..." : "Intră"} {!loading && <ArrowRight size={16} weight="bold" />}
          </button>
        </form>

        <p className="font-body text-label-xs text-secondary-text/70 mt-6">
          Nu ai parolă? Scrie-ne la{" "}
          <a href="mailto:hello@withinapp.ro" className="text-forest-green font-semibold hover:underline">
            hello@withinapp.ro
          </a>
        </p>
      </motion.div>
    </div>
  );
}
