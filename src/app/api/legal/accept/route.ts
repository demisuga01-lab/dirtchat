import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLegalAcceptance } from "@/lib/account/legal-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { legalDocumentId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { legalDocumentId } = body;

  if (!legalDocumentId) {
    return NextResponse.json({ error: "legalDocumentId is required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;
  const ua = request.headers.get("user-agent") ?? undefined;

  try {
    await recordLegalAcceptance(userData.user.id, legalDocumentId, ip, ua);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record acceptance";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
