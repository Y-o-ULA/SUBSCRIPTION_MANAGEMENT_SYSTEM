-- CUSTOMERS & PROFILES
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  company text,
  created_at timestamptz not null default now()
);
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','customer')),
  customer_id uuid references customers(id)
);

-- CATALOG
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  sales_price numeric(12,2) not null check (sales_price >= 0),
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  notes text,
  created_at timestamptz not null default now()
);
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  attribute text not null,            -- e.g. 'Brand'
  value text not null,                -- e.g. 'Odoo'
  extra_price numeric(12,2) not null default 0
);
create table taxes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rate numeric(5,2) not null check (rate between 0 and 100)
);
create table plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  billing_interval text not null check (billing_interval in ('daily','weekly','monthly','yearly')),
  min_qty int not null default 1 check (min_qty >= 1),
  available_from date,
  available_to date,
  auto_close boolean not null default false,
  closable boolean not null default true,
  pausable boolean not null default false,
  renewable boolean not null default true,
  tax_id uuid references taxes(id)
);
create table discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('fixed','percent')),
  value numeric(12,2) not null check (value > 0),
  min_amount numeric(12,2) not null default 0,
  min_qty int not null default 0,
  start_date date,
  end_date date,
  usage_limit int,
  used_count int not null default 0,
  product_id uuid references products(id),   -- null = whole subscription
  active boolean not null default true
);

-- SUBSCRIPTIONS
create sequence subscription_seq start 1001;
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('SUB-' || nextval('subscription_seq')::text),
  customer_id uuid not null references customers(id),
  plan_id uuid not null references plans(id),
  status text not null default 'Draft'
    check (status in ('Draft','Quotation','Confirmed','Active','Closed')),
  start_date date not null default current_date,
  expiry_date date,
  payment_terms_days int not null default 15,
  next_billing_date date,
  created_at timestamptz not null default now()
);
create table subscription_lines (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  tax_id uuid references taxes(id)
);

-- INVOICES & PAYMENTS
create sequence invoice_seq start 5001;
create table invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('INV-' || nextval('invoice_seq')::text),
  subscription_id uuid not null references subscriptions(id),
  customer_id uuid not null references customers(id),
  billing_period_start date not null,
  billing_period_end date not null,
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  due_date date not null,
  status text not null default 'Draft' check (status in ('Draft','Confirmed','Paid')),
  created_at timestamptz not null default now(),
  unique (subscription_id, billing_period_start)      -- no double billing
);
create table invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  tax_rate numeric(5,2) not null default 0,
  amount numeric(12,2) not null
);
create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id),
  method text not null check (method in ('Card','UPI','Bank Transfer','Cash')),
  amount numeric(12,2) not null check (amount > 0),
  paid_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

-- INDEXES (speed for thousands of rows)
create index on invoices (status, due_date);
create index on invoices (customer_id);
create index on subscriptions (status, next_billing_date);
create index on subscriptions (customer_id);
create index on payments (invoice_id);
create index on invoice_lines (invoice_id);

-- DEMO MODE: keep RLS off (Supabase may enable it by default)
alter table customers disable row level security;
alter table profiles disable row level security;
alter table products disable row level security;
alter table product_variants disable row level security;
alter table taxes disable row level security;
alter table plans disable row level security;
alter table discounts disable row level security;
alter table subscriptions disable row level security;
alter table subscription_lines disable row level security;
alter table invoices disable row level security;
alter table invoice_lines disable row level security;
alter table payments disable row level security;