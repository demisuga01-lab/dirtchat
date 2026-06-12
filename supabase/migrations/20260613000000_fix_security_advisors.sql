-- Fix security advisor warnings
-- 1. Revoke EXECUTE from PUBLIC on trigger/utility functions
-- These are internal functions, not meant to be called via the API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;

-- 2. Fix set_updated_at() mutable search_path
ALTER FUNCTION public.set_updated_at() SET search_path = '';

-- 3. Tighten avatars_select_public to only allow reading own folder
-- Public buckets allow URL-based access without a SELECT policy,
-- so the broad SELECT policy was exposing the full file listing.
DROP POLICY IF EXISTS avatars_select_public ON storage.objects;
CREATE POLICY avatars_select_public ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'avatars'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
