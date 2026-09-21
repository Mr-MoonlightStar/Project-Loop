"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ThemeBar {
  name: string;
  count: number;
  color?: string | null;
}

export default function ThemesBarChart({ data }: { data: ThemeBar[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No themes categorized for this period
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              borderColor: "#1E293B",
              borderRadius: "0.5rem",
              fontSize: "12px",
              color: "#F8FAFC",
            }}
          />
          <Bar dataKey="count" name="Feedback Count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color || "#6366F1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
