// src/lib/models/model-discovery-service.ts
//
// Server-only model discovery orchestrator. Decrypts the saved provider
// key, calls the provider's metadata or chat-completions endpoint, parses
// the response safely, infers capabilities, upserts the catalog rows,
// and logs redacted run + event rows. Never returns the decrypted key
// and never persists secrets or Authorization headers anywhere.

import "server-only";
import { createClient as createUserClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/security/provider-crypto";
import { safeErrorMessage } from "@/lib/security/redact";
import { normalizeOpenAICompatibleUrl } from "@/lib/providers/url-normalize";
import type { ProviderConnection, ProviderProtocol } from "@/lib/providers/types";
import { inferCapabilities } from "@/lib/models/capability-inference";
import {
  fallbackDefaultDescriptor,
  normalizeProviderModelsResponse,
  type NormalizedModelDescriptor,
} from "@/lib/models/model-normalize";
import type {
  DiscoveryResult,
  ManualModelInput,
  ModelCapabilities,
  ProviderModel,
  ProviderModelWithCapabilities,
} from "@/lib/models/types";
import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================
const DISCOVERY_TIMEOUT_MS = Number.parseInt(
  process.env.MODEL_DISCOVERY_TIMEOUT_MS ?? "10000",
  10
);

// ============================================================================
// Validation
// ============================================================================
const manualInputSchema = z.object({
  providerModelId: z.string().trim().min(1).max(200),
  displayName: z.string().trim().max(200).optional().nullable(),
  contextWindowTokens: z.number().int().positive().max(10_000_000).optional().nullable(),
  maxOutputTokens: z.number().int().positive().max(10_000_000).optional().nullable(),
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

// ============================================================================
// Public types
// ============================================================================
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export interface ModelListResult {
  provider: ProviderConnection;
  models: ProviderModelWithCapabilities[];
  hasSecret: boolean;
}

// ============================================================================
// Helpers
// ============================================================================
async function requireUserId(): Promise<string> {
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new AuthError("You must be signed in to manage models.");
  }
  return data.user.id;
}

class AuthError extends Error {
  code = "unauthenticated";
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

async function readDecryptedSecret(
  providerConnectionId: string,
  userId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("provider_connection_secrets")
    .select("encrypted_secret")
    .eq("provider_connection_id", providerConnectionId)
    .eq("user_id", userId)
    .eq("secret_kind", "api_key")
    .maybeSingle();
  if (error || !data) return null;
  try {
    return decryptSecret(
      (data as { encrypted_secret: string }).encrypted_secret
    );
  } catch {
    return null;
  }
}

async function loadProviderConnectionOrThrow(
  userId: string,
  providerConnectionId: string
): Promise<ProviderConnection> {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("provider_connections")
    .select("*")
    .eq("id", providerConnectionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) {
    throw new Error("Provider connection not found.");
  }
  return data as ProviderConnection;
}

async function listCapabilities(
  userId: string,
  modelIds: string[]
): Promise<Map<string, ModelCapabilities>> {
  const out = new Map<string, ModelCapabilities>();
  if (modelIds.length === 0) return out;
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("model_capabilities")
    .select("*")
    .eq("user_id", userId)
    .in("provider_model_id", modelIds);
  if (error) return out;
  for (const row of (data ?? []) as ModelCapabilities[]) {
    out.set(row.provider_model_id, row);
  }
  return out;
}

// ============================================================================
// Read API
// ============================================================================
export async function listProviderModels(
  providerConnectionId: string
): Promise<ModelListResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw err;
  }
  const provider = await loadProviderConnectionOrThrow(
    userId,
    providerConnectionId
  );
  const supabase = await createUserClient();
  const { data: modelRows, error } = await supabase
    .from("provider_models")
    .select("*")
    .eq("user_id", userId)
    .eq("provider_connection_id", providerConnectionId)
    .order("is_default_for_provider", { ascending: false })
    .order("display_name", { ascending: true });
  if (error) {
    throw new Error(`Could not list models: ${safeErrorMessage(error)}`);
  }
  const rows = (modelRows ?? []) as ProviderModel[];
  const capsByModelId = await listCapabilities(
    userId,
    rows.map((r) => r.id)
  );
  const models: ProviderModelWithCapabilities[] = rows.map((r) => ({
    ...r,
    capabilities: capsByModelId.get(r.id) ?? null,
  }));
  // Secret presence
  const admin = createAdminClient();
  const { data: secretMeta } = await admin
    .from("provider_connection_secrets")
    .select("provider_connection_id")
    .eq("provider_connection_id", providerConnectionId)
    .eq("user_id", userId)
    .maybeSingle();
  return { provider, models, hasSecret: !!secretMeta };
}

// ============================================================================
// Discovery probe (server-side HTTP)
// ============================================================================
interface ProbeResult {
  ok: boolean;
  httpStatus: number | null;
  latencyMs: number;
  parsed: ReturnType<typeof normalizeProviderModelsResponse> | null;
  probeKind: "models" | "chat_completions" | "skipped" | "failed";
}

async function timedFetchJson(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<{ response: Response; latencyMs: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
    return { response, latencyMs: Date.now() - start };
  } finally {
    clearTimeout(timeout);
  }
}

async function probeModels(
  apiKey: string,
  modelsUrl: string
): Promise<ProbeResult> {
  try {
    const { response, latencyMs } = await timedFetchJson(
      modelsUrl,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
      DISCOVERY_TIMEOUT_MS
    );
    if (!response.ok) {
      return {
        ok: false,
        httpStatus: response.status,
        latencyMs,
        parsed: null,
        probeKind: "models",
      };
    }
    const body = await response.json().catch(() => null);
    const parsed = normalizeProviderModelsResponse(body);
    return {
      ok: parsed.ok,
      httpStatus: response.status,
      latencyMs,
      parsed,
      probeKind: "models",
    };
  } catch {
    return {
      ok: false,
      httpStatus: null,
      latencyMs: 0,
      parsed: null,
      probeKind: "failed",
      // We can't return a string here without changing the type; surface
      // via the caller. The caller still records the latency in the run.
    };
  }
}

async function probeChatCompletions(
  apiKey: string,
  chatCompletionsUrl: string,
  defaultModel: string
): Promise<ProbeResult> {
  try {
    const { response, latencyMs } = await timedFetchJson(
      chatCompletionsUrl,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: defaultModel,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
          temperature: 0,
          stream: false,
        }),
      },
      DISCOVERY_TIMEOUT_MS
    );
    const ok = response.ok;
    return {
      ok,
      httpStatus: response.status,
      latencyMs,
      parsed: null,
      probeKind: "chat_completions",
    };
  } catch {
    return {
      ok: false,
      httpStatus: null,
      latencyMs: 0,
      parsed: null,
      probeKind: "failed",
    };
  }
}

