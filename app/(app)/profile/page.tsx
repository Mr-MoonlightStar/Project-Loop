"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User as UserIcon,
  Mail,
  Shield,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  XCircle,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password accordion state — HIDDEN by default per specification
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  // Password complexity rules evaluation
  const pwRules = [
    { label: "8+ characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(newPassword) },
    { label: "One number (0-9)", met: /[0-9]/.test(newPassword) },
    { label: "One special character (!@#$%...)", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // If password section is open, validate new password complexity
    if (showPasswordSection && newPassword) {
      if (!currentPassword) {
        setMessage({ type: "error", text: "Please enter your current password." });
        return;
      }
      if (newPassword.length < 8) {
        setMessage({ type: "error", text: "New password must be at least 8 characters long." });
        return;
      }
      if (!/[A-Z]/.test(newPassword)) {
        setMessage({ type: "error", text: "New password must contain at least one uppercase letter (A-Z)." });
        return;
      }
      if (!/[a-z]/.test(newPassword)) {
        setMessage({ type: "error", text: "New password must contain at least one lowercase letter (a-z)." });
        return;
      }
      if (!/[0-9]/.test(newPassword)) {
        setMessage({ type: "error", text: "New password must contain at least one number (0-9)." });
        return;
      }
      if (!/[^A-Za-z0-9]/.test(newPassword)) {
        setMessage({ type: "error", text: "New password must contain at least one special character (!@#$%...)." });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "New passwords do not match." });
        return;
      }
    }

    setLoading(true);

    try {
      const payload: { name?: string; currentPassword?: string; newPassword?: string } = {
        name: name.trim(),
      };

      if (showPasswordSection && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update next-auth client session
      await update({ name: data.user.name });

      // Reset password fields and collapse section
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto pb-12 px-2 sm:px-0">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
          User Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Manage your personal credentials, identity, and workspace security preferences.
        </p>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-3.5 sm:p-4 rounded-lg border text-xs sm:text-sm flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Identity Summary */}
      <div className="bg-surface border border-surface-border rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-lg sm:text-xl shrink-0">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-text-primary truncate">
              {session?.user?.name || "Team Member"}
            </h2>
            <p className="text-xs text-text-secondary truncate">{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          <div className="p-3.5 sm:p-4 rounded-lg bg-surface-subtle border border-surface-border flex items-center gap-3">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                Assigned Workspace
              </span>
              <p className="text-xs sm:text-sm font-semibold text-text-primary mt-0.5 truncate">
                {session?.user?.workspaceName || "Acme Corp"}
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg bg-surface-subtle border border-surface-border flex items-center gap-3">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-brand shrink-0" />
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                Account Role
              </span>
              <p className="text-xs sm:text-sm font-semibold text-text-primary mt-0.5">
                {session?.user?.role || "VIEWER"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Password Form */}
      <div className="bg-surface border border-surface-border rounded-xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-4 pb-3 border-b border-surface-border">
          Account Credentials & Security
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5" htmlFor="profile-name">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="profile-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-subtle border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5" htmlFor="profile-email">
                Email Address (Managed by Tenant Admin)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="profile-email"
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-subtle border border-surface-border rounded-md text-text-muted cursor-not-allowed min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Change Password Section — Hidden by default per specification */}
          <div className="pt-4 border-t border-surface-border">
            {!showPasswordSection ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-surface-subtle border border-surface-border">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-brand shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-text-primary">Password & Security</h4>
                    <p className="text-[11px] text-text-secondary">Password fields are hidden to keep settings clean.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-text-primary bg-surface border border-surface-border rounded-md hover:bg-surface-elevated hover:border-brand/40 transition-colors self-start sm:self-auto"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="space-y-4 p-4 rounded-lg bg-surface-subtle border border-surface-border animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-surface-border pb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-brand" />
                    <h4 className="text-xs sm:text-sm font-semibold text-text-primary">Change Password</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 min-h-[36px] px-2 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1" htmlFor="current-pw">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="current-pw"
                        type={showCurrentPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-9 pr-12 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        aria-label={showCurrentPw ? "Hide current password" : "Show current password"}
                        className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-text-muted hover:text-text-primary min-w-[44px] min-h-[44px]"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1" htmlFor="new-pw">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="new-pw"
                          type={showNewPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-9 pr-12 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand min-h-[44px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          aria-label={showNewPw ? "Hide new password" : "Show new password"}
                          className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-text-muted hover:text-text-primary min-w-[44px] min-h-[44px]"
                        >
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1" htmlFor="confirm-pw">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="confirm-pw"
                          type={showConfirmPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-12 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand min-h-[44px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          aria-label={showConfirmPw ? "Hide confirm password" : "Show confirm password"}
                          className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-text-muted hover:text-text-primary min-w-[44px] min-h-[44px]"
                        >
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Password Rules */}
                  <div className="mt-2 p-3 rounded bg-surface border border-surface-border text-[11px] space-y-1">
                    <span className="font-semibold text-text-primary block mb-1">New Password Complexity Rules:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {pwRules.map((rule, idx) => (
                        <div key={idx} className={`flex items-center gap-1.5 ${rule.met ? "text-emerald-400 font-medium" : "text-text-muted"}`}>
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
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
