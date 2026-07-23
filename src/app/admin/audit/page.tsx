"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, CircleNotch, User } from "@phosphor-icons/react";

interface AuditEntry {
  id: number;
  admin_name: string;
  admin_role: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  "Ștergere": "bg-red-50 text-red-600 border-red-200",
  "Schimbare": "bg-amber-50 text-amber-700 border-amber-200",
  "Creare": "bg-forest-green/10 text-forest-green border-forest-green/20",
};

function actionStyle(action: string): string {
  for (const [prefix, cls] of Object.entries(ACTION_COLORS)) {
    if (action.startsWith(prefix)) return cls;
  }
  return "bg-light-green text-secondary-text border-sage-border";
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-log")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.entries) setEntries(d.entries); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-h2 text-deep-green flex items-center gap-2">
          <ShieldCheck size={24} className="text-forest-green" /> Jurnal de audit
        </h1>
        <p className="font-body text-body-sm text-secondary-text">
          Toate acțiunile sensibile din panoul de administrare — cine, ce, când. Ultimele 200.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <CircleNotch size={32} className="animate-spin text-forest-green" />
        </div>
      ) : entries.length === 0 ? (
        <div className="card bg-white p-16 text-center">
          <p className="font-body text-body-sm text-secondary-text">
            Nicio acțiune înregistrată încă. Jurnalul se completează automat de acum înainte.
          </p>
        </div>
      ) : (
        <div className="card bg-white overflow-hidden">
          <div className="divide-y divide-sage-border/30">
            {entries.map(e => (
              <div key={e.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-light-green/20 transition-colors">
                <div className="w-9 h-9 rounded-full bg-light-green flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-forest-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`tag text-[10px] border ${actionStyle(e.action)}`}>{e.action}</span>
                    {e.target && (
                      <span className="font-body text-label-xs text-on-surface truncate max-w-[220px]">{e.target}</span>
                    )}
                    {e.details && (
                      <span className="font-body text-label-xs text-secondary-text">
                        {Object.entries(e.details).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-label-xs text-secondary-text mt-0.5">
                    {e.admin_name} <span className="text-secondary-text/60">({e.admin_role})</span>
                  </p>
                </div>
                <p className="font-body text-label-xs text-secondary-text flex-shrink-0 text-right">
                  {new Date(e.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}<br />
                  {new Date(e.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