// ============================================================================
// Discovery orchestrator
// ============================================================================
async function ensureSingleDefault(
  userId: string,
  providerConnectionId: string,
  newDefaultModelInternalId: string
): Promise<void> {
  const supabase = await createUserClient();
  // Unset current default.
  await supabase
    .from("provider_models")
    .update({ is_default_for_provider: false })
    .eq("user_id", userId)
    .eq("provider_connection_id", providerConnectionId)
    .eq("is_default_for_provider", true);
  // Set the new default.
  await supabase
    .from("provider_models")
    .update({ is_default_for_provider: true })
    .eq("id", newDefaultModelInternalId)
    .eq("user_id", userId);
}

async function recordEvent(
  runId: string,
  userId: string,
  providerConnectionId: string,
  level: "info" | "warning" | "error" | "debug",
  eventType: string,
  message: string,
  httpStatus: number | null,
  latencyMs: number | null,
  details: Record<string, unknown>
): Promise<void> {
  const supabase = await createUserClient();
  await supabase.from("model_discovery_events").insert({
    discovery_run_id: runId,
    user_id: userId,
    provider_connection_id: providerConnectionId,
    level,
    event_type: eventType,
    message: message.slice(0, 1000),
    http_status: httpStatus,
    latency_ms: latencyMs,
    safe_details: details,
  });
}

