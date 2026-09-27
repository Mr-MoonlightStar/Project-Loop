import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface border border-surface-border rounded-xl p-8 text-center space-y-6 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto">
          <Search className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
            Error 404
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Page Not Found
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            The feedback dossier, analysis page, or report you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/inbox"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-subtle border border-surface-border rounded-md hover:bg-surface hover:text-text-primary transition-colors"
          >
            Browse Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}
