import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getThread,
  renameThread,
  archiveThread,
  deleteThread,
  AuthError,
  NotFoundError,
} from "@/lib/chat/chat-service";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const patchSchema = z.object({
  title: z.string().trim().max(200).optional(),
  is_archived: z.boolean().optional(),
});

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
    const thread = await getThread(user.user.id, id);
    return NextResponse.json({ ok: true, thread }, { status: 200 });
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
          err instanceof Error ? err.message : "Could not fetch thread.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "You must be signed in." },
        { status: 401 }
      );
    }

    if (parsed.data.title !== undefined) {
      await renameThread(user.user.id, id, parsed.data.title);
    }
    if (parsed.data.is_archived !== undefined) {
      await archiveThread(user.user.id, id, parsed.data.is_archived);
    }

    const thread = await getThread(user.user.id, id);
    return NextResponse.json({ ok: true, thread }, { status: 200 });
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
          err instanceof Error ? err.message : "Could not update thread.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    await deleteThread(user.user.id, id);
    return NextResponse.json({ ok: true }, { status: 200 });
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
          err instanceof Error ? err.message : "Could not delete thread.",
      },
      { status: 500 }
    );
  }
}
