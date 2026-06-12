-- 20260612000100_initial_profiles.sql
-- Initial Dirtchat profile foundation.
--
-- This migration creates:
--   * public.profiles        — user-owned profile rows.
--   * handle_new_user()      — trigger function that inserts a profile
--                              row for each new auth.users row.
--   * on_auth_user_created   — trigger that fires handle_new_user().
--   * Row Level Security policies so users can only read/write their own
--     profile.
--
-- SAFETY: This migration is idempotent and only creates objects in the
-- public schema. It does NOT drop, truncate, or modify auth.users. Do
-- not run on production without reviewing the policy definitions first.
--
-- The migration has been prepared for the Dirtchat dev project. It has
-- not been applied to the remote Supabase database in Prompt 1.
-- Apply with: `supabase db push` (when the Supabase CLI is configured)
-- or by running the file in the Supabase SQL editor.

set check_function_bodies = off;

-- 1. profiles table ----------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. updated_at maintenance -------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 3. RLS ----------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 4. handle_new_user trigger -------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
