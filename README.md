# Project LOOP — Corporate AI Customer-Feedback Intelligence Platform

> **"The loop on customer feedback."**  
> Project LOOP is an enterprise-grade multi-tenant customer feedback intelligence platform built with **Next.js 14 App Router**, **TypeScript**, **PostgreSQL (Neon / Prisma)**, and **Google Gemini AI**.

[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2d3748?logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285f4?logo=google)](https://ai.google.dev/)
[![Neon Database](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-00e599?logo=postgresql)](https://neon.tech/)

---

## 🎯 Platform Overview

Project LOOP ingests multi-channel customer feedback (Support Tickets, App Store Reviews, NPS/CSAT Surveys, Sales Calls, Community Threads) and transforms it into structured, evidence-backed product decisions. It combines **deterministic quantitative analytics** with **grounded LLM intelligence** (`gemini-2.5-flash` and `text-embedding-004`) ensuring zero hallucination and strict citation of verbatim customer statements.

---

## 🏗️ Core Architecture & Enterprise Principles

### 1. Cryptographic & Logical Multi-Tenancy
- **Tenant Scoping Guarantee**: Every database query is strictly filtered by the authenticated user's `workspaceId`.
- **Cross-Tenant Guarding**: Feedback, themes, embeddings, and executive reports from other organizations are completely isolated and inaccessible.
- **Session Enforcement**: NextAuth JWT tokens carry immutable `workspaceId`, `workspaceName`, and `role` claims checked on every API request.

### 2. Role-Based Access Control (RBAC)
Server-side authorization guards enforce 3 distinct user tiers:

| Role | Permissions & Capabilities |
|---|---|
| 👑 **ADMIN** | Full workspace governance: invite/demote members, change roles, delete feedback & reports, manage API keys, configure workspace settings. |
| 📊 **ANALYST** | Operational triage: bulk import CSVs, simulate channels, trigger Gemini re-classification, update triage status (`NEW` → `REVIEWED` → `ACTIONED`), generate VoC reports. |
| 👁️ **VIEWER** | Read-only executive view: browse analytics dashboards, query Ask LOOP grounded assistant, inspect inbox and themes, review published reports. |

### 3. Zero-Hallucination Grounded AI Pipeline
- **Auto-Classification**: Gemini 2.5 Flash classifies sentiment (`POS`, `NEU`, `NEG`), calculates normalized sentiment score (`-1.0` to `+1.0`), extracts feature area, and assigns relevant themes with strict Zod schema validation.
- **Theme Clustering & Spike Detection**: Trend velocity algorithms detect emerging customer friction ($\ge 50\%$ period-over-period growth with $\ge 3$ items) and alert product teams.
- **Ask LOOP Grounded Assistant**: Uses Gemini embeddings (`text-embedding-004`) and hybrid cosine similarity search strictly constrained within the tenant's workspace. The LLM prompt explicitly refuses to answer if evidence is absent and cites verbatim quote IDs `[1]`, `[2]`.
- **Voice of Customer (VoC) Reports**: Pre-computes exact distributions and top quotes in TypeScript before prompting Gemini to write executive-level syntheses, risk matrices, and prioritized action plans (P0/P1/P2).

### 4. Modern B2B SaaS Design System
- **Restrained Semantic Palette**: Zinc/slate neutral base, subtle 1px borders (`border-surface-border`), flat cards, and single brand accent (#6366f1).
- **Reserved Glassmorphism**: Glassmorphism is strictly reserved for the Ask LOOP conversational interface (`glass-panel`) and command modals.
- **Print Optimization**: Executive reports include specialized `@media print` styling to output clean, branded PDFs for board meetings and executive reviews.

---

## 📱 Complete Screen & Module Inventory

1. **Landing Page** (`/`): Product narrative, feature highlights, and authentication gateways.
2. **Authentication** (`/login`, `/signup`): Secure credentials sign-in with 1-click demo credential quick-fill buttons and new tenant workspace creation.
3. **Analytics Dashboard** (`/dashboard`): Real-time volume trends, sentiment breakdown donut chart, top themes horizontal bar chart, channel distribution, and date filters (`7d`, `30d`, `90d`, `all`).
4. **Feedback Inbox** (`/inbox`): High-density feedback table with multi-faceted filtering (status, sentiment, channel, theme), search query, pagination, and empty-state indicators.
5. **Feedback Detail View** (`/inbox/[id]`): Verbatim customer transcript, metadata tags, triage workflow controls (`NEW`, `REVIEWED`, `ACTIONED`), and manual AI re-classification trigger.
6. **Add Feedback Multi-Channel** (`/feedback/add`):
   - **CSV Bulk Import**: Drag-and-drop file upload, column mapping preview, row validation, and batch ingestion.
   - **Simulated Channels**: 1-click test ingest from Zendesk, App Store, G2, NPS Surveys, and Intercom.
   - **Manual Form**: Single-item creation for customer interviews or ad-hoc feedback.
7. **Themes & Trends** (`/trends`): Theme timeline trendlines, velocity cards, emerging spike alert banners, and 1-click drill-down to inbox.
8. **Ask LOOP Grounded Chat** (`/ask`): Conversational search with pre-built prompt chips, grounded customer quote citations, and source inspection drawer.
9. **VoC Reports Dossier** (`/reports` & `/reports/[id]`): Executive report library, date-range generator modal, KPI ribbon, emerging risk matrix, and print/PDF export styling.
10. **Workspace Settings & RBAC** (`/settings`): Tenant profile details, member directory, role promotion/demotion dropdowns, and new member invitation modal.
11. **User Profile** (`/profile`): Personal profile details, tenant association badge, and password change security form.
12. **Error & Fallback States**: Branded 404 (`app/not-found.tsx`), 500 error boundary (`app/error.tsx`), and RBAC 403 access control modal.

---

## 👥 Demo Credentials

The database seed provides ready-to-test accounts for all 3 RBAC tiers (Password: `loopdemo123` or quick-fill buttons on the login screen):

| Role | Email | Password | Primary Use Case |
|---|---|---|---|
| **Admin** | `admin@loopdemo.com` | `loopdemo123` | Full workspace governance, settings, user management, and deletion |
| **Analyst** | `analyst@loopdemo.com` | `loopdemo123` | Feedback ingestion, CSV import, status triage, and VoC generation |
| **Viewer** | `viewer@loopdemo.com` | `loopdemo123` | Read-only dashboards, Ask LOOP queries, and reports inspection |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **PostgreSQL**: Neon, Supabase, or local PostgreSQL instance
- **Google Gemini API Key**: [Get a Gemini API Key](https://aistudio.google.com/)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Mr-MoonlightStar/Project-Loop.git
cd Project-Loop
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database Connection (Neon / PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-host.region.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super-secret-random-hex-string-for-nextauth-encryption"

# Google Gemini API Key
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```

### 4. Database Migration & Seed
Run Prisma migrations and populate the database with realistic multi-channel feedback data (140+ items across 6 themes):
```bash
npx prisma migrate dev --name init
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and sign in using one of the demo accounts!

---

## 🚢 Production Deployment (Vercel)

This repository is optimized for zero-configuration continuous deployment on Vercel:

1. **Connect Repository**: Import `Mr-MoonlightStar/Project-Loop` in Vercel.
2. **Environment Variables**: Configure in Vercel Dashboard:
   - `DATABASE_URL` (Neon PostgreSQL pooled connection string)
   - `NEXTAUTH_URL` (e.g. `https://project-loop.vercel.app`)
   - `NEXTAUTH_SECRET` (Generated secret string)
   - `GEMINI_API_KEY` (Google Gemini API key)
3. **Build Command**: The `package.json` build command is pre-configured with Prisma generation and migration deployment:
   ```json
   "build": "prisma generate && prisma migrate deploy && next build"
   ```
4. **Deploy**: Every push to `main` triggers an automatic production build and deployment.

---

## 🧪 Verification & Automated Checks

Ensure code cleanliness and type validity:
```bash
# Run ESLint validation
npm run lint

# Run full Next.js production build test
npx next build
```

---

## 📜 Development Milestone History

- [x] **Step 0**: Git repository setup, GitHub remote configuration & `.env.example`
- [x] **Step 1**: Design tokens, Next.js 14 App Router scaffold, Prisma schema & seed definition
- [x] **Step 2**: NextAuth authentication & atomic multi-tenant workspace signup
- [x] **Step 3**: Server-side RBAC guards (`ADMIN`, `ANALYST`, `VIEWER`) & Feedback CRUD
- [x] **Step 4**: CSV bulk import with Papa Parse preview & multi-channel simulation
- [x] **Step 5**: High-density feedback inbox, multi-faceted filtering & detail view
- [x] **Step 6**: Analytics dashboard with Recharts (volume, sentiment donut, top themes)
- [x] **Step 7**: AI1 — Structured classification with Google Gemini 2.5 Flash
- [x] **Step 8**: AI2 — Theme clustering & velocity spike detection ($\ge 50\%$ growth alert)
- [x] **Step 9**: AI3 — Ask LOOP retrieval-grounded semantic Q&A with real quote citations
- [x] **Step 10**: AI4 — Voice-of-Customer (VoC) report generation & print/PDF export
- [x] **Step 11**: Production polish, workspace RBAC settings, user profile & error boundaries
- [x] **Step 12**: Complete documentation, architecture specification & deployment readiness

---

## ⚖️ License
Proprietary — Developed for corporate customer-feedback intelligence operations.
