"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  ShieldAlert,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface ThemeItem {
  id: string;
  name: string;
  color?: string | null;
  _count?: { feedback: number };
}

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

export default function InboxPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isViewer = user?.role === "VIEWER";

  // Data states
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [dateRange, setDateRange] = useState("all");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Themes for filter dropdown
  useEffect(() => {
    async function loadThemes() {
      try {
        const res = await fetch("/api/themes");
        if (res.ok) {
          const data = await res.json();
          setThemes(data.themes || []);
        }
      } catch (err) {
        console.error("Error loading themes:", err);
      }
    }
    loadThemes();
  }, []);

  // Fetch Feedback Items with filters and pagination
  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (appliedSearch) params.set("q", appliedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (channelFilter) params.set("channel", channelFilter);
      if (themeFilter) params.set("themeId", themeFilter);
      if (dateRange && dateRange !== "all") params.set("dateRange", dateRange);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        if (data.pagination) {
          setTotalItems(data.pagination.total);
          setTotalPages(data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load feedback", err);
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearch, statusFilter, channelFilter, themeFilter, dateRange, page, limit]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const handleResetFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setStatusFilter("");
    setChannelFilter("");
    setThemeFilter("");
    setDateRange("all");
    setPage(1);
  };

  const handleStatusChange = async (id: string, newStatus: "NEW" | "REVIEWED" | "ACTIONED", e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
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

  const hasActiveFilters = !!(appliedSearch || statusFilter || channelFilter || themeFilter || dateRange !== "all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback Inbox</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and triage customer feedback across all ingested channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isViewer ? (
            <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Viewer Role: Read-only</span>
            </div>
          ) : (
            <Link
              href="/feedback/add"
              className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              + Ingest Feedback
            </Link>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback content..."
              className="w-full pl-9 pr-20 py-2 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand text-foreground"
            />
            {search && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] rounded bg-brand text-white font-medium"
              >
                Search
              </button>
            )}
          </form>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs bg-surface border border-surface-border rounded-lg text-foreground focus:outline-none"
            >
              <option value="">Status: All</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACTIONED">Actioned</option>
            </select>

            {/* Channel Filter */}
            <select
              value={channelFilter}
              onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs bg-surface border border-surface-border rounded-lg text-foreground focus:outline-none"
            >
              <option value="">Channel: All</option>
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>

            {/* Theme Filter */}
            <select
              value={themeFilter}
              onChange={(e) => { setThemeFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs bg-surface border border-surface-border rounded-lg text-foreground focus:outline-none"
            >
              <option value="">Theme: All</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 text-xs bg-surface border border-surface-border rounded-lg text-foreground focus:outline-none"
            >
              <option value="all">Date: All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-1.5 rounded-lg hover:bg-surface-subtle border border-surface-border text-slate-400 hover:text-foreground text-xs flex items-center gap-1"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading inbox items...</div>
        ) : items.length === 0 ? (
          /* Empty States */
          hasActiveFilters ? (
            /* empty-search state */
            <div className="p-16 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-semibold text-foreground">No feedback matching your filters</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No items matched the current search query or filter parameters. Try clearing your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-surface border border-surface-border text-xs text-brand hover:bg-surface-subtle transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* empty-inbox state */
            <div className="p-16 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-brand mx-auto opacity-70" />
              <div className="text-base font-semibold text-foreground">No customer feedback yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your workspace is ready. Ingest feedback via CSV, trigger a simulated channel connector, or run the database seed script to populate sample data.
              </p>
              {!isViewer && (
                <div className="pt-2">
                  <Link
                    href="/feedback/add"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Ingest Your First Feedback
                  </Link>
                </div>
              )}
            </div>
          )
        ) : (
          /* Feedback Table */
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
                  <tr
                    key={item.id}
                    className="hover:bg-surface-subtle/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 max-w-md">
                      <Link href={`/inbox/${item.id}`} className="block">
                        <div className="line-clamp-2 text-foreground font-normal group-hover:text-brand-400 transition-colors">
                          {item.content}
                        </div>
                        {item.themes && item.themes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
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
                      </Link>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-300">
                      <Link href={`/inbox/${item.id}`} className="block">
                        <span className="px-2 py-0.5 rounded bg-surface-subtle border border-surface-border text-[11px]">
                          {item.channel}
                        </span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Link href={`/inbox/${item.id}`} className="block">
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
                      </Link>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-400">
                      <Link href={`/inbox/${item.id}`} className="block">
                        {item.customerLabel || "—"}
                      </Link>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {isViewer ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface border border-surface-border">
                          {item.status}
                        </span>
                      ) : (
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as "NEW" | "REVIEWED" | "ACTIONED", e)}
                          className="px-2 py-1 text-[11px] font-mono rounded bg-surface border border-surface-border text-foreground focus:outline-none"
                        >
                          <option value="NEW">NEW</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="ACTIONED">ACTIONED</option>
                        </select>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                      <Link href={`/inbox/${item.id}`} className="block">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {items.length > 0 && (
          <div className="p-3 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <span className="font-mono text-slate-200">
                {(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)}
              </span>
              <span>of</span>
              <span className="font-mono text-slate-200">{totalItems}</span>
              <span>records</span>

              <span className="text-slate-600">|</span>

              <label className="flex items-center gap-1.5">
                <span>Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
                  className="bg-surface border border-surface-border rounded px-1.5 py-0.5 text-foreground text-[11px]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px]">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded bg-surface border border-surface-border hover:bg-surface-subtle text-foreground disabled:opacity-30 disabled:pointer-events-none"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded bg-surface border border-surface-border hover:bg-surface-subtle text-foreground disabled:opacity-30 disabled:pointer-events-none"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
