import Link from "next/link";
import { MessageSquare, Sparkles, ShieldCheck, ArrowRight, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between p-6 sm:p-12 max-w-7xl mx-auto">
      {/* Top Floating Glass Navigation Header */}
      <header className="glass-panel sticky top-3 sm:top-6 z-50 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold tracking-wider shadow-sm shrink-0">
            ∞
          </div>
          <span className="font-semibold text-base sm:text-lg tracking-tight">Project LOOP</span>
          <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded-full bg-brand-muted text-brand-400 border border-brand-500/20">
            Cycle 1
          </span>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 min-h-[44px] flex items-center rounded-lg hover:bg-surface-subtle transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="neu-button text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 min-h-[44px] rounded-lg bg-brand text-white hover:bg-brand-hover flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span className="hidden xs:inline">Create</span> Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="my-auto py-16 flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surface-border text-xs font-medium text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          Multi-tenant AI Customer-Feedback Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
          Turn scattered feedback into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-300">
            grounded decisions
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Project LOOP automatically ingests multi-channel feedback, classifies sentiment, clusters recurring themes, and grounds answers directly in real ingested customer quotes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="neu-button px-6 py-3 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover flex items-center gap-2 shadow-lg"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* System Pillars Grounded Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-12 text-left">
          <div className="neu-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-brand">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-sm">Tenant Isolation</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Workspace-scoped RBAC with ADMIN, ANALYST, and VIEWER roles enforced server-side.
            </p>
          </div>

          <div className="neu-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-sentiment-pos">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-sm">Real-time Intelligence</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Volume over time, sentiment shifts, and theme clusters driven strictly by verified data.
            </p>
          </div>

          <div className="neu-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-sentiment-neu">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-sm">Ask LOOP Q&A</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Zero hallucination semantic retrieval grounded exclusively in ingested feedback with verbatim citations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
