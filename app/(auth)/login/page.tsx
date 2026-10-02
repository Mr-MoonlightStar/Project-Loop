"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!res?.ok) {
        setAuthError(res?.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setAuthError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setValue("email", demoEmail, { shouldValidate: true });
    setValue("password", "loopdemo123", { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-12">
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
        <div className="glass-panel p-6 sm:p-8 rounded-2xl relative space-y-5">
          {/* Social Sign-In Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-surface hover:bg-surface-elevated border border-surface-border text-foreground font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl })}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-surface hover:bg-surface-elevated border border-surface-border text-foreground font-medium text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-surface-border w-full" />
            <span className="bg-surface px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider absolute">
              or credentials
            </span>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-sentiment-neg-subtle border border-sentiment-neg/20 text-sentiment-neg flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-email">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  {...register("email")}
                  className={`w-full bg-surface-subtle border ${
                    errors.email ? "border-sentiment-neg focus:border-sentiment-neg" : "border-surface-border focus:border-brand"
                  } rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand/40 transition-colors`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-sentiment-neg flex items-center gap-1">
                  <span>•</span> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full bg-surface-subtle border ${
                    errors.password ? "border-sentiment-neg focus:border-sentiment-neg" : "border-surface-border focus:border-brand"
                  } rounded-lg pl-9 pr-12 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand/40 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors min-w-[44px] min-h-[44px]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-sentiment-neg flex items-center gap-1">
                  <span>•</span> {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neu-button w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-brand text-white font-medium text-sm hover:bg-brand-hover flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Accounts */}
          <div className="pt-2 border-t border-surface-border">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              1-Click Demo Accounts (Local / Preview)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("admin@loopdemo.com")}
                className="min-h-[44px] px-2 py-1.5 rounded bg-surface hover:bg-surface-elevated border border-surface-border text-[11px] font-medium text-slate-300 hover:text-white transition-colors text-center"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("analyst@loopdemo.com")}
                className="min-h-[44px] px-2 py-1.5 rounded bg-surface hover:bg-surface-elevated border border-surface-border text-[11px] font-medium text-slate-300 hover:text-white transition-colors text-center"
              >
                📊 Analyst
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("viewer@loopdemo.com")}
                className="min-h-[44px] px-2 py-1.5 rounded bg-surface hover:bg-surface-elevated border border-surface-border text-[11px] font-medium text-slate-300 hover:text-white transition-colors text-center"
              >
                👁️ Viewer
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Need a new workspace?{" "}
          <Link href="/signup" className="text-brand hover:text-brand-hover font-medium underline underline-offset-4">
            Create organization
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
