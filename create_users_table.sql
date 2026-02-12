-- Run this in your Supabase SQL Editor

-- Table: Users (for Custom Authentication)
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null, -- hashed
  name text,
  slug text unique,
  phone text,
  role text default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table users enable row level security;

-- Allow public access (since we handle auth in the app code via bcrypt)
create policy "Enable all access for all users" on users for all using (true);
