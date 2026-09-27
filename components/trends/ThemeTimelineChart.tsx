"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface ThemeMeta {
  name: string;
  color: string;
}

interface TrendTimelineProps {
  data: Array<Record<string, unknown>>;
  themeMeta: ThemeMeta[];
}

export default function ThemeTimelineChart({ data, themeMeta }: TrendTimelineProps) {
  if (!data || data.length === 0 || themeMeta.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-500">
        No theme trend data recorded in this period
      </div>
    );
  }

  // Format short date: "Sep 22"
  const formatted = data.map((d) => {
    const rawDate = String(d.date);
    const parts = rawDate.split("-");
    let formattedDate = rawDate;
    if (parts.length === 3) {
      const month = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).toLocaleString("default", { month: "short" });
      formattedDate = `${month} ${parseInt(parts[2])}`;
    }
    return {
      ...d,
      formattedDate,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="formattedDate"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              borderColor: "#1E293B",
              borderRadius: "0.5rem",
              fontSize: "12px",
              color: "#F8FAFC",
            }}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            iconType="circle"
          />
          {themeMeta.map((t) => (
            <Line
              key={t.name}
              type="monotone"
              dataKey={t.name}
              stroke={t.color}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
