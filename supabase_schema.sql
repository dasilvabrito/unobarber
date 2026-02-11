-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: Tenants (Barbershops)
create table if not exists tenants (
  slug text primary key,
  name text,
  logo_url text,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: Services
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  tenant_slug text references tenants(slug) on delete cascade,
  title text not null,
  price numeric not null,
  duration text,
  type text check (type in ('service', 'combo')),
  active boolean default true,
  discount_price numeric,
  allowed_professionals text[], -- Array of Professional IDs (stored as text to match current logic)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: Professionals
create table if not exists professionals (
  id uuid default uuid_generate_v4() primary key,
  tenant_slug text references tenants(slug) on delete cascade,
  name text not null,
  specialty text,
  bio text,
  photo_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: Bookings
create table if not exists bookings (
  id uuid default uuid_generate_v4() primary key,
  tenant_slug text references tenants(slug) on delete cascade,
  date text not null, -- YYYY-MM-DD
  time text not null, -- HH:MM
  client_name text not null,
  client_phone text not null,
  service_title text, -- Snapshot
  service_price numeric, -- Snapshot
  professional_name text, -- Snapshot
  status text check (status in ('confirmed', 'completed', 'cancelled', 'no_show')) default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Simplest Policy: Public Access for now (Dev Mode)
alter table tenants enable row level security;
alter table services enable row level security;
alter table professionals enable row level security;
alter table bookings enable row level security;

-- OPEN ACCESS POLICY (Use carefully)
create policy "Enable all access for all users" on tenants for all using (true);
create policy "Enable all access for all users" on services for all using (true);
create policy "Enable all access for all users" on professionals for all using (true);
create policy "Enable all access for all users" on bookings for all using (true);
