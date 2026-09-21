"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface VolumePoint {
  date: string;
  count: number;
}

export default function VolumeChart({ data }: { data: VolumePoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No volume data recorded in this period
      </div>
    );
  }

  // Format short date label: "Sep 12"
  const formattedData = data.map((d) => {
    const parts = d.date.split("-");
    const month = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).toLocaleString("default", { month: "short" });
    return {
      ...d,
      formattedDate: `${month} ${parseInt(parts[2])}`,
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="count"
            name="Feedback Items"
            stroke="#6366F1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#volumeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
