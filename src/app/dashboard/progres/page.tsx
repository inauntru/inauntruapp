"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, CircleNotch, Lightning, Timer, CalendarCheck, Flame,
} from "@phosphor-icons/react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

interface ProgressData {
  totalMinutes: number;
  totalPractices: number;
  totalCheckIns: number;
  streak: number;
  weeklyPractices: { week: string; count: number }[];
  dailyCheckIns: { day: string; count: number }[];
  moodData: { mood: string; count: number }[];
}

const MOOD_LABELS: Record<string, string> = {
  happy: "Bucuros", content: "Mulțumit", neutral: "Neutru", anxious: "Anxios", sad: "Trist",
};
const MOOD_COLORS: Record<string, string> = {
  happy: "#4a7c59", content: "#6b9f7a", neutral: "#9eb3a4", anxious: "#e9b84a", sad: "#c06b4a",
};
const CHART_COLOR = "#4a7c59";

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card bg-white p-5 flex items-center gap-4">
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

export default function ProgresPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/progress")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const chartTooltipStyle = {
    backgroundColor: "white",
    border: "1px solid #d4ddd6",
    borderRadius: "12px",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-light-green text-secondary-text hover:text-forest-green transition-colors">
          <ArrowLeft size={18} weight="bold" />
        </Link>
        <div>
          <h1 className="font-heading text-h2 text-deep-green">Progresul meu</h1>
          <p className="font-body text-body-sm text-secondary-text">Statistici detaliate despre practicile tale</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <CircleNotch size={32} className="animate-spin text-forest-green" />
        </div>
      ) : !data ? (
        <p className="text-center font-body text-secondary-text py-16">Nu s-au putut încărca datele.</p>
      ) : (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Flame} label="Streak" value={data.streak} sub={data.streak === 1 ? "zi consecutivă" : "zile consecutive"} />
            <StatCard icon={Timer} label="Minute practicate" value={data.totalMinutes} sub="total" />
            <StatCard icon={Lightning} label="Practici completate" value={data.totalPractices} sub="total" />
            <StatCard icon={CalendarCheck} label="Check-in-uri" value={data.totalCheckIns} sub="total" />
          </div>

          {/* Weekly practices chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-white p-5">
            <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Practici pe săptămână</h3>
            <p className="font-body text-label-xs text-secondary-text mb-5">Ultimele 8 săptămâni</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weeklyPractices} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ede9" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#6b7c6e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#6b7c6e" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "#f0f5f1" }} formatter={(v: number) => [v, "Practici"]} />
                <Bar dataKey="count" fill={CHART_COLOR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Daily check-ins chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card bg-white p-5">
            <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Check-in-uri zilnice</h3>
            <p className="font-body text-label-xs text-secondary-text mb-5">Ultimele 30 de zile</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.dailyCheckIns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ede9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fontFamily: "var(--font-body)", fill: "#6b7c6e" }}
                  axisLine={false} tickLine={false}
                  interval={4}
                />
                <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#6b7c6e" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [v, "Check-in-uri"]} />
                <Line type="monotone" dataKey="count" stroke={CHART_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: CHART_COLOR }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Mood distribution */}
          {data.moodData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card bg-white p-5">
              <h3 className="font-body font-semibold text-body-md text-deep-green mb-1">Distribuție stări</h3>
              <p className="font-body text-label-xs text-secondary-text mb-5">Cum te-ai simțit în check-in-uri</p>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <PieChart width={200} height={200}>
                  <Pie data={data.moodData} cx={100} cy={100} innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count">
                    {data.moodData.map((entry) => (
                      <Cell key={entry.mood} fill={MOOD_COLORS[entry.mood] ?? "#9eb3a4"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number, _: string, props: { payload?: { mood?: string } }) => [v, MOOD_LABELS[props.payload?.mood ?? ""] ?? props.payload?.mood ?? ""]} />
                </PieChart>
                <div className="flex flex-wrap gap-3">
                  {data.moodData.map((entry) => (
                    <div key={entry.mood} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: MOOD_COLORS[entry.mood] ?? "#9eb3a4" }} />
                      <span className="font-body text-label-xs text-on-surface">{MOOD_LABELS[entry.mood] ?? entry.mood}</span>
                      <span className="font-body text-label-xs font-semibold text-deep-green">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
