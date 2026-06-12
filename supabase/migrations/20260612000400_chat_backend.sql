-- 20260612000400_chat_backend.sql
-- Prompt 4: chat backend and streaming schema.
--
-- Creates:
--   * public.chat_threads           — user-owned conversation containers
--   * public.chat_messages          — messages with sequence, role, status
--   * public.chat_generation_runs   — one row per generation attempt
--
-- SAFETY:
--   * Idempotent (uses if not exists / drop if exists patterns).
--   * No drop / truncate / disable RLS / write to auth.users.
--   * Reuses public.set_updated_at() from Prompt 1.
--   * RLS enabled with user-owned SELECT/INSERT/UPDATE/DELETE on all three
--     new tables.
--   * provider_connection_secrets policies are NOT modified.

set check_function_bodies = off;

-- ============================================================================
-- 1. chat_threads
-- ============================================================================
create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  summary text,
  default_provider_connection_id uuid references public.provider_connections(id) on delete set null,
  default_provider_model_id uuid references public.provider_models(id) on delete set null,
  default_model_id text,
  is_archived boolean not null default false,
  is_pinned boolean not null default false,
  last_message_at timestamptz,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_threads_title_length_chk
    check (char_length(title) <= 200)
);

create index if not exists chat_threads_user_updated_idx
  on public.chat_threads (user_id, updated_at desc);

create index if not exists chat_threads_user_last_message_idx
  on public.chat_threads (user_id, last_message_at desc nulls last);

create index if not exists chat_threads_user_archived_idx
  on public.chat_threads (user_id, is_archived);

drop trigger if exists chat_threads_set_updated_at on public.chat_threads;
create trigger chat_threads_set_updated_at
before update on public.chat_threads
for each row execute procedure public.set_updated_at();

alter table public.chat_threads enable row level security;

drop policy if exists "chat_threads_select_own" on public.chat_threads;
create policy "chat_threads_select_own"
on public.chat_threads
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "chat_threads_insert_own" on public.chat_threads;
create policy "chat_threads_insert_own"
on public.chat_threads
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "chat_threads_update_own" on public.chat_threads;
create policy "chat_threads_update_own"
on public.chat_threads
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "chat_threads_delete_own" on public.chat_threads;
create policy "chat_threads_delete_own"
on public.chat_threads
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 2. chat_messages
-- ============================================================================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null default '',
  status text not null default 'complete',
  sequence integer not null,
  parent_message_id uuid references public.chat_messages(id) on delete set null,
  provider_connection_id uuid references public.provider_connections(id) on delete set null,
  provider_model_id uuid references public.provider_models(id) on delete set null,
  model_id text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  safe_error text,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint chat_messages_role_chk
    check (role in ('system', 'user', 'assistant', 'tool')),
  constraint chat_messages_status_chk
    check (status in ('queued', 'streaming', 'complete', 'error', 'cancelled')),
  unique (thread_id, sequence)
);

create index if not exists chat_messages_thread_sequence_idx
  on public.chat_messages (thread_id, sequence);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at desc);

create index if not exists chat_messages_thread_created_idx
  on public.chat_messages (thread_id, created_at);

drop trigger if exists chat_messages_set_updated_at on public.chat_messages;
create trigger chat_messages_set_updated_at
before update on public.chat_messages
for each row execute procedure public.set_updated_at();

alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
on public.chat_messages
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
on public.chat_messages
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "chat_messages_update_own" on public.chat_messages;
create policy "chat_messages_update_own"
on public.chat_messages
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own"
on public.chat_messages
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 3. chat_generation_runs
-- ============================================================================
create table if not exists public.chat_generation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_message_id uuid references public.chat_messages(id) on delete set null,
  assistant_message_id uuid references public.chat_messages(id) on delete set null,
  provider_connection_id uuid references public.provider_connections(id) on delete set null,
  provider_model_id uuid references public.provider_models(id) on delete set null,
  model_id text,
  protocol text,
  status text not null default 'queued',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  http_status integer,
  provider_request_id text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  safe_request jsonb not null default '{}'::jsonb,
  safe_response_metadata jsonb not null default '{}'::jsonb,
  safe_error text,
  error_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_generation_runs_status_chk
    check (status in ('queued', 'streaming', 'complete', 'error', 'cancelled'))
);

create index if not exists chat_generation_runs_user_created_idx
  on public.chat_generation_runs (user_id, created_at desc);

create index if not exists chat_generation_runs_thread_created_idx
  on public.chat_generation_runs (thread_id, created_at desc);

create index if not exists chat_generation_runs_assistant_message_idx
  on public.chat_generation_runs (assistant_message_id);

drop trigger if exists chat_generation_runs_set_updated_at on public.chat_generation_runs;
create trigger chat_generation_runs_set_updated_at
before update on public.chat_generation_runs
for each row execute procedure public.set_updated_at();

alter table public.chat_generation_runs enable row level security;

drop policy if exists "chat_generation_runs_select_own" on public.chat_generation_runs;
create policy "chat_generation_runs_select_own"
on public.chat_generation_runs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "chat_generation_runs_insert_own" on public.chat_generation_runs;
create policy "chat_generation_runs_insert_own"
on public.chat_generation_runs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "chat_generation_runs_update_own" on public.chat_generation_runs;
create policy "chat_generation_runs_update_own"
on public.chat_generation_runs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "chat_generation_runs_delete_own" on public.chat_generation_runs;
create policy "chat_generation_runs_delete_own"
on public.chat_generation_runs
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 4. Comments for future maintainers
-- ============================================================================
comment on table public.chat_threads is
  'User-owned conversation containers for the Dirtchat chat workspace.';
comment on table public.chat_messages is
  'Messages in a chat thread. Each message belongs to a thread and is owned by a user.';
comment on table public.chat_generation_runs is
  'One row per generation attempt. Stores safe metadata about provider calls — no secrets.';
