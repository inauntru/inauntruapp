"use client";

import { ChartLine } from "@phosphor-icons/react";

export default function AdminStatisticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-h2 text-deep-green">Statistici</h1>
        <p className="font-body text-body-sm text-secondary-text">Analize și date despre activitatea platformei</p>
      </div>

      <div className="card bg-white p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-light-green rounded-2xl flex items-center justify-center mb-4">
          <ChartLine size={28} className="text-forest-green" />
        </div>
        <h3 className="font-heading text-h3 text-deep-green mb-2">Date insuficiente</h3>
        <p className="font-body text-body-sm text-secondary-text max-w-md">
          Graficele și analizele vor apărea automat pe măsură ce utilizatorii se înregistrează, completează check-in-uri și accesează practici.
          <br /><br />
          Statisticile detaliate de revenue vor fi disponibile după integrarea Stripe.
        </p>
      </div>
    </div>
  );
}
