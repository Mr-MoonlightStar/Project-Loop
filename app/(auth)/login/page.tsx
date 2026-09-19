"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res?.ok) {
        setError(res?.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ∞
            </div>
            <span className="font-bold text-xl tracking-tight">Project LOOP</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your workspace</h1>
          <p className="text-xs text-slate-400">
            Access your feedback inbox, theme trends, and Ask LOOP intelligence.
          </p>
        </div>

        {/* Floating Glass Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-sentiment-neg-muted border border-sentiment-neg/20 text-sentiment-neg flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="email">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-foreground"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neu-button w-full py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seed Quick-Fill Helpers for Mentors / Graders */}
          <div className="mt-6 pt-5 border-t border-surface-border/60">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Demo Workspace Accounts (Seed):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("admin@loopdemo.com")}
                className="px-2 py-1.5 rounded text-[11px] bg-surface-subtle hover:bg-surface-subtle/80 border border-surface-border text-slate-300 transition-colors text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("analyst@loopdemo.com")}
                className="px-2 py-1.5 rounded text-[11px] bg-surface-subtle hover:bg-surface-subtle/80 border border-surface-border text-slate-300 transition-colors text-center"
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("viewer@loopdemo.com")}
                className="px-2 py-1.5 rounded text-[11px] bg-surface-subtle hover:bg-surface-subtle/80 border border-surface-border text-slate-300 transition-colors text-center"
              >
                Viewer
              </button>
            </div>
          </div>
        </div>

        {/* Link to Signup */}
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have a workspace yet?{" "}
          <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium underline-offset-4 hover:underline">
            Create a workspace
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
