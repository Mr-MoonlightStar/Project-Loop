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
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setLoading(true);

    try {
      const payload: { name?: string; currentPassword?: string; newPassword?: string } = {
        name: name.trim(),
      };

      if (newPassword) {
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

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          User Account Profile
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your personal credentials, identity, and workspace security preferences.
        </p>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-lg border text-sm flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Identity Summary */}
      <div className="bg-surface border border-surface-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-xl">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {session?.user?.name || "Team Member"}
            </h2>
            <p className="text-xs text-text-secondary">{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border flex items-center gap-3">
            <Building className="w-5 h-5 text-text-muted" />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Assigned Workspace
              </span>
              <p className="text-xs font-semibold text-text-primary mt-0.5">
                {session?.user?.workspaceName || "Acme Corp"}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border flex items-center gap-3">
            <Shield className="w-5 h-5 text-brand" />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Account Role
              </span>
              <p className="text-xs font-semibold text-text-primary mt-0.5">
                {session?.user?.role || "VIEWER"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Password Form */}
      <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text-primary mb-4 pb-3 border-b border-surface-border">
          Account Credentials & Security
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Email Address (Managed by Tenant Admin)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-surface-subtle border border-surface-border rounded-md text-text-muted cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Change Password Block */}
          <div className="pt-4 border-t border-surface-border space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand" />
              <h4 className="text-sm font-semibold text-text-primary">Change Password</h4>
            </div>
            <p className="text-xs text-text-secondary">
              Leave password fields blank if you only wish to update your name.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Profile...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
