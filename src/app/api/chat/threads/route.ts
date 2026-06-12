import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  listThreads,
  createThread,
  AuthError,
} from "@/lib/chat/chat-service";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createSchema = z.object({
  title: z.string().trim().max(200).optional(),
  defaultProviderConnectionId: z.string().trim().optional(),
  defaultProviderModelId: z.string().trim().optional(),
  defaultModelId: z.string().trim().optional(),
});

export async function GET() {
  try {
    const threads = await listThreads();
    return NextResponse.json({ ok: true, threads }, { status: 200 });
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
        error: err instanceof Error ? err.message : "Could not list threads.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
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
    const userId = user?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "You must be signed in." },
        { status: 401 }
      );
    }
    const thread = await createThread(userId, parsed.data);
    return NextResponse.json({ ok: true, thread }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Could not create thread.",
      },
      { status: 500 }
    );
  }
}
