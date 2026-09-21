"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Papa from "papaparse";
import Link from "next/link";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Info,
  Radio,
} from "lucide-react";

const CHANNELS = [
  "Support Ticket",
  "App Store",
  "NPS Survey",
  "Sales Call",
  "Community Post",
];

export default function AddFeedbackPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isViewer = user?.role === "VIEWER";

  const [activeTab, setActiveTab] = useState<"csv" | "simulate" | "manual">("csv");

  // Single Entry Manual Form State
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [customerLabel, setCustomerLabel] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualStatus, setManualStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown>[]>([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState<{
    importedCount: number;
    failedCount: number;
    totalRows: number;
    errors?: Array<{ rowNumber: number; reason: string }>;
  } | null>(null);

  // Channel Simulation State
  const [simChannel, setSimChannel] = useState<string>("Support Ticket");
  const [simCount, setSimCount] = useState<number>(5);
  const [simLoading, setSimLoading] = useState(false);
  const [simMessage, setSimMessage] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Handle Manual Form Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    setManualLoading(true);
    setManualStatus(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, channel, customerLabel: customerLabel || null, sourceRef: sourceRef || null }),
      });

      if (!res.ok) {
        const err = await res.json();
        setManualStatus({ type: "error", msg: err.error || "Failed to create feedback" });
        return;
      }

      setManualStatus({ type: "success", msg: "Feedback successfully ingested into your workspace." });
      setContent("");
      setCustomerLabel("");
      setSourceRef("");
    } catch {
      setManualStatus({ type: "error", msg: "An unexpected error occurred" });
    } finally {
      setManualLoading(false);
    }
  };

  // Handle CSV File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvPreview((results.data as Record<string, unknown>[]).slice(0, 5));
      },
    });
  };

  // Upload & Import CSV
  const handleCsvUpload = async () => {
    if (!csvFile || isViewer) return;
    setCsvLoading(true);
    setCsvResult(null);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/feedback/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: results.data }),
          });

          const data = await res.json();
          if (res.ok) {
            setCsvResult(data);
          } else {
            alert(data.error || "Import failed");
          }
        } catch {
          alert("Network or parse error during import");
        } finally {
          setCsvLoading(false);
        }
      },
    });
  };

  // Trigger Channel Simulation
  const handleSimulateChannel = async () => {
    if (isViewer) return;
    setSimLoading(true);
    setSimMessage(null);

    try {
      const res = await fetch("/api/feedback/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: simChannel, batchSize: simCount }),
      });

      const data = await res.json();
      if (res.ok) {
        setSimMessage({ type: "success", msg: data.message });
      } else {
        setSimMessage({ type: "error", msg: data.error || "Simulation failed" });
      }
    } catch {
      setSimMessage({ type: "error", msg: "Failed to simulate channel import" });
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div className="space-y-1">
          <Link
            href="/inbox"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Inbox
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Ingest Customer Feedback</h1>
          <p className="text-xs text-slate-400">
            Import multi-channel feedback via CSV bulk upload, live simulated connectors, or manual entry.
          </p>
        </div>

        {isViewer && (
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-amber-400 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Read-Only Viewer: Ingestion disabled</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border gap-2">
        <button
          onClick={() => setActiveTab("csv")}
          className={`px-4 py-2 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "csv"
              ? "border-brand text-brand font-semibold"
              : "border-transparent text-slate-400 hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          CSV Bulk Import
        </button>

        <button
          onClick={() => setActiveTab("simulate")}
          className={`px-4 py-2 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "simulate"
              ? "border-brand text-brand font-semibold"
              : "border-transparent text-slate-400 hover:text-foreground"
          }`}
        >
          <Radio className="w-4 h-4" />
          Simulated Connectors
        </button>

        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "manual"
              ? "border-brand text-brand font-semibold"
              : "border-transparent text-slate-400 hover:text-foreground"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Manual Single Entry
        </button>
      </div>

      {/* Tab 1: CSV Bulk Import */}
      {activeTab === "csv" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Info className="w-4 h-4 text-brand" />
              CSV Format Guidelines
            </div>
            <p className="text-slate-400">
              Required column: <code className="text-brand-400 font-mono">content</code> (or <code className="font-mono">text</code>).
              Recommended columns: <code className="font-mono text-slate-300">channel, customer_label, source_ref, created_at</code>.
            </p>
          </div>

          <div className="p-8 border-2 border-dashed border-surface-border rounded-xl text-center space-y-4 bg-surface-subtle/30">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <label
                htmlFor="csv-file-input"
                className={`cursor-pointer px-4 py-2 rounded-lg bg-surface border border-surface-border text-xs font-medium hover:bg-surface-subtle transition-colors text-foreground ${
                  isViewer ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Choose CSV File
              </label>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                disabled={isViewer}
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                {csvFile ? csvFile.name : "Select a UTF-8 encoded .csv spreadsheet"}
              </p>
            </div>
          </div>

          {/* CSV Preview */}
          {csvPreview.length > 0 && (
            <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>File Preview (First 5 Rows)</span>
                <span className="text-slate-400 font-normal">{csvFile?.name}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-border text-slate-400 font-medium">
                      <th className="py-2 px-3">Content Preview</th>
                      <th className="py-2 px-3">Channel</th>
                      <th className="py-2 px-3">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {csvPreview.map((row, idx) => (
                      <tr key={idx} className="text-slate-300">
                        <td className="py-2 px-3 max-w-sm truncate">
                          {String(row.content || row.text || row.feedback || "—")}
                        </td>
                        <td className="py-2 px-3">{String(row.channel || "Default")}</td>
                        <td className="py-2 px-3">{String(row.customerLabel || row.customer_label || "—")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={csvLoading || isViewer}
                  onClick={handleCsvUpload}
                  className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {csvLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Parsing & Ingesting...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      Import All Rows
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Import Result Stats */}
          {csvResult && (
            <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Import Complete
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
                  <div className="text-xs text-slate-400">Total Rows</div>
                  <div className="text-lg font-bold font-mono text-foreground">{csvResult.totalRows}</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
                  <div className="text-xs text-slate-400">Successfully Ingested</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">{csvResult.importedCount}</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border">
                  <div className="text-xs text-slate-400">Failed / Skipped</div>
                  <div className="text-lg font-bold font-mono text-red-400">{csvResult.failedCount}</div>
                </div>
              </div>

              {csvResult.errors && csvResult.errors.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-sentiment-neg-muted border border-sentiment-neg/20 text-xs text-sentiment-neg space-y-1 max-h-40 overflow-y-auto">
                  <div className="font-semibold">Failed Row Details:</div>
                  {csvResult.errors.map((err, i) => (
                    <div key={i} className="text-[11px]">
                      Row {err.rowNumber}: {err.reason}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Link
                  href="/inbox"
                  className="text-xs font-medium text-brand hover:underline"
                >
                  View Ingested Rows in Inbox →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Simulated Connectors */}
      {activeTab === "simulate" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-surface-border text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-brand" />
              Simulated Connector Feeds
            </div>
            <p className="text-slate-400">
              Mimic incoming feedback from integrated third-party platforms. Each pull loads authentic customer tickets, ratings, or quotes into your tenant workspace.
            </p>
          </div>

          {simMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                simMessage.type === "success"
                  ? "bg-sentiment-pos-muted text-sentiment-pos border border-sentiment-pos/20"
                  : "bg-sentiment-neg-muted text-sentiment-neg border border-sentiment-neg/20"
              }`}
            >
              {simMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{simMessage.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Connector Channel
              </label>
              <select
                value={simChannel}
                onChange={(e) => setSimChannel(e.target.value)}
                disabled={isViewer}
                className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Batch Size (Items to Generate)
              </label>
              <select
                value={simCount}
                onChange={(e) => setSimCount(parseInt(e.target.value, 10))}
                disabled={isViewer}
                className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value={3}>3 feedback items</option>
                <option value={5}>5 feedback items</option>
                <option value={10}>10 feedback items</option>
                <option value={20}>20 feedback items</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={simLoading || isViewer}
              onClick={handleSimulateChannel}
              className="px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {simLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Piping Feed...
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" />
                  Simulate Ingest from {simChannel}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Manual Single Entry */}
      {activeTab === "manual" && (
        <div className="p-6 rounded-xl bg-surface border border-surface-border space-y-4">
          {manualStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                manualStatus.type === "success"
                  ? "bg-sentiment-pos-muted text-sentiment-pos border border-sentiment-pos/20"
                  : "bg-sentiment-neg-muted text-sentiment-neg border border-sentiment-neg/20"
              }`}
            >
              {manualStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{manualStatus.msg}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Feedback Message *
              </label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter feedback statement or ticket message..."
                disabled={isViewer}
                className="w-full p-3 text-sm bg-surface-subtle border border-surface-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Channel *
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  disabled={isViewer}
                  className="w-full px-3 py-2 text-sm bg-surface-subtle border border-surface-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  {CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer Label / Tier
                </label>
                <input
                  type="text"
                  value={customerLabel}
                  onChange={(e) => setCustomerLabel(e.target.value)}
                  placeholder="e.g. Enterprise Tier"
                  disabled={isViewer}
                  className="w-full px-3 py-2 text-sm bg-surface-subtle border border-surface-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Source Reference
                </label>
                <input
                  type="text"
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder="e.g. TICKET-992"
                  disabled={isViewer}
                  className="w-full px-3 py-2 text-sm bg-surface-subtle border border-surface-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={manualLoading || isViewer}
                className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {manualLoading ? "Saving..." : "Ingest Feedback"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
