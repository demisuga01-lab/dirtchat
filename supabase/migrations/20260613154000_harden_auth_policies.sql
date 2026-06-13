-- Remove direct user insert policy from user_account_events since insertions should only occur via trusted server code using the admin service-role.
DROP POLICY IF EXISTS "user_account_events_insert_own" ON public.user_account_events;

-- Restrict select policy on legal_documents to active documents only, and make them publicly readable (authenticated and anon roles).
DROP POLICY IF EXISTS "legal_documents_select_authenticated" ON public.legal_documents;
CREATE POLICY "legal_documents_select_active" ON public.legal_documents
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);
