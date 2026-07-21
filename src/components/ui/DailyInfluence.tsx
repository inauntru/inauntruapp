"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { type DayInfluences, type InfluenceLevel } from "@/lib/zodiac-influences";

const ZODIAC_EMOJI: Record<string, string> = {
  Berbec:"♈", Taur:"♉", Gemeni:"♊", Rac:"♋", Leu:"♌", Fecioară:"♍",
  Balanță:"♎", Scorpion:"♏", Săgetător:"♐", Capricorn:"♑", Vărsător:"♒", Pești:"♓",
};

const ELEMENT_LABEL: Record<string, string> = {
  foc: "Foc", pamant: "Pământ", aer: "Aer", apa: "Apă",
};

const LEVEL_CONFIG: Record<InfluenceLevel, { label: string; dot: string; bar: string; text: string }> = {
  favorabil:   { label: "Favorabil",   dot: "bg-forest-green",   bar: "bg-forest-green",   text: "text-forest-green" },
  echilibrat:  { label: "Echilibrat",  dot: "bg-secondary-text", bar: "bg-secondary-text", text: "text-secondary-text" },
  provocator:  { label: "Provocator",  dot: "bg-terracotta",     bar: "bg-terracotta",      text: "text-terracotta" },
};

const LEVEL_BARS: Record<InfluenceLevel, number> = {
  favorabil: 3, echilibrat: 2, provocator: 1,
};

interface Props {
  influences: DayInfluences;
}

export default function DailyInfluence({ influences }: Props) {
  const { sign, element, areas } = influences;

  return (
    <div className="rounded-2xl border border-sage-border/40 bg-white overflow-hidden shadow-card">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-sage-border/30 flex items-center justify-between">
        <div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-widest mb-0.5">
            Influențele zilei
          </p>
          <div className="flex items-center gap-2">
            <span className="font-heading text-h3 text-deep-green">
              {ZODIAC_EMOJI[sign]} {sign}
            </span>
            <span className="font-body text-label-xs text-secondary-text">
              · {ELEMENT_LABEL[element]}
            </span>
          </div>
        </div>
        <p className="font-body text-label-xs text-secondary-text text-right">
          {new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
        </p>
      </div>

      {/* Areas */}
      <div className="divide-y divide-sage-border/20">
        {areas.map((area, i) => {
          const cfg = LEVEL_CONFIG[area.level];
          const bars = LEVEL_BARS[area.level];
          return (
            <motion.div
              key={area.area}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="px-5 py-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{area.icon}</span>
                  <span className="font-body font-semibold text-body-sm text-deep-green">
                    {area.area}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Bar indicator */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(n => (
                      <div
                        key={n}
                        className={`w-4 h-1.5 rounded-full transition-all ${n <= bars ? cfg.bar : "bg-sage-border/40"}`}
                      />
                    ))}
                  </div>
                  <span className={`font-body text-label-xs font-semibold ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
              <p className="font-body text-body-sm text-secondary-text leading-relaxed">
                {area.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-sage-border/30 bg-light-green/30">
        <p className="font-body text-label-xs text-secondary-text text-center">
          Bazat pe semnul tău · Se actualizează zilnic
        </p>
      </div>
    </div>
  );
}

// ── Placeholder când nu există dată naștere ───────────────────────────────────
export function DailyInfluencePlaceholder() {
  return (
    <div className="rounded-2xl border border-sage-border/40 bg-white p-5 text-center shadow-card">
      <p className="text-2xl mb-3">✦</p>
      <p className="font-heading text-h3 text-deep-green mb-1">Influențele zilei</p>
      <p className="font-body text-body-sm text-secondary-text mb-4">
        Adaugă data nașterii pentru a vedea cum te influențează ziua de azi, bazat pe semnul tău zodiacal.
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
