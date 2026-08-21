-- Field Visit Tracker schema
-- Roles live in `profiles`, keyed 1:1 to Supabase auth.users.

create type user_role as enum ('admin', 'salesman');
create type visit_status as enum ('New', 'Interested', 'Order Placed', 'Not Interested', 'Follow Up', 'Closed');
create type shop_type as enum ('Wholesaler', 'Distributor', 'Retailer');
create type expense_status as enum ('Pending', 'Approved', 'Rejected');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'salesman',
  full_name text not null,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table punches (
  id uuid primary key default gen_random_uuid(),
  salesman_id uuid not null references profiles (id) on delete cascade,
  punch_in_at timestamptz not null default now(),
  punch_in_lat double precision,
  punch_in_lng double precision,
  punch_out_at timestamptz,
  punch_out_lat double precision,
  punch_out_lng double precision,
  created_at timestamptz not null default now()
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  salesman_id uuid not null references profiles (id) on delete cascade,
  punch_id uuid references punches (id) on delete set null,
  visit_date date not null default current_date,
  shopkeeper_name text not null,
  phone text,
  type shop_type not null default 'Retailer',
  state text,
  city text,
  area text,
  status visit_status not null default 'New',
  feedback text,
  latitude double precision,
  longitude double precision,
  selfie_path text,
  visiting_card_path text,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  salesman_id uuid not null references profiles (id) on delete cascade,
  expense_date date not null default current_date,
  amount numeric(10, 2) not null,
  note text,
  status expense_status not null default 'Pending',
  reviewed_by uuid references profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index visits_salesman_idx on visits (salesman_id);
create index visits_date_idx on visits (visit_date);
create index visits_state_idx on visits (state);
create index expenses_salesman_idx on expenses (salesman_id);
create index punches_salesman_idx on punches (salesman_id);

-- Keep one open punch per salesman at a time
create unique index punches_open_unique on punches (salesman_id) where punch_out_at is null;

alter table profiles enable row level security;
alter table punches enable row level security;
alter table visits enable row level security;
alter table expenses enable row level security;

create function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create policy "profiles: self or admin read" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles: admin write" on profiles for insert
  with check (is_admin());
create policy "profiles: self or admin update" on profiles for update
  using (id = auth.uid() or is_admin());

create policy "punches: own or admin read" on punches for select
  using (salesman_id = auth.uid() or is_admin());
create policy "punches: own insert" on punches for insert
  with check (salesman_id = auth.uid());
create policy "punches: own or admin update" on punches for update
  using (salesman_id = auth.uid() or is_admin());

create policy "visits: own or admin read" on visits for select
  using (salesman_id = auth.uid() or is_admin());
create policy "visits: own insert" on visits for insert
  with check (salesman_id = auth.uid());
create policy "visits: own or admin update" on visits for update
  using (salesman_id = auth.uid() or is_admin());

create policy "expenses: own or admin read" on expenses for select
  using (salesman_id = auth.uid() or is_admin());
create policy "expenses: own insert" on expenses for insert
  with check (salesman_id = auth.uid());
create policy "expenses: own update pending, admin any" on expenses for update
  using (
    (salesman_id = auth.uid() and status = 'Pending') or is_admin()
  );

-- Storage: one bucket for visit photos (selfies + visiting cards), private
insert into storage.buckets (id, name, public)
values ('visit-photos', 'visit-photos', false)
on conflict (id) do nothing;

create policy "visit-photos: owner or admin read" on storage.objects for select
  using (
    bucket_id = 'visit-photos'
    and (owner = auth.uid() or is_admin())
  );
create policy "visit-photos: owner insert" on storage.objects for insert
  with check (bucket_id = 'visit-photos' and owner = auth.uid());
