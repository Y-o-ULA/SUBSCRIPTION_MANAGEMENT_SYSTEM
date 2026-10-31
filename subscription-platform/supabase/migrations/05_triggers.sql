-- when a subscription becomes Active, billing starts on its start date
create or replace function set_next_billing() returns trigger language plpgsql as $$
begin
  if new.status = 'Active' and new.next_billing_date is null then
    new.next_billing_date := new.start_date;
  end if;
  return new;
end $$;
create trigger trg_set_next_billing before insert or update on subscriptions
for each row execute function set_next_billing();

-- reject payments larger than what is still owed
create or replace function check_payment() returns trigger language plpgsql as $$
declare v_total numeric(12,2); v_paid numeric(12,2);
begin
  select total into v_total from invoices where id = new.invoice_id;
  select coalesce(sum(amount), 0) into v_paid from payments where invoice_id = new.invoice_id;
  if v_paid + new.amount > v_total then
    raise exception 'Payment exceeds outstanding amount (% remaining)', v_total - v_paid;
  end if;
  return new;
end $$;
create trigger trg_check_payment before insert on payments
for each row execute function check_payment();

-- mark invoice Paid once payments cover the total
create or replace function mark_invoice_paid() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_total numeric(12,2); v_paid numeric(12,2);
begin
  select total into v_total from invoices where id = new.invoice_id;
  select coalesce(sum(amount), 0) into v_paid from payments where invoice_id = new.invoice_id;
  if v_paid >= v_total then
    update invoices set status = 'Paid' where id = new.invoice_id;
  end if;
  return new;
end $$;
create trigger trg_mark_paid after insert on payments
for each row execute function mark_invoice_paid();