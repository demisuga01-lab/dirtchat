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
    .from("user_legal_acceptances")
    .select("id, legal_document_id, accepted_at")
    .eq("user_id", userData.user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to load acceptances" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
