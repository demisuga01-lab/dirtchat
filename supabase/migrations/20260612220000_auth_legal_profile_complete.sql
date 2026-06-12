-- 20260612220000_auth_legal_profile_complete.sql
-- Auth, legal, profile, and account events wiring for Dirtchat.
--
-- Creates:
--   * Profiles enhancement (onboarding_completed_at, last_seen_at, account_status, safe_metadata)
--   * legal_documents — versioned legal document storage
--   * user_legal_acceptances — append-only per-user acceptance tracking
--   * user_account_events — audit trail for account lifecycle events
--   * Updates handle_new_user() trigger to create preferences and account event
--   * Seeds active Terms of Service v1.0.0 and Privacy Policy v1.0.0
--
-- SAFETY:
--   * Idempotent — uses if not exists / drop if exists patterns.
--   * Does not drop, truncate, or disable RLS on existing tables.
--   * Does not modify auth.users or other tables outside public schema.
--   * RLS: user-owned policies, no anon writes, no using(true) for user data tables.

set check_function_bodies = off;

-- ============================================================================
-- 1. Profiles enhancement
-- ============================================================================

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists account_status text not null default 'active',
  add column if not exists safe_metadata jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_account_status_chk'
    and connamespace = 'public'::regnamespace
  ) then
    alter table public.profiles
      add constraint profiles_account_status_chk
        check (account_status in ('active', 'disabled', 'suspended'));
  end if;
end $$;

-- ============================================================================
-- 2. legal_documents table
-- ============================================================================

create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null,
  version text not null,
  title text not null,
  content text not null,
  is_active boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint legal_documents_type_chk
    check (document_type in ('terms_of_service', 'privacy_policy')),
  constraint legal_documents_version_not_empty
    check (char_length(version) > 0),
  constraint legal_documents_title_not_empty
    check (char_length(title) > 0),
  constraint legal_documents_content_not_empty
    check (char_length(content) > 0),
  constraint legal_documents_unique_type_version
    unique (document_type, version)
);

-- Ensure only one active document per type
create unique index if not exists legal_documents_single_active_per_type
  on public.legal_documents (document_type) where is_active = true;

comment on table public.legal_documents is
  'Versioned legal documents (Terms of Service, Privacy Policy). Only one active per type.';

-- ============================================================================
-- 3. user_legal_acceptances table
-- ============================================================================

create table if not exists public.user_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legal_document_id uuid not null references public.legal_documents(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  constraint user_legal_acceptances_unique
    unique (user_id, legal_document_id)
);

create index if not exists user_legal_acceptances_user_id_idx
  on public.user_legal_acceptances (user_id);

comment on table public.user_legal_acceptances is
  'Append-only per-user acceptance records for legal documents.';

-- ============================================================================
-- 4. user_account_events table
-- ============================================================================

create table if not exists public.user_account_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists user_account_events_user_id_idx
  on public.user_account_events (user_id);

create index if not exists user_account_events_type_idx
  on public.user_account_events (event_type);

comment on table public.user_account_events is
  'Audit trail for account lifecycle events. Append-only via triggers and API.';

-- ============================================================================
-- 5. RLS policies
-- ============================================================================

-- legal_documents: all authenticated users can read documents
alter table public.legal_documents enable row level security;

drop policy if exists "legal_documents_select_authenticated" on public.legal_documents;
create policy "legal_documents_select_authenticated"
  on public.legal_documents
  for select
  to authenticated
  using (true);

-- user_legal_acceptances: user can read and insert their own records
alter table public.user_legal_acceptances enable row level security;

drop policy if exists "user_legal_acceptances_select_own" on public.user_legal_acceptances;
create policy "user_legal_acceptances_select_own"
  on public.user_legal_acceptances
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_legal_acceptances_insert_own" on public.user_legal_acceptances;
create policy "user_legal_acceptances_insert_own"
  on public.user_legal_acceptances
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- user_account_events: user can select and insert their own events
alter table public.user_account_events enable row level security;

