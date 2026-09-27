"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Share2,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Quote,
  Layers,
  Sparkles,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { VoCReportContent } from "@/lib/ai";

interface ReportDetail {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  contentJson: VoCReportContent;
  generatedBy?: {
    name: string;
    email: string;
  };
  workspace?: {
    name: string;
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) {
          throw new Error("Report not found or unauthorized");
        }
        const data = await res.json();
        setReport(data.report);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-text-secondary">Loading executive dossier...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-text-primary">Report Unavailable</h2>
        <p className="text-sm text-text-secondary">{error || "The requested report could not be found."}</p>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>
      </div>
    );
  }

  const content = report.contentJson;
  const metrics = content.metrics;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="print:hidden flex items-center justify-between border-b border-surface-border pb-4">
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dossier Library
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-primary bg-surface border border-surface-border rounded-md hover:bg-surface-subtle transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-text-muted" />
            {copied ? "Link Copied!" : "Share Link"}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main Dossier Container (Styled for Screen & High-Quality Print) */}
      <div className="bg-surface border border-surface-border rounded-xl p-8 sm:p-10 space-y-10 shadow-sm print:border-none print:shadow-none print:p-0 print:bg-transparent">
        {/* Dossier Header */}
        <div className="border-b border-surface-border pb-6 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs font-bold tracking-widest text-brand uppercase bg-brand/10 px-2.5 py-1 rounded">
              Voice of Customer Executive Dossier
            </span>
            <span className="text-xs text-text-muted">
              Project LOOP Intelligence Platform
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            {report.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              Reporting Window: {new Date(report.periodStart).toLocaleDateString()} — {new Date(report.periodEnd).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-text-muted" />
              Prepared by {report.generatedBy?.name || "Product Intelligence"} ({report.generatedBy?.email})
            </span>
            <span>•</span>
            <span>Synthesized {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Key Metrics Ribbon */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-subtle border border-surface-border rounded-lg p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Total Volume
              </span>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {metrics.totalVolume}
              </p>
              <span className="text-[11px] text-text-muted">feedback items</span>
            </div>

            <div className="bg-surface-subtle border border-surface-border rounded-lg p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Sentiment Index
              </span>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {metrics.avgSentimentScore > 0 ? `+${metrics.avgSentimentScore.toFixed(2)}` : metrics.avgSentimentScore.toFixed(2)}
              </p>
              <span className="text-[11px] text-text-muted">range (-1.0 to +1.0)</span>
            </div>

            <div className="bg-surface-subtle border border-surface-border rounded-lg p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Positive Share
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {metrics.sentimentBreakdown.positivePct}%
              </p>
              <span className="text-[11px] text-text-muted">
                {metrics.sentimentBreakdown.positive} items
              </span>
            </div>

            <div className="bg-surface-subtle border border-surface-border rounded-lg p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Negative Share
              </span>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {metrics.sentimentBreakdown.negativePct}%
              </p>
              <span className="text-[11px] text-text-muted">
                {metrics.sentimentBreakdown.negative} items
              </span>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-border pb-2">
            <Sparkles className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-bold text-text-primary">Executive Summary</h2>
          </div>
          <div className="bg-surface-subtle border border-surface-border rounded-lg p-5">
            <p className="text-sm leading-relaxed text-text-primary whitespace-pre-line">
              {content.executiveSummary}
            </p>
          </div>
        </section>

        {/* Strategic Takeaways / Key Insights */}
        {content.keyInsights && content.keyInsights.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Strategic Takeaways
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.keyInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-surface-border rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-text-secondary leading-normal"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Emerging Risks & Critical Blockers */}
        {content.emergingIssues && content.emergingIssues.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-surface-border pb-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-text-primary">
                Critical Friction & Emerging Risks
              </h2>
            </div>

            <div className="space-y-3">
              {content.emergingIssues.map((issue, idx) => {
                const impactColor =
                  issue.impact === "CRITICAL"
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : issue.impact === "HIGH"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-surface-subtle text-text-secondary border-surface-border";

                return (
                  <div
                    key={idx}
                    className="border border-surface-border rounded-lg p-4 bg-surface space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-text-primary">{issue.issue}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${impactColor}`}>
                        {issue.impact} IMPACT
                      </span>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-surface-subtle rounded border border-surface-border text-xs italic text-text-secondary">
                      <Quote className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                      <span>&ldquo;{issue.evidenceQuote}&rdquo;</span>
                    </div>

                    <p className="text-xs text-text-secondary">
                      <strong className="text-text-primary">Suggested Remediation:</strong> {issue.suggestedFix}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Top Themes & Real Quotes Deep Dive */}
        {content.topThemes && content.topThemes.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-surface-border pb-2">
              <Layers className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-bold text-text-primary">
                Top Theme Trajectories & Customer Voice
              </h2>
            </div>

            <div className="space-y-5">
              {content.topThemes.map((theme, idx) => (
                <div
                  key={idx}
                  className="border border-surface-border rounded-lg p-5 bg-surface space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-text-primary">{theme.name}</h3>
                      <span className="text-xs text-text-muted">
                        ({theme.count} items, {theme.percentage}% share)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-600 font-medium">{theme.sentiment.positive} POS</span>
                      <span className="text-text-muted">/</span>
                      <span className="text-text-muted font-medium">{theme.sentiment.neutral} NEU</span>
                      <span className="text-text-muted">/</span>
                      <span className="text-rose-600 font-medium">{theme.sentiment.negative} NEG</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {theme.analysis}
                  </p>

                  {/* Sample Quotes */}
                  {theme.sampleQuotes && theme.sampleQuotes.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                        Verbatim Customer Quotes:
                      </span>
                      <div className="space-y-1.5">
                        {theme.sampleQuotes.map((quote, qIdx) => (
                          <div
                            key={qIdx}
                            className="text-xs text-text-secondary bg-surface-subtle border border-surface-border p-2.5 rounded italic flex items-start gap-2"
                          >
                            <Quote className="w-3 h-3 text-text-muted shrink-0 mt-0.5" />
                            <span>&ldquo;{quote}&rdquo;</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prioritized Strategic Recommendations */}
        {content.recommendations && content.recommendations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-surface-border pb-2">
              <TrendingUp className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-bold text-text-primary">
                Cross-Functional Strategic Action Plan
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.recommendations.map((rec, idx) => {
                const priorityBadge =
                  rec.priority === "P0"
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : rec.priority === "P1"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-surface-subtle text-text-secondary border-surface-border";

                return (
                  <div
                    key={idx}
                    className="border border-surface-border rounded-lg p-4 bg-surface flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                          {rec.area}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityBadge}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-text-primary">{rec.title}</h4>
                      <p className="text-xs text-text-secondary leading-normal">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Sign-off Footer */}
        <div className="border-t border-surface-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <span>Project LOOP • Voice of Customer Intelligence System</span>
          <span>Confidential • Internal Distribution Only</span>
        </div>
      </div>
    </div>
  );
}
