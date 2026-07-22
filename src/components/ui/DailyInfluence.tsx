"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { type ZodiacSign } from "@/lib/quotes";
import { type InfluenceLevel, getDailyInfluences } from "@/lib/zodiac-influences";

const LEVEL_CONFIG: Record<InfluenceLevel, { label: string; bar: string; text: string; bg: string }> = {
  favorabil:  { label: "Favorabil",  bar: "bg-forest-green",   text: "text-forest-green",   bg: "bg-forest-green/8" },
  echilibrat: { label: "Echilibrat", bar: "bg-secondary-text", text: "text-secondary-text", bg: "bg-light-green/40" },
  provocator: { label: "Provocator", bar: "bg-terracotta",     text: "text-terracotta",     bg: "bg-rose-powder/10" },
};

const LEVEL_BARS: Record<InfluenceLevel, number> = { favorabil: 3, echilibrat: 2, provocator: 1 };

const AREA_ICONS: Record<string, string> = {
  corp: "🫀", minte: "🌊", relatii: "🌿", energie: "✦",
};

interface AreaData { key: string; level: string; description: string }
interface InfluenceData {
  areas: AreaData[];
  context?: { moon: string; sunSign: string; dayRuler: string };
  personalized?: boolean;
  natal?: { sun: string; ascendant: string; moon: string };
}

interface Props {
  sign: ZodiacSign;
  dateOfBirth: string;
}

export default function DailyInfluence({ sign, dateOfBirth }: Props) {
  const [data, setData] = useState<InfluenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sign || !dateOfBirth) return;
    setLoading(true);
    fetch(`/api/astro/daily?sign=${encodeURIComponent(sign)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setData(d); setLoading(false); })
      .catch(() => {
        // Fallback la conținut static deterministic
        const fallback = getDailyInfluences(dateOfBirth);
        if (fallback) {
          const labelToKey: Record<string, string> = { Corp: "corp", Minte: "minte", "Relații": "relatii", Energie: "energie" };
          setData({
            areas: fallback.areas.map(a => ({
              key: labelToKey[a.area] ?? a.area.toLowerCase(),
              level: a.level,
              description: a.description,
            })),
          });
        } else {
          setError(true);
        }
        setLoading(false);
      });
  }, [sign, dateOfBirth]);

  const today = new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "short" });

  if (loading) return <DailyInfluenceSkeleton />;
  if (error || !data) return null;

  return (
    <div className="rounded-2xl border border-sage-border/40 bg-white overflow-hidden shadow-card">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-sage-border/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-heading text-h3 text-deep-green">Influențele zilei</p>
            {data.context && (
              <p className="font-body text-label-xs text-secondary-text mt-1">
                {data.context.moon} · {data.context.dayRuler} · ☀ în {data.context.sunSign}
              </p>
            )}
            {data.natal && (
              <p className="font-body text-label-xs text-forest-green mt-0.5">
                Profilul tău: ☀ {data.natal.sun} · Asc {data.natal.ascendant} · ☾ {data.natal.moon}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-body text-label-xs text-secondary-text">{today}</p>
            {data.personalized && (
              <span className="inline-block mt-1 font-body text-[10px] font-semibold text-forest-green bg-forest-green/10 px-2 py-0.5 rounded-full">
                Personalizat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Areas */}
      <div className="divide-y divide-sage-border/20">
        {data.areas.map((area, i) => {
          const level = area.level as InfluenceLevel;
          const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.echilibrat;
          const bars = LEVEL_BARS[level] ?? 2;
          const icon = AREA_ICONS[area.key] ?? "·";
          const areaLabel = { corp: "Corp", minte: "Minte", relatii: "Relații", energie: "Energie" }[area.key] ?? area.key;
          return (
            <motion.div
              key={area.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`px-5 py-4 ${cfg.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{icon}</span>
                  <span className="font-body font-semibold text-body-sm text-deep-green">{areaLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3].map(n => (
                      <div key={n} className={`w-4 h-1.5 rounded-full ${n <= bars ? cfg.bar : "bg-sage-border/40"}`} />
                    ))}
                  </div>
                  <span className={`font-body text-label-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                </div>
              </div>
              <p className="font-body text-body-sm text-secondary-text leading-relaxed">{area.description}</p>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DailyInfluenceSkeleton() {
  return (
    <div className="rounded-2xl border border-sage-border/40 bg-white overflow-hidden shadow-card">
      <div className="px-5 pt-5 pb-4 border-b border-sage-border/30">
        <p className="font-heading text-h3 text-deep-green">Influențele zilei</p>
        <p className="font-body text-label-xs text-secondary-text mt-1 animate-pulse">Se calculează tranzitele...</p>
      </div>
      <div className="divide-y divide-sage-border/20">
        {["Corp", "Minte", "Relații", "Energie"].map(a => (
          <div key={a} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body font-semibold text-body-sm text-deep-green">{a}</span>
              <div className="flex gap-0.5">
                {[1,2,3].map(n => <div key={n} className="w-4 h-1.5 rounded-full bg-sage-border/40 animate-pulse" />)}
              </div>
            </div>
            <div className="h-4 bg-sage-border/30 rounded animate-pulse w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Placeholder fără dată naștere ─────────────────────────────────────────────
export function DailyInfluencePlaceholder() {
  return (
    <div className="rounded-2xl border border-sage-border/40 bg-white p-5 text-center shadow-card">
      <p className="text-2xl mb-3">✦</p>
      <p className="font-heading text-h3 text-deep-green mb-1">Influențele zilei</p>
      <p className="font-body text-body-sm text-secondary-text mb-4">
        Adaugă data nașterii pentru a vedea cum te influențează tranzitele planetare de azi, personalizat pentru semnul tău.
      </p>
      <Link
        href="/dashboard/cont"
        className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-deep-green text-white font-ui font-semibold text-label-xs uppercase tracking-wide hover:bg-forest-green transition-colors"
      >
        Adaugă în profil
      </Link>
    </div>
  );
}
