"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Lock,
  Mail,
  Building,
  User,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { signupSchema, SignupFormData } from "@/lib/validations/auth";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      workspaceName: "",
    },
    mode: "onChange",
  });

  const currentPassword = watch("password") || "";

  // Password rules live evaluation
  const rules = [
    { label: "8+ characters", met: currentPassword.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(currentPassword) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(currentPassword) },
    { label: "One number (0-9)", met: /[0-9]/.test(currentPassword) },
    { label: "One special character (!@#$%...)", met: /[^A-Za-z0-9]/.test(currentPassword) },
  ];

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        setServerError(resData.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Automatically sign in the user into their new workspace
      const authRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!authRes?.ok) {
        router.push("/login?created=true");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred during account creation");
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your workspace</h1>
          <p className="text-xs text-slate-400">
            Sign up as an ADMIN to create an isolated organization, invite teammates, and run AI feedback intelligence.
          </p>
        </div>

        {/* Floating Glass Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl relative">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3 rounded-lg bg-sentiment-neg-subtle border border-sentiment-neg/20 text-sentiment-neg flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-name">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Sarah Connor"
                  {...register("name")}
                  className={`w-full bg-surface-subtle border ${
                    errors.name ? "border-sentiment-neg focus:border-sentiment-neg" : "border-surface-border focus:border-brand"
                  } rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand/40 transition-colors`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-sentiment-neg flex items-center gap-1">
                  <span>•</span> {errors.name.message}
                </p>
              )}
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-email">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="sarah@company.com"
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

            {/* Workspace / Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-workspace">
                Organization / Workspace Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-workspace"
                  type="text"
                  placeholder="Acme Corp"
                  {...register("workspaceName")}
                  className={`w-full bg-surface-subtle border ${
                    errors.workspaceName ? "border-sentiment-neg focus:border-sentiment-neg" : "border-surface-border focus:border-brand"
                  } rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand/40 transition-colors`}
                />
              </div>
              {errors.workspaceName && (
                <p className="mt-1 text-xs text-sentiment-neg flex items-center gap-1">
                  <span>•</span> {errors.workspaceName.message}
                </p>
              )}
              <span className="text-[11px] text-slate-400 block mt-1">
                Creates a cryptographically and logically isolated tenant workspace.
              </span>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-password"
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

              {/* Specific Rule Error */}
              {errors.password && (
                <p className="mt-1 text-xs text-sentiment-neg flex items-center gap-1">
                  <span>•</span> {errors.password.message}
                </p>
              )}

              {/* Password complexity checklist */}
              <div className="mt-2.5 p-3 rounded-lg bg-surface border border-surface-border space-y-1.5 text-[11px]">
                <span className="font-semibold text-slate-300 block mb-1">Password Requirements:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-400">
                  {rules.map((rule, idx) => (
                    <div key={idx} className={`flex items-center gap-1.5 ${rule.met ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                      {rule.met ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neu-button w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-brand text-white font-medium text-sm hover:bg-brand-hover flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand/20 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Organization
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:text-brand-hover font-medium underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
