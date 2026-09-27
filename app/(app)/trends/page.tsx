"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Layers,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import ThemeTimelineChart from "@/components/trends/ThemeTimelineChart";

interface ThemeTrendItem {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  totalCount: number;
  currentCount: number;
  prevCount: number;
  growthRate: number;
  isSpiking: boolean;
  sentiments: {
    posCount: number;
    neuCount: number;
    negCount: number;
    posPct: number;
    neuPct: number;
    negPct: number;
  };
}

interface TrendsResponse {
  period: string;
  periodDays: number;
  spikingCount: number;
  spikingThemes: ThemeTrendItem[];
  themes: ThemeTrendItem[];
  topThemesTimeline: Array<Record<string, unknown>>;
  topThemeNames: Array<{ name: string; color: string }>;
}

export default function TrendsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [period, setPeriod] = useState<"7d" | "14d" | "30d">("14d");
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/trends?period=${period}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load trends:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrends();
  }, [period]);

  const themes = data?.themes || [];
  const spikingThemes = data?.spikingThemes || [];

  return (
    <div className="space-y-6">
      {/* Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Theme Trends & Spike Detection</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track emerging issues, volume velocity, and customer sentiment shifts across themes for{" "}
            <span className="font-semibold text-slate-200">{user?.workspaceName}</span>.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface border border-surface-border text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {(
            [
              { key: "7d", label: "7 Days vs Prev" },
              { key: "14d", label: "14 Days vs Prev" },
              { key: "30d", label: "30 Days vs Prev" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setPeriod(t.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                period === t.key
                  ? "bg-brand text-white font-semibold"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spiking Issues Alert Banner (Acceptance criteria 2) */}
      {spikingThemes.length > 0 && (
        <div className="p-4 rounded-xl bg-sentiment-neg-muted border border-sentiment-neg/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-sentiment-neg">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {spikingThemes.length} Theme{spikingThemes.length > 1 ? "s" : ""} Spiking vs Previous Period
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {spikingThemes.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-lg bg-surface border border-surface-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground truncate">{st.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sentiment-neg-muted text-sentiment-neg border border-sentiment-neg/20 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    +{st.growthRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {st.currentCount} items <span className="text-slate-500">(was {st.prevCount})</span>
                  </span>
                  <Link
                    href={`/inbox?themeId=${st.id}`}
                    className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
                  >
                    Drill down →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-line Theme Volume Timeline */}
      <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Theme Trajectory Over Time</h2>
            <p className="text-xs text-slate-400">Volume progression for the top active themes in the chosen timeframe</p>
          </div>
          <TrendingUp className="w-4 h-4 text-brand" />
        </div>

        <ThemeTimelineChart
          data={data?.topThemesTimeline || []}
          themeMeta={data?.topThemeNames || []}
        />
      </div>

      {/* Themes Clustering Grid / Table with Drill-Down (Acceptance criteria 1 & 3) */}
      <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Clustered Themes ({themes.length})</h2>
            <p className="text-xs text-slate-400">Click any theme to drill down into the underlying customer quotes</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-xs text-slate-400">Analyzing theme velocity and clusters...</div>
        ) : themes.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-semibold">No themes identified</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ingest feedback or run seed script to allow AI theme clustering to tag discussions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle/50 text-slate-400 font-medium">
                  <th className="py-3 px-4">Theme & Description</th>
                  <th className="py-3 px-3">Period Volume</th>
                  <th className="py-3 px-3">Velocity vs Prev</th>
                  <th className="py-3 px-3">Sentiment Ratio</th>
                  <th className="py-3 px-4 text-right">Drill-Down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {themes.map((theme) => (
                  <tr
                    key={theme.id}
                    className="hover:bg-surface-subtle/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className="font-semibold text-foreground text-xs">{theme.name}</span>
                        {theme.isSpiking && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sentiment-neg-muted text-sentiment-neg border border-sentiment-neg/20">
                            SPIKE
                          </span>
                        )}
                      </div>
                      {theme.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {theme.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-foreground font-semibold">
                        {theme.currentCount} <span className="text-slate-500 text-[11px] font-normal">items</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {theme.totalCount} lifetime
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        {theme.growthRate > 0 ? (
                          <span className="text-emerald-400 flex items-center">
                            <ArrowUpRight className="w-3 h-3" />
                            +{theme.growthRate}%
                          </span>
                        ) : theme.growthRate < 0 ? (
                          <span className="text-slate-400 flex items-center">
                            <ArrowDownRight className="w-3 h-3" />
                            {theme.growthRate}%
                          </span>
                        ) : (
                          <span className="text-slate-500">0%</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        was {theme.prevCount} in prev {data?.periodDays}d
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap min-w-[140px]">
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        <span className="text-sentiment-pos font-semibold">{theme.sentiments.posPct}% Pos</span>
                        <span>•</span>
                        <span className="text-sentiment-neg font-semibold">{theme.sentiments.negPct}% Neg</span>
                      </div>
                      {/* Mini visual ratio bar */}
                      <div className="h-1.5 w-full rounded-full bg-surface-subtle flex overflow-hidden">
                        <div
                          className="bg-sentiment-pos h-full"
                          style={{ width: `${theme.sentiments.posPct}%` }}
                        />
                        <div
                          className="bg-sentiment-neu h-full"
                          style={{ width: `${theme.sentiments.neuPct}%` }}
                        />
                        <div
                          className="bg-sentiment-neg h-full"
                          style={{ width: `${theme.sentiments.negPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        href={`/inbox?themeId=${theme.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-[11px] font-medium text-slate-300 hover:text-white hover:bg-surface-subtle transition-colors"
                      >
                        <span>View Feedback</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
