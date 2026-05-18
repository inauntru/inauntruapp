"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CircleNotch, Users, CalendarCheck, Timer, CreditCard } from "@phosphor-icons/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

interface StatsData {
  totalUsers: number;
  confirmedUsers: number;
  paidUsers: number;
  totalCheckIns: number;
  usersByPlan: { plan: string; count: number }[];
  newUsersPerDay: { day: string; count: number }[];
  checkInsPerDay: { day: string; count: number }[];
}

const PLAN_COLORS: Record<string, string> = {
  gratuit: "#9eb3a4", standard: "#6b9f7a", premium: "#2d5a3d",
};
const PLAN_LABELS: Record<string, string> = {
  gratuit: "Gratuit", standard: "Standard", premium: "Premium",
};
const CHART_COLOR = "#4a7c59";

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid #d4ddd6",
  borderRadius: "12px",
  fontFamily: "var(--font-body)",
  fontSize: "12px",
};

function StatCard({ icon: Icon, label, value, sub, delay = 0 }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card bg-white p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center flex-shrink-0">
        <Icon size={22} className="text-forest-green" />
      </div>
      <div>
        <p className="font-body text-label-xs text-secondary-text uppercase tracking-wider">{label}</p>
        <p className="font-heading text-2xl font-bold text-deep-green">{value}</p>
        {sub && <p className="font-body text-label-xs text-secondary-text">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function AdminStatisticiPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <CircleNotch size={32} className="animate-spin text-forest-green" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="font-heading text-h2 text-deep-green mb-2">Statistici</h1>
        <p className="font-body text-secondary-text">Nu s-au putut încărca datele.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-h2 text-deep-green">Statistici</h1>
        <p className="font-body text-body-sm text-secondary-text">Prezentare generală a platformei</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Utilizatori totali" value={data.totalUsers} sub={`${data.confirmedUsers} confirmați`} delay={0} />
        <StatCard icon={CreditCard} label="Abonați plătiți" value={data.paidUsers} sub="standard + premium" delay={0.05} />
        <StatCard icon={CalendarCheck} label="Check-in-uri totale" value={data.totalCheckIns} delay={0.1} />
        <StatCard icon={Timer} label="Rată confirmare" value={data.totalUsers > 0 ? `${Math.round((data.confirmedUsers / data.totalUsers) * 100)}%` : "—"} sub="emailuri confirmate" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card bg-white p-5">
          <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Distribuție planuri</h3>
          <p className="font-body text-label-xs text-secondary-text mb-5">Utilizatori per plan</p>
          {data.usersByPlan.length === 0 ? (
            <p className="font-body text-secondary-text text-body-sm text-center py-8">Date insuficiente</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <PieChart width={200} height={200}>
                <Pie data={data.usersByPlan} cx={100} cy={100} innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count">
                  {data.usersByPlan.map((entry) => (
                    <Cell key={entry.plan} fill={PLAN_COLORS[entry.plan] ?? "#9eb3a4"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown, _: unknown, props: { payload?: { plan?: string } }): [number, string] => [Number(v ?? 0), PLAN_LABELS[props.payload?.plan ?? ""] ?? props.payload?.plan ?? ""]} />
              </PieChart>
              <div className="flex flex-wrap gap-4 justify-center">
                {data.usersByPlan.map((entry) => (
                  <div key={entry.plan} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[entry.plan] ?? "#9eb3a4" }} />
                    <span className="font-body text-label-xs text-on-surface">{PLAN_LABELS[entry.plan] ?? entry.plan}</span>
                    <span className="font-body text-label-xs font-semibold text-deep-green">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card bg-white p-5">
          <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Utilizatori noi</h3>
          <p className="font-body text-label-xs text-secondary-text mb-5">Ultimele 30 de zile</p>
          {data.newUsersPerDay.every((d) => d.count === 0) ? (
            <p className="font-body text-secondary-text text-body-sm text-center py-8">Date insuficiente</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.newUsersPerDay} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ede9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "var(--font-body)", fill: "#6b7c6e" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#6b7c6e" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown): [number, string] => [Number(v ?? 0), "Utilizatori noi"]} />
                <Bar dataKey="count" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card bg-white p-5">
        <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Check-in-uri zilnice</h3>
        <p className="font-body text-label-xs text-secondary-text mb-5">Activitate ultimele 30 de zile</p>
        {data.checkInsPerDay.every((d) => d.count === 0) ? (
          <p className="font-body text-secondary-text text-body-sm text-center py-8">Date insuficiente — utilizatorii nu au făcut check-in-uri încă.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.checkInsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ede9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "var(--font-body)", fill: "#6b7c6e" }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#6b7c6e" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown): [number, string] => [Number(v ?? 0), "Check-in-uri"]} />
              <Line type="monotone" dataKey="count" stroke={CHART_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: CHART_COLOR }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
