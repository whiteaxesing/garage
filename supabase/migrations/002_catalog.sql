-- Brands catalog
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Models catalog
create table models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  name text not null,
  generations text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(brand_id, name)
);

-- RLS: anyone authenticated can read, only owners can write
alter table brands enable row level security;
alter table models enable row level security;

create policy "authenticated users read brands"
  on brands for select
  to authenticated
  using (true);

create policy "authenticated users read models"
  on models for select
  to authenticated
  using (true);

create policy "authenticated users insert brands"
  on brands for insert
  to authenticated
  with check (true);

create policy "authenticated users insert models"
  on models for insert
  to authenticated
  with check (true);

create policy "authenticated users update models"
  on models for update
  to authenticated
  using (true);
