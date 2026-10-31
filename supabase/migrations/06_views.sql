drop view if exists dashboard_summary, overdue_invoices, billing_queue,
                    upcoming_renewals, monthly_revenue, subscription_mrr, invoice_balances;

create view invoice_balances as
select i.id, i.number, i.subscription_id, i.customer_id, c.name as customer_name,
       i.billing_period_start, i.total, i.due_date, i.status, i.created_at,
       coalesce(p.paid, 0) as paid,
       i.total - coalesce(p.paid, 0) as balance,
       (i.status <> 'Paid' and i.due_date < current_date) as is_overdue,
       case when i.status <> 'Paid' and i.due_date < current_date
            then current_date - i.due_date else 0 end as days_overdue
from invoices i
join customers c on c.id = i.customer_id
left join (select invoice_id, sum(amount) as paid from payments group by invoice_id) p
  on p.invoice_id = i.id;

create view overdue_invoices as
select * from invoice_balances where is_overdue order by days_overdue desc;

create view subscription_mrr as
select s.id as subscription_id, s.customer_id,
       coalesce(l.amt, p.price * p.min_qty) as period_amount,
       coalesce(l.amt, p.price * p.min_qty) *
         case p.billing_interval when 'daily' then 365.0/12 when 'weekly' then 52.0/12
                                 when 'monthly' then 1.0 when 'yearly' then 1.0/12 end as mrr
from subscriptions s
join plans p on p.id = s.plan_id
left join (select subscription_id, sum(quantity * unit_price) as amt
           from subscription_lines group by subscription_id) l on l.subscription_id = s.id
where s.status = 'Active';

create view dashboard_summary as
select
  (select count(*) from subscriptions where status = 'Active') as active_subscriptions,
  (select coalesce(sum(amount), 0) from payments) as revenue_collected,
  (select coalesce(sum(balance), 0) from invoice_balances where status <> 'Paid') as outstanding_amount,
  (select count(*) from invoice_balances where is_overdue) as overdue_invoices,
  (select coalesce(sum(balance), 0) from invoice_balances where is_overdue) as overdue_amount,
  (select round(coalesce(sum(mrr), 0), 2) from subscription_mrr) as mrr,
  (select count(*) from subscriptions where status = 'Active'
     and next_billing_date <= current_date) as ready_to_bill,
  (select count(*) from subscriptions where status = 'Active'
     and next_billing_date > current_date and next_billing_date <= current_date + 7) as renewals_next_7_days;

create view monthly_revenue as
select to_char(date_trunc('month', paid_at), 'YYYY-MM') as month,
       date_trunc('month', paid_at)::date as month_start,
       sum(amount) as revenue
from payments group by 1, 2 order by 2;

create view upcoming_renewals as
select s.id, s.number, c.name as customer_name, p.name as plan_name, s.next_billing_date
from subscriptions s
join customers c on c.id = s.customer_id
join plans p on p.id = s.plan_id
where s.status = 'Active' and s.next_billing_date > current_date
  and s.next_billing_date <= current_date + 7
order by s.next_billing_date;

create view billing_queue as
select s.id, s.number, c.name as customer_name, p.name as plan_name,
       p.billing_interval, p.price, s.next_billing_date
from subscriptions s
join customers c on c.id = s.customer_id
join plans p on p.id = s.plan_id
where s.status = 'Active' and s.next_billing_date <= current_date
order by s.next_billing_date;

grant select on all tables in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;