"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, MessageSquare, AlertCircle, CheckCircle2, Search, Filter, ShieldAlert } from "lucide-react";

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string | null;
  sourceRef?: string | null;
  sentiment: "POS" | "NEU" | "NEG";
  sentimentScore: number;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
  themes?: Array<{
    theme: {
      id: string;
      name: string;
      color?: string | null;
    };
  }>;
}

const CHANNELS = [
  "Support Ticket",
  "App Store",
  "NPS Survey",
  "Sales Call",
  "Community Post",
];

export default function FeedbackPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isViewer = user?.role === "VIEWER";

  // Form State
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [customerLabel, setCustomerLabel] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Table State
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");

  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (statusFilter) params.set("status", statusFilter);
      if (channelFilter) params.set("channel", channelFilter);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load feedback", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, channelFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFeedback();
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          channel,
          customerLabel: customerLabel || null,
          sourceRef: sourceRef || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setFormMessage({ type: "error", text: errData.error || "Failed to add feedback" });
        return;
      }

      setFormMessage({ type: "success", text: "Feedback ingested successfully" });
      setContent("");
      setCustomerLabel("");
      setSourceRef("");
      fetchFeedback();
    } catch {
      setFormMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "NEW" | "REVIEWED" | "ACTIONED") => {
    if (isViewer) return;

    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ingest, triage, and action multi-channel customer responses.
          </p>
        </div>

        {isViewer && (
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-amber-400 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Viewer Role: Read-only access enabled</span>
          </div>
        )}
      </div>

      {/* Single Entry Ingestion Form (Cycle 1 "Bicycle") */}
      {!isViewer ? (
        <div className="neu-card p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
            <Plus className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold">Single-Entry Feedback Ingestion</h2>
          </div>

          <form onSubmit={handleCreateFeedback} className="space-y-4">
            {formMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  formMessage.type === "success"
                    ? "bg-sentiment-pos-muted text-sentiment-pos border border-sentiment-pos/20"
                    : "bg-sentiment-neg-muted text-sentiment-neg border border-sentiment-neg/20"
                }`}
              >
                {formMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{formMessage.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Feedback Content *
              </label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste customer support message, review, or verbatim quote..."
                className="w-full p-3 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-foreground"
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
                  className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand text-foreground"
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
                  placeholder="e.g. Enterprise, Free, Beta Lead"
                  className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Source Reference / ID
                </label>
                <input
                  type="text"
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder="e.g. TICKET-1049, REV-89"
                  className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="neu-button px-5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                {isSubmitting ? "Ingesting..." : "Ingest Feedback"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback content..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand text-foreground"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface border border-surface-border rounded-lg text-foreground focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTIONED">Actioned</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface border border-surface-border rounded-lg text-foreground focus:outline-none"
          >
            <option value="">All Channels</option>
            {CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Data Table */}
      <div className="neu-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading feedback items...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-medium">No feedback items found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No records match your criteria. Ingest a feedback item above or run the seed script.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle/50 text-slate-400 font-medium">
                  <th className="py-3 px-4">Content</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3">Sentiment</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-subtle/30 transition-colors">
                    <td className="py-3 px-4 max-w-md">
                      <div className="line-clamp-2 text-foreground font-normal">{item.content}</div>
                      {item.themes && item.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.themes.map(({ theme }) => (
                            <span
                              key={theme.id}
                              className="text-[10px] px-1.5 py-0.5 rounded font-mono border"
                              style={{
                                borderColor: theme.color ? `${theme.color}40` : "var(--surface-border)",
                                color: theme.color || "inherit",
                              }}
                            >
                              {theme.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-surface border border-surface-border text-[11px]">
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.sentiment === "POS"
                            ? "bg-sentiment-pos-muted text-sentiment-pos border-sentiment-pos/20"
                            : item.sentiment === "NEG"
                            ? "bg-sentiment-neg-muted text-sentiment-neg border-sentiment-neg/20"
                            : "bg-sentiment-neu-muted text-sentiment-neu border-sentiment-neu/20"
                        }`}
                      >
                        {item.sentiment} ({item.sentimentScore > 0 ? `+${item.sentimentScore}` : item.sentimentScore})
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                      {item.customerLabel || "—"}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isViewer ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface border border-surface-border">
                          {item.status}
                        </span>
                      ) : (
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as "NEW" | "REVIEWED" | "ACTIONED"
                            )
                          }
                          className="px-2 py-1 text-[11px] font-mono rounded bg-surface border border-surface-border text-foreground focus:outline-none"
                        >
                          <option value="NEW">NEW</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="ACTIONED">ACTIONED</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
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
