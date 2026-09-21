"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SentimentSlice {
  name: string;
  value: number;
  color: string;
}

export default function SentimentChart({ data }: { data: SentimentSlice[] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No sentiment data recorded
      </div>
    );
  }

  return (
    <div className="h-64 w-full flex flex-col items-center justify-center">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                borderColor: "#1E293B",
                borderRadius: "0.5rem",
                fontSize: "12px",
                color: "#F8FAFC",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment Legends */}
      <div className="flex items-center justify-center gap-4 text-xs">
        {data.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-400">{item.name}</span>
              <span className="font-mono font-medium text-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
