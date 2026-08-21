"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2554ec", "#12805c", "#b45309", "#d92d20", "#7c3aed", "#0891b2"];

export function VisitTrendChart({ data }: { data: { date: string; visits: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e8ef" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#667085" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#667085" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#e4e8ef", fontSize: 12 }} />
        <Line type="monotone" dataKey="visits" stroke="#2554ec" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StateBarChart({ data }: { data: { state: string; visits: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e8ef" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#667085" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="state" width={90} tick={{ fontSize: 11, fill: "#667085" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#e4e8ef", fontSize: 12 }} />
        <Bar dataKey="visits" fill="#2554ec" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#e4e8ef", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
