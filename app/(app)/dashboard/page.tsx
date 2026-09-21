"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Calendar,
  MessageSquare,
  SmilePlus,
} from "lucide-react";
import VolumeChart from "@/components/dashboard/VolumeChart";
import SentimentChart from "@/components/dashboard/SentimentChart";
import ThemesBarChart from "@/components/dashboard/ThemesBarChart";

interface AnalyticsResponse {
  dateRange: string;
  stats: {
    totalFeedback: number;
    newThisWeek: number;
    negPercentage: number;
    posPercentage: number;
    neuPercentage: number;
    posCount: number;
    neuCount: number;
    negCount: number;
    avgScore: number;
  };
  charts: {
    volumeOverTime: Array<{ date: string; count: number }>;
    sentimentBreakdown: Array<{ name: string; value: number; color: string }>;
    topThemes: Array<{ name: string; count: number; color?: string | null }>;
    channelBreakdown: Array<{ channel: string; count: number }>;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/analytics?dateRange=${dateRange}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [dateRange]);

  const stats = data?.stats;
  const charts = data?.charts;
  const isZeroState = !isLoading && stats?.totalFeedback === 0;

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time customer feedback intelligence for{" "}
            <span className="font-semibold text-slate-200">{user?.workspaceName}</span>
          </p>
        </div>

        {/* Date Range Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface border border-surface-border text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {(
            [
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "90d", label: "90 Days" },
              { key: "all", label: "All Time" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setDateRange(t.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                dateRange === t.key
                  ? "bg-brand text-white font-semibold"
                  : "text-slate-400 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Dashboard State (if workspace has 0 rows) */}
      {isZeroState ? (
        <div className="p-16 rounded-xl border border-surface-border bg-surface text-center space-y-4">
          <MessageSquare className="w-12 h-12 text-brand mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-foreground">No customer feedback to visualize</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your workspace has not ingested any customer tickets, reviews, or survey items yet.
            Ingest feedback to see real-time volume charts, sentiment breakdowns, and theme clusters.
          </p>
          <div className="pt-2">
            <Link
              href="/feedback/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              Ingest First Feedback Batch
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Feedback */}
            <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Feedback</span>
                <MessageSquare className="w-4 h-4 text-brand" />
              </div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {isLoading ? "—" : stats?.totalFeedback.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">In selected timeframe</p>
            </div>

            {/* % Negative Sentiment */}
            <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Negative Sentiment</span>
                <AlertTriangle className="w-4 h-4 text-sentiment-neg" />
              </div>
              <div className="text-2xl font-bold font-mono text-sentiment-neg">
                {isLoading ? "—" : `${stats?.negPercentage}%`}
              </div>
              <p className="text-[11px] text-slate-500">
                {isLoading ? "..." : `${stats?.negCount} unhappy responses`}
              </p>
            </div>

            {/* New Feedback This Week */}
            <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>New This Week</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {isLoading ? "—" : stats?.newThisWeek}
              </div>
              <p className="text-[11px] text-slate-500">Arrived in last 7 days</p>
            </div>

            {/* Net Sentiment Score */}
            <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Average Sentiment</span>
                <SmilePlus className="w-4 h-4 text-sentiment-pos" />
              </div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {isLoading ? "—" : stats?.avgScore !== undefined && stats.avgScore > 0 ? `+${stats.avgScore}` : stats?.avgScore}
              </div>
              <p className="text-[11px] text-slate-500">Scale from -1.0 to +1.0</p>
            </div>
          </div>

          {/* Charts Row 1: Volume Over Time (2 Cols) + Sentiment Donut (1 Col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-xl border border-surface-border bg-surface space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Feedback Volume Trend</h2>
                  <p className="text-xs text-slate-400">Daily frequency of customer submissions</p>
                </div>
                <TrendingUp className="w-4 h-4 text-brand" />
              </div>
              <VolumeChart data={charts?.volumeOverTime || []} />
            </div>

            <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Sentiment Breakdown</h2>
                <p className="text-xs text-slate-400">Positive vs Neutral vs Negative ratio</p>
              </div>
              <SentimentChart data={charts?.sentimentBreakdown || []} />
            </div>
          </div>

          {/* Charts Row 2: Top Themes Ranking + Channel Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Top Themes by Frequency</h2>
                <p className="text-xs text-slate-400">Most active discussion clusters in this period</p>
              </div>
              <ThemesBarChart data={charts?.topThemes || []} />
            </div>

            <div className="p-5 rounded-xl border border-surface-border bg-surface space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Ingestion Channels</h2>
                <p className="text-xs text-slate-400">Feedback distribution across sources</p>
              </div>

              {charts?.channelBreakdown && charts.channelBreakdown.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {charts.channelBreakdown.map((ch) => {
                    const total = stats?.totalFeedback || 1;
                    const pct = Math.round((ch.count / total) * 100);
                    return (
                      <div key={ch.channel} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-300">{ch.channel}</span>
                          <span className="font-mono text-slate-400">
                            {ch.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                  No channel data available
                </div>
              )}
            </div>
          </div>

          {/* Quick CTA to AI Q&A or Inbox */}
          <div className="p-6 rounded-xl border border-surface-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Want to investigate customer drivers deeper?
              </div>
              <p className="text-xs text-slate-400">
                Ask LOOP uses retrieval-grounded AI to answer questions directly from verbatim quotes.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/inbox"
                className="px-4 py-2 rounded-lg bg-surface-subtle hover:bg-surface-subtle/80 border border-surface-border text-xs text-slate-300 transition-colors"
              >
                View Inbox
              </Link>
              <Link
                href="/ask"
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
              >
                Open Ask LOOP
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
