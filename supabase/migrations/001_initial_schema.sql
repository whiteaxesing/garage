-- Garages (one per taller)
create table garages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  primary_color text not null default '#1a1a2e',
  created_at timestamptz not null default now()
);

-- Garage owners (admin users)
create table garage_owners (
  id uuid primary key references auth.users(id) on delete cascade,
  garage_id uuid not null references garages(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references garages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  id_number text,
  created_at timestamptz not null default now()
);

-- Vehicles
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  garage_id uuid not null references garages(id) on delete cascade,
  brand text not null,
  model text not null,
  year int not null,
  plate text not null,
  created_at timestamptz not null default now()
);

-- Services
create table services (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  garage_id uuid not null references garages(id) on delete cascade,
  service_type text not null,
  description text,
  mileage int,
  performed_at timestamptz not null default now(),
  next_service_date timestamptz,
  created_at timestamptz not null default now()
);

-- Invite codes (garage generates, client uses to register)
create table invite_codes (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references garages(id) on delete cascade,
  code text not null unique,
  client_id uuid references clients(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Push tokens for notifications
create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table garages enable row level security;
alter table garage_owners enable row level security;
alter table clients enable row level security;
alter table vehicles enable row level security;
alter table services enable row level security;
alter table invite_codes enable row level security;
alter table push_tokens enable row level security;

-- Garage owners can read their own garage
create policy "owner reads own garage"
  on garages for select
  using (id in (select garage_id from garage_owners where id = auth.uid()));

-- Garage owners can update their own garage
create policy "owner updates own garage"
  on garages for update
  using (id in (select garage_id from garage_owners where id = auth.uid()));

-- Owners manage their clients
create policy "owner manages clients"
  on clients for all
  using (garage_id in (select garage_id from garage_owners where id = auth.uid()));

-- Clients can read their own record
create policy "client reads own record"
  on clients for select
  using (user_id = auth.uid());

-- Owners manage vehicles
create policy "owner manages vehicles"
  on vehicles for all
  using (garage_id in (select garage_id from garage_owners where id = auth.uid()));

-- Clients can read their own vehicles
create policy "client reads own vehicles"
  on vehicles for select
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Owners manage services
create policy "owner manages services"
  on services for all
  using (garage_id in (select garage_id from garage_owners where id = auth.uid()));

-- Clients can read their own services
create policy "client reads own services"
  on services for select
  using (vehicle_id in (
    select v.id from vehicles v
    join clients c on c.id = v.client_id
    where c.user_id = auth.uid()
  ));

-- Owners manage invite codes
create policy "owner manages invite codes"
  on invite_codes for all
  using (garage_id in (select garage_id from garage_owners where id = auth.uid()));

-- Clients manage their own push tokens
create policy "client manages own push tokens"
  on push_tokens for all
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Owners can read push tokens of their clients (for sending notifications)
create policy "owner reads push tokens"
  on push_tokens for select
  using (client_id in (
    select id from clients
    where garage_id in (select garage_id from garage_owners where id = auth.uid())
  ));
