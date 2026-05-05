"use client";

import { useState } from "react";
import { TrendUp, TrendDown, Download, MagnifyingGlass, DotsThreeVertical } from "@phosphor-icons/react";

const SUBSCRIPTIONS = [
  { id: 1, user: "Ana Constantin", email: "ana.c@yahoo.ro", plan: "Premium+", start: "2026-01-05", renewal: "2026-05-05", status: "active", amount: 89 },
  { id: 2, user: "Radu Popescu", email: "radu.p@gmail.com", plan: "Premium+", start: "2025-12-10", renewal: "2026-06-10", status: "active", amount: 89 },
  { id: 3, user: "Cristina Mihai", email: "cristina.m@gmail.com", plan: "Premium", start: "2026-01-28", renewal: "2026-05-28", status: "active", amount: 59 },
  { id: 4, user: "Tudor Ionescu", email: "tudor.i@gmail.com", plan: "Premium", start: "2026-02-14", renewal: "2026-05-14", status: "active", amount: 59 },
  { id: 5, user: "Andrei Toma", email: "andrei.t@gmail.com", plan: "Premium", start: "2026-02-03", renewal: "2026-05-03", status: "expiring", amount: 59 },
  { id: 6, user: "Maria Dumitrescu", email: "maria.d@gmail.com", plan: "Premium+", start: "2026-01-15", renewal: "2026-04-15", status: "expired", amount: 89 },
];

const STATUS_FILTERS = ["Toate", "Activ", "Expiră curând", "Expirat", "Anulat"];

export default function AdminSubscriptionsPage() {
  const [status, setStatus] = useState("Toate");
  const [search, setSearch] = useState("");

  const filtered = SUBSCRIPTIONS.filter((s) => {
    if (status !== "Toate") {
      const map: Record<string, string> = { "Activ": "active", "Expiră curând": "expiring", "Expirat": "expired", "Anulat": "cancelled" };
      if (s.status !== map[status]) return false;
    }
    if (search && !s.user.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const mrr = SUBSCRIPTIONS.filter((s) => s.status === "active").reduce((acc, s) => acc + s.amount, 0) * 5;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Abonamente</h1>
          <p className="font-body text-body-sm text-secondary-text">Gestionează toate abonamentele active</p>
        </div>
        <button className="btn btn-ghost btn-sm gap-2">
          <Download size={14} weight="bold" /> Export CSV
        </button>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-white p-5">
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">MRR</p>
          <p className="font-heading text-3xl font-bold text-deep-green">{mrr.toLocaleString("ro-RO")}</p>
          <p className="font-body text-label-xs text-secondary-text">RON</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendUp size={12} weight="bold" className="text-forest-green" />
            <span className="font-body text-label-xs text-forest-green">+8% față de luna trecută</span>
          </div>
        </div>
        <div className="card bg-white p-5">
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Abonamente active</p>
          <p className="font-heading text-3xl font-bold text-deep-green">312</p>
          <p className="font-body text-label-xs text-secondary-text">89 Premium · 223 Premium+</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendUp size={12} weight="bold" className="text-forest-green" />
            <span className="font-body text-label-xs text-forest-green">+12 luna aceasta</span>
          </div>
        </div>
        <div className="card bg-white p-5">
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Churn luna aceasta</p>
          <p className="font-heading text-3xl font-bold text-terracotta">7</p>
          <p className="font-body text-label-xs text-secondary-text">2.3% churn rate</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendDown size={12} weight="bold" className="text-forest-green" />
            <span className="font-body text-label-xs text-forest-green">Față de 3.1% luna trecută</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-white p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Caută utilizator..." className="w-full pl-9 pr-4 py-2 rounded-full border border-sage-border text-body-sm font-body focus:outline-none focus:border-forest-green" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`filter-pill ${status === s ? "active" : ""}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Utilizator</th>
                <th>Plan</th>
                <th>Data start</th>
                <th>Reînnoire</th>
                <th>Status</th>
                <th>Sumă</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div>
                      <p className="font-body text-body-sm font-semibold text-deep-green">{s.user}</p>
                      <p className="font-body text-[10px] text-secondary-text">{s.email}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${s.plan === "Premium+" ? "bg-deep-green/10 text-deep-green border-deep-green/20 border" : "tag-green"}`}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="text-secondary-text font-body text-body-sm">{s.start}</td>
                  <td className="text-secondary-text font-body text-body-sm">{s.renewal}</td>
                  <td>
                    <span className={`tag ${
                      s.status === "active" ? "bg-forest-green/10 text-forest-green border-forest-green/20 border" :
                      s.status === "expiring" ? "bg-terracotta/10 text-terracotta border-terracotta/20 border" :
                      "tag-outline"
                    }`}>
                      {s.status === "active" ? "Activ" : s.status === "expiring" ? "Expiră" : "Expirat"}
                    </span>
                  </td>
                  <td className="font-body font-semibold text-body-sm text-deep-green">{s.amount} RON</td>
                  <td>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
                      <DotsThreeVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
