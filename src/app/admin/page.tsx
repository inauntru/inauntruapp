"use client";

import { useState } from "react";
import {
  Users,
  Lightning,
  CreditCard,
  CurrencyCircleDollar,
  Bell,
  TrendUp,
  TrendDown,
  Eye,
  VideoCamera,
  ArrowRight,
  Plus,
  CalendarBlank,
  Clock,
  Circle,
} from "@phosphor-icons/react";
import { REVENUE_DATA, HOURLY_VIEWS, ADMIN_CONTENT, LIVE_SESSIONS } from "@/lib/mockData";

// Simple sparkline using SVG
function Sparkline({ data, color = "#2B8C5C" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Simple bar chart
function BarChart({ data }: { data: typeof HOURLY_VIEWS }) {
  const max = Math.max(...data.map((d) => d.views));
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((d) => (
        <div key={d.hour} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-forest-green/70 rounded-sm hover:bg-forest-green transition-colors"
            style={{ height: `${(d.views / max) * 100}%`, minHeight: 2 }}
            title={`${d.hour}:00 — ${d.views} vizualizări`}
          />
        </div>
      ))}
    </div>
  );
}

// Simple area chart (revenue)
function AreaChart({ data }: { data: typeof REVENUE_DATA }) {
  const max = Math.max(...data.map((d) => d.revenue));
  const min = Math.min(...data.map((d) => d.revenue));
  const range = max - min;
  const w = 400;
  const h = 120;
  const pts = data
    .map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d.revenue - min) / range) * (h - 10) - 5}`)
    .join(" ");
  const areaPath = `M ${pts.split(" ")[0]} L ${pts} L ${w},${h} L 0,${h} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2B8C5C" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2B8C5C" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <polyline points={pts} stroke="#2B8C5C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.date} className="font-body text-[10px] text-secondary-text">{d.date}</span>
        ))}
      </div>
    </div>
  );
}

