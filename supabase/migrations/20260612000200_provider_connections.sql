-- 20260612000200_provider_connections.sql
-- Prompt 2: provider connection manager schema.
--
-- Creates:
--   * public.provider_connections        — user-owned provider metadata.
--   * public.provider_connection_secrets — encrypted secret material, one
--                                          row per (connection, secret_kind).
--   * updated_at maintenance triggers.
--   * Row Level Security policies so users can only read/write their own
--     provider metadata.
--
-- SAFETY:
--   * The `provider_connection_secrets` table has RLS enabled but does
--     NOT define an authenticated SELECT policy. The only path to read a
--     secret is via the service-role server client (see
--     `src/lib/supabase/admin.ts`).
--   * This migration is idempotent: it uses `if not exists` and
--     `drop … if exists` patterns. It does not drop, rename, or truncate
--     existing tables, and it never touches auth.users rows.
--   * No data is dropped. RLS is not disabled.

set check_function_bodies = off;

-- ============================================================================
-- 1. provider_connections (safe metadata)
-- ============================================================================
create table if not exists public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  provider_type text not null,
  protocol text not null,
  base_url text not null,
  default_model text,
  notes text,
  is_enabled boolean not null default true,
  status text not null default 'untested',
  last_tested_at timestamptz,
  last_test_status text,
  last_test_latency_ms integer,
  last_test_error text,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_connections_provider_type_chk
    check (provider_type in ('tokenrouter', 'openrouter', 'openai', 'anthropic', 'custom')),
  constraint provider_connections_protocol_chk
    check (protocol in ('openai-compatible', 'anthropic-compatible')),
  constraint provider_connections_status_chk
    check (status in ('untested', 'valid', 'invalid', 'error', 'disabled'))
);

create index if not exists provider_connections_user_id_idx
  on public.provider_connections (user_id);

-- updated_at trigger (reuses set_updated_at from Prompt 1 if present)
drop trigger if exists provider_connections_set_updated_at on public.provider_connections;
create trigger provider_connections_set_updated_at
before update on public.provider_connections
for each row execute procedure public.set_updated_at();

-- ============================================================================
-- 2. provider_connection_secrets (encrypted material)
-- ============================================================================
create table if not exists public.provider_connection_secrets (
  id uuid primary key default gen_random_uuid(),
  provider_connection_id uuid not null references public.provider_connections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  secret_kind text not null default 'api_key',
  encrypted_secret text not null,
  encryption_version integer not null default 1,
  key_last4 text,
  key_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_connection_id, secret_kind),
  constraint provider_connection_secrets_kind_chk
    check (secret_kind in ('api_key'))
);

create index if not exists provider_connection_secrets_connection_id_idx
  on public.provider_connection_secrets (provider_connection_id);

create index if not exists provider_connection_secrets_user_id_idx
  on public.provider_connection_secrets (user_id);

drop trigger if exists provider_connection_secrets_set_updated_at
  on public.provider_connection_secrets;
create trigger provider_connection_secrets_set_updated_at
before update on public.provider_connection_secrets
for each row execute procedure public.set_updated_at();

-- ============================================================================
-- 3. RLS — provider_connections (user-owned, full CRUD)
-- ============================================================================
alter table public.provider_connections enable row level security;

drop policy if exists "provider_connections_select_own" on public.provider_connections;
create policy "provider_connections_select_own"
on public.provider_connections
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "provider_connections_insert_own" on public.provider_connections;
create policy "provider_connections_insert_own"
on public.provider_connections
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "provider_connections_update_own" on public.provider_connections;
create policy "provider_connections_update_own"
on public.provider_connections
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "provider_connections_delete_own" on public.provider_connections;
create policy "provider_connections_delete_own"
on public.provider_connections
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 4. RLS — provider_connection_secrets (locked down, no client SELECT)
-- ============================================================================
-- RLS is enabled but only INSERT/UPDATE/DELETE policies are granted to
-- authenticated users (and only on rows they own). The SELECT policy is
-- intentionally omitted: client code must never read `encrypted_secret`.
-- All secret reads happen through the service-role admin client in
-- `src/lib/supabase/admin.ts`.
alter table public.provider_connection_secrets enable row level security;

drop policy if exists "provider_connection_secrets_select_own"
  on public.provider_connection_secrets;
-- (no select policy — explicit comment so future maintainers see the intent)
-- The following DROP POLICY statement is here to make the no-SELECT intent
-- obvious in `pg_policies`. If a future migration ever adds a SELECT
-- policy, it must be reviewed for secret-leak risk before being merged.

drop policy if exists "provider_connection_secrets_insert_own"
  on public.provider_connection_secrets;
create policy "provider_connection_secrets_insert_own"
on public.provider_connection_secrets
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "provider_connection_secrets_update_own"
  on public.provider_connection_secrets;
create policy "provider_connection_secrets_update_own"
on public.provider_connection_secrets
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "provider_connection_secrets_delete_own"
  on public.provider_connection_secrets;
create policy "provider_connection_secrets_delete_own"
on public.provider_connection_secrets
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 5. Comments for future maintainers
-- ============================================================================
comment on table public.provider_connections is
  'User-owned provider metadata for the Dirtchat provider connection manager.';
comment on table public.provider_connection_secrets is
  'Encrypted provider secrets. No client-side SELECT policy; reads only via service-role admin client.';
comment on column public.provider_connection_secrets.encrypted_secret is
  'AES-256-GCM ciphertext, base64-encoded JSON envelope (see src/lib/security/provider-crypto.ts).';
