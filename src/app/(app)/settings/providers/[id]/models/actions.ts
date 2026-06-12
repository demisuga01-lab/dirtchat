"use server";

import { revalidatePath } from "next/cache";
import {
  addManualProviderModel,
  deleteManualProviderModel,
  listProviderModels,
  refreshProviderModels,
  setProviderDefaultModel,
  type ActionResult,
  type ModelListResult,
} from "@/lib/models/model-discovery-service";
import type { DiscoveryResult, ManualModelInput } from "@/lib/models/types";

export async function listModelsAction(
  providerConnectionId: string
): Promise<ActionResult<ModelListResult>> {
  try {
    const data = await listProviderModels(providerConnectionId);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: errorMessage(err), code: errorCode(err) };
  }
}

export async function refreshModelsAction(
  providerConnectionId: string
): Promise<ActionResult<DiscoveryResult>> {
  const result = await refreshProviderModels(providerConnectionId);
  if (result.ok) {
    revalidatePath(`/settings/providers/${providerConnectionId}/models`);
  }
  return result;
}

export async function addManualModelAction(
  providerConnectionId: string,
  input: ManualModelInput
): Promise<ActionResult<{ id: string }>> {
  const result = await addManualProviderModel(providerConnectionId, input);
  if (result.ok) {
    revalidatePath(`/settings/providers/${providerConnectionId}/models`);
  }
  return result;
}

export async function setDefaultModelAction(
  providerConnectionId: string,
  providerModelInternalId: string
): Promise<ActionResult<{ id: string }>> {
  const result = await setProviderDefaultModel(
    providerConnectionId,
    providerModelInternalId
  );
  if (result.ok) {
    revalidatePath(`/settings/providers/${providerConnectionId}/models`);
    revalidatePath("/settings/providers");
  }
  return result;
}

export async function deleteManualModelAction(
  providerConnectionId: string,
  providerModelInternalId: string
): Promise<ActionResult<{ id: string }>> {
  const result = await deleteManualProviderModel(
    providerConnectionId,
    providerModelInternalId
  );
  if (result.ok) {
    revalidatePath(`/settings/providers/${providerConnectionId}/models`);
  }
  return result;
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
