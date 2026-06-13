import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAvailableChatModels, AuthError } from "@/lib/chat/chat-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return NextResponse.json(
      { ok: false, error: "You must be signed in." },
      { status: 401 }
    );
  }

  try {
    const models = await getAvailableChatModels();
    return NextResponse.json({ ok: true, models }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Could not list models.",
      },
      { status: 500 }
    );
  }
}
