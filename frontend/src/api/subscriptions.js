/**
 * api/subscriptions.js
 * CRUD + lifecycle operations on the subscriptions table.
 * RLS is in place – admin sees all rows; customers see their own.
 */
import { supabase } from '../lib/supabase';

/** List all subscriptions with joined customer and plan data. */
export async function fetchSubscriptions({ status = null, limit = 200 } = {}) {
  let query = supabase
    .from('subscriptions')
    .select(`
      id,
      number,
      status,
      start_date,
      expiry_date,
      payment_terms_days,
      next_billing_date,
      created_at,
      customer:customers(id, name, email, company),
      plan:plans(id, name, price, billing_interval)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Fetch a single subscription by id (with lines). */
export async function fetchSubscriptionById(id) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      customer:customers(*),
      plan:plans(*, product:products(*)),
      lines:subscription_lines(*, product:products(*), variant:product_variants(*))
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/** Create a new subscription (status defaults to 'Draft'). */
export async function createSubscription(payload) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update subscription status (e.g. Draft → Active, Active → Closed). */
export async function updateSubscriptionStatus(id, status) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetch billing queue (subscriptions due for invoicing today or earlier). */
export async function fetchBillingQueue() {
  const { data, error } = await supabase
    .from('billing_queue')
    .select('*');

  if (error) throw error;
  return data ?? [];
}