interface UpsertResult {
  added: number;
  updated: number;
}

async function upsertModels(
  userId: string,
  providerConnectionId: string,
  descriptors: NormalizedModelDescriptor[]
): Promise<UpsertResult> {
  const supabase = await createUserClient();
  let added = 0;
  let updated = 0;
  for (const d of descriptors) {
    // Check if a row already exists for (user, connection, model id).
    const { data: existing, error: selErr } = await supabase
      .from("provider_models")
      .select("id, first_seen_at")
      .eq("user_id", userId)
      .eq("provider_connection_id", providerConnectionId)
      .eq("provider_model_id", d.provider_model_id)
      .maybeSingle();
    if (selErr) continue;
    if (existing) {
      await supabase
        .from("provider_models")
        .update({
          display_name: d.display_name,
          canonical_slug: d.canonical_slug,
          model_family: d.model_family,
          provider_owned_by: d.provider_owned_by,
          description: d.description,
          is_available: true,
          last_seen_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString(),
          context_window_tokens: d.context_window_tokens,
          max_output_tokens: d.max_output_tokens,
          input_modalities: d.input_modalities,
          output_modalities: d.output_modalities,
          supported_parameters: d.supported_parameters,
          pricing_prompt: d.pricing_prompt,
          pricing_completion: d.pricing_completion,
          pricing_image: d.pricing_image,
          pricing_request: d.pricing_request,
          raw_provider_metadata: d.raw_provider_metadata,
        })
        .eq("id", (existing as { id: string }).id);
      updated++;
    } else {
      await supabase.from("provider_models").insert({
        user_id: userId,
        provider_connection_id: providerConnectionId,
        provider_model_id: d.provider_model_id,
        display_name: d.display_name,
        canonical_slug: d.canonical_slug,
        model_family: d.model_family,
        provider_owned_by: d.provider_owned_by,
        description: d.description,
        source: "discovered",
        discovery_status: "available",
        is_available: true,
        is_manual: false,
        is_default_for_provider: false,
        context_window_tokens: d.context_window_tokens,
        max_output_tokens: d.max_output_tokens,
        input_modalities: d.input_modalities,
        output_modalities: d.output_modalities,
        supported_parameters: d.supported_parameters,
        pricing_prompt: d.pricing_prompt,
        pricing_completion: d.pricing_completion,
        pricing_image: d.pricing_image,
        pricing_request: d.pricing_request,
        raw_provider_metadata: d.raw_provider_metadata,
      });
      added++;
    }
  }
  return { added, updated };
}

async function upsertCapabilities(
  userId: string,
  providerConnectionId: string,
  modelId: string,
  inference: ReturnType<typeof inferCapabilities>,
  isManual: boolean
): Promise<void> {
  const supabase = await createUserClient();
  const row = {
    user_id: userId,
    provider_model_id: modelId,
    ...inference.fields,
    context_window_tokens: inference.fields.supports_streaming != null
      ? (await supabase
          .from("provider_models")
          .select("context_window_tokens, max_output_tokens")
          .eq("id", modelId)
          .maybeSingle()
          .then((r) => r.data as { context_window_tokens: number | null; max_output_tokens: number | null } | null)
        )?.context_window_tokens ?? null
      : null,
    capability_confidence: inference.confidence,
    capability_score: inference.score,
    capability_source: inference.source,
    capability_notes: inference.notes,
    metadata_evidence: inference.metadata_evidence,
    probe_evidence: inference.probe_evidence,
  };

  // For non-manual sources, do not write manual_overrides; the field
  // remains at its default `{}` for upsert.
  void isManual;

  // Upsert by unique(provider_model_id).
  const { error } = await supabase
    .from("model_capabilities")
    .upsert(row, { onConflict: "provider_model_id" });
  if (error) {
    // Non-fatal; record a warning via the calling run.
  }
}

