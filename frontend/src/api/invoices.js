/**
 * api/invoices.js
 * Read and manage invoices using the invoice_balances view
 * (which enriches raw invoices with paid/balance/overdue fields)
 * and the invoices table for mutations.
 */
import { supabase } from '../lib/supabase';

/**
 * List invoices enriched with balance & overdue info.
 * Reads from the `invoice_balances` view (06_views.sql).
 */
export async function fetchInvoices({ status = null, limit = 150 } = {}) {
  let query = supabase
    .from('invoice_balances')
    .select(`
      id,
      number,
      subscription_id,
      customer_id,
      customer_name,
      billing_period_start,
      total,
      due_date,
      status,
      paid,
      balance,
      is_overdue,
      days_overdue,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Fetch a single invoice with its line items for the print/view page. */
export async function fetchInvoiceById(id) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      lines:invoice_lines(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Fetch only overdue invoices via the overdue_invoices view. */
export async function fetchOverdueInvoices() {
  const { data, error } = await supabase
    .from('overdue_invoices')
    .select('*');

  if (error) throw error;
  return data ?? [];
}

/** Update invoice status (e.g. Confirmed → Paid manually). */
export async function updateInvoiceStatus(id, status) {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

