# 🏛️ BrightLoop Architecture & Data Flow Reference

This document details the database schema relationships, data flows, and security model of the BrightLoop Subscription Platform.

---

## 1. Entity Relationship Overview

```
 [customers] ──< [subscriptions] ──< [subscription_lines]
       │               │                      │
       │               v                      v
       │          [invoices] ──< [invoice_lines]
       │               │
       │               v
       └─────────< [payments]

 [products] ──< [product_variants]
     │
     └──< [plans] >── [taxes]
     │
     └──< [discounts]
```

### Key Relationships
1. **Subscriptions to Invoices**: A single subscription generates multiple periodic invoices over its lifetime (e.g. 1 invoice per month).
2. **Plans to Products**: A plan binds a product to a recurring cadence (`daily`, `weekly`, `monthly`, `yearly`) and an applicable tax.
3. **Discounts**: Can be global (across whole subscription) or scoped to a specific product.
4. **Payments to Invoices**: Payments are logged against specific invoices. Database triggers aggregate payments to automatically update the invoice's balance and status.

---

## 2. Invoicing Lifecycle & Billing Engine

The core automated process is implemented in PostgreSQL as `generate_due_invoices()`:

```
                      Scheduled / Manual Trigger
                                  │
                                  ▼
                    Query `billing_queue` View
            (Active subscriptions where next_billing_date <= today)
                                  │
                                  ▼
                    For each due subscription:
           ┌──────────────────────────────────────────────┐
           │ 1. Lock subscription row (skip locked)       │
           │ 2. Find best valid discount                  │
           │ 3. Compute period subtotal & 18% GST tax     │
           │ 4. Insert into `invoices` table              │
           │ 5. Populate itemized `invoice_lines`         │
           │ 6. Increment discount usage count            │
           │ 7. Advance subscription next_billing_date    │
           │    (next_billing_date += billing_interval)   │
           └──────────────────────────────────────────────┘
                                  │
                                  ▼
                 Return summary JSON to caller:
      { subscriptions_checked: N, invoices_created: N, skipped: N }
```

---

## 3. Financial Analytics & Database Views

Rather than calculating aggregates on the frontend, BrightLoop relies on server-side PostgreSQL views:

| View Name | Source Query | Primary Consumer |
|---|---|---|
| `dashboard_summary` | Sub-selects on `subscriptions`, `payments`, and `invoice_balances` | `/dashboard` Top KPI Cards |
| `monthly_revenue` | Aggregated sum of `payments.amount` grouped by `date_trunc('month', paid_at)` | `/dashboard` Recharts Area Graph |
| `invoice_balances` | Joins `invoices` with `payments` calculating remaining balance & overdue days | `/invoices` Data Table |
| `billing_queue` | Subscriptions needing an invoice today or earlier | `/billing-run` Execution Table |
| `upcoming_renewals` | Active subscriptions due in the next 7 days | `/dashboard` Retention Indicators |

---

## 4. Frontend State & API Layer

The frontend enforces strict separation of concerns:
- **`src/lib/supabase.js`**: Holds the initialized Supabase client singleton using environment credentials.
- **`src/api/*.js`**: Encapsulates all query definitions, filtering, mutation payloads, and error handling.
- **`src/pages/**/*.jsx`**: Pure presentation components consuming data through asynchronous hooks (`useEffect`, `useState`).
- **`src/context/AuthContext.jsx`**: Global authentication provider handling auth token listeners, user profile mapping, and route-protection state.

---

## 5. Security & Access Control (RLS)

- **Admin Access**:
  - Enforced by `ProtectedRoute.jsx` verifying that `profiles.role === 'admin'`.
  - Admin users have full catalog creation, billing execution, and collection tracking permissions.
- **Customer Access**:
  - Customers are restricted to viewing only their own subscriptions and invoices linked to their `customer_id`.

