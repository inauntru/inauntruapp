"use client";

import { useState, useMemo } from "react";
import { REVENUE_DATA, FUNNEL_DATA } from "@/lib/mockData";
import { CalendarBlank, ArrowUp, ArrowDown, DeviceMobile, Desktop, Browsers } from "@phosphor-icons/react";

const DATE_RANGES = ["Ultimele 7 zile", "Ultimele 30 zile", "Ultimele 90 zile", "Acest an"];

const ACQUISITION_DATA = [
  { day: "Lun", new: 12, returning: 34 },
  { day: "Mar", new: 8, returning: 28 },
  { day: "Mie", new: 19, returning: 41 },
  { day: "Joi", new: 14, returning: 37 },
  { day: "Vin", new: 22, returning: 45 },
  { day: "Sâm", new: 31, returning: 52 },
  { day: "Dum", new: 27, returning: 48 },
];

const COHORT_DATA = [
  { week: "Săpt. 1", w1: 100, w2: 72, w3: 61, w4: 55, w5: 51, w6: 48 },
  { week: "Săpt. 2", w1: 100, w2: 68, w3: 58, w4: 52, w5: 49, w6: null },
  { week: "Săpt. 3", w1: 100, w2: 75, w3: 63, w4: 57, w5: null, w6: null },
  { week: "Săpt. 4", w1: 100, w2: 71, w3: 60, w4: null, w5: null, w6: null },
  { week: "Săpt. 5", w1: 100, w2: 74, w3: null, w4: null, w5: null, w6: null },
  { week: "Săpt. 6", w1: 100, w2: null, w3: null, w4: null, w5: null, w6: null },
];

const REGIONS = [
  { name: "București", users: 423, pct: 27 },
  { name: "Cluj", users: 187, pct: 12 },
  { name: "Timișoara", users: 134, pct: 9 },
  { name: "Iași", users: 118, pct: 8 },
  { name: "Brașov", users: 96, pct: 6 },
  { name: "Constanța", users: 78, pct: 5 },
  { name: "Alte orașe", users: 511, pct: 33 },
];

const TRAFFIC_SOURCES = [
  { source: "Organic Search", sessions: 3241, pct: 41, color: "#2B8C5C" },
  { source: "Social Media", sessions: 1987, pct: 25, color: "#EAEBFF" },
  { source: "Direct", sessions: 1243, pct: 16, color: "#3A6850" },
  { source: "Referral", sessions: 872, pct: 11, color: "#3D3FAA" },
  { source: "Paid", sessions: 567, pct: 7, color: "#0F2E1A" },
];

const DEVICES = [
  { label: "Mobile", pct: 67, color: "#2B8C5C" },
  { label: "Desktop", pct: 26, color: "#3A6850" },
  { label: "Tablet", pct: 7, color: "#EAEBFF" },
];

