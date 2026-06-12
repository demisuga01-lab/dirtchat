-- 20260612000600_user_preferences.sql
-- Prompt 7: user preferences for dashboard settings, appearance, chat behavior.
--
-- Creates:
--   * public.user_preferences — per-user app settings (theme, density, chat prefs).
--
-- SAFETY:
--   * Idempotent — uses if not exists / drop if exists patterns.
--   * Does not drop, truncate, or disable RLS.
--   * Does not duplicate profile fields (profiles stays identity, prefs stays settings).
--   * Does not modify auth.users or other tables.
--   * RLS: authenticated users can SELECT/INSERT/UPDATE their own row.
--     No DELETE policy — preferences are not deleted, only set to defaults via app.

set check_function_bodies = off;

-- ============================================================================
-- 1. user_preferences table
-- ============================================================================
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system',
  density text not null default 'comfortable',
  sidebar_collapsed boolean not null default false,
  default_provider_connection_id uuid references public.provider_connections(id) on delete set null,
  default_provider_model_id uuid references public.provider_models(id) on delete set null,
  default_model_id text,
  chat_enter_to_send boolean not null default true,
  chat_show_timestamps boolean not null default false,
  chat_show_token_usage boolean not null default true,
  chat_auto_scroll boolean not null default true,
  chat_markdown_enabled boolean not null default true,
  chat_code_copy_enabled boolean not null default true,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_theme_chk
    check (theme in ('light', 'dark', 'system')),
  constraint user_preferences_density_chk
    check (density in ('compact', 'comfortable', 'spacious'))
);

-- ============================================================================
-- 2. updated_at trigger
-- ============================================================================
drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute procedure public.set_updated_at();

-- ============================================================================
-- 3. RLS
-- ============================================================================
alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
on public.user_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
on public.user_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
on public.user_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Intentionally no DELETE policy — preferences should never be deleted,
-- only set to defaults through the app.
comment on table public.user_preferences is
  'Per-user application preferences: theme, density, chat behavior defaults.';
