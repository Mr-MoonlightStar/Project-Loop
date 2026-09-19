import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, Building, User, LogOut, LayoutDashboard, Inbox, TrendingUp, Sparkles, FileText } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Floating Glass Navigation Header */}
      <header className="glass-panel sticky top-0 z-40 px-6 py-3 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-base shadow-sm">
              ∞
            </div>
            <span className="font-bold text-lg tracking-tight">Project LOOP</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg bg-surface-subtle text-foreground flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4 text-brand" />
              Dashboard
            </Link>
            <Link
              href="/inbox"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-subtle/60 transition-colors flex items-center gap-1.5"
            >
              <Inbox className="w-4 h-4" />
              Inbox
            </Link>
            <Link
              href="/trends"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-subtle/60 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              Trends
            </Link>
            <Link
              href="/ask"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-subtle/60 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ask LOOP
            </Link>
            <Link
              href="/reports"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-foreground hover:bg-surface-subtle/60 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Reports
            </Link>
          </nav>
        </div>

        {/* User / Tenant Badge & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border border-surface-border text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-200">{user.workspaceName}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-muted text-brand-400 border border-brand-500/20 font-semibold">
              {user.role}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/api/auth/signout"
              className="p-2 rounded-lg hover:bg-surface-subtle text-slate-400 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Workspace Greeting & Tenant Isolation Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border/50">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workspace Overview</h1>
            <p className="text-xs text-slate-400 mt-1">
              All feedback, themes, and reports below are strictly scoped to workspace:{" "}
              <span className="font-mono text-slate-300">{user.workspaceName}</span> ({user.workspaceId})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-slate-300 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tenant Scoping Active</span>
            </div>
          </div>
        </div>

        {/* Tenant Details Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="neu-card p-5 space-y-2">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-brand" />
              Current Workspace
            </div>
            <div className="text-lg font-bold">{user.workspaceName}</div>
            <p className="text-[11px] font-mono text-slate-500 truncate">ID: {user.workspaceId}</p>
          </div>

          <div className="neu-card p-5 space-y-2">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand" />
              Authenticated User
            </div>
            <div className="text-lg font-bold">{user.name || "Team Member"}</div>
            <p className="text-[11px] font-mono text-slate-500 truncate">{user.email}</p>
          </div>

          <div className="neu-card p-5 space-y-2">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-brand" />
              Enforced Role
            </div>
            <div className="text-lg font-bold text-brand-400">{user.role}</div>
            <p className="text-[11px] text-slate-500">
              {user.role === "ADMIN" && "Full administrative permissions & member management."}
              {user.role === "ANALYST" && "Feedback ingestion, triage, and AI intelligence access."}
              {user.role === "VIEWER" && "Read-only access to feedback, charts, and reports."}
            </p>
          </div>
        </div>

        {/* Next Step Placeholder for Cycle 1 */}
        <div className="neu-card p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-muted text-brand mx-auto flex items-center justify-center font-bold">
            ✓
          </div>
          <h2 className="text-lg font-semibold">Authentication & Workspace Scoping Operational</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cycle 1 Foundation: NextAuth session handling, user credentials hashing, tenant creation on signup, and session-based workspace isolation are confirmed.
          </p>
        </div>
      </main>
    </div>
  );
}
