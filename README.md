# ☀️ BrightLoop Subscriptions Platform

> **Full-Stack SaaS Recurring Billing & Subscription Lifecycle Engine**  
> Built with **React 19 + Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL with RLS, Triggers, Views & Functions)**.

---

## 📖 Overview

**BrightLoop** is an enterprise-grade subscription and billing management platform designed to automate recurring customer lifecycles, tiered pricing catalogs, GST tax compliance, automated batch invoice generation, and customer self-service portals.

Featuring a warm editorial UI inspired by modern design systems, BrightLoop combines **deep data visual hierarchy** with a powerful PostgreSQL backend engine.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    BrightLoop Frontend                      │
│     React 19 + Vite · Tailwind CSS · Recharts · Lucide      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                @supabase/supabase-js Client
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Supabase Backend (DB)                    │
│   PostgreSQL 15 · Row Level Security (RLS) · Database Views │
│       Database Triggers · PL/pgSQL Stored Functions (RPC)   │
└─────────────────────────────────────────────────────────────┘
```

### Frontend
- **Framework**: React 19 + Vite 8
- **Routing**: React Router v6 (Protected Admin Routes & Public Customer Portal)
- **Styling**: Tailwind CSS (Warm Ivory, Amber & Jet Charcoal Theme)
- **Visuals & Charts**: `recharts` for financial dynamics & `lucide-react` icons
- **State & Auth**: `AuthContext.jsx` with Supabase Auth session listeners

### Backend (Supabase PostgreSQL)
- **Tables**: `products`, `product_variants`, `plans`, `taxes`, `discounts`, `customers`, `profiles`, `subscriptions`, `subscription_lines`, `invoices`, `invoice_lines`, `payments`
- **Views**: `dashboard_summary`, `monthly_revenue`, `invoice_balances`, `overdue_invoices`, `upcoming_renewals`, `billing_queue`
- **Database Triggers**:
  - `trg_set_next_billing`: Sets initial billing date on subscription activation.
  - `trg_check_payment`: Guards against overpayments on invoices.
  - `trg_mark_paid`: Automatically updates invoice status to `Paid` upon complete settlement.
- **Stored Functions**:
  - `generate_due_invoices()`: Security-definer engine processing all due subscriptions in a single transaction.

---

## 📂 Project Directory Structure

```
subscription-platform/
 ├── docs/
 │    ├── architecture.md      # Detailed system diagrams & DB schema
 │    ├── demo-script.md        # Step-by-step evaluator & presentation guide
 │    └── doc.txt               # Quick reference cheat-sheet
 ├── supabase/
 │    ├── seed.sql              # Test dataset (300 customers, 600 subscriptions)
 │    └── migrations/
 │         ├── 01_catalog.sql   # Tables & schema definition
 │         ├── 04_functions.sql # Billing engine RPC function
 │         ├── 05_triggers.sql  # Payment & lifecycle validation triggers
 │         └── 06_views.sql     # Aggregated views for analytics
 └── frontend/
      ├── src/
      │    ├── api/             # Dedicated API abstraction layer
      │    │    ├── dashboard.js
      │    │    ├── invoices.js
      │    │    ├── payments.js
      │    │    ├── plans.js
      │    │    ├── products.js
      │    │    └── subscriptions.js
      │    ├── components/
      │    │    ├── layout/AdminLayout.jsx
      │    │    ├── layout/ProtectedRoute.jsx
      │    │    ├── ui/Table.jsx
      │    │    └── charts/RevenueChart.jsx
      │    ├── context/AuthContext.jsx
      │    ├── lib/supabase.js
      │    └── pages/
      │         ├── Login.jsx
      │         ├── admin/
      │         │    ├── Dashboard.jsx
      │         │    ├── Products.jsx
      │         │    ├── Plans.jsx
      │         │    ├── Subscriptions.jsx
      │         │    ├── Invoices.jsx
      │         │    ├── Payments.jsx
      │         │    ├── Discounts.jsx
      │         │    └── BillingRun.jsx
      │         └── customer/
      │              ├── Portal.jsx
      │              └── InvoiceView.jsx
      └── .env
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js** v18+ installed
- A **Supabase** project instance

### 2. Configure Environment Variables
Inside `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

### 3. Run Migrations & Seed Data
Execute the SQL files inside `supabase/migrations/` in order (01, 04, 05, 06) and run `seed.sql` in the Supabase SQL Editor.

### 4. Install & Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔑 Login & Role Access

The landing page features dual tabs for access:

| Role | Default Email | Destination | Access Scope |
|---|---|---|---|
| **Admin Console** | `admin@example.com` | `/dashboard` | Catalog, Plans, Billing Runs, Invoicing & Financial KPIs |
| **Customer Portal** | `customer1@example.com` | `/portal` | Subscribed services, next renewal dates, downloadable tax receipts |

---

## 🚀 Key Features

1. **Automated Billing Engine**: 1-click execution of `generate_due_invoices()` calculating pro-rated cycles, GST (18%), and promotional discounts.
2. **Real-time KPI Dashboard**: MRR, projected ARR, active subscribers, and overdue balances driven by database views.
3. **Multi-Cadence Plans**: Support for daily, weekly, monthly, and annual billing intervals.
4. **GST Compliant Invoices**: Clean, printable invoices with itemized line items and tax breakdowns.
5. **Collection Tracking**: Multi-mode payment recording (UPI, Cards, Bank Transfer, Cash) with automated status updates.

---

## 📄 License
MIT License. Developed for BrightLoop Platform.

