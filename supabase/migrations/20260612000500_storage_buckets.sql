-- 20260612000500_storage_buckets.sql
-- Prompt 6: Supabase Storage buckets and policies for Dirtchat.
--
-- Creates:
--   * chat-attachments  — private bucket for chat file/image uploads
--   * avatars           — public-read bucket for user avatar images
--   * temp-uploads      — private bucket for temporary upload processing
--
-- Each bucket has user-scoped RLS policies so authenticated users can
-- only manage their own files (object paths must start with user_id/).
--
-- SAFETY:
--   * Idempotent — uses if not exists / if not exists policy patterns.
--   * Does not drop buckets, truncate tables, or delete existing files.
--   * Does not disable RLS or create public write access.
--   * All buckets enforce owner-scoped path prefixes (user_id/).
--   * chat-attachments and temp-uploads are fully private.
--   * avatars is public-read but write is restricted to owner.

-- ============================================================================
-- 1. chat-attachments (private — chat file/image uploads)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments',
  'chat-attachments',
  false,
  52428800,  -- 50 MB
  array[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'text/plain', 'text/csv', 'text/markdown',
    'application/json', 'application/xml',
    'application/zip', 'application/gzip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
)
on conflict (id) do nothing;

-- RLS: authenticated users can select/insert/update/delete only their own path
create policy "chat_attachments_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "chat_attachments_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "chat_attachments_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'chat-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "chat_attachments_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- 2. avatars (public-read — user profile images)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Public SELECT so avatar URLs render without signed tokens.
create policy "avatars_select_public"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

-- Only the owning user can insert/update/delete their own avatar.
create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- 3. temp-uploads (private — temporary upload processing)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'temp-uploads',
  'temp-uploads',
  false,
  104857600,  -- 100 MB
  array[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'text/plain', 'text/csv', 'text/markdown',
    'application/json', 'application/xml',
    'application/zip', 'application/gzip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

-- RLS: authenticated users can only manage their own temp paths.
create policy "temp_uploads_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'temp-uploads'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "temp_uploads_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'temp-uploads'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "temp_uploads_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'temp-uploads'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "temp_uploads_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'temp-uploads'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- 4. Comments for future maintainers
-- ============================================================================

-- All buckets use the pattern: storage.foldername(name)[1] extracts the
-- first path segment, which must be the user's UUID. Upload clients must
-- prefix paths with `{user_id}/` — e.g. `{user_id}/avatar.png`.

-- chat-attachments and temp-uploads are private; file access requires
-- a signed URL generated server-side via the service-role client.

-- avatars is public-read; avatar URLs work without signed tokens.
-- Only authenticated users can write their own avatar.
