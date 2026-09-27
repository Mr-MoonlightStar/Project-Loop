"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface border border-surface-border rounded-xl p-8 text-center space-y-6 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider">
            System Error
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Something Went Wrong
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            An unexpected error occurred while processing intelligence operations. Our telemetry logs have captured this event.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-text-muted mt-2">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-subtle border border-surface-border rounded-md hover:bg-surface hover:text-text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
