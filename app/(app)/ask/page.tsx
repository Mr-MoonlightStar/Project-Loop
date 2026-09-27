"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  Quote,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CitedSource {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string | null;
  similarityScore: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  isAnswerable?: boolean;
  summaryHighlights?: string[];
  sources?: CitedSource[];
  timestamp: string;
}

const SAMPLE_QUESTIONS = [
  "What are the top complaints regarding billing and invoices?",
  "What do users like most about our dashboard speed?",
  "What are the main pain points in our onboarding flow?",
  "How do customers describe their experience with our mobile responsiveness?",
];

export default function AskLoopPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openSourcesIdx, setOpenSourcesIdx] = useState<number | null>(null);

  const handleSubmit = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || isLoading) return;

    setInput("");
    const userMessage: Message = {
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/insights/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      if (res.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer,
          isAnswerable: data.isAnswerable,
          summaryHighlights: data.summaryHighlights,
          sources: data.citedSources,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Sorry, I encountered an error processing your query.",
            isAnswerable: false,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please try again.",
          isAnswerable: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSources = (idx: number) => {
    setOpenSourcesIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Ask LOOP</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-muted text-brand-400 border border-brand-500/20 font-semibold">
              RAG Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded intelligence querying exclusively against verified customer feedback for{" "}
            <span className="font-semibold text-slate-200">{user?.workspaceName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict Zero-Hallucination Grounding</span>
        </div>
      </div>

      {/* Floating Glassmorphic Chat Container (The ONLY designated place for glassmorphism) */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden min-h-[460px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty State & Prompt Starters */
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-brand-muted text-brand flex items-center justify-center shadow-inner">
                <Sparkles className="w-6 h-6 text-brand-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">Ask anything about customer sentiment</h2>
                <p className="text-xs text-slate-400">
                  LOOP retrieves relevant tickets and survey items to construct answers backed by evidence. If the feedback is not present, it will not speculate.
                </p>
              </div>

              {/* Sample Prompt Chips */}
              <div className="w-full space-y-2 text-left">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider text-center">
                  Suggested Questions:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {SAMPLE_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSubmit(q)}
                      className="p-3 text-xs rounded-xl bg-surface/80 hover:bg-surface border border-surface-border text-slate-200 text-left transition-all hover:border-brand/40 flex items-center justify-between group"
                    >
                      <span className="line-clamp-1">{q}</span>
                      <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message Thread */
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-2`}
              >
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {msg.role === "user" ? user?.name || "You" : "Ask LOOP"}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed space-y-3 ${
                    msg.role === "user"
                      ? "bg-brand text-white font-normal"
                      : "bg-surface border border-surface-border text-slate-200 shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Highlights if provided */}
                  {msg.summaryHighlights && msg.summaryHighlights.length > 0 && (
                    <div className="pt-2 border-t border-surface-border/60 space-y-1">
                      <div className="font-semibold text-[11px] text-brand-300 uppercase tracking-wider">
                        Key Takeaways:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {msg.summaryHighlights.map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Source Citations Drawer */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-surface-border/60">
                      <button
                        type="button"
                        onClick={() => toggleSources(idx)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Quote className="w-3 h-3 text-brand" />
                        <span>{msg.sources.length} Cited Feedback Sources</span>
                        {openSourcesIdx === idx ? (
                          <ChevronUp className="w-3 h-3 ml-1" />
                        ) : (
                          <ChevronDown className="w-3 h-3 ml-1" />
                        )}
                      </button>

                      {openSourcesIdx === idx && (
                        <div className="mt-2 space-y-2 pt-1">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={src.id}
                              className="p-2.5 rounded-lg bg-surface-subtle border border-surface-border space-y-1 text-[11px]"
                            >
                              <div className="flex items-center justify-between text-slate-400">
                                <span className="font-semibold text-slate-300">
                                  [{sIdx + 1}] {src.channel}
                                </span>
                                <Link
                                  href={`/inbox/${src.id}`}
                                  className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-[10px]"
                                >
                                  View Item <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              </div>
                              <p className="text-slate-300 italic">&ldquo;{src.content}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {msg.role === "assistant" && msg.isAnswerable === false && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Zero-hallucination guard enforced: No fabricated feedback created.</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-400 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Retrieving relevant feedback quotes and formulating grounded answer...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-surface-border bg-surface/70">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about customer feedback..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs bg-surface border border-surface-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
