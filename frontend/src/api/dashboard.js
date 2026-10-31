/**
 * api/dashboard.js
 * Reads the `dashboard_summary` and `monthly_revenue` views
 * that are created by supabase/migrations/06_views.sql
 */
import { supabase } from '../lib/supabase';

/**
 * Returns a single row from the dashboard_summary view.
 * Columns: active_subscriptions, revenue_collected, outstanding_amount,
 *          overdue_invoices, overdue_amount, mrr, ready_to_bill,
 *          renewals_next_7_days
 */
export async function fetchDashboardSummary() {
  const { data, error } = await supabase
    .from('dashboard_summary')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Returns rows from the monthly_revenue view ordered chronologically.
 * Columns: month (YYYY-MM string), month_start (date), revenue (numeric)
 */
export async function fetchMonthlyRevenue() {
  const { data, error } = await supabase
    .from('monthly_revenue')
    .select('month, month_start, revenue')
    .order('month_start', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Returns upcoming renewals (next 7 days) from the upcoming_renewals view.
 * Columns: id, number, customer_name, plan_name, next_billing_date
 */
export async function fetchUpcomingRenewals() {
  const { data, error } = await supabase
    .from('upcoming_renewals')
    .select('*');

  if (error) throw error;
  return data ?? [];
}