async function findModelByDescriptor(
  userId: string,
  providerConnectionId: string,
  modelId: string
): Promise<string | null> {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("provider_models")
    .select("id")
    .eq("user_id", userId)
    .eq("provider_connection_id", providerConnectionId)
    .eq("provider_model_id", modelId)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function refreshProviderModels(
  providerConnectionId: string
): Promise<ActionResult<DiscoveryResult>> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message, code: err.code };
    }
    return { ok: false, error: "Not authenticated.", code: "unauthenticated" };
  }

  const provider = await loadProviderConnectionOrThrow(
    userId,
    providerConnectionId
  );

  // Create the run row up front.
  const supabase = await createUserClient();
  const { data: runRow, error: runErr } = await supabase
    .from("model_discovery_runs")
    .insert({
      user_id: userId,
      provider_connection_id: providerConnectionId,
      status: "running",
      triggered_by: "user",
      protocol: provider.protocol,
      base_url: provider.base_url,
      default_model: provider.default_model,
    })
    .select("id")
    .single();
  if (runErr || !runRow) {
    return {
      ok: false,
      error: `Could not start discovery: ${safeErrorMessage(runErr)}`,
      code: "db",
    };
  }
  const runId = (runRow as { id: string }).id;

  // Anthropic-compatible is not implemented yet.
  if ((provider.protocol as ProviderProtocol) === "anthropic-compatible") {
    await supabase
      .from("model_discovery_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        safe_summary: "Anthropic-compatible discovery is not implemented yet.",
        safe_error: "Anthropic-compatible discovery ships in a later prompt.",
        errors_count: 1,
      })
      .eq("id", runId);
    await recordEvent(
      runId,
      userId,
      providerConnectionId,
      "warning",
      "protocol_not_supported",
      "Anthropic-compatible discovery is not implemented yet.",
      null,
      null,
      { protocol: provider.protocol }
    );
    return {
      ok: false,
      error: "Anthropic-compatible discovery ships in a later prompt.",
      code: "unsupported_protocol",
    };
  }

  const apiKey = await readDecryptedSecret(providerConnectionId, userId);
  if (!apiKey) {
    await supabase
      .from("model_discovery_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        safe_summary: "No API key saved for this provider.",
        safe_error: "Add an API key first, then refresh models.",
        errors_count: 1,
      })
      .eq("id", runId);
    await recordEvent(
      runId,
      userId,
      providerConnectionId,
      "error",
      "missing_api_key",
      "No API key saved for this provider.",
      null,
      null,
      {}
    );
    return {
      ok: false,
      error: "No API key saved for this provider. Add a key first.",
      code: "no_key",
    };
  }

  // Normalize URL.
  const normalized = normalizeOpenAICompatibleUrl(provider.base_url);
  if (!normalized.ok) {
    await supabase
      .from("model_discovery_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        safe_summary: "Invalid base URL.",
        safe_error: normalized.message,
        errors_count: 1,
      })
      .eq("id", runId);
    await recordEvent(
      runId,
      userId,
      providerConnectionId,
      "error",
      "invalid_base_url",
      normalized.message,
      null,
      null,
      {}
    );
    return {
      ok: false,
      error: normalized.message,
      code: "invalid_url",
    };
  }

  // Step 1: try /models.
  let probe: ProbeResult | null = null;
  let modelsFromProvider: NormalizedModelDescriptor[] = [];
  let probeSucceeded = false;

  if (normalized.value.modelsUrl) {
    probe = await probeModels(apiKey, normalized.value.modelsUrl);
    if (probe.ok && probe.parsed && probe.parsed.ok) {
      modelsFromProvider = probe.parsed.models;
      probeSucceeded = true;
    }
    await recordEvent(
      runId,
      userId,
      providerConnectionId,
      probe.ok ? "info" : "warning",
      "probe_models",
      probe.ok
        ? `Discovered ${probe.parsed?.models.length ?? 0} model(s).`
        : `Provider /models endpoint did not return a usable list (HTTP ${probe.httpStatus ?? "n/a"}).`,
      probe.httpStatus,
      probe.latencyMs,
      { shape: probe.parsed?.shape ?? null }
    );
  }

  // Step 2: TokenRouter-style fallback. If we have a default model,
  // perform a tiny chat-completions ping and synthesize a model row
  // for it.
  let fallbackPingSucceeded = false;
  let fallbackLatency: number | null = null;
  if (
    (!probeSucceeded || modelsFromProvider.length === 0) &&
    provider.default_model
  ) {
    const ping = await probeChatCompletions(
      apiKey,
      normalized.value.chatCompletionsUrl,
      provider.default_model
    );
    fallbackPingSucceeded = ping.ok;
    fallbackLatency = ping.latencyMs;
    await recordEvent(
      runId,
      userId,
      providerConnectionId,
      ping.ok ? "info" : "warning",
      "fallback_chat_ping",
      ping.ok
        ? `Fallback chat-completions ping succeeded for ${provider.default_model}.`
        : `Fallback chat-completions ping failed (HTTP ${ping.httpStatus ?? "n/a"}).`,
      ping.httpStatus,
      ping.latencyMs,
      { default_model: provider.default_model }
    );
  }

  // Decide source of the synthesized list.
  let descriptorsToUpsert = modelsFromProvider;
  if (modelsFromProvider.length === 0 && provider.default_model) {
    descriptorsToUpsert = [
      fallbackDefaultDescriptor(provider.default_model, provider.base_url),
    ];
  }

  // Upsert models.
  const upsert = await upsertModels(
    userId,
    providerConnectionId,
    descriptorsToUpsert
  );

  // For each upserted model, infer capabilities and write a row.
  let capsWritten = 0;
  for (const d of descriptorsToUpsert) {
    const internalId = await findModelByDescriptor(
      userId,
      providerConnectionId,
      d.provider_model_id
    );
    if (!internalId) continue;
    const isFallback =
      modelsFromProvider.length === 0 &&
      d.provider_model_id === provider.default_model;
    const inference = inferCapabilities({
      descriptor: d,
      probeSuccess:
        isFallback && fallbackPingSucceeded
          ? true
          : !isFallback
            ? probeSucceeded
            : null,
      sourceHint: isFallback ? "fallback" : "metadata",
    });
    await upsertCapabilities(
      userId,
      providerConnectionId,
      internalId,
      inference,
      false
    );
    capsWritten++;
  }

  // Mark stale manual/discovered rows as unavailable only if a refresh
  // returned at least one model OR a fallback ping succeeded.
  let markedUnavailable = 0;
  if (probeSucceeded || fallbackPingSucceeded) {
    const seenIds = new Set(descriptorsToUpsert.map((d) => d.provider_model_id));
    const { data: existing, error: existingErr } = await supabase
      .from("provider_models")
      .select("id, provider_model_id, is_manual")
      .eq("user_id", userId)
      .eq("provider_connection_id", providerConnectionId);
    if (!existingErr && existing) {
      for (const row of existing as Array<{
        id: string;
        provider_model_id: string;
        is_manual: boolean;
      }>) {
        if (row.is_manual) continue; // never mark manual models unavailable
        if (seenIds.has(row.provider_model_id)) continue;
        await supabase
          .from("provider_models")
          .update({
            is_available: false,
            discovery_status: "unavailable",
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        markedUnavailable++;
      }
    }
  }

  const finalStatus =
    upsert.added + upsert.updated > 0
      ? probeSucceeded || fallbackPingSucceeded
        ? "success"
        : "partial"
      : "failed";
  const message =
    finalStatus === "success"
      ? `Discovered ${upsert.added + upsert.updated} model(s).`
      : finalStatus === "partial"
        ? "Discovery returned no models. Try a manual model add."
        : "No models discovered and no fallback ping succeeded.";

  const finalLatency =
    (probe?.latencyMs ?? 0) + (fallbackLatency ?? 0);

  await supabase
    .from("model_discovery_runs")
    .update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      models_found: modelsFromProvider.length,
      models_added: upsert.added,
      models_updated: upsert.updated,
      models_marked_unavailable: markedUnavailable,
      errors_count:
        (probe && !probe.ok ? 1 : 0) +
        (fallbackLatency != null && !fallbackPingSucceeded ? 1 : 0),
      request_latency_ms: finalLatency > 0 ? finalLatency : null,
      safe_summary: message,
      safe_error:
        (probe && !probe.ok && probeSucceeded === false && modelsFromProvider.length === 0)
          ? `Provider /models endpoint not available (HTTP ${probe.httpStatus ?? "n/a"}).`
          : null,
      raw_response_shape: probe?.parsed?.shape ?? null,
      metadata: {
        has_models_endpoint: !!normalized.value.modelsUrl,
        fallback_ping_attempted: fallbackLatency != null,
        fallback_ping_succeeded: fallbackPingSucceeded,
        caps_written: capsWritten,
      },
    })
    .eq("id", runId);

  const result: DiscoveryResult = {
    ok: finalStatus === "success" || finalStatus === "partial",
    status: finalStatus,
    runId,
    modelsFound: modelsFromProvider.length,
    modelsAdded: upsert.added,
    modelsUpdated: upsert.updated,
    modelsMarkedUnavailable: markedUnavailable,
    errorsCount:
      (probe && !probe.ok ? 1 : 0) +
      (fallbackLatency != null && !fallbackPingSucceeded ? 1 : 0),
    message,
  };
  return { ok: true, data: result };
}