drop policy if exists "user_account_events_select_own" on public.user_account_events;
create policy "user_account_events_select_own"
  on public.user_account_events
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_account_events_insert_own" on public.user_account_events;
create policy "user_account_events_insert_own"
  on public.user_account_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================================================
-- 6. Grant access to Data API for new tables
-- ============================================================================

grant usage on schema public to authenticated;
grant all on public.legal_documents to authenticated;
grant all on public.user_legal_acceptances to authenticated;
grant all on public.user_account_events to authenticated;

-- ============================================================================
-- 7. Seed legal documents
-- ============================================================================

insert into public.legal_documents (document_type, version, title, content, is_active, published_at) values
(
  'terms_of_service',
  '1.0.0',
  'Terms of Service',
  '## Terms of Service

**Last updated:** June 2026

**This is a placeholder document.** Replace with actual legal terms before production use.

### 1. Acceptance of Terms
By accessing or using Dirtchat ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.

### 2. Description of Service
Dirtchat provides an AI chat interface that connects to third-party language model providers. You are responsible for configuring your own provider connections and API keys.

### 3. User Responsibilities
- You must provide accurate account information
- You are responsible for maintaining the confidentiality of your credentials and API keys
- You agree not to use the Service for any unlawful purpose
- You agree not to attempt to circumvent rate limits, access controls, or security measures

### 4. Third-Party Services
The Service acts as an intermediary to third-party AI providers. We are not responsible for the availability, accuracy, or content generated by those providers. Your use of third-party providers is subject to their respective terms of service.

### 5. Data Handling
- Chat messages and generated content are stored in your account
- Provider API keys are encrypted at rest
- We do not train AI models on your data
- See our Privacy Policy for detailed information about data handling

### 6. Limitation of Liability
The Service is provided "as is" without warranty of any kind. In no event shall the creators or operators be liable for any damages arising from your use of the Service.

### 7. Termination
We reserve the right to suspend or terminate access to the Service for violations of these terms.

### 8. Changes to Terms
We may update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.

### 9. Contact
For questions about these terms, please contact the project maintainers.',
  true,
  now()
),
(
  'privacy_policy',
  '1.0.0',
  'Privacy Policy',
  '## Privacy Policy

**Last updated:** June 2026

**This is a placeholder document.** Replace with actual privacy policy before production use.

### 1. Information We Collect

**Account Information:** When you register, we collect your email address and display name.

**Chat Data:** We store your chat messages, generated responses, and associated metadata (model used, token counts, timestamps).

**Provider Data:** We store encrypted API keys for third-party AI providers and connection configuration details.

**Usage Data:** We collect basic usage metrics such as login timestamps, feature usage, and error logs.

### 2. How We Use Information
- To provide and maintain the Service
- To improve the user experience
- To diagnose and fix technical issues
- To communicate account-related notices

### 3. Data Sharing
- We do not sell your personal data
- We do not share your chat content with third parties except as needed to fulfill AI provider requests
- Provider API keys are encrypted and never shared

### 4. Data Retention
Your data is retained for as long as your account is active. You may request deletion of your account and associated data at any time.

### 5. Data Security
- All data is encrypted in transit (TLS)
- Provider API keys are encrypted at rest using AES-256-GCM
- We follow security best practices for database access and authentication

### 6. Your Rights
- You can access, update, or delete your account information through the settings page
- You can request export of your data
- You can delete your chat threads at any time

### 7. Third-Party Services
When you use an AI provider through our Service, your prompts are sent to that provider. Review their privacy policies for information about their data handling practices.

### 8. Changes to This Policy
We may update this policy. We will notify users of material changes through the Service.

### 9. Contact
For privacy-related questions, please contact the project maintainers.',
  true,
  now()
)
on conflict (document_type, version) do nothing;

-- ============================================================================
-- 8. Update handle_new_user trigger to create preferences and account event
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, last_seen_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    now()
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_account_events (user_id, event_type, event_data)
  values (new.id, 'account_created', jsonb_build_object(
    'email', new.email,
    'created_at', new.created_at
  ));

  return new;
end;
$$;