function RevenueChart({ data }: { data: typeof REVENUE_DATA }) {
  const max = Math.max(...data.map((d) => d.revenue));
  const width = 560;
  const height = 180;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const points = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - (d.revenue / max) * chartH,
    revenue: d.revenue,
    label: d.date,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;

  const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2B8C5C" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2B8C5C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => {
        const y = padT + chartH - (t / max) * chartH;
        return (
          <g key={i}>
            <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="#A8DFC0" strokeWidth="1" strokeDasharray="4 4" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#3A6850">
              {t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t}
            </text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#revGrad)" />
      <path d={pathD} fill="none" stroke="#2B8C5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#2B8C5C" strokeWidth="2" />
          <text x={p.x} y={height - 6} textAnchor="middle" fontSize="9" fill="#3A6850">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

function AcquisitionChart({ data }: { data: typeof ACQUISITION_DATA }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.new + d.returning]));
  const barW = 28;
  const gap = 16;
  const chartH = 120;
  const padB = 24;
  const padL = 8;

  return (
    <svg viewBox={`0 0 ${data.length * (barW * 2 + gap) + padL * 2} ${chartH + padB}`} className="w-full h-36">
      {data.map((d, i) => {
        const x = padL + i * (barW * 2 + gap);
        const returningH = (d.returning / maxVal) * chartH;
        const newH = (d.new / maxVal) * chartH;
        return (
          <g key={i}>
            <rect x={x} y={chartH - returningH} width={barW} height={returningH} fill="#E6F5ED" rx="4" />
            <rect x={x + barW} y={chartH - newH} width={barW} height={newH} fill="#2B8C5C" rx="4" />
            <text x={x + barW} y={chartH + padB - 4} textAnchor="middle" fontSize="9" fill="#3A6850">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

function FunnelViz({ data }: { data: typeof FUNNEL_DATA }) {
  const max = data[0]?.value ?? 1;
  return (
    <div className="space-y-2">
      {data.map((step, i) => {
        const pct = Math.round((step.value / max) * 100);
        const convPct = i > 0 ? Math.round((step.value / data[i - 1].value) * 100) : 100;
        return (
          <div key={step.step}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-forest-green/10 text-forest-green font-bold text-xs flex items-center justify-center">{i + 1}</span>
                <span className="font-body text-body-sm text-on-surface">{step.step}</span>
              </div>
              <div className="flex items-center gap-3">
                {i > 0 && (
                  <span className="font-body text-label-xs text-secondary-text">{convPct}% conversie</span>
                )}
                <span className="font-body text-body-sm font-semibold text-deep-green w-16 text-right">{step.value.toLocaleString("ro-RO")}</span>
              </div>
            </div>
            <div className="h-8 bg-light-green rounded-lg overflow-hidden">
              <div
                className="h-full bg-forest-green rounded-lg transition-all duration-700 flex items-center justify-end pr-3"
                style={{ width: `${pct}%` }}
              >
                {pct > 15 && <span className="font-body text-label-xs text-white font-semibold">{pct}%</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }: { data: typeof DEVICES }) {
  const r = 40;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="w-28 h-28 flex-shrink-0">
        {data.map((d) => {
          const dash = (d.pct / 100) * circ;
          const offset = circ - cumPct * circ / 100;
          cumPct += d.pct;
          return (
            <circle
              key={d.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        })}
      </svg>
      <div className="space-y-2 flex-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="font-body text-body-sm text-on-surface">{d.label}</span>
            </div>
            <span className="font-body text-body-sm font-semibold text-deep-green">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CohortTable({ data }: { data: typeof COHORT_DATA }) {
  const cols = ["w1", "w2", "w3", "w4", "w5", "w6"] as const;
  const getColor = (v: number | null) => {
    if (v === null) return "bg-transparent";
    if (v >= 90) return "bg-forest-green text-white";
    if (v >= 70) return "bg-forest-green/60 text-white";
    if (v >= 55) return "bg-forest-green/30 text-deep-green";
    if (v >= 45) return "bg-forest-green/15 text-deep-green";
    return "bg-light-green text-deep-green";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center">
        <thead>
          <tr>
            <th className="text-left font-body text-label-xs text-secondary-text uppercase tracking-wider pb-3 pr-4">Cohortă</th>
            {cols.map((c, i) => (
              <th key={c} className="font-body text-label-xs text-secondary-text uppercase tracking-wider pb-3 px-1">Săpt. {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.week}>
              <td className="text-left font-body text-body-sm text-secondary-text py-1 pr-4 whitespace-nowrap">{row.week}</td>
              {cols.map((c) => (
                <td key={c} className="py-1 px-0.5">
                  {row[c] !== null ? (
                    <div className={`rounded-md py-1 px-2 font-body text-label-xs font-semibold ${getColor(row[c])}`}>
                      {row[c]}%
                    </div>
                  ) : (
                    <div className="py-1 px-2" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState("Ultimele 30 zile");
  const [revenueMetric, setRevenueMetric] = useState<"revenue" | "mrr">("revenue");

  const kpis = [
    { label: "Venituri totale", value: "18.408 RON", change: "+12.4%", up: true },
    { label: "Utilizatori noi", value: "234", change: "+18%", up: true },
    { label: "Rata de conversie", value: "4.2%", change: "+0.6pp", up: true },
    { label: "Churn rate", value: "2.3%", change: "-0.8pp", up: true },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Statistici</h1>
          <p className="font-body text-body-sm text-secondary-text">Analiza performanței platformei</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-sage-border rounded-full p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-full font-body text-label-xs transition-all whitespace-nowrap ${
                dateRange === r ? "bg-forest-green text-white" : "text-secondary-text hover:text-deep-green"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="card bg-white p-5">
            <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">{k.label}</p>
            <p className="font-heading text-2xl font-bold text-deep-green mb-2">{k.value}</p>
            <div className="flex items-center gap-1">
              {k.up ? (
                <ArrowUp size={11} weight="bold" className="text-forest-green" />
              ) : (
                <ArrowDown size={11} weight="bold" className="text-terracotta" />
              )}
              <span className={`font-body text-label-xs ${k.up ? "text-forest-green" : "text-terracotta"}`}>{k.change} față de perioada anterioară</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card bg-white p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body font-semibold text-body-md text-deep-green">Evoluție venituri</h2>
          <div className="flex gap-2">
            {(["revenue", "mrr"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setRevenueMetric(m)}
                className={`px-3 py-1.5 rounded-full font-body text-label-xs transition-all border ${
                  revenueMetric === m ? "bg-forest-green text-white border-forest-green" : "border-sage-border text-secondary-text"
                }`}
              >
                {m === "revenue" ? "Total" : "MRR"}
              </button>
            ))}
          </div>
        </div>
        <RevenueChart data={REVENUE_DATA} />
      </div>

      {/* Two column: Acquisition + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Acquisition */}
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-body font-semibold text-body-md text-deep-green">Achiziție utilizatori</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-forest-green" />
                <span className="font-body text-label-xs text-secondary-text">Noi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-light-green border border-sage-border" />
                <span className="font-body text-label-xs text-secondary-text">Recurenți</span>
              </div>
            </div>
          </div>
          <AcquisitionChart data={ACQUISITION_DATA} />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-light-green rounded-xl p-3 text-center">
              <p className="font-heading text-xl font-bold text-deep-green">133</p>
              <p className="font-body text-label-xs text-secondary-text">Utilizatori noi (7 zile)</p>
            </div>
            <div className="bg-light-green rounded-xl p-3 text-center">
              <p className="font-heading text-xl font-bold text-deep-green">285</p>
              <p className="font-body text-label-xs text-secondary-text">Sesiuni recurente (7 zile)</p>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card bg-white p-5">
          <h2 className="font-body font-semibold text-body-md text-deep-green mb-4">Pâlnie de conversie</h2>
          <FunnelViz data={FUNNEL_DATA} />
          <div className="mt-4 p-3 bg-light-green rounded-xl">
            <p className="font-body text-label-xs text-secondary-text">Conversie totală (Vizitatori → Plătitori)</p>
            <p className="font-heading text-xl font-bold text-deep-green mt-0.5">4.2%</p>
          </div>
        </div>
      </div>

      {/* Retention Cohort */}
      <div className="card bg-white p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-body font-semibold text-body-md text-deep-green">Retenție cohortă</h2>
            <p className="font-body text-label-xs text-secondary-text">Procentul de utilizatori activi pe săptămână față de prima săptămână</p>
          </div>
        </div>
        <CohortTable data={COHORT_DATA} />
      </div>

      {/* Three column: Regions + Devices + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic */}
        <div className="card bg-white p-5">
          <h2 className="font-body font-semibold text-body-md text-deep-green mb-4">Distribuție geografică</h2>
          <div className="space-y-3">
            {REGIONS.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-body-sm text-on-surface">{r.name}</span>
                  <span className="font-body text-label-xs text-secondary-text">{r.users.toLocaleString("ro-RO")} · {r.pct}%</span>
                </div>
                <div className="h-1.5 bg-light-green rounded-full overflow-hidden">
                  <div className="h-full bg-forest-green rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="card bg-white p-5">
          <h2 className="font-body font-semibold text-body-md text-deep-green mb-4">Dispozitive</h2>
          <DonutChart data={DEVICES} />
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Mobile", icon: <DeviceMobile size={16} />, val: "67%" },
              { label: "Desktop", icon: <Desktop size={16} />, val: "26%" },
              { label: "Tablet", icon: <Browsers size={16} />, val: "7%" },
            ].map((d) => (
              <div key={d.label} className="bg-light-green rounded-xl p-2.5 text-center">
                <div className="flex justify-center text-forest-green mb-1">{d.icon}</div>
                <p className="font-body font-semibold text-label-xs text-deep-green">{d.val}</p>
                <p className="font-body text-[10px] text-secondary-text">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="card bg-white p-5">
          <h2 className="font-body font-semibold text-body-md text-deep-green mb-4">Surse de trafic</h2>
          <div className="space-y-3">
            {TRAFFIC_SOURCES.map((t) => (
              <div key={t.source}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                    <span className="font-body text-body-sm text-on-surface">{t.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-label-xs text-secondary-text">{t.sessions.toLocaleString("ro-RO")}</span>
                    <span className="font-body text-label-xs font-semibold text-deep-green w-8 text-right">{t.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-light-green rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
