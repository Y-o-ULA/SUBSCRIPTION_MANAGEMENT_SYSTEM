/**
 * api/plans.js
 * CRUD for pricing plans and their relationship to products and taxes.
 */
import { supabase } from '../lib/supabase';

/** Fetch all plans with the related product and tax details. */
export async function fetchPlans() {
  const { data, error } = await supabase
    .from('plans')
    .select(`
      id,
      name,
      price,
      billing_interval,
      min_qty,
      available_from,
      available_to,
      auto_close,
      closable,
      pausable,
      renewable,
      product:products(id, name, type),
      tax:taxes(id, name, rate)
    `)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/** Fetch a single plan by id. */
export async function fetchPlanById(id) {
  const { data, error } = await supabase
    .from('plans')
    .select(`*, product:products(*), tax:taxes(*)`)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new pricing plan.
 * @param {{ product_id, name, price, billing_interval, min_qty, renewable, pausable, auto_close, tax_id? }} payload
 */
export async function createPlan(payload) {
  const { data, error } = await supabase
    .from('plans')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update an existing plan. */
export async function updatePlan(id, payload) {
  const { data, error } = await supabase
    .from('plans')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete a plan (cascades via FK constraints). */
export async function deletePlan(id) {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/** Fetch all taxes (for plan creation dropdowns). */
export async function fetchTaxes() {
  const { data, error } = await supabase
    .from('taxes')
    .select('id, name, rate')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

