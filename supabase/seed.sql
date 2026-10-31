truncate payments, invoice_lines, invoices, subscription_lines, subscriptions,
         plans, product_variants, discounts, products cascade;
alter sequence subscription_seq restart with 1001;
alter sequence invoice_seq restart with 5001;

insert into taxes (name, rate) select 'GST 18%', 18
where not exists (select 1 from taxes where name = 'GST 18%');

insert into customers (name, email, company)
select (array['Aarav','Diya','Rohan','Meera','Kabir','Ananya','Vikram','Isha','Arjun','Neha'])[1 + g % 10]
       || ' ' ||
       (array['Sharma','Nair','Iyer','Patel','Reddy','Menon','Gupta','Das','Khan','Joshi'])[1 + (g / 10) % 10],
       'customer' || g || '@example.com',
       (array['Acme','Globex','Initech','Hooli','Stark','Wayne','Wonka','Umbrella'])[1 + g % 8] || ' Pvt Ltd'
from generate_series(1, 300) g
on conflict (email) do nothing;

insert into products (name, type, sales_price, cost_price, notes) values
 ('Business Pro','Software',1000,400,'Core suite'),
 ('Analytics Suite','Software',2500,900,'BI add-on'),
 ('Support Plus','Service',500,200,'Priority support'),
 ('Storage Add-on','Add-on',300,100,'Extra storage'),
 ('Odoo Connector','Add-on',800,300,'ERP integration');

insert into product_variants (product_id, attribute, value, extra_price)
select id, 'Brand', 'Odoo', 560 from products where name = 'Business Pro';
insert into product_variants (product_id, attribute, value, extra_price)
select id, 'Brand', 'Standard', 0 from products where name = 'Business Pro';

insert into plans (product_id, name, price, billing_interval, tax_id)
select p.id, p.name || ' Monthly', p.sales_price, 'monthly', t.id
from products p cross join (select id from taxes where name = 'GST 18%' limit 1) t
union all
select p.id, p.name || ' Yearly', p.sales_price * 10, 'yearly', t.id
from products p cross join (select id from taxes where name = 'GST 18%' limit 1) t;

insert into discounts (name, type, value, min_qty, min_amount, start_date, end_date, usage_limit) values
 ('Volume 10% (5+ seats)','percent',10,5,0, current_date - 30, current_date + 90, null),
 ('Welcome 200 off','fixed',200,0,500, current_date - 30, current_date + 60, 50),
 ('Festive 20% (expired)','percent',20,0,0, current_date - 90, current_date - 10, null);

-- 600 subscriptions: ~78% Active, rest Closed/Draft/Quotation/Confirmed
with cust as (select id, row_number() over (order by email) as rn from customers),
     n as (select count(*) as c from customers),
     pls as (select id, billing_interval, row_number() over (order by name) as rn from plans),
     m as (select count(*) as c from plans),
     gen as (select g, random() as r from generate_series(1, 600) g)
insert into subscriptions (customer_id, plan_id, status, start_date, expiry_date,
                           payment_terms_days, next_billing_date)
select cust.id, pls.id, x.status,
       (date_trunc('month', current_date) - interval '5 months')::date,
       case when x.status = 'Closed' then current_date - 20 else null end,
       15,
       case when x.status = 'Active' then
              case when pls.billing_interval = 'monthly' then date_trunc('month', current_date)::date
                   else current_date + ((gen.g * 7) % 365) end
            else null end
from gen
cross join n cross join m
join cust on cust.rn = 1 + gen.g % n.c
join pls on pls.rn = 1 + gen.g % m.c
cross join lateral (select case when gen.r < 0.78 then 'Active' when gen.r < 0.86 then 'Closed'
                                when gen.r < 0.91 then 'Draft' when gen.r < 0.96 then 'Quotation'
                                else 'Confirmed' end as status) x;

-- 4 months of history for monthly active subscriptions
insert into invoices (subscription_id, customer_id, billing_period_start, billing_period_end,
                      subtotal, discount_amount, tax_amount, total, due_date, status)
select s.id, s.customer_id, x.ps, (x.ps + interval '1 month')::date - 1,
       pl.price, 0, round(pl.price * 0.18, 2), pl.price + round(pl.price * 0.18, 2), x.ps + 15,
       case when (k >= 2 and random() < 0.92) or (k = 1 and random() < 0.6) then 'Paid' else 'Confirmed' end
from subscriptions s
join plans pl on pl.id = s.plan_id and pl.billing_interval = 'monthly'
cross join generate_series(1, 4) k
cross join lateral (select (date_trunc('month', current_date) - make_interval(months => k))::date as ps) x
where s.status = 'Active';

insert into invoice_lines (invoice_id, description, quantity, unit_price, tax_rate, amount)
select i.id, pr.name, 1, i.subtotal, 18, i.subtotal
from invoices i
join subscriptions s on s.id = i.subscription_id
join plans pl on pl.id = s.plan_id
join products pr on pr.id = pl.product_id;

insert into payments (invoice_id, method, amount, paid_at, note)
select i.id, (array['UPI','Card','Bank Transfer','Cash'])[1 + floor(random() * 4)::int],
       i.total, least(current_date, i.billing_period_start + floor(random() * 12)::int), 'Seeded payment'
from invoices i where i.status = 'Paid';

select * from dashboard_summary;