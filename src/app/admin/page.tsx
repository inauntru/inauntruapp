"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, CalendarBlank, ArrowRight } from "@phosphor-icons/react";

interface Stats {
  totalUsers: number;
  confirmedUsers: number;
  premiumUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/users/list")
      .then((r) => r.json())
      .then(({ users }) => {
        if (!users) return;
        setStats({
          totalUsers: users.length,
          confirmedUsers: users.filter((u: { email_confirmed: boolean }) => u.email_confirmed).length,
          premiumUsers: users.filter((u: { plan: string }) => u.plan !== "gratuit").length,
        });
      })
      .catch(() => {});
  }, []);

  const s = stats;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-h2 text-deep-green">Bine ai revenit</h1>
        <p className="font-body text-body-sm text-secondary-text">Iată situația platformei WithIn.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card bg-white p-5">
          <div className="w-9 h-9 bg-light-green rounded-xl flex items-center justify-center mb-3">
            <Users size={16} className="text-forest-green" />
          </div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Total utilizatori</p>
          <p className="font-heading text-3xl font-bold text-deep-green">{s?.totalUsers ?? "—"}</p>
          <p className="font-body text-label-xs text-secondary-text mt-1">{s?.confirmedUsers ?? 0} cu email confirmat</p>
        </div>

        <div className="card bg-white p-5">
          <div className="w-9 h-9 bg-light-green rounded-xl flex items-center justify-center mb-3">
            <CreditCard size={16} className="text-forest-green" />
          </div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Abonați</p>
          <p className="font-heading text-3xl font-bold text-deep-green">{s?.premiumUsers ?? "—"}</p>
          <p className="font-body text-label-xs text-secondary-text mt-1">Standard + Premium</p>
        </div>

        <div className="card bg-white p-5">
          <div className="w-9 h-9 bg-light-green rounded-xl flex items-center justify-center mb-3">
            <CalendarBlank size={16} className="text-forest-green" />
          </div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Sesiuni LIVE</p>
          <p className="font-heading text-3xl font-bold text-deep-green">0</p>
          <p className="font-body text-label-xs text-secondary-text mt-1">Nicio sesiune programată</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gestionează utilizatori", href: "/admin/utilizatori", desc: "Vezi și editează conturi" },
          { label: "Adaugă conținut", href: "/admin/continut", desc: "Practici și categorii" },
          { label: "Programează sesiuni", href: "/admin/sesiuni", desc: "Sesiuni LIVE noi" },
          { label: "Editează emailuri", href: "/admin/emailuri", desc: "Template-uri transacționale" },
        ].map((link) => (
          <a key={link.href} href={link.href}
            className="card bg-white p-4 flex items-center justify-between gap-3 hover:border-forest-green/40 hover:shadow-sm transition-all group">
            <div>
              <p className="font-body font-semibold text-body-sm text-deep-green">{link.label}</p>
              <p className="font-body text-label-xs text-secondary-text">{link.desc}</p>
            </div>
            <ArrowRight size={16} className="text-secondary-text group-hover:text-forest-green transition-colors flex-shrink-0" />
          </a>
        ))}
      </div>

      {/* Note */}
      {s?.totalUsers === 0 && (
        <div className="mt-8 p-5 bg-light-green/60 border border-sage-border rounded-2xl text-center">
          <p className="font-body text-body-sm text-deep-green font-semibold mb-1">Platformă în pregătire</p>
          <p className="font-body text-label-xs text-secondary-text">
            Statisticile detaliate și graficele vor apărea automat pe măsură ce utilizatorii se înregistrează și interacționează cu platforma.
          </p>
        </div>
      )}
    </div>
  );
}
