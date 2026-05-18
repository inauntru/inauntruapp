"use client";

import { CreditCard, ArrowRight } from "@phosphor-icons/react";

export default function AdminSubscriptionsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-h2 text-deep-green">Abonamente</h1>
        <p className="font-body text-body-sm text-secondary-text">Gestionarea abonamentelor și plăților</p>
      </div>

      {/* Stats — all zero until Stripe */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "MRR", value: "0 RON" },
          { label: "Abonați activi", value: "0" },
          { label: "Trial activ", value: "0" },
          { label: "Churn lunar", value: "—" },
        ].map((s) => (
          <div key={s.label} className="card bg-white p-5">
            <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-heading text-2xl font-bold text-deep-green">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="card bg-white p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-light-green rounded-2xl flex items-center justify-center mb-4">
          <CreditCard size={28} className="text-forest-green" />
        </div>
        <h3 className="font-heading text-h3 text-deep-green mb-2">Stripe nu este conectat încă</h3>
        <p className="font-body text-body-sm text-secondary-text max-w-sm mb-6">
          Abonamentele și istoricul de plăți vor apărea automat după integrarea Stripe. Acesta este ultimul pas înainte de lansare.
        </p>
        <a href="/admin/setari" className="btn btn-ghost btn-sm gap-2">
          Configurează în Setări <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
