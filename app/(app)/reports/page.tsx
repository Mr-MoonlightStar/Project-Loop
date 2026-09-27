"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  Plus,
  Calendar,
  User as UserIcon,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Trash2,
  Sparkles,
  Loader2,
  X,
  Layers,
} from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  contentJson: {
    metrics?: {
      totalVolume?: number;
      avgSentimentScore?: number;
      sentimentBreakdown?: {
        positivePct?: number;
        neutralPct?: number;
        negativePct?: number;
      };
    };
    keyInsights?: string[];
  };
  generatedBy?: {
    name: string;
    email: string;
  };
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [customTitle, setCustomTitle] = useState("");

  const canGenerate = session?.user?.role === "ADMIN" || session?.user?.role === "ANALYST";

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGenerate) return;

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          title: customTitle.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate report");
      }

      setIsModalOpen(false);
      setCustomTitle("");
      await fetchReports();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this executive report?")) return;

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete report");
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Voice of Customer Reports
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Executive syntheses, sentiment trajectories, and actionable product recommendations.
          </p>
        </div>

        {canGenerate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors shadow-sm self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate New Report
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Reports
            </span>
            <FileText className="w-5 h-5 text-brand" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">{reports.length}</span>
            <span className="text-xs text-text-muted">published dossiers</span>
          </div>
        </div>

        <div className="bg-surface border border-surface-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Analysis Engine
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">Gemini 2.5 Flash</span>
            <span className="text-xs text-text-muted">zero-hallucination</span>
          </div>
        </div>

        <div className="bg-surface border border-surface-border rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Latest Ingest Window
            </span>
            <Calendar className="w-5 h-5 text-text-muted" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-text-primary">
              {reports[0] ? new Date(reports[0].createdAt).toLocaleDateString() : "No reports yet"}
            </span>
            {reports[0] && (
              <span className="text-xs text-text-muted">
                by {reports[0].generatedBy?.name || "Analyst"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-surface border border-surface-border rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand" />
            Executive Dossier Library
          </h2>
          <span className="text-xs text-text-muted">{reports.length} available</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <p className="text-sm">Retrieving executive reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center mb-4 text-text-muted">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">No reports generated yet</h3>
            <p className="text-sm text-text-secondary max-w-sm mt-1 mb-6">
              Generate an executive Voice of Customer report to summarize customer sentiment, emerging issues, and top product themes.
            </p>
            {canGenerate && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate First Report
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {reports.map((report) => {
              const metrics = report.contentJson?.metrics;
              const positivePct = metrics?.sentimentBreakdown?.positivePct ?? 0;
              const negativePct = metrics?.sentimentBreakdown?.negativePct ?? 0;
              const volume = metrics?.totalVolume ?? 0;

              return (
                <div
                  key={report.id}
                  className="p-5 hover:bg-surface-subtle transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/reports/${report.id}`}
                        className="text-base font-semibold text-text-primary hover:text-brand transition-colors truncate"
                      >
                        {report.title}
                      </Link>
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-surface-subtle border border-surface-border text-text-secondary">
                        {new Date(report.periodStart).toLocaleDateString()} —{" "}
                        {new Date(report.periodEnd).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        {report.generatedBy?.name || "Team Member"}
                      </span>
                      <span>•</span>
                      <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="font-medium text-text-secondary">{volume} feedback items analyzed</span>
                    </div>

                    {report.contentJson?.keyInsights && report.contentJson.keyInsights.length > 0 && (
                      <p className="text-xs text-text-secondary line-clamp-1 italic mt-1">
                        &ldquo;{report.contentJson.keyInsights[0]}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Sentiment Pills & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 bg-surface border border-surface-border px-3 py-1.5 rounded text-xs">
                      <span className="text-emerald-600 font-semibold">{positivePct}% POS</span>
                      <span className="text-text-muted">/</span>
                      <span className="text-rose-600 font-semibold">{negativePct}% NEG</span>
                    </div>

                    <Link
                      href={`/reports/${report.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-primary bg-surface border border-surface-border rounded hover:bg-surface-subtle transition-colors"
                    >
                      View Report
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {canGenerate && (
                      <button
                        onClick={(e) => handleDelete(report.id, e)}
                        title="Delete Report"
                        className="p-1.5 text-text-muted hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surface-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand" />
                <h3 className="text-base font-semibold text-text-primary">
                  Synthesize VoC Executive Report
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  Reporting Time Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["7d", "30d", "90d"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-2 text-xs font-medium rounded-md border text-center transition-colors ${
                        period === p
                          ? "bg-brand text-white border-brand shadow-sm"
                          : "bg-surface border-surface-border text-text-secondary hover:bg-surface-subtle"
                      }`}
                    >
                      {p === "7d" ? "Past 7 Days" : p === "30d" ? "Past 30 Days" : "Past 90 Days"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Report Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Product VoC Intelligence Summary"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="p-3 rounded-md bg-surface-subtle border border-surface-border text-xs text-text-secondary space-y-1">
                <p className="font-semibold text-text-primary">What this report includes:</p>
                <ul className="list-disc list-inside space-y-0.5 text-text-muted">
                  <li>Total feedback volume & sentiment trajectory metrics</li>
                  <li>Gemini 2.5 Flash synthesized executive summary</li>
                  <li>Emerging issues with verbatim evidence quotes</li>
                  <li>Top theme deep-dives with customer citation cards</li>
                  <li>Prioritized cross-functional action plan (P0, P1, P2)</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={generating}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50 shadow-sm"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synthesizing Dossier...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
