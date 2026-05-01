-- ================================================
-- INVOEAZY — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================
-- SHOPS TABLE
-- Stores shop registration info (owner creates this)
-- ================================================
create table if not exists public.shops (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  type          text not null default 'general',
  phone         text,
  address       text,
  gst           text,
  owner_name    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Row Level Security for shops
alter table public.shops enable row level security;

-- Owners can read/write their own shop
create policy "Owner full access" on public.shops
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ================================================
-- EMPLOYEES TABLE
-- Stores employee login credentials linked to a shop
-- ================================================
create table if not exists public.employees (
  id            uuid primary key default uuid_generate_v4(),
  shop_id       uuid references public.shops(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete set null,
  name          text not null,
  phone         text,
  email         text,
  role          text default 'employee',  -- 'owner' | 'employee'
  permissions   jsonb default '{"create_bills": true, "manage_khata": false}'::jsonb,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- Row Level Security for employees
alter table public.employees enable row level security;

-- Owner can manage all employees in their shop
create policy "Owner manages employees" on public.employees
  for all
  using (
    exists (
      select 1 from public.shops
      where shops.id = employees.shop_id
      and shops.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.shops
      where shops.id = employees.shop_id
      and shops.owner_id = auth.uid()
    )
  );

-- Employees can view their own record
create policy "Employee reads own record" on public.employees
  for select
  using (user_id = auth.uid());

-- ================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_shops_updated
  before update on public.shops
  for each row execute procedure public.handle_updated_at();

-- ================================================
-- NOTE: Bills & Products are stored LOCALLY on device
-- (localStorage) — NOT in Supabase. Only shop
-- registration and employee logins are stored in cloud.
-- ================================================

-- ================================================
-- FEEDBACK TABLE
-- ================================================
create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  user_email text,
  message text not null,
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

-- Allow anyone to insert feedback
create policy "Anyone can insert feedback" on public.feedback
  for insert with check (true);

-- Only allow admins (or nobody from the app) to read feedback
create policy "Only admins read feedback" on public.feedback
  for select using (false);
