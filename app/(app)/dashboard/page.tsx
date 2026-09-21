import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, Building, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const { user } = session;

  // Retrieve actual feedback stats scoped to this workspace
  const [totalFeedback, newItems, negativeItems] = await Promise.all([
    prisma.feedback.count({ where: { workspaceId: user.workspaceId } }),
    prisma.feedback.count({ where: { workspaceId: user.workspaceId, status: "NEW" } }),
    prisma.feedback.count({ where: { workspaceId: user.workspaceId, sentiment: "NEG" } }),
  ]);

  const negPercentage = totalFeedback > 0 ? Math.round((negativeItems / totalFeedback) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Workspace Greeting & Tenant Isolation Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Data scoped strictly to tenant:{" "}
            <span className="font-mono text-slate-200">{user.workspaceName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-slate-300 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Tenant Boundary Enforced</span>
          </div>
        </div>
      </div>

      {/* Tenant Context Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neu-card p-5 space-y-2">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-brand" />
            Active Workspace
          </div>
          <div className="text-lg font-bold">{user.workspaceName}</div>
          <p className="text-[11px] font-mono text-slate-500 truncate">Tenant ID: {user.workspaceId}</p>
        </div>

        <div className="neu-card p-5 space-y-2">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand" />
            User Account
          </div>
          <div className="text-lg font-bold">{user.name || "Team Member"}</div>
          <p className="text-[11px] font-mono text-slate-500 truncate">{user.email}</p>
        </div>

        <div className="neu-card p-5 space-y-2">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand" />
            Role Permissions
          </div>
          <div className="text-lg font-bold text-brand-400">{user.role}</div>
          <p className="text-[11px] text-slate-500">
            {user.role === "ADMIN" && "Full administrative & member controls."}
            {user.role === "ANALYST" && "Feedback ingestion & triage access."}
            {user.role === "VIEWER" && "Read-only access across platform."}
          </p>
        </div>
      </div>

      {/* Live Feedback Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neu-card p-5 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total Feedback Items</div>
          <div className="text-2xl font-bold font-mono text-foreground">{totalFeedback}</div>
          <p className="text-[11px] text-slate-500">Total records in workspace</p>
        </div>

        <div className="neu-card p-5 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Pending Triage (New)</div>
          <div className="text-2xl font-bold font-mono text-amber-400">{newItems}</div>
          <p className="text-[11px] text-slate-500">Awaiting status review</p>
        </div>

        <div className="neu-card p-5 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Negative Sentiment Ratio</div>
          <div className="text-2xl font-bold font-mono text-sentiment-neg">{negPercentage}%</div>
          <p className="text-[11px] text-slate-500">{negativeItems} negative feedback rows</p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="neu-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-sm font-semibold">Ready to review and triage customer responses?</h2>
          <p className="text-xs text-slate-400">
            Navigate to the feedback inbox to ingest new tickets, filter by channel, or update triage status.
          </p>
        </div>

        <Link
          href="/inbox"
          className="neu-button px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-medium flex items-center gap-2 transition-all shrink-0"
        >
          Open Feedback Inbox
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