// ============================================================================
// Manual model add
// ============================================================================
export async function addManualProviderModel(
  providerConnectionId: string,
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message, code: err.code };
    }
    return { ok: false, error: "Not authenticated.", code: "unauthenticated" };
  }
  const parsed = manualInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid manual model input.",
      code: "validation",
    };
  }
  const input: ManualModelInput = parsed.data;

  // Ownership / existence check before allowing the manual insert.
  await loadProviderConnectionOrThrow(userId, providerConnectionId);
  const supabase = await createUserClient();

  // Check for duplicates.
  const { data: existing } = await supabase
    .from("provider_models")
    .select("id")
    .eq("user_id", userId)
    .eq("provider_connection_id", providerConnectionId)
    .eq("provider_model_id", input.providerModelId)
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "A model with that id already exists for this provider.",
      code: "duplicate",
    };
  }

  const descriptor: NormalizedModelDescriptor = {
    provider_model_id: input.providerModelId,
    display_name: input.displayName ?? input.providerModelId,
    canonical_slug: input.providerModelId
      .toLowerCase()
      .replace(/[^a-z0-9._:-]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    model_family: input.providerModelId
      .toLowerCase()
      .match(/^[a-z0-9.\-]+/i)?.[0] ?? null,
    provider_owned_by: null,
    description: null,
    context_window_tokens: input.contextWindowTokens ?? null,
    max_output_tokens: input.maxOutputTokens ?? null,
    input_modalities: ["text"],
    output_modalities: ["text"],
    supported_parameters: [],
    pricing_prompt: null,
    pricing_completion: null,
    pricing_image: null,
    pricing_request: null,
    raw_provider_metadata: { source: "manual" },
  };

  const { data: row, error } = await supabase
    .from("provider_models")
    .insert({
      user_id: userId,
      provider_connection_id: providerConnectionId,
      provider_model_id: input.providerModelId,
      display_name: descriptor.display_name,
      canonical_slug: descriptor.canonical_slug,
      model_family: descriptor.model_family,
      source: "manual",
      discovery_status: "manual",
      is_available: true,
      is_manual: true,
      is_default_for_provider: false,
      context_window_tokens: descriptor.context_window_tokens,
      max_output_tokens: descriptor.max_output_tokens,
      input_modalities: descriptor.input_modalities,
      output_modalities: descriptor.output_modalities,
      supported_parameters: descriptor.supported_parameters,
      raw_provider_metadata: descriptor.raw_provider_metadata,
    })
    .select("id")
    .single();
  if (error || !row) {
    return {
      ok: false,
      error: `Could not add model: ${safeErrorMessage(error)}`,
      code: "db",
    };
  }
  const newId = (row as { id: string }).id;

  // Capabilities row.
  const inference = inferCapabilities({
    descriptor,
    probeSuccess: null,
    sourceHint: "manual",
  });
  // Apply manual overrides if provided.
  if (input.capabilityOverrides) {
    for (const [k, v] of Object.entries(input.capabilityOverrides)) {
      if (v === undefined) continue;
      // Only set true/false for known fields; everything else stays.
      const f = inference.fields as Record<string, boolean | null | undefined>;
      if (k in f) {
        f[k] = v as boolean;
      }
    }
  }
  await supabase.from("model_capabilities").upsert(
    {
      user_id: userId,
      provider_model_id: newId,
      ...inference.fields,
      capability_confidence: "manual",
      capability_score: 1.0,
      capability_source: "manual",
      capability_notes: "Manually added model.",
      metadata_evidence: { manual: true },
      probe_evidence: {},
      manual_overrides: input.capabilityOverrides ?? {},
    },
    { onConflict: "provider_model_id" }
  );

  // Set default if requested.
  if (input.isDefault) {
    await ensureSingleDefault(userId, providerConnectionId, newId);
    await supabase
      .from("provider_connections")
      .update({ default_model: input.providerModelId })
      .eq("id", providerConnectionId)
      .eq("user_id", userId);
  }

  return { ok: true, data: { id: newId } };
}

