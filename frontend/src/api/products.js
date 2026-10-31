/**
 * api/products.js
 * CRUD for the products table and its product_variants child table.
 */
import { supabase } from '../lib/supabase';

/** Fetch all products with their variants. */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      type,
      sales_price,
      cost_price,
      notes,
      created_at,
      variants:product_variants(id, attribute, value, extra_price)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Fetch a single product by id. */
export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(`*, variants:product_variants(*)`)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new product.
 * @param {{ name, type, sales_price, cost_price, notes? }} payload
 */
export async function createProduct(payload) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name:        payload.name,
      type:        payload.type,
      sales_price: Number(payload.sales_price) || 0,
      cost_price:  Number(payload.cost_price)  || 0,
      notes:       payload.notes ?? null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update a product. */
export async function updateProduct(id, payload) {
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Delete a product and cascade to variants. */
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/** Add a variant to a product (e.g. Brand: Odoo, extra_price: 560). */
export async function createProductVariant({ product_id, attribute, value, extra_price = 0 }) {
  const { data, error } = await supabase
    .from('product_variants')
    .insert([{ product_id, attribute, value, extra_price }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetch all discounts (for product-linked promo configuration). */
export async function fetchDiscounts({ activeOnly = false } = {}) {
  let query = supabase
    .from('discounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (activeOnly) query = query.eq('active', true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Create a discount rule.
 * @param {{ name, type, value, min_amount, min_qty, start_date?, end_date?, usage_limit?, product_id? }} payload
 */
export async function createDiscount(payload) {
  const { data, error } = await supabase
    .from('discounts')
    .insert([{ ...payload, active: true }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Toggle a discount on/off. */
export async function toggleDiscount(id, active) {
  const { data, error } = await supabase
    .from('discounts')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

