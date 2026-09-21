# Project LOOP — AI Customer-Feedback Intelligence Platform

> **"Close the loop on customer feedback."**  
> Corporate-grade multi-tenant AI customer-feedback intelligence platform built with Next.js 14 App Router, TypeScript, PostgreSQL (Neon / Prisma), and Gemini AI.

---

## 🎯 Overview
Project LOOP ingests multi-channel customer feedback (support tickets, app-store reviews, NPS/CSAT surveys, sales notes, community posts) and transforms it into actionable, evidence-backed product decisions through structured AI classification, automated theme clustering, grounded semantic retrieval (Ask LOOP), and executive Voice-of-Customer (VoC) digests.

---

## 🏗️ Architecture & Core Principles
- **Multi-Tenant Isolation:** Guaranteed tenant boundary enforcement — every query strictly scoped by `workspaceId`.
- **Role-Based Access Control (RBAC):** `ADMIN`, `ANALYST`, and `VIEWER` roles enforced server-side.
- **Strict Grounding:** Ask LOOP (RAG) strictly adheres to ingested tenant feedback data with verbatim citations. No hallucinations.
- **Modern Clean UI System:** Professional B2B SaaS design system with dark/light mode support, restrained palette, and subtle glassmorphic floating command/chat layers.

---

## 📋 Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (custom design tokens for modern B2B SaaS)
- **Database & ORM:** PostgreSQL (Neon) + Prisma
- **Authentication:** NextAuth.js (Auth.js) with bcryptjs credentials
- **AI & Embeddings:** Anthropic Claude API (`claude-sonnet-4-6`) + vector embeddings / retrieval
- **Data & Charts:** Zod runtime validation, Papa Parse, Recharts, Lucide React
- **Deployment:** Vercel

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18+ LTS
- PostgreSQL database URL (Neon or Supabase free tier)
- Google API Key

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Migrations
```bash
npx prisma migrate dev --name init
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Credentials
The seeded demo workspace comes with pre-configured users for each RBAC tier:
| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@loopdemo.com` | *(configured during seed)* | Full access, member & workspace management |
| **Analyst** | `analyst@loopdemo.com` | *(configured during seed)* | Ingest, triage, tag, run VoC & re-classify |
| **Viewer** | `viewer@loopdemo.com` | *(configured during seed)* | Read-only analytics, inbox view, Ask LOOP |

---

## 📜 Development Status
- [x] Step 0: Git repository initialization & setup
- [ ] Step 1: Design tokens, scaffold, Prisma schema & initial deployment skeleton
- [ ] Step 2: Auth UI & NextAuth multi-tenant workspace scoping
- [ ] Step 3: RBAC & Feedback CRUD + comprehensive seed script (120+ items)
- [ ] Step 4: CSV Bulk import & simulated channel ingestion
- [ ] Step 5: Feedback inbox with search, pagination, and status workflow
- [ ] Step 6: Analytics dashboard with Recharts
- [ ] Step 7: AI1 — Structured classification on ingest (Zod validated)
- [ ] Step 8: AI2 — Theme clustering & trend/spike detection
- [ ] Step 9: AI3 — Ask LOOP grounded semantic Q&A with citations
- [ ] Step 10: AI4 — Voice-of-Customer report generation & export
- [ ] Step 11: Production hardening & accessibility review
