import { NextResponse, type NextRequest } from "next/server";
import { testConnection } from "@/lib/providers/provider-service";
import { z } from "zod";

const bodySchema = z
  .object({
    baseUrl: z.string().trim().min(1).max(2000).optional(),
    protocol: z.enum(["openai-compatible", "anthropic-compatible"]).optional(),
    defaultModel: z.string().trim().max(200).nullable().optional(),
    apiKey: z.string().trim().min(1).max(2000).optional(),
  })
  .optional();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/providers/[id]/test
 *
 * Server-only connection test. Accepts an optional JSON body with
 * unsaved form overrides (baseUrl, protocol, defaultModel, apiKey). If
 * no apiKey is supplied, the saved encrypted secret is used.
 *
 * Never returns the API key, request body, or Authorization header.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing provider id." },
      { status: 400 }
    );
  }

  let body: z.infer<typeof bodySchema> = undefined;
  try {
    if (request.headers.get("content-length")) {
      const json = await request.json();
      const parsed = bodySchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          {
            ok: false,
            error: parsed.error.issues[0]?.message ?? "Invalid request body.",
          },
          { status: 400 }
        );
      }
      body = parsed.data;
    }
  } catch {
    // ignore — body is optional
  }

  const result = await testConnection(id, body);
  // The result is already redacted and safe to return.
  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
    headers: { "Cache-Control": "no-store" },
  });
}
