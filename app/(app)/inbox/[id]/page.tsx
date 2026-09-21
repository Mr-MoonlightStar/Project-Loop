"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Tag,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface ThemeLink {
  id: string;
  confidence: number;
  theme: {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
  };
}

interface FeedbackDetail {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string | null;
  sourceRef?: string | null;
  sentiment: "POS" | "NEU" | "NEG";
  sentimentScore: number;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  themes: ThemeLink[];
}

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const isViewer = user?.role === "VIEWER";
  const isAdmin = user?.role === "ADMIN";

  const feedbackId = params?.id as string;

  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadFeedback() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/feedback/${feedbackId}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Feedback item was not found in your workspace.");
          } else {
            setError("Failed to load feedback details.");
          }
          return;
        }

        const data = await res.json();
        setFeedback(data.feedback);
      } catch {
        setError("Network error while loading feedback item.");
      } finally {
        setIsLoading(false);
      }
    }

    if (feedbackId) {
      loadFeedback();
    }
  }, [feedbackId]);

  const handleStatusUpdate = async (newStatus: "NEW" | "REVIEWED" | "ACTIONED") => {
    if (isViewer || !feedback) return;
    setStatusUpdating(true);

    try {
      const res = await fetch(`/api/feedback/${feedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setFeedback({ ...feedback, status: newStatus });
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !feedback) return;
    if (!confirm("Are you sure you want to delete this feedback item? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/feedback/${feedback.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/inbox");
      } else {
        alert("Failed to delete feedback");
        setIsDeleting(false);
      }
    } catch {
      alert("Network error while deleting item");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto" />
        <p className="text-xs text-slate-400">Loading feedback item...</p>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold">Feedback Item Unavailable</h2>
        <p className="text-xs text-slate-400">{error || "This item could not be retrieved."}</p>
        <Link
          href="/inbox"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-surface-border text-xs text-brand hover:bg-surface-subtle"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Feedback Inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/inbox"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Inbox
        </Link>

        {isAdmin && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? "Deleting..." : "Delete Item"}
          </button>
        )}
      </div>

      {/* Main Grid: Left side transcript, right side metadata & actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Full Content & Quote (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border text-xs text-slate-400">
              <span className="font-mono">{feedback.sourceRef || `ID: ${feedback.id.slice(0, 8)}`}</span>
              <span>{new Date(feedback.createdAt).toLocaleString()}</span>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Customer Statement / Transcript
              </h2>
              <blockquote className="p-4 rounded-lg bg-surface-subtle border-l-4 border-brand text-sm leading-relaxed text-foreground font-normal">
                &ldquo;{feedback.content}&rdquo;
              </blockquote>
            </div>

            {/* Attached Themes */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Assigned Theme Clusters
              </div>

              {feedback.themes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No themes assigned yet. AI clustering will auto-tag this item.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {feedback.themes.map(({ theme, confidence }) => (
                    <div
                      key={theme.id}
                      className="p-2.5 rounded-lg border border-surface-border bg-surface-subtle/50 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: theme.color || "inherit" }}
                        >
                          {theme.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {Math.round(confidence * 100)}% Match
                        </span>
                      </div>
                      {theme.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {theme.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Triage Controls (1 Col) */}
        <div className="space-y-6">
          {/* Status & Triage Card */}
          <div className="p-5 rounded-xl bg-surface border border-surface-border space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Triage Status Workflow
            </h3>

            <div className="flex flex-col gap-2">
              {(["NEW", "REVIEWED", "ACTIONED"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={isViewer || statusUpdating}
                  onClick={() => handleStatusUpdate(st)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border transition-all ${
                    feedback.status === st
                      ? "bg-brand text-white border-brand shadow-sm font-semibold"
                      : "bg-surface-subtle border-surface-border text-slate-300 hover:text-foreground hover:bg-surface-subtle/80"
                  } ${isViewer ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <span>{st}</span>
                  {feedback.status === st && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {isViewer && (
              <p className="text-[11px] text-amber-400/90 pt-1">
                Viewers have read-only access to status transitions.
              </p>
            )}
          </div>

          {/* Sentiment & Channel Metadata */}
          <div className="p-5 rounded-xl bg-surface border border-surface-border space-y-3 text-xs">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Signal Metadata
            </h3>

            <div className="flex items-center justify-between py-1.5 border-b border-surface-border">
              <span className="text-slate-400">Channel</span>
              <span className="font-medium text-foreground">{feedback.channel}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-surface-border">
              <span className="text-slate-400">Sentiment</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  feedback.sentiment === "POS"
                    ? "bg-sentiment-pos-muted text-sentiment-pos border-sentiment-pos/20"
                    : feedback.sentiment === "NEG"
                    ? "bg-sentiment-neg-muted text-sentiment-neg border-sentiment-neg/20"
                    : "bg-sentiment-neu-muted text-sentiment-neu border-sentiment-neu/20"
                }`}
              >
                {feedback.sentiment} ({feedback.sentimentScore > 0 ? `+${feedback.sentimentScore}` : feedback.sentimentScore})
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-surface-border">
              <span className="text-slate-400">Customer Persona</span>
              <span className="font-medium text-foreground">{feedback.customerLabel || "Unlabeled"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Source ID</span>
              <span className="font-mono text-slate-300">{feedback.sourceRef || "Manual"}</span>
            </div>
          </div>

          {/* Tenant Scoping Footnote */}
          <div className="p-3 rounded-lg bg-surface-subtle/50 border border-surface-border text-[11px] text-slate-400 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Scoped strictly to tenant workspace</span>
          </div>
        </div>
      </div>
    </div>
  );
}
