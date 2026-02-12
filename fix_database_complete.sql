-- CRIAR TABELA TENANTS (Se não existir)
create table if not exists tenants (
  slug text primary key,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- PERMISSÕES GERAIS PARA A TABELA TENANTS
-- Habilitar RLS
alter table tenants enable row level security;

-- Remover políticas antigas para evitar conflitos
drop policy if exists "Enable read access for all users" on tenants;
drop policy if exists "Enable insert for all users" on tenants;
drop policy if exists "Enable update for all users" on tenants;
drop policy if exists "All Tenants Public" on tenants;

-- Criar política permissiva TOTAL para tenants
create policy "All Tenants Public"
on tenants
for all
using (true)
with check (true);

-- Garantir também para SERVICES e PROFESSIONALS
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  tenant_slug text,
  title text,
  price numeric,
  duration integer,
  description text,
  active boolean default true,
  discount_price numeric,
  allowed_professionals text[],
  created_at timestamptz default now()
);

alter table services enable row level security;
drop policy if exists "All Services Public" on services;
create policy "All Services Public" on services for all using (true) with check (true);

create table if not exists professionals (
  id uuid default uuid_generate_v4() primary key,
  tenant_slug text,
  name text,
  specialty text,
  bio text,
  photo_url text,
  active boolean default true,
  created_at timestamptz default now()
);

alter table professionals enable row level security;
drop policy if exists "All Professionals Public" on professionals;
create policy "All Professionals Public" on professionals for all using (true) with check (true);

-- Reforçar Bookings
create table if not exists bookings (
  id uuid default uuid_generate_v4() primary key,
  tenant_slug text,
  client_name text,
  client_phone text,
  time text,
  date text,
  service_title text,
  service_price numeric,
  professional_name text,
  status text default 'confirmed',
  created_at timestamptz default now()
);

alter table bookings enable row level security;
drop policy if exists "All Bookings Public" on bookings;
create policy "All Bookings Public" on bookings for all using (true) with check (true);
