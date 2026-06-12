import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordLegalAcceptance } from "@/lib/account/legal-service";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    displayName?: string;
    acceptedLegalDocumentIds?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password, confirmPassword, displayName, acceptedLegalDocumentIds } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  if (confirmPassword && password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  // Verify terms and privacy acceptance at the logic level
  const admin = createAdminClient();
  const { data: activeDocs, error: legalError } = await admin
    .from("legal_documents")
    .select("id, document_type")
    .eq("is_active", true);

  if (legalError) {
    return NextResponse.json({ error: "Failed to verify legal document configuration." }, { status: 500 });
  }

  const activeTerms = activeDocs?.find((d) => d.document_type === "terms_of_service");
  const activePrivacy = activeDocs?.find((d) => d.document_type === "privacy_policy");
  const submittedIds = new Set(acceptedLegalDocumentIds ?? []);

  if (activeTerms && !submittedIds.has(activeTerms.id)) {
    return NextResponse.json({ error: "You must accept the Terms of Service to create an account." }, { status: 400 });
  }

  if (activePrivacy && !submittedIds.has(activePrivacy.id)) {
    return NextResponse.json({ error: "You must accept the Privacy Policy to create an account." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || email.split("@")[0] },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Could not create user" }, { status: 500 });
  }

  // Record legal acceptances if provided
  if (acceptedLegalDocumentIds?.length) {
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;
    const ua = request.headers.get("user-agent") ?? undefined;

    for (const docId of acceptedLegalDocumentIds) {
      try {
        await recordLegalAcceptance(data.user.id, docId, ip, ua);
      } catch {
        // Non-fatal
      }
    }
  }

  // Record account event
  try {
    const admin = createAdminClient();
    await admin.from("user_account_events").insert({
      user_id: data.user.id,
      event_type: "sign_up",
      event_data: { email },
    });
  } catch {
    // Non-fatal
  }

  return NextResponse.json({
    ok: true,
    session: !!data.session,
    userId: data.user.id,
  });
}
