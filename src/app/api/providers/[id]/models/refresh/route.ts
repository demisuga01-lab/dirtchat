import { NextResponse, type NextRequest } from "next/server";
import { refreshProviderModels } from "@/lib/models/model-discovery-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/providers/[id]/models/refresh
 *
 * Server-side model discovery. Returns a safe, redacted summary. The
 * decrypted provider key is used inside the server only and never leaves
 * this process.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing provider id." },
      { status: 400 }
    );
  }
  const result = await refreshProviderModels(id);
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
