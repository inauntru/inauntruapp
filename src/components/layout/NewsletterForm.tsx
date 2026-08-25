"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleNotch } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewsletterForm() {
  const { tr } = useLanguage();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 font-body text-body-sm text-white/80">
        <Check size={16} weight="bold" className="text-forest-green" />
        {tr("Te-ai abonat! Ne auzim curând.")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
        placeholder={tr("Email-ul tău")}
        className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-body-sm text-white placeholder-white/40 font-body focus:outline-none focus:border-forest-green transition-colors"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        aria-label={tr("Abonează-te")}
        className="w-10 h-10 bg-forest-green rounded-full flex items-center justify-center flex-shrink-0 hover:bg-opacity-80 transition-colors disabled:opacity-50"
      >
        {state === "loading"
          ? <CircleNotch size={18} className="animate-spin" />
          : <ArrowRight size={18} weight="bold" />}
      </button>
      {state === "error" && (
        <span className="sr-only">{tr("A apărut o eroare. Încearcă din nou.")}</span>
      )}
    </form>
  );
}
