import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  listMessages,
  AuthError,
  NotFoundError,
} from "@/lib/chat/chat-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "You must be signed in." },
        { status: 401 }
      );
    }
    const messages = await listMessages(user.user.id, id);
    return NextResponse.json({ ok: true, messages }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 401 }
      );
    }
    if (err instanceof NotFoundError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : "Could not list messages.",
      },
      { status: 500 }
    );
  }
}