// ============================================================================
// Set default
// ============================================================================
export async function setProviderDefaultModel(
  providerConnectionId: string,
  providerModelInternalId: string
): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message, code: err.code };
    }
    return { ok: false, error: "Not authenticated.", code: "unauthenticated" };
  }

  const supabase = await createUserClient();
  // Verify ownership.
  const { data: row, error } = await supabase
    .from("provider_models")
    .select("id, provider_model_id, provider_connection_id")
    .eq("id", providerModelInternalId)
    .eq("user_id", userId)
    .eq("provider_connection_id", providerConnectionId)
    .maybeSingle();
  if (error || !row) {
    return {
      ok: false,
      error: "Model not found.",
      code: "not_found",
    };
  }
  const modelRow = row as { id: string; provider_model_id: string };

  await ensureSingleDefault(
    userId,
    providerConnectionId,
    modelRow.id
  );
  await supabase
    .from("provider_connections")
    .update({ default_model: modelRow.provider_model_id })
    .eq("id", providerConnectionId)
    .eq("user_id", userId);

  return { ok: true, data: { id: modelRow.id } };
}

// ============================================================================
// Delete manual model
// ============================================================================
export async function deleteManualProviderModel(
  providerConnectionId: string,
  providerModelInternalId: string
): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message, code: err.code };
    }
    return { ok: false, error: "Not authenticated.", code: "unauthenticated" };
  }
  const supabase = await createUserClient();
  const { data: row, error } = await supabase
    .from("provider_models")
    .select("id, is_manual")
    .eq("id", providerModelInternalId)
    .eq("user_id", userId)
    .eq("provider_connection_id", providerConnectionId)
    .maybeSingle();
  if (error || !row) {
    return { ok: false, error: "Model not found.", code: "not_found" };
  }
  const modelRow = row as { id: string; is_manual: boolean };
  if (!modelRow.is_manual) {
    return {
      ok: false,
      error: "Only manually-added models can be deleted from the catalog.",
      code: "not_manual",
    };
  }
  // Capabilities cascade via FK.
  const { error: delErr } = await supabase
    .from("provider_models")
    .delete()
    .eq("id", modelRow.id)
    .eq("user_id", userId);
  if (delErr) {
    return {
      ok: false,
      error: `Could not delete model: ${safeErrorMessage(delErr)}`,
      code: "db",
    };
  }
  return { ok: true, data: { id: modelRow.id } };
}

export { AuthError };
