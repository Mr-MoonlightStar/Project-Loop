"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Building,
  Shield,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Database,
  Lock,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  createdAt: string;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [members, setMembers] = useState<Member[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Invite form state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "ANALYST" | "VIEWER">("ANALYST");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/workspace/members");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setWorkspace(data.workspace || null);
      }
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (memberId: string, newRole: "ADMIN" | "ANALYST" | "VIEWER") => {
    if (!isAdmin) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/workspace/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update member role");
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setMessage({ type: "success", text: "Role updated successfully." });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating role",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/workspace/members/${memberId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove member");
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setMessage({ type: "success", text: `${memberName} has been removed.` });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error removing member",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to invite member");
      }

      setMembers((prev) => [...prev, data.member]);
      setShowInviteModal(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("ANALYST");
      setMessage({ type: "success", text: `Invited ${data.member.name} (${data.member.role}).` });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error inviting member",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Workspace Settings & RBAC
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage workspace profile, multi-tenant isolation parameters, and team permissions.
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

      {/* Workspace Information */}
      <div className="bg-surface border border-surface-border rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Workspace Profile</h2>
              <p className="text-xs text-text-muted">Tenant identification and data boundary</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded font-medium bg-surface-subtle border border-surface-border text-emerald-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Strict Tenant Isolation Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Workspace Name
            </span>
            <p className="text-sm font-semibold text-text-primary mt-1">
              {workspace?.name || session?.user?.workspaceName || "Acme Corp"}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Tenant Created
            </span>
            <p className="text-sm font-medium text-text-secondary mt-1">
              {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : "Active"}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Workspace ID
            </span>
            <p className="text-xs font-mono text-text-muted mt-1 truncate" title={workspace?.id}>
              {workspace?.id || session?.user?.workspaceId}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border flex items-start gap-3 text-xs text-text-secondary">
          <Database className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <span>
            Every database query is strictly filtered by <code className="text-brand font-mono">workspaceId</code>. Users from outside this tenant boundary are cryptographically and logically isolated.
          </span>
        </div>
      </div>

      {/* Role Definitions Reference Card */}
      <div className="bg-surface border border-surface-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand" />
          Role Permission Hierarchy (RBAC)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-surface-border bg-surface-subtle space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand uppercase tracking-wider">ADMIN</span>
              <span className="text-[10px] text-text-muted">Full Control</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Full workspace governance, member invitations, role promotions/demotions, feedback deletion, and AI settings.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-surface-border bg-surface-subtle space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 uppercase tracking-wider">ANALYST</span>
              <span className="text-[10px] text-text-muted">Analysis & Triage</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Upload CSVs, simulate channels, trigger Gemini auto-classification, triage feedback status, and generate VoC reports.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-surface-border bg-surface-subtle space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-400 uppercase tracking-wider">VIEWER</span>
              <span className="text-[10px] text-text-muted">Read-Only</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Read dashboards, browse the feedback inbox, execute Ask LOOP grounded queries, and view published reports.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" />
            <h2 className="text-base font-semibold text-text-primary">Team Members</h2>
            <span className="text-xs text-text-muted">({members.length})</span>
          </div>

          {isAdmin ? (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors shadow-sm self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Member
            </button>
          ) : (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Only Administrators can add or modify roles
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span className="text-xs">Loading team directory...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-subtle border-b border-surface-border text-xs text-text-muted uppercase">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Joined</th>
                  {isAdmin && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {members.map((member) => {
                  const isCurrent = member.id === session?.user?.id;

                  return (
                    <tr key={member.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{member.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-subtle border border-surface-border text-text-muted">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-xs">{member.email}</td>
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <select
                            value={member.role}
                            disabled={actionLoading}
                            onChange={(e) =>
                              handleRoleChange(
                                member.id,
                                e.target.value as "ADMIN" | "ANALYST" | "VIEWER"
                              )
                            }
                            className="text-xs bg-surface border border-surface-border rounded px-2.5 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        ) : (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                              member.role === "ADMIN"
                                ? "bg-brand/10 text-brand border-brand/20"
                                : member.role === "ANALYST"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-surface-subtle text-text-muted border-surface-border"
                            }`}
                          >
                            {member.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          {!isCurrent && (
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              disabled={actionLoading}
                              title="Remove member"
                              className="p-1 text-text-muted hover:text-rose-500 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surface-border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Invite Member to Workspace
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Workspace Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "ADMIN" | "ANALYST" | "VIEWER")
                  }
                  className="w-full px-3 py-2 text-sm bg-surface border border-surface-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="ANALYST">ANALYST (Triage, Ingestion, Reports)</option>
                  <option value="VIEWER">VIEWER (Read-only dashboards)</option>
                  <option value="ADMIN">ADMIN (Full workspace governance)</option>
                </select>
              </div>

              <p className="text-[11px] text-text-muted">
                Initial temporary password will be set to <code className="text-brand">loopdemo123</code>.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
