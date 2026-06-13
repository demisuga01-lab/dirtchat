-- Drop old check constraint
ALTER TABLE public.legal_documents DROP CONSTRAINT IF EXISTS legal_documents_type_chk;

-- Update existing document_type values
UPDATE public.legal_documents SET document_type = 'terms' WHERE document_type = 'terms_of_service';
UPDATE public.legal_documents SET document_type = 'privacy' WHERE document_type = 'privacy_policy';

-- Add new check constraint
ALTER TABLE public.legal_documents ADD CONSTRAINT legal_documents_type_chk CHECK (document_type = ANY (ARRAY['terms'::text, 'privacy'::text]));
