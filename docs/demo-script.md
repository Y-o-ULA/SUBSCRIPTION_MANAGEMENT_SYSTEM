# 🎬 BrightLoop Subscription Platform — Demo & Evaluation Script

Use this script to showcase the core features and flows of the BrightLoop Subscription Platform during presentations, demos, or technical evaluations.

---

## 🎯 Demo Objectives
1. Demonstrate the modern, editorial **BrightLoop** UI design system.
2. Demonstrate **dual-role authentication** (Admin Console vs. Customer Care Portal).
3. Showcase **catalog management** (Products, Variants, and Pricing Plans).
4. Run the **Automated Billing Engine** (`generate_due_invoices` stored procedure).
5. Record a **Payment Collection** and observe database triggers auto-marking invoices as `Paid`.
6. Demonstrate the **Customer Portal** and print an itemized GST Tax Invoice.

---

## ⏱️ Step-by-Step Walkthrough

### Step 1: The Landing Page & Dual Role Access
- **URL**: `http://localhost:5173/` or `/login`
- **Highlight**:
  - Show the warm ivory (`#fbf7ee`) and pitch dark design inspired by high-end design systems.
  - Notice the **ENTER PORTAL** circular stamp badge, the marquee ticker ribbon, and feature service cards.
  - Switch between **Admin Console** and **Customer Portal** tabs.
  - Click **Enter Admin Suite** (default credentials: `admin@example.com` / `password123`).

---

### Step 2: The Executive Dashboard
- **URL**: `/dashboard`
- **Highlight**:
  - Point out the 3 primary KPI metric cards:
    - **MRR (Monthly Recurring Revenue)** with projected ARR and trend badges.
    - **Active Subscriptions** count and renewal retention rate.
    - **Overdue Invoices** and churn risk tracking.
  - Point out the **Revenue Dynamics Chart** rendered via `recharts` fetching historical monthly revenue directly from the `monthly_revenue` database view.

---

### Step 3: Catalog & Pricing Tiers
- **URLs**: `/products` and `/plans`
- **Highlight**:
  - In **Products**: Show core software packages, add-ons, and variant attributes (e.g., *Brand: Odoo*).
  - Click **Add Product** and show the quick modal to add new software items.
  - In **Plans**: Showcase multi-cadence billing intervals (`Monthly`, `Yearly`, `Weekly`) and policy badges like *Auto-Renewable* and *Pausable*.

---

### Step 4: Active Subscriptions & Lifecycles
- **URL**: `/subscriptions`
- **Highlight**:
  - Show the real-time subscription lifecycle management table.
  - Demonstrate filter tabs: `All`, `Active`, `Confirmed`, `Draft`, `Closed`.
  - Type in the search box to filter by customer name or company in real-time.
  - Note status badges with color indicators (Emerald for Active, Rose for Closed, Amber for Draft).

---

### Step 5: Executing the Billing Engine
- **URL**: `/billing-run`
- **Highlight**:
  - Show the **Queued Subscriptions** table: these are subscriptions whose `next_billing_date <= CURRENT_DATE`.
  - Click the **Execute Billing Run Now** button.
  - Explain what just happened behind the scenes:
    - The frontend calls the Supabase PostgreSQL RPC function: `generate_due_invoices()`.
    - It locks due subscriptions, checks active discount rules, calculates 18% GST tax, creates invoice headers + line items, and shifts the subscription's next billing date forward.
  - Review the success confirmation banner: *X subscriptions checked, Y invoices generated*.

---

### Step 6: Review Invoices & Record Payment
- **URLs**: `/invoices` and `/payments`
- **Highlight**:
  - Navigate to **Invoices** to see the newly generated tax invoices with their balance and due date.
  - Click on **Payments** → click **Record Payment**.
  - Select an unpaid invoice from the dropdown, enter the amount, choose payment mode (`UPI` or `Card`), and click **Confirm Settlement**.
  - Explain the **Database Trigger**:
    - Trigger `trg_check_payment` ensures payments never exceed invoice balance.
    - Trigger `trg_mark_paid` automatically flips the invoice status from `Confirmed` to `Paid`.

---

### Step 7: Customer Self-Service Portal & Printable Invoice
- **URLs**: `/portal` and `/portal/invoice/:id`
- **Highlight**:
  - Open the **Customer Portal** to show what the end-client sees.
  - Displays their active subscribed packages and their next scheduled renewal date.
  - Shows invoice history with a direct **View / Download** button.
  - Click **View** to open the clean, printable **Tax Invoice** view.
  - Click **Print / PDF** to show the print-ready CSS layout.

---

## 🏆 Summary Checklist for Evaluators
- [x] Responsive layout with collapsible navigation bar
- [x] Full PostgreSQL schema with foreign keys, checks, and sequences
- [x] Automated batch invoicing logic in PL/pgSQL
- [x] Real-time KPI queries using database views
- [x] Clean, unified API abstraction layer (`src/api/*.js`)
- [x] Modern, high-conversion UI design system

