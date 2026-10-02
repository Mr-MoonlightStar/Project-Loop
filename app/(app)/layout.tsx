import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building, LogOut, LayoutDashboard, Inbox, TrendingUp, Sparkles, FileText, Settings, User } from "lucide-react";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4 text-brand" />
              Dashboard
            </Link>
            <Link
              href="/inbox"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
            >
              <Inbox className="w-4 h-4" />
              Inbox
            </Link>
            <Link
              href="/trends"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              Trends
            </Link>
            <Link
              href="/ask"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ask LOOP
            </Link>
            <Link
              href="/reports"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-foreground hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Reports
            </Link>
          </nav>
        </div>

        {/* User / Tenant Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/settings"
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border border-surface-border text-xs hover:border-brand/40 transition-colors"
            title="Workspace Settings"
          >
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-200">{user.workspaceName}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-muted text-brand-400 border border-brand-500/20 font-semibold">
              {user.role}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-surface-subtle text-slate-400 hover:text-slate-200 transition-colors"
              title="Workspace Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <Link
              href="/profile"
              className="p-2 rounded-lg hover:bg-surface-subtle text-slate-400 hover:text-slate-200 transition-colors"
              title="User Profile"
            >
              <User className="w-4 h-4" />
            </Link>

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

      {/* Main Content Area with bottom padding on mobile for nav bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (visible only on mobile screens < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur border-t border-surface-border flex items-center justify-around py-2 px-2 text-xs">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1 p-1.5 text-slate-400 hover:text-brand focus:text-brand transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </Link>
        <Link
          href="/inbox"
          className="flex flex-col items-center gap-1 p-1.5 text-slate-400 hover:text-brand focus:text-brand transition-colors"
        >
          <Inbox className="w-5 h-5" />
          <span className="text-[10px]">Inbox</span>
        </Link>
        <Link
          href="/trends"
          className="flex flex-col items-center gap-1 p-1.5 text-slate-400 hover:text-brand focus:text-brand transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px]">Trends</span>
        </Link>
        <Link
          href="/ask"
          className="flex flex-col items-center gap-1 p-1.5 text-slate-400 hover:text-amber-400 focus:text-amber-400 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Ask LOOP</span>
        </Link>
        <Link
          href="/reports"
          className="flex flex-col items-center gap-1 p-1.5 text-slate-400 hover:text-brand focus:text-brand transition-colors"
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Reports</span>
        </Link>
      </nav>
    </div>
  );
}
