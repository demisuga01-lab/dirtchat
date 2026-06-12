-- 20260612000300_model_discovery.sql
-- Prompt 3: model discovery and capability detection schema.
--
-- Creates:
--   * public.provider_models         — discovered or manually-added models
--                                       per provider connection.
--   * public.model_capabilities      — 1:1 normalized capability rows.
--   * public.model_discovery_runs    — one row per refresh.
--   * public.model_discovery_events  — safe, redacted events/errors.
--
-- SAFETY:
--   * Idempotent (uses if not exists / drop if exists patterns).
--   * No drop / truncate / disable RLS / write to auth.users.
--   * Reuses public.set_updated_at() from Prompt 1.
--   * RLS enabled with user-owned SELECT/INSERT/UPDATE/DELETE on all
--     four new tables.
--   * Existing provider_connection_secrets policies are NOT modified.

set check_function_bodies = off;

-- ============================================================================
-- 1. provider_models
-- ============================================================================
create table if not exists public.provider_models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_connection_id uuid not null references public.provider_connections(id) on delete cascade,
  provider_model_id text not null,
  display_name text,
  canonical_slug text,
  model_family text,
  provider_owned_by text,
  description text,
  source text not null default 'discovered',
  discovery_status text not null default 'available',
  is_available boolean not null default true,
  is_manual boolean not null default false,
  is_default_for_provider boolean not null default false,
  context_window_tokens integer,
  max_output_tokens integer,
  input_modalities text[] not null default array['text']::text[],
  output_modalities text[] not null default array['text']::text[],
  supported_parameters text[] not null default array[]::text[],
  pricing_prompt text,
  pricing_completion text,
  pricing_image text,
  pricing_request text,
  raw_provider_metadata jsonb not null default '{}'::jsonb,
  normalized_metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_models_source_chk
    check (source in ('discovered', 'manual', 'fallback_default', 'imported')),
  constraint provider_models_discovery_status_chk
    check (discovery_status in ('available', 'unavailable', 'unknown', 'error', 'manual'))
);

create unique index if not exists provider_models_user_connection_model_uniq
  on public.provider_models (user_id, provider_connection_id, provider_model_id);

create index if not exists provider_models_user_id_idx
  on public.provider_models (user_id);

create index if not exists provider_models_connection_id_idx
  on public.provider_models (provider_connection_id);

-- One default per provider per user.
create unique index if not exists provider_models_one_default_per_provider_uniq
  on public.provider_models (user_id, provider_connection_id)
  where is_default_for_provider is true;

drop trigger if exists provider_models_set_updated_at on public.provider_models;
create trigger provider_models_set_updated_at
before update on public.provider_models
for each row execute procedure public.set_updated_at();

alter table public.provider_models enable row level security;

drop policy if exists "provider_models_select_own" on public.provider_models;
create policy "provider_models_select_own"
on public.provider_models
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "provider_models_insert_own" on public.provider_models;
create policy "provider_models_insert_own"
on public.provider_models
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "provider_models_update_own" on public.provider_models;
create policy "provider_models_update_own"
on public.provider_models
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "provider_models_delete_own" on public.provider_models;
create policy "provider_models_delete_own"
on public.provider_models
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 2. model_capabilities (1:1 with provider_models)
-- ============================================================================
create table if not exists public.model_capabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_model_id uuid not null references public.provider_models(id) on delete cascade,
  supports_text_input boolean,
  supports_text_output boolean,
  supports_image_input boolean,
  supports_file_input boolean,
  supports_audio_input boolean,
  supports_audio_output boolean,
  supports_video_input boolean,
  supports_streaming boolean,
  supports_tool_calling boolean,
  supports_parallel_tool_calling boolean,
  supports_json_mode boolean,
  supports_structured_outputs boolean,
  supports_function_calling boolean,
  supports_reasoning boolean,
  supports_reasoning_effort boolean,
  supports_reasoning_tokens boolean,
  supports_reasoning_exclude boolean,
  supports_system_messages boolean,
  supports_temperature boolean,
  supports_top_p boolean,
  supports_stop_sequences boolean,
  supports_response_format boolean,
  context_window_tokens integer,
  max_output_tokens integer,
  capability_confidence text not null default 'unknown',
  capability_score numeric(4,3) not null default 0,
  capability_source text not null default 'unknown',
  capability_notes text,
  metadata_evidence jsonb not null default '{}'::jsonb,
  probe_evidence jsonb not null default '{}'::jsonb,
  manual_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_model_id),
  constraint model_capabilities_confidence_chk
    check (capability_confidence in ('unknown', 'low', 'medium', 'high', 'manual')),
  constraint model_capabilities_source_chk
    check (capability_source in ('unknown', 'metadata', 'probe', 'metadata_and_probe', 'manual', 'provider_default', 'fallback_default'))
);