// Donut chart (subscription breakdown)
function DonutChart() {
  // Gratuit 52%, Premium 29%, Premium+ 19%
  const segments = [
    { label: "Gratuit", value: 52, color: "#E6F5ED", stroke: "#3A6850" },
    { label: "Premium", value: 29, color: "#2B8C5C", stroke: "#2B8C5C" },
    { label: "Premium+", value: 19, color: "#0F2E1A", stroke: "#0F2E1A" },
  ];
  const r = 40;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((seg) => {
          const dashArray = (seg.value / 100) * circumference;
          const el = (
            <circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.stroke}
              strokeWidth="18"
              strokeDasharray={`${dashArray} ${circumference - dashArray}`}
              strokeDashoffset={-offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
            />
          );
          offset += dashArray;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-deep-green font-bold" fontSize="14" fontFamily="Playfair Display">312</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#3A6850" fontSize="8" fontFamily="DM Sans">abonați</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.stroke }} />
            <span className="font-body text-label-xs text-secondary-text">{seg.label}</span>
            <span className="font-body text-label-xs font-semibold text-deep-green ml-auto">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const LIVE_FEED = [
  { type: "register", text: "Ana D. s-a înregistrat", time: "2 min", color: "bg-forest-green" },
  { type: "purchase", text: "Mihai P. a cumpărat Premium", time: "5 min", color: "bg-terracotta" },
  { type: "checkin", text: "Elena R. a completat check-in", time: "8 min", color: "bg-secondary-text" },
  { type: "session", text: "Sesiune LIVE: 34 participanți", time: "15 min", color: "bg-forest-green" },
  { type: "register", text: "Tudor I. s-a înregistrat", time: "18 min", color: "bg-forest-green" },
  { type: "purchase", text: "Cristina M. a cumpărat Premium+", time: "22 min", color: "bg-terracotta" },
];

export default function AdminDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState("Zilnic");

  const sparklineData = REVENUE_DATA.map((d) => d.revenue);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Bine ai revenit, Admin</h1>
          <p className="font-body text-body-sm text-secondary-text">Iată situația platformei INAUNTRU astăzi.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center bg-white border border-sage-border rounded-xl text-secondary-text hover:text-forest-green transition-colors">
            <Bell size={16} weight="regular" />
          </button>
          <div className="flex items-center gap-2 bg-white border border-sage-border rounded-full px-3 py-1.5">
            <div className="w-7 h-7 rounded-full bg-forest-green flex items-center justify-center">
              <span className="text-white text-xs font-bold">AD</span>
            </div>
            <span className="font-body text-label-xs text-on-surface font-medium">Admin</span>
          </div>
        </div>
      </div>

      {/* ROW 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total users */}
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-light-green rounded-xl flex items-center justify-center">
              <Users size={16} weight="regular" className="text-forest-green" />
            </div>
            <span className="font-body text-label-xs text-forest-green font-semibold flex items-center gap-1">
              <TrendUp size={12} weight="bold" /> +12%
            </span>
          </div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Total utilizatori</p>
          <p className="font-heading text-3xl font-bold text-deep-green">1.547</p>
          <p className="font-body text-label-xs text-forest-green mt-1">+23 azi</p>
          <div className="mt-3">
            <Sparkline data={[120, 145, 132, 178, 165, 190, 210]} />
          </div>
        </div>

        {/* Active now */}
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-terracotta/10 rounded-xl flex items-center justify-center">
              <Lightning size={16} weight="fill" className="text-terracotta" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-forest-green animate-live-pulse" />
              <span className="font-body text-label-xs text-forest-green">Live</span>
            </div>
          </div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Activi acum</p>
          <p className="font-heading text-3xl font-bold text-deep-green">234</p>
          <p className="font-body text-label-xs text-secondary-text mt-1">Peak azi: 134 la 20:00</p>
          <div className="mt-3">
            <Sparkline data={[45, 67, 89, 112, 134, 98, 234]} color="#3D3FAA" />
          </div>
        </div>

        {/* Active subscriptions */}
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-light-green rounded-xl flex items-center justify-center">
              <CreditCard size={16} weight="regular" className="text-forest-green" />
            </div>
            <span className="font-body text-label-xs text-forest-green font-semibold flex items-center gap-1">
              <TrendUp size={12} weight="bold" /> +5%
            </span>
          </div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Abonați activi</p>
          <p className="font-heading text-3xl font-bold text-deep-green">312</p>
          <p className="font-body text-label-xs text-secondary-text mt-1">89 Premium · 223 Premium+</p>
          <p className="font-body text-label-xs text-forest-green">+12% față de luna trecută</p>
        </div>

        {/* Monthly revenue */}
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-light-green rounded-xl flex items-center justify-center">
              <CurrencyCircleDollar size={16} weight="regular" className="text-forest-green" />
            </div>
            <span className="font-body text-label-xs text-forest-green font-semibold flex items-center gap-1">
              <TrendUp size={12} weight="bold" /> +8%
            </span>
          </div>
          <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider mb-1">Revenue lunar</p>
          <p className="font-heading text-3xl font-bold text-deep-green">18.408</p>
          <p className="font-body text-label-xs text-secondary-text mt-1">RON</p>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-label-xs text-secondary-text">Țintă: 25.000 RON</span>
              <span className="font-body text-label-xs font-semibold text-forest-green">74%</span>
            </div>
            <div className="h-1.5 bg-light-green rounded-full overflow-hidden">
              <div className="h-full bg-forest-green rounded-full" style={{ width: "74%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Revenue chart + Donut */}
      <div className="grid lg:grid-cols-5 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-3 card bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body font-semibold text-body-md text-deep-green">Revenue lunar</h3>
            <div className="flex gap-1">
              {["Zilnic", "Săptămânal", "Lunar"].map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 rounded-full text-label-xs font-body transition-all ${
                    chartPeriod === p ? "bg-forest-green text-white" : "text-secondary-text hover:bg-light-green"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <AreaChart data={REVENUE_DATA} />
        </div>

        {/* Donut chart */}
        <div className="lg:col-span-2 card bg-white p-5">
          <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Distribuție abonamente</h3>
          <DonutChart />
        </div>
      </div>

      {/* ROW 3: Watchtime + Sessions + Live feed */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Watch hours */}
        <div className="card bg-white p-5">
          <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Ore de vizionare</h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-heading text-3xl font-bold text-deep-green">847</span>
            <span className="font-body text-body-sm text-secondary-text">ore azi</span>
          </div>
          <BarChart data={HOURLY_VIEWS} />
          <div className="flex justify-between mt-1 mb-4">
            <span className="font-body text-label-xs text-secondary-text">6:00</span>
            <span className="font-body text-label-xs text-secondary-text">12:00</span>
            <span className="font-body text-label-xs text-secondary-text">18:00</span>
            <span className="font-body text-label-xs text-secondary-text">23:00</span>
          </div>
          <div className="border-t border-sage-border pt-3">
            <p className="font-body text-label-xs text-secondary-text">
              Total alltime: <strong className="text-deep-green">12.450 ore</strong>
            </p>
            <p className="font-body text-label-xs text-secondary-text mt-1">
              Top practică azi: Respirație 4-7-8
            </p>
          </div>
        </div>

        {/* Sessions */}
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body font-semibold text-body-md text-deep-green">Sesiuni LIVE</h3>
            <button className="flex items-center gap-1 text-label-xs text-forest-green font-semibold hover:underline">
              <Plus size={12} weight="bold" /> Adaugă
            </button>
          </div>
          <div className="bg-light-green border border-sage-border rounded-xl p-4 mb-3">
            <p className="font-body text-label-xs text-secondary-text mb-1">Următoarea sesiune</p>
            <p className="font-body font-semibold text-body-sm text-deep-green line-clamp-1">{LIVE_SESSIONS[0].title}</p>
            <div className="flex items-center gap-3 mt-2 text-label-xs text-secondary-text font-body">
              <span className="flex items-center gap-1"><CalendarBlank size={11} /> {new Date(LIVE_SESSIONS[0].date).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {new Date(LIVE_SESSIONS[0].date).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
          <div className="space-y-2">
            {LIVE_SESSIONS.slice(1, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b border-sage-border/40 last:border-0">
                <div className="w-7 h-7 bg-light-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <VideoCamera size={12} weight="regular" className="text-forest-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-label-xs font-semibold text-deep-green truncate">{s.title}</p>
                  <p className="font-body text-[10px] text-secondary-text">{s.facilitator}</p>
                </div>
                <span className="font-body text-[10px] text-secondary-text flex-shrink-0">{s.spotsLeft} locuri</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live activity feed */}
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body font-semibold text-body-md text-deep-green">Activitate în timp real</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-forest-green animate-live-pulse" />
              <span className="font-body text-label-xs text-forest-green">Live</span>
            </div>
          </div>
          <div className="space-y-3">
            {LIVE_FEED.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0 mt-1.5`} />
                <div className="flex-1">
                  <p className="font-body text-label-xs text-on-surface">{item.text}</p>
                  <p className="font-body text-[10px] text-secondary-text">{item.time} în urmă</p>
                </div>
              </div>
            ))}
          </div>
          <p className="font-body text-label-xs text-secondary-text mt-4 text-center">
            Actualizat acum 30s
          </p>
        </div>
      </div>

      {/* ROW 4: Top practices table */}
      <div className="card bg-white p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-body font-semibold text-body-md text-deep-green">Top practici azi</h3>
          <a href="/admin/continut" className="font-body text-label-xs text-forest-green hover:underline flex items-center gap-1">
            Vezi toate <ArrowRight size={12} weight="bold" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Titlu</th>
                <th>Facilitator</th>
                <th>Vizionări azi</th>
                <th>Total</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_CONTENT.slice(0, 5).map((c, i) => (
                <tr key={c.id} className="cursor-pointer">
                  <td>
                    <span className={`font-body font-bold text-label-sm ${i === 0 ? "text-terracotta" : i === 1 ? "text-secondary-text" : "text-secondary-text/60"}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-light-green rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Eye size={14} weight="regular" className="text-forest-green" />
                      </div>
                      <span className="font-body font-medium text-body-sm text-deep-green line-clamp-1">{c.title}</span>
                    </div>
                  </td>
                  <td className="text-secondary-text">{c.facilitator}</td>
                  <td>
                    <span className="font-body font-semibold text-body-sm text-deep-green">
                      {(c.views * 0.12).toFixed(0)}
                    </span>
                  </td>
                  <td className="font-body font-semibold text-body-sm text-deep-green">
                    {c.views.toLocaleString("ro-RO")}
                  </td>
                  <td>
                    <span className="flex items-center gap-1 font-body text-label-xs">
                      <span className="text-terracotta">★</span>
                      <span className="font-semibold text-deep-green">{c.rating}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 5: New users + Churn */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* New users */}
        <div className="card bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body font-semibold text-body-md text-deep-green">Utilizatori noi (7 zile)</h3>
            <a href="/admin/utilizatori" className="font-body text-label-xs text-forest-green hover:underline">
              Vezi toți
            </a>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Utilizator</th>
                <th>Plan</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Ana D.", email: "ana.d@gmail.com", plan: "Premium", date: "Azi" },
                { name: "Tudor I.", email: "tudor.i@gmail.com", plan: "Gratuit", date: "Ieri" },
                { name: "Maria V.", email: "maria.v@yahoo.ro", plan: "Premium+", date: "Ieri" },
                { name: "Radu P.", email: "radu.p@gmail.com", plan: "Gratuit", date: "2 zile" },
                { name: "Cristina M.", email: "cristina.m@gmail.com", plan: "Premium", date: "3 zile" },
              ].map((u, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-light-green flex items-center justify-center flex-shrink-0">
                        <span className="font-body text-[10px] font-bold text-forest-green">{u.name.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-body text-body-sm font-medium text-deep-green">{u.name}</p>
                        <p className="font-body text-[10px] text-secondary-text">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${u.plan === "Gratuit" ? "tag-outline" : "tag-green"}`}>{u.plan}</span>
                  </td>
                  <td className="text-secondary-text">{u.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Churn & Retention */}
        <div className="card bg-white p-5">
          <h3 className="font-body font-semibold text-body-md text-deep-green mb-4">Churn & Retenție</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-terracotta">2.3%</p>
              <p className="font-body text-label-xs text-secondary-text">Churn lunar</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-forest-green">86%</p>
              <p className="font-body text-label-xs text-secondary-text">Retenție 30 zile</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-3xl font-bold text-deep-green">71%</p>
              <p className="font-body text-label-xs text-secondary-text">Retenție 90 zile</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Retenție 30 zile", value: 86 },
              { label: "Retenție 60 zile", value: 79 },
              { label: "Retenție 90 zile", value: 71 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-label-xs text-secondary-text">{item.label}</span>
                  <span className="font-body text-label-xs font-semibold text-deep-green">{item.value}%</span>
                </div>
                <div className="h-2 bg-light-green rounded-full overflow-hidden">
                  <div className="h-full bg-forest-green rounded-full" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
