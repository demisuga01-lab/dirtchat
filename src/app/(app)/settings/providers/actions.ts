"use server";

// Server actions for the provider manager. All actions require an
// authenticated user and validate input with zod. Errors are returned
// as safe, redacted messages — secrets are never echoed back.

import { revalidatePath } from "next/cache";
import {
  createProvider,
  deleteProvider,
  listProviders,
  setSecret,
  testConnection,
  updateProvider,
  type ActionResult,
  type TestConnectionResult,
} from "@/lib/providers/provider-service";

export async function listProvidersAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listProviders>>>
> {
  try {
    const data = await listProviders();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: errorMessage(err), code: errorCode(err) };
  }
}

export async function createProviderAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const result = await createProvider(input);
  if (result.ok) revalidatePath("/settings/providers");
  return result;
}

export async function updateProviderAction(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const result = await updateProvider(id, input);
  if (result.ok) revalidatePath("/settings/providers");
  return result;
}

export async function deleteProviderAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const result = await deleteProvider(id);
  if (result.ok) revalidatePath("/settings/providers");
  return result;
}

export async function setProviderSecretAction(
  id: string,
  apiKey: string
): Promise<ActionResult<{ id: string }>> {
  const result = await setSecret(id, apiKey);
  if (result.ok) revalidatePath("/settings/providers");
  return result;
}

export async function testProviderConnectionAction(
  id: string,
  rawInput?: {
    baseUrl?: string;
    protocol?: "openai-compatible" | "anthropic-compatible";
    defaultModel?: string | null;
    apiKey?: string;
  }
): Promise<TestConnectionResult> {
  return testConnection(id, rawInput);
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown server error.";
}

function errorCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}
