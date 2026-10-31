/**
 * api/payments.js
 * Read and record payments against invoices.
 * The DB trigger trg_mark_paid auto-marks invoices Paid when
 * total payments >= invoice total.
 */
import { supabase } from '../lib/supabase';

/** List all payments with joined invoice and customer info. */
export async function fetchPayments({ limit = 150 } = {}) {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id,
      method,
      amount,
      paid_at,
      note,
      invoice:invoices(
        id,
        number,
        total,
        customer:customers(id, name, company)
      )
    `)
    .order('paid_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Record a new payment.
 * The DB trigger check_payment will reject if amount > outstanding.
 * The DB trigger mark_invoice_paid will auto-flip status to Paid
 * once all money is received.
 *
 * @param {{ invoice_id: string, method: string, amount: number, note?: string }} payload
 */
export async function recordPayment(payload) {
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      invoice_id: payload.invoice_id,
      method:     payload.method,
      amount:     payload.amount,
      note:       payload.note ?? null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetch all unpaid / outstanding invoices (for the "settle invoice" dropdown). */
export async function fetchUnpaidInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      number,
      total,
      due_date,
      customer:customers(name, company)
    `)
    .neq('status', 'Paid')
    .order('due_date', { ascending: true })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

