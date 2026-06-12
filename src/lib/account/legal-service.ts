import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type LegalDocument = {
  id: string;
  document_type: "terms_of_service" | "privacy_policy";
  version: string;
  title: string;
  content: string;
  is_active: boolean;
  published_at: string;
};

export type LegalAcceptance = {
  id: string;
  user_id: string;
  legal_document_id: string;
  accepted_at: string;
};

export async function getActiveLegalDocuments(): Promise<LegalDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_documents")
    .select("*")
    .eq("is_active", true)
    .order("document_type");
  if (error) throw error;
  return data as LegalDocument[];
}

export async function getUserAcceptances(userId: string): Promise<{ legal_document_id: string; accepted_at: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_legal_acceptances")
    .select("legal_document_id, accepted_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function checkUserNeedsAcceptance(userId: string): Promise<{
  needsAcceptance: boolean;
  pendingDocuments: LegalDocument[];
}> {
  const [activeDocs, acceptances] = await Promise.all([
    getActiveLegalDocuments(),
    getUserAcceptances(userId),
  ]);

  const acceptedIds = new Set(acceptances.map((a) => a.legal_document_id));
  const pendingDocs = activeDocs.filter((d) => !acceptedIds.has(d.id));

  return {
    needsAcceptance: pendingDocs.length > 0,
    pendingDocuments: pendingDocs,
  };
}

export async function recordLegalAcceptance(
  userId: string,
  legalDocumentId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("user_legal_acceptances").insert({
    user_id: userId,
    legal_document_id: legalDocumentId,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
  });
  if (error) throw error;

  const { error: eventError } = await admin.from("user_account_events").insert({
    user_id: userId,
    event_type: "legal_document_accepted",
    event_data: { legal_document_id: legalDocumentId },
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
  });
  if (eventError) throw eventError;
}
