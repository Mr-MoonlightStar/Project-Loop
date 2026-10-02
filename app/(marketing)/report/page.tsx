"use client";

import Link from "next/link";
import { ArrowLeft, Printer, ShieldCheck, Database, Cpu, Lock, Layers } from "lucide-react";

export default function PlatformReportPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-brand/30 selection:text-white pb-24">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-50 bg-[#111726]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Project LOOP
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand-300">
            Public Live Technical Dossier
          </span>
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main Document Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
        {/* Document Header */}
        <header className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 text-brand-300 text-xs font-semibold tracking-wide uppercase">
            Platform Intelligence Dossier
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Project LOOP — Complete Platform Architecture & Technical Report
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            &ldquo;Close the loop on customer feedback.&rdquo; An enterprise multi-tenant customer intelligence engine that ingests cross-channel signals, detects friction velocity, and answers queries with retrieval-grounded quote citations.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Repository</div>
              <div className="text-xs font-semibold text-white mt-1 truncate">Project-Loop</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Database</div>
              <div className="text-xs font-semibold text-emerald-400 mt-1">Neon Live (180+ Rows)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">AI Engine</div>
              <div className="text-xs font-semibold text-indigo-300 mt-1">Gemini 2.5 Flash</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Status</div>
              <div className="text-xs font-semibold text-emerald-300 mt-1">Production v1.0.0</div>
            </div>
          </div>
        </header>

        {/* Section 1: Executive Mission */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-white border-b border-slate-800/80 pb-2">
            <ShieldCheck className="w-5 h-5 text-brand" />
            <h2>1. Platform Mission & Problem Statement</h2>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3.5 text-sm text-slate-300 leading-relaxed">
            <p>
              Modern enterprise organizations receive thousands of customer signals every day across fragmented channels: Zendesk support tickets, Apple App Store reviews, G2/Capterra software reviews, NPS survey free-text comments, and Intercom chat logs.
            </p>
            <p>
              Product and executive teams face three fundamental bottlenecks:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li><strong className="text-white">Signal Fragmentation:</strong> Critical customer pain points remain locked inside operational silos without unified analytics.</li>
              <li><strong className="text-white">Subjective Triage:</strong> Product roadmaps are driven by anecdotes and loud individual customers rather than statistical theme velocity.</li>
              <li><strong className="text-white">AI Hallucinations in Decision-Making:</strong> Generic LLMs fabricate sentiment and cite imaginary feedback when prompted.</li>
            </ul>
            <p>
              <strong className="text-white">Project LOOP</strong> solves this by marrying deterministic quantitative distributions with grounded LLM inference (Google Gemini 2.5 Flash + <code className="text-brand-300 font-mono text-xs">text-embedding-004</code>). Every insight, theme cluster, and executive Voice-of-Customer (VoC) dossier is anchored in verbatim customer citations.
            </p>
          </div>
        </section>

        {/* Section 2: Complete Technology Stack */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-white border-b border-slate-800/80 pb-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2>2. Complete Technology Stack</h2>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-white font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Layer</th>
                  <th className="py-3 px-4">Technology</th>
                  <th className="py-3 px-4">Role & Architecture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Core Framework</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">Next.js 14.2.15</td>
                  <td className="py-3 px-4">App Router, React Server Components (RSC), dynamic server rendering, streaming, and REST API handlers.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Language</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">TypeScript 5.x</td>
                  <td className="py-3 px-4">Strict mode types across DB models, AI schemas, and UI props.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Styling & UI</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">Tailwind CSS 3.4</td>
                  <td className="py-3 px-4">Custom B2B SaaS token system, flat cards, subtle borders, zinc/slate neutrals, and glassmorphic panels.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Database & ORM</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">Neon + Prisma 5.22</td>
                  <td className="py-3 px-4">Serverless PostgreSQL (ap-southeast-1) with PgBouncer connection pooling (<code className="text-slate-400">-pooler</code>).</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Authentication</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">NextAuth.js v4 + Bcrypt</td>
                  <td className="py-3 px-4">30-day JWT sessions, Credentials provider, plus Google and GitHub OAuth with workspace self-provisioning.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">AI Models</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">Gemini 2.5 Flash</td>
                  <td className="py-3 px-4">Structured JSON sentiment classification, theme assignment, executive VoC synthesis, and grounded Q&A.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Vector Search</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">text-embedding-004</td>
                  <td className="py-3 px-4">768-dimensional embeddings for hybrid cosine similarity retrieval over verbatim customer quotes.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Data Visualization</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">Recharts 3.10</td>
                  <td className="py-3 px-4">Volume area charts, sentiment donut charts, top themes horizontal bars, velocity trendlines.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Deployment</td>
                  <td className="py-3 px-4 text-brand-300 font-mono">Vercel</td>
                  <td className="py-3 px-4">Continuous git-integrated serverless edge delivery.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Architecture & Security */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-white border-b border-slate-800/80 pb-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h2>3. Multi-Tenancy & RBAC Security Model</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-white">Strict Workspace Scoping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every database query without exception strictly evaluates <code className="text-brand-300 font-mono">WHERE workspaceId = user.workspaceId</code>. Cross-tenant leakage between organizations is cryptographically and logically impossible.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-semibold text-white">Zero-Hallucination Grounding</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask LOOP explicitly refuses to answer if facts are missing from the tenant corpus. Every claim mandates exact bracketed quote citations <code className="text-brand-300 font-mono">[1]</code>, <code className="text-brand-300 font-mono">[2]</code>.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-white">Role-Based Access Control (RBAC) Matrix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/20 space-y-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">ADMIN</span>
                <p className="text-xs text-slate-300 font-medium pt-1">Full Organization Governance</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">Manage members, promote/demote roles, delete feedback & reports, configure settings.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/20 space-y-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">ANALYST</span>
                <p className="text-xs text-slate-300 font-medium pt-1">Ingestion & Operations</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">Import CSVs, simulate channels, status triage (NEW &rarr; REVIEWED &rarr; ACTIONED), generate VoC reports.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">VIEWER</span>
                <p className="text-xs text-slate-300 font-medium pt-1">Executive Read-Only</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">Browse analytics dashboards, explore feedback table, query Ask LOOP, read generated dossiers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Screen Inventory */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-white border-b border-slate-800/80 pb-2">
            <Layers className="w-5 h-5 text-brand" />
            <h2>4. Complete Screen & Route Inventory</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/ — Landing Page</div>
              <p className="text-slate-400">Marketing narrative, product pillars, and sign-in triggers.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/login — Authentication</div>
              <p className="text-slate-400">1-click demo buttons for all 3 RBAC tiers, credentials, and OAuth.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/dashboard — Executive Analytics</div>
              <p className="text-slate-400">Volume area charts, sentiment donut, top themes bars, 7d/30d/90d/all filters.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/inbox — Feedback Explorer</div>
              <p className="text-slate-400">Paginated data table with multi-faceted search, status, and theme filters.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/inbox/[id] — Customer Transcript</div>
              <p className="text-slate-400">Verbatim quote, metadata badges, triage controls, and manual AI re-classify.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/feedback/add — Multi-Channel Ingest</div>
              <p className="text-slate-400">CSV bulk import, Papa Parse preview, live simulator, and manual form.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/trends — Themes & Velocity</div>
              <p className="text-slate-400">Velocity cards, timeline trendlines, and spike banners (&ge;50% growth).</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/ask — Ask LOOP Grounded Assistant</div>
              <p className="text-slate-400">Floating glassmorphic chat with prompt chips and source quote inspection drawer.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/reports & /reports/[id] — VoC Dossiers</div>
              <p className="text-slate-400">Board-ready executive reports with KPI ribbon and @media print PDF export.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-mono text-brand-300 font-semibold">/settings & /profile — Governance</div>
              <p className="text-slate-400">Workspace parameters, member directory, role promotions, and security.</p>
            </div>
          </div>
        </section>

        {/* Section 5: Demo Seed Data */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-white border-b border-slate-800/80 pb-2">
            <Database className="w-5 h-5 text-brand" />
            <h2>5. Active Seed Credentials (Seeded in Neon)</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-white font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-3 px-4 font-bold text-rose-400">ADMIN</td>
                  <td className="py-3 px-4 font-mono text-slate-200">admin@loopdemo.com</td>
                  <td className="py-3 px-4 font-mono text-slate-400">password123</td>
                  <td className="py-3 px-4">Full workspace governance & user management</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-indigo-400">ANALYST</td>
                  <td className="py-3 px-4 font-mono text-slate-200">analyst@loopdemo.com</td>
                  <td className="py-3 px-4 font-mono text-slate-400">password123</td>
                  <td className="py-3 px-4">Data ingestion, CSV triage, VoC reports</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-emerald-400">VIEWER</td>
                  <td className="py-3 px-4 font-mono text-slate-200">viewer@loopdemo.com</td>
                  <td className="py-3 px-4 font-mono text-slate-400">password123</td>
                  <td className="py-3 px-4">Read-only dashboards, Ask LOOP queries</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
          <p>Project LOOP — Enterprise Customer-Feedback Intelligence Platform</p>
          <p className="font-mono text-[11px] text-slate-600">Built with Next.js 14, Neon PostgreSQL, Prisma ORM, and Google Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}
