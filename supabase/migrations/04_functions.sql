create or replace function plan_interval(p text) returns interval
language sql immutable as $$
  select case p when 'daily' then interval '1 day' when 'weekly' then interval '7 days'
    when 'monthly' then interval '1 month' when 'yearly' then interval '1 year' end;
$$;

create or replace function generate_due_invoices(p_today date default current_date)
returns json language plpgsql security definer set search_path = public as $$
declare
  sub record;
  v_next date;
  v_period_end date;
  v_interval interval;
  v_subtotal numeric(12,2);
  v_tax_raw numeric(12,2);
  v_tax numeric(12,2);
  v_disc_id uuid;
  v_discount numeric(12,2);
  v_invoice_id uuid;
  v_checked int := 0;
  v_created int := 0;
  v_skipped int := 0;
begin
  for sub in
    select s.id, s.customer_id, s.next_billing_date, s.expiry_date, s.payment_terms_days,
           p.billing_interval, p.auto_close, p.product_id, p.price, p.min_qty, p.tax_id
    from subscriptions s join plans p on p.id = s.plan_id
    where s.status = 'Active'
      and s.next_billing_date is not null
      and s.next_billing_date <= p_today
      and (s.expiry_date is null or s.next_billing_date <= s.expiry_date)
    order by s.next_billing_date
    for update of s skip locked
  loop
    v_checked := v_checked + 1;
    v_interval := plan_interval(sub.billing_interval);
    v_next := sub.next_billing_date;

    -- if the subscription has no lines yet, create one from the plan
    if not exists (select 1 from subscription_lines where subscription_id = sub.id) then
      insert into subscription_lines (subscription_id, product_id, quantity, unit_price, tax_id)
      values (sub.id, sub.product_id, sub.min_qty, sub.price, sub.tax_id);
    end if;

    -- bill every period that is due (catches up if several are behind)
    while v_next <= p_today and (sub.expiry_date is null or v_next <= sub.expiry_date) loop
      v_period_end := ((v_next + v_interval)::date) - 1;

      select coalesce(sum(l.quantity * l.unit_price), 0),
             coalesce(sum(round(l.quantity * l.unit_price * coalesce(t.rate, 0) / 100, 2)), 0)
        into v_subtotal, v_tax_raw
      from subscription_lines l left join taxes t on t.id = l.tax_id
      where l.subscription_id = sub.id;

      -- best valid discount (dates, min amount/qty, usage limit)
      v_disc_id := null; v_discount := 0;
      select d.id as did,
             least(b.amt, case d.type when 'percent' then round(b.amt * d.value / 100, 2) else d.value end) as damt
        into v_disc_id, v_discount
      from discounts d
      cross join lateral (
        select coalesce(sum(l.quantity * l.unit_price), 0) as amt, coalesce(sum(l.quantity), 0) as qty
        from subscription_lines l
        where l.subscription_id = sub.id and (d.product_id is null or l.product_id = d.product_id)
      ) b
      where d.active and b.amt > 0 and b.amt >= d.min_amount and b.qty >= d.min_qty
        and (d.start_date is null or d.start_date <= v_next)
        and (d.end_date is null or d.end_date >= v_next)
        and (d.usage_limit is null or d.used_count < d.usage_limit)
      order by damt desc
      limit 1;
      v_discount := coalesce(v_discount, 0);

      v_tax := case when v_subtotal > 0
                 then round(v_tax_raw * (v_subtotal - v_discount) / v_subtotal, 2) else 0 end;

      v_invoice_id := null;
      insert into invoices (subscription_id, customer_id, billing_period_start, billing_period_end,
                            subtotal, discount_amount, tax_amount, total, due_date)
      values (sub.id, sub.customer_id, v_next, v_period_end,
              v_subtotal, v_discount, v_tax, v_subtotal - v_discount + v_tax,
              v_next + sub.payment_terms_days)
      on conflict (subscription_id, billing_period_start) do nothing
      returning id into v_invoice_id;

      if v_invoice_id is null then
        v_skipped := v_skipped + 1;                -- already billed
      else
        insert into invoice_lines (invoice_id, description, quantity, unit_price, tax_rate, amount)
        select v_invoice_id, pr.name || coalesce(' - ' || v.value, ''), l.quantity, l.unit_price,
               coalesce(t.rate, 0), l.quantity * l.unit_price
        from subscription_lines l
        join products pr on pr.id = l.product_id
        left join product_variants v on v.id = l.variant_id
        left join taxes t on t.id = l.tax_id
        where l.subscription_id = sub.id;

        if v_disc_id is not null then
          update discounts set used_count = used_count + 1 where id = v_disc_id;
        end if;
        v_created := v_created + 1;
      end if;

      v_next := (v_next + v_interval)::date;
    end loop;

    update subscriptions
    set next_billing_date = v_next,
        status = case when sub.auto_close and sub.expiry_date is not null and v_next > sub.expiry_date
                      then 'Closed' else status end
    where id = sub.id;
  end loop;

  return json_build_object('subscriptions_checked', v_checked, 'invoices_created', v_created, 'skipped', v_skipped);
end $$;