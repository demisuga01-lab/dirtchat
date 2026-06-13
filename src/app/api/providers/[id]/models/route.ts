import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  addManualProviderModel,
  listProviderModels,
  type ModelListResult,
} from "@/lib/models/model-discovery-service";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/providers/[id]/models
 *
 * Returns the model list for the current user's provider connection,
 * plus the connection metadata. Never returns the encrypted secret or
 * the decrypted API key.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return NextResponse.json(
      { ok: false, error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing provider id." },
      { status: 400 }
    );
  }
  try {
    const data: ModelListResult = await listProviderModels(id);
    return NextResponse.json(
      { ok: true, data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: redactMessage(err) },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}

const manualAddSchema = z.object({
  providerModelId: z.string().trim().min(1).max(200),
  displayName: z.string().trim().max(200).nullable().optional(),
  contextWindowTokens: z.number().int().positive().max(10_000_000).nullable().optional(),
  maxOutputTokens: z.number().int().positive().max(10_000_000).nullable().optional(),
  isDefault: z.boolean().optional().default(false),
  capabilityOverrides: z
    .object({
      supportsImageInput: z.boolean().optional(),
      supportsStreaming: z.boolean().optional(),
      supportsToolCalling: z.boolean().optional(),
      supportsFunctionCalling: z.boolean().optional(),
      supportsJsonMode: z.boolean().optional(),
      supportsStructuredOutputs: z.boolean().optional(),
      supportsReasoning: z.boolean().optional(),
      supportsTemperature: z.boolean().optional(),
      supportsTopP: z.boolean().optional(),
      supportsSystemMessages: z.boolean().optional(),
    })
    .optional(),
});

/**
 * POST /api/providers/[id]/models
 *
 * Manually add a model. The body is validated with zod and the user is
 * authenticated. The user must own the provider connection.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return NextResponse.json(
      { ok: false, error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing provider id." },
      { status: 400 }
    );
  }
  let body: z.infer<typeof manualAddSchema>;
  try {
    const json = await request.json();
    const parsed = manualAddSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error:
            parsed.error.issues[0]?.message ?? "Invalid request body.",
        },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not parse JSON body." },
      { status: 400 }
    );
  }
  const result = await addManualProviderModel(id, body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, code: result.code },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}

function redactMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (!msg) return "Unknown error.";
    if (msg.length > 200) return msg.slice(0, 200) + "…";
    return msg;
  }
  return "Unknown error.";
}
