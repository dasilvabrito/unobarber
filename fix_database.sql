-- Run this in Supabase SQL Editor to FIX ALL TABLES

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables (if they don't exist)
create table if not exists tenants (
  slug text primary key,
  name text,
  logo_url text,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  tenant_slug text references tenants(slug) on delete cascade,
  title text not null,
  price numeric not null,
  duration text,
  type text check (type in ('service', 'combo')),
  active boolean default true,
  discount_price numeric,
  allowed_professionals text[], 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create table if not exists bookings (
  id uuid default uuid_generate_v4() primary key,
  tenant_slug text references tenants(slug) on delete cascade,
  date text not null, 
  time text not null, 
  client_name text not null,
  client_phone text not null,
  service_title text, 
  service_price numeric, 
  professional_name text, 
  status text check (status in ('confirmed', 'completed', 'cancelled', 'no_show')) default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Fix Permissions (RLS) - Allow EVERYTHING for now
alter table tenants enable row level security;
alter table services enable row level security;
alter table professionals enable row level security;
alter table bookings enable row level security;

-- Drop old policies to avoid errors
drop policy if exists "Enable all access for all users" on tenants;
drop policy if exists "Enable all access for all users" on services;
drop policy if exists "Enable all access for all users" on professionals;
drop policy if exists "Enable all access for all users" on bookings;

-- Create new PERMISSIVE policies
create policy "Enable all access for all users" on tenants for all using (true) with check (true);
create policy "Enable all access for all users" on services for all using (true) with check (true);
create policy "Enable all access for all users" on professionals for all using (true) with check (true);
create policy "Enable all access for all users" on bookings for all using (true) with check (true);