create index if not exists model_capabilities_user_id_idx
  on public.model_capabilities (user_id);

drop trigger if exists model_capabilities_set_updated_at on public.model_capabilities;
create trigger model_capabilities_set_updated_at
before update on public.model_capabilities
for each row execute procedure public.set_updated_at();

alter table public.model_capabilities enable row level security;

drop policy if exists "model_capabilities_select_own" on public.model_capabilities;
create policy "model_capabilities_select_own"
on public.model_capabilities
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "model_capabilities_insert_own" on public.model_capabilities;
create policy "model_capabilities_insert_own"
on public.model_capabilities
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "model_capabilities_update_own" on public.model_capabilities;
create policy "model_capabilities_update_own"
on public.model_capabilities
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "model_capabilities_delete_own" on public.model_capabilities;
create policy "model_capabilities_delete_own"
on public.model_capabilities
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 3. model_discovery_runs
-- ============================================================================
create table if not exists public.model_discovery_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_connection_id uuid not null references public.provider_connections(id) on delete cascade,
  status text not null default 'running',
  triggered_by text not null default 'user',
  protocol text,
  base_url text,
  default_model text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  models_found integer not null default 0,
  models_added integer not null default 0,
  models_updated integer not null default 0,
  models_marked_unavailable integer not null default 0,
  errors_count integer not null default 0,
  safe_summary text,
  safe_error text,
  request_latency_ms integer,
  raw_response_shape text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint model_discovery_runs_status_chk
    check (status in ('running', 'success', 'partial', 'failed', 'cancelled'))
);

create index if not exists model_discovery_runs_user_id_idx
  on public.model_discovery_runs (user_id);

create index if not exists model_discovery_runs_connection_id_idx
  on public.model_discovery_runs (provider_connection_id);

create index if not exists model_discovery_runs_started_at_idx
  on public.model_discovery_runs (started_at desc);

drop trigger if exists model_discovery_runs_set_updated_at on public.model_discovery_runs;
create trigger model_discovery_runs_set_updated_at
before update on public.model_discovery_runs
for each row execute procedure public.set_updated_at();

alter table public.model_discovery_runs enable row level security;

drop policy if exists "model_discovery_runs_select_own" on public.model_discovery_runs;
create policy "model_discovery_runs_select_own"
on public.model_discovery_runs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "model_discovery_runs_insert_own" on public.model_discovery_runs;
create policy "model_discovery_runs_insert_own"
on public.model_discovery_runs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "model_discovery_runs_update_own" on public.model_discovery_runs;
create policy "model_discovery_runs_update_own"
on public.model_discovery_runs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "model_discovery_runs_delete_own" on public.model_discovery_runs;
create policy "model_discovery_runs_delete_own"
on public.model_discovery_runs
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 4. model_discovery_events
-- ============================================================================
create table if not exists public.model_discovery_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  discovery_run_id uuid not null references public.model_discovery_runs(id) on delete cascade,
  provider_connection_id uuid not null references public.provider_connections(id) on delete cascade,
  level text not null default 'info',
  event_type text not null,
  message text not null,
  http_status integer,
  latency_ms integer,
  safe_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint model_discovery_events_level_chk
    check (level in ('debug', 'info', 'warning', 'error'))
);

create index if not exists model_discovery_events_user_id_idx
  on public.model_discovery_events (user_id);

create index if not exists model_discovery_events_run_id_idx
  on public.model_discovery_events (discovery_run_id);

create index if not exists model_discovery_events_connection_id_idx
  on public.model_discovery_events (provider_connection_id);

create index if not exists model_discovery_events_created_at_idx
  on public.model_discovery_events (created_at desc);

alter table public.model_discovery_events enable row level security;

drop policy if exists "model_discovery_events_select_own" on public.model_discovery_events;
create policy "model_discovery_events_select_own"
on public.model_discovery_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "model_discovery_events_insert_own" on public.model_discovery_events;
create policy "model_discovery_events_insert_own"
on public.model_discovery_events
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "model_discovery_events_update_own" on public.model_discovery_events;
create policy "model_discovery_events_update_own"
on public.model_discovery_events
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "model_discovery_events_delete_own" on public.model_discovery_events;
create policy "model_discovery_events_delete_own"
on public.model_discovery_events
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 5. Comments for future maintainers
-- ============================================================================
comment on table public.provider_models is
  'Discovered or manually-added provider models. One row per (user, provider_connection, provider_model_id).';
comment on table public.model_capabilities is
  'Normalized capability information. 1:1 with provider_models. Nullable booleans: null = unknown.';
comment on table public.model_discovery_runs is
  'One row per model discovery refresh. Stores safe summary only — no secrets.';
comment on table public.model_discovery_events is
  'Safe, redacted events/errors from model discovery. No Authorization headers or keys are stored.';
