import { NextResponse, type NextRequest } from "next/server";
import { setProviderDefaultModel } from "@/lib/models/model-discovery-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/providers/[id]/models/[modelId]/default
 *
 * Marks the given model as the default for the current user's provider
 * connection. The body is empty. Ownership is enforced server-side.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; modelId: string }> }
) {
  const { id, modelId } = await params;
  if (!id || !modelId) {
    return NextResponse.json(
      { ok: false, error: "Missing provider id or model id." },
      { status: 400 }
    );
  }
  const result = await setProviderDefaultModel(id, modelId);
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
