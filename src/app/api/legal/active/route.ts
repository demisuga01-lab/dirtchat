import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("legal_documents")
    .select("id, document_type, version, title, content, is_active, published_at")
    .eq("is_active", true)
    .order("document_type");

  if (error) {
    return NextResponse.json({ error: "Failed to load legal documents" }, { status: 500 });
  }

  return NextResponse.json(data);
}
