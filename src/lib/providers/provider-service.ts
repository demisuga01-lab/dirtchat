// src/lib/providers/provider-service.ts
//
// Server-only provider service. Wraps the Supabase server client (for
// user-owned metadata) and the service-role admin client (for secret
// material). All public methods on this module return safe metadata only;
// the encrypted secret is never returned through the regular CRUD API.

import "server-only";
import { createClient as createUserClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  encryptSecret,
  secretLast4,
  secretHash,
} from "@/lib/security/provider-crypto";
import { redact, safeErrorMessage } from "@/lib/security/redact";
import {
  normalizeOpenAICompatibleUrl,
} from "@/lib/providers/url-normalize";
import {
  PRESETS,
  type PresetDefinition,
  type ProviderConnection,
  type ProviderProtocol,
  type ProviderSecretMeta,
  type ProviderStatus,
  type ProviderWithSecretMeta,
} from "@/lib/providers/types";
import { z } from "zod";
import { ServerConfigError } from "@/lib/env/server";

// ============================================================================
// Validation
// ============================================================================
const providerTypeSchema = z.enum([
  "tokenrouter",
  "openrouter",
  "openai",
  "anthropic",
  "custom",
]);
const protocolSchema = z.enum([
  "openai-compatible",
  "anthropic-compatible",
]);

const createInputSchema = z.object({
  label: z.string().trim().min(1, "Label is required.").max(120),
  providerType: providerTypeSchema,
  protocol: protocolSchema,
  baseUrl: z.string().trim().min(1, "Base URL is required.").max(2000),
  defaultModel: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  isEnabled: z.boolean().optional().default(true),
  presetId: z.string().optional(),
  apiKey: z.string().trim().min(1).max(2000).optional().or(z.literal("")),
});

const updateInputSchema = createInputSchema
  .omit({ apiKey: true })
  .partial();

const testInputSchema = z.object({
  baseUrl: z.string().trim().min(1).max(2000),
  protocol: protocolSchema,
  defaultModel: z.string().trim().max(200).optional().nullable(),
  apiKey: z.string().trim().min(1).max(2000),
});

export type CreateProviderInput = z.infer<typeof createInputSchema>;
export type UpdateProviderInput = z.infer<typeof updateInputSchema>;
export type TestConnectionInput = z.infer<typeof testInputSchema>;

// ============================================================================
// Public types returned to the UI
// ============================================================================
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export interface TestConnectionResult {
  ok: boolean;
  status: ProviderStatus;
  httpStatus: number | null;
  latencyMs: number;
  message: string;
  modelCount: number | null;
  safeProviderInfo: Record<string, unknown> | null;
}

// ============================================================================
// Helpers
// ============================================================================
function getPresetById(id: string | undefined): PresetDefinition | null {
  if (!id) return null;
  return PRESETS.find((p) => p.id === id) ?? null;
}

function applyPresetToInput(
  input: CreateProviderInput
): CreateProviderInput {
  const preset = getPresetById(input.presetId);
  if (!preset) return input;
  return {
    ...input,
    label: input.label?.trim() ? input.label : preset.label,
    providerType: preset.providerType,
    protocol: preset.protocol,
    baseUrl: input.baseUrl?.trim() ? input.baseUrl : preset.baseUrl,
    defaultModel: input.defaultModel?.trim()
      ? input.defaultModel
      : preset.defaultModel,
  };
}

async function requireUserId(): Promise<string> {
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new AuthError("You must be signed in to manage providers.");
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

class ConfigError extends Error {
  code = "config";
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

class NotFoundError extends Error {
  code = "not_found";
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// ============================================================================
// Read API
// ============================================================================
export async function listProviders(): Promise<ProviderWithSecretMeta[]> {
  const userId = await requireUserId();
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("provider_connections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Could not list providers: ${safeErrorMessage(error)}`);
  }
  const rows = (data ?? []) as ProviderConnection[];

  // Fetch secret metadata (without the encrypted_secret) via the admin
  // client. We use a left-join style by selecting only the safe fields.
  const ids = rows.map((r) => r.id);
  const secretByConn = new Map<string, ProviderSecretMeta>();
  if (ids.length > 0) {
    const admin = createAdminClient();
    const { data: secrets, error: secretsError } = await admin
      .from("provider_connection_secrets")
      .select(
        "provider_connection_id, key_last4, key_hash, encryption_version, updated_at"
      )
      .eq("user_id", userId)
      .in("provider_connection_id", ids);
    if (secretsError) {
      // Non-fatal: we still want to show the connection list.
      // eslint-disable-next-line no-console
      console.warn(
        "[provider-service] could not read secret meta:",
        redact(secretsError.message)
      );
    } else {
      for (const s of secrets ?? []) {
        secretByConn.set(s.provider_connection_id as string, {
          provider_connection_id: s.provider_connection_id as string,
          has_secret: true,
          key_last4: (s.key_last4 as string | null) ?? null,
          key_hash: (s.key_hash as string | null) ?? null,
          encryption_version: (s.encryption_version as number | null) ?? 1,
          updated_at: (s.updated_at as string | null) ?? null,
        });
      }
    }
  }
  return rows.map((r) => ({
    ...r,
    secret: secretByConn.get(r.id) ?? null,
  }));
}

export async function getProvider(
  id: string
): Promise<ProviderWithSecretMeta> {
  const userId = await requireUserId();
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("provider_connections")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new Error(`Could not read provider: ${safeErrorMessage(error)}`);
  }
  if (!data) {
    throw new NotFoundError("Provider connection not found.");
  }
  const admin = createAdminClient();
  const { data: secretRow, error: secretErr } = await admin
    .from("provider_connection_secrets")
    .select(
      "provider_connection_id, key_last4, key_hash, encryption_version, updated_at"
    )
    .eq("provider_connection_id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (secretErr) {
    // non-fatal
    // eslint-disable-next-line no-console
    console.warn(
      "[provider-service] could not read secret meta:",
      redact(secretErr.message)
    );
  }
  const secret: ProviderSecretMeta | null = secretRow
    ? {
        provider_connection_id: secretRow.provider_connection_id as string,
        has_secret: true,
        key_last4: (secretRow.key_last4 as string | null) ?? null,
        key_hash: (secretRow.key_hash as string | null) ?? null,
        encryption_version:
          (secretRow.encryption_version as number | null) ?? 1,
        updated_at: (secretRow.updated_at as string | null) ?? null,
      }
    : null;
  return { ...(data as ProviderConnection), secret };
}

// ============================================================================
// Write API — metadata
// ============================================================================
export async function createProvider(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  let input: CreateProviderInput;
  try {
    const parsed = createInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        ok: false,
        error: issue?.message ?? "Invalid provider input.",
        code: "validation",
      };
    }
    input = applyPresetToInput(parsed.data);
  } catch (err) {
    return { ok: false, error: safeErrorMessage(err), code: "validation" };
  }

  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message, code: err.code };
    }
    throw err;
  }

  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("provider_connections")
    .insert({
      user_id: userId,
      label: input.label,
      provider_type: input.providerType,
      protocol: input.protocol,
      base_url: input.baseUrl,
      default_model: input.defaultModel || null,
      notes: input.notes || null,
      is_enabled: input.isEnabled ?? true,
      status: "untested",
    })
    .select("id")
    .single();
  if (error || !data) {
    return {
      ok: false,
      error: `Could not create provider: ${safeErrorMessage(error)}`,
      code: "db",
    };
  }

  const newId = (data as { id: string }).id;

  if (input.apiKey) {
    const secretResult = await setSecretInternal(newId, userId, input.apiKey);
    if (!secretResult.ok) {
      // Roll back metadata insert to keep state consistent.
      await supabase.from("provider_connections").delete().eq("id", newId);
      return secretResult;
    }
  }

  return { ok: true, data: { id: newId } };
}

export async function updateProvider(
  id: string,
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message, code: err.code };
    }
    throw err;
  }

  let input: UpdateProviderInput;
  try {
    const parsed = updateInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid provider input.",
        code: "validation",
      };
    }
    input = parsed.data;
  } catch (err) {
    return { ok: false, error: safeErrorMessage(err), code: "validation" };
  }

  const supabase = await createUserClient();
  const update: Record<string, unknown> = {};
  if (input.label !== undefined) update.label = input.label;
  if (input.providerType !== undefined) update.provider_type = input.providerType;
  if (input.protocol !== undefined) update.protocol = input.protocol;
  if (input.baseUrl !== undefined) update.base_url = input.baseUrl;
  if (input.defaultModel !== undefined)
    update.default_model = input.defaultModel || null;
  if (input.notes !== undefined) update.notes = input.notes || null;
  if (input.isEnabled !== undefined) update.is_enabled = input.isEnabled;
  if (Object.keys(update).length > 0) {
    const { error } = await supabase
      .from("provider_connections")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      return {
        ok: false,
        error: `Could not update provider: ${safeErrorMessage(error)}`,
        code: "db",
      };
    }
  }

  return { ok: true, data: { id } };
}

export async function deleteProvider(
  id: string
): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message, code: err.code };
    }
    throw err;
  }

  const supabase = await createUserClient();
  // RLS + cascade will remove the secret row as well.
  const { error } = await supabase
    .from("provider_connections")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    return {
      ok: false,
      error: `Could not delete provider: ${safeErrorMessage(error)}`,
      code: "db",
    };
  }
  return { ok: true, data: { id } };
}

// ============================================================================
// Write API — secrets
// ============================================================================
async function setSecretInternal(
  providerConnectionId: string,
  userId: string,
  plaintext: string
): Promise<ActionResult<{ id: string }>> {
  if (!plaintext) {
    return { ok: false, error: "API key is empty.", code: "validation" };
  }
  const admin = createAdminClient();
  let encrypted: string;
  let last4: string;
  let hash: string;
  try {
    encrypted = encryptSecret(plaintext);
    last4 = secretLast4(plaintext);
    hash = secretHash(plaintext);
  } catch (err) {
    if (err instanceof ServerConfigError) {
      return { ok: false, error: err.message, code: "config" };
    }
    return {
      ok: false,
      error: "Could not encrypt API key.",
      code: "crypto",
    };
  }
  // Upsert by (provider_connection_id, secret_kind). The unique index
  // already enforces this.
  const { error } = await admin
    .from("provider_connection_secrets")
    .upsert(
      {
        provider_connection_id: providerConnectionId,
        user_id: userId,
        secret_kind: "api_key",
        encrypted_secret: encrypted,
        encryption_version: 1,
        key_last4: last4,
        key_hash: hash,
      },
      { onConflict: "provider_connection_id,secret_kind" }
    );
  if (error) {
    return {
      ok: false,
      error: `Could not save API key: ${safeErrorMessage(error)}`,
      code: "db",
    };
  }
  return { ok: true, data: { id: providerConnectionId } };
}

/**
 * Public wrapper used by server actions. Verifies ownership before
 * writing.
 */
export async function setSecret(
  providerConnectionId: string,
  plaintext: string
): Promise<ActionResult<{ id: string }>> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: err.message, code: err.code };
    }
    throw err;
  }
  // Ownership check.
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("provider_connections")
    .select("id")
    .eq("id", providerConnectionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    return {
      ok: false,
      error: `Ownership check failed: ${safeErrorMessage(error)}`,
      code: "db",
    };
  }
  if (!data) {
    return { ok: false, error: "Provider connection not found.", code: "not_found" };
  }
  return setSecretInternal(providerConnectionId, userId, plaintext);
}

// ============================================================================
// Test connection
// ============================================================================
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
    const { decryptSecret } = await import("@/lib/security/provider-crypto");
    return decryptSecret((data as { encrypted_secret: string }).encrypted_secret);
  } catch {
    return null;
  }
}

async function recordTestResult(
  providerConnectionId: string,
  userId: string,
  result: TestConnectionResult
): Promise<void> {
  const supabase = await createUserClient();
  const safeError =
    result.status === "valid" || result.status === "untested"
      ? null
      : result.message && result.message.length > 200
        ? result.message.slice(0, 200)
        : result.message;
  await supabase
    .from("provider_connections")
    .update({
      status: result.status,
      last_tested_at: new Date().toISOString(),
      last_test_status: result.status,
      last_test_latency_ms: result.latencyMs,
      last_test_error: safeError,
    })
    .eq("id", providerConnectionId)
    .eq("user_id", userId);
}

export async function testConnection(
  providerConnectionId: string,
  rawInput?: Partial<TestConnectionInput>
): Promise<TestConnectionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    return {
      ok: false,
      status: "error",
      httpStatus: null,
      latencyMs: 0,
      message: err instanceof Error ? err.message : "Not authenticated.",
      modelCount: null,
      safeProviderInfo: null,
    };
  }

  // Load connection metadata.
  const supabase = await createUserClient();
  const { data: conn, error: connError } = await supabase
    .from("provider_connections")
    .select("*")
    .eq("id", providerConnectionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (connError || !conn) {
    return {
      ok: false,
      status: "invalid",
      httpStatus: null,
      latencyMs: 0,
      message: "Provider connection not found.",
      modelCount: null,
      safeProviderInfo: null,
    };
  }
  const connRow = conn as ProviderConnection;

  // Resolve effective inputs: prefer rawInput (for unsaved form tests) over saved.
  const baseUrl = (rawInput?.baseUrl ?? connRow.base_url ?? "").trim();
  const protocol: ProviderProtocol =
    (rawInput?.protocol as ProviderProtocol) ?? (connRow.protocol as ProviderProtocol);
  const defaultModel =
    (rawInput?.defaultModel ?? connRow.default_model ?? "").trim() || null;

  let apiKey = "";
  if (rawInput?.apiKey) {
    apiKey = rawInput.apiKey;
  } else {
    const decrypted = await readDecryptedSecret(providerConnectionId, userId);
    if (!decrypted) {
      const result: TestConnectionResult = {
        ok: false,
        status: "error",
        httpStatus: null,
        latencyMs: 0,
        message:
          "No API key is saved for this provider. Add a key first, then test.",
        modelCount: null,
        safeProviderInfo: null,
      };
      await recordTestResult(providerConnectionId, userId, result);
      return result;
    }
    apiKey = decrypted;
  }

  // Validate input shape (without leaking the key).
  const inputCheck = testInputSchema.safeParse({
    baseUrl,
    protocol,
    defaultModel,
    apiKey,
  });
  if (!inputCheck.success) {
    const result: TestConnectionResult = {
      ok: false,
      status: "invalid",
      httpStatus: null,
      latencyMs: 0,
      message: inputCheck.error.issues[0]?.message ?? "Invalid test input.",
      modelCount: null,
      safeProviderInfo: null,
    };
    await recordTestResult(providerConnectionId, userId, result);
    return result;
  }

  if (protocol === "anthropic-compatible") {
    const result: TestConnectionResult = {
      ok: false,
      status: "untested",
      httpStatus: null,
      latencyMs: 0,
      message:
        "Anthropic-compatible test support ships in a later prompt. Save the connection for now.",
      modelCount: null,
      safeProviderInfo: null,
    };
    await recordTestResult(providerConnectionId, userId, result);
    return result;
  }

  const normalized = normalizeOpenAICompatibleUrl(baseUrl);
  if (!normalized.ok) {
    const result: TestConnectionResult = {
      ok: false,
      status: "invalid",
      httpStatus: null,
      latencyMs: 0,
      message: normalized.message,
      modelCount: null,
      safeProviderInfo: null,
    };
    await recordTestResult(providerConnectionId, userId, result);
    return result;
  }

  const result = await runOpenAICompatibleProbe({
    apiKey,
    apiRootUrl: normalized.value.apiRootUrl,
    chatCompletionsUrl: normalized.value.chatCompletionsUrl,
    modelsUrl: normalized.value.modelsUrl,
    defaultModel,
  });

  await recordTestResult(providerConnectionId, userId, result);
  return result;
}

// ============================================================================
// Probe implementation
// ============================================================================
interface ProbeArgs {
  apiKey: string;
  apiRootUrl: string;
  chatCompletionsUrl: string;
  modelsUrl: string | null;
  defaultModel: string | null;
}

const DEFAULT_TIMEOUT_MS = 8000;

async function timedFetch(
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

async function runOpenAICompatibleProbe(
  args: ProbeArgs
): Promise<TestConnectionResult> {
  const authHeaders = {
    Authorization: `Bearer ${args.apiKey}`,
    "Content-Type": "application/json",
  };

  // 1. Try /models if we can derive a URL.
  if (args.modelsUrl) {
    try {
      const { response, latencyMs } = await timedFetch(
        args.modelsUrl,
        { method: "GET", headers: authHeaders },
        DEFAULT_TIMEOUT_MS
      );
      if (response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { data?: unknown[]; models?: unknown[] }
          | null;
        const models =
          (body && Array.isArray(body.data) && body.data) ||
          (body && Array.isArray(body.models) && body.models) ||
          [];
        const modelCount = models.length;
        const defaultPresent =
          args.defaultModel != null &&
          models.some((m) => {
            if (m && typeof m === "object") {
              const id = (m as { id?: unknown }).id;
              return typeof id === "string" && id === args.defaultModel;
            }
            return false;
          });
        return {
          ok: true,
          status: "valid",
          httpStatus: response.status,
          latencyMs,
          message: defaultPresent
            ? `Connected. ${modelCount} model(s) available; default model present.`
            : `Connected. ${modelCount} model(s) available.`,
          modelCount,
          safeProviderInfo: { defaultModelPresent: !!defaultPresent },
        };
      }
      // If /models gave a non-2xx (e.g. 401/404/405), fall through to a
      // chat-completions ping if a default model is configured.
      if (response.status === 401 || response.status === 403) {
        return {
          ok: false,
          status: "invalid",
          httpStatus: response.status,
          latencyMs,
          message: "Authentication failed. Check the API key.",
          modelCount: null,
          safeProviderInfo: null,
        };
      }
    } catch (err) {
      // Network error: continue to chat-completions ping.
      // eslint-disable-next-line no-console
      console.warn(
        "[provider-service] /models probe failed, falling back:",
        redact(err instanceof Error ? err.message : err)
      );
    }
  }

  // 2. Fall back to a tiny chat-completions ping if a default model is
  // configured. Use a single-token response to keep the request tiny.
  if (!args.defaultModel) {
    return {
      ok: false,
      status: "untested",
      httpStatus: null,
      latencyMs: 0,
      message:
        "Could not list models and no default model is set. Set a default model and try again.",
      modelCount: null,
      safeProviderInfo: null,
    };
  }

  try {
    const { response, latencyMs } = await timedFetch(
      args.chatCompletionsUrl,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          model: args.defaultModel,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
          temperature: 0,
          stream: false,
        }),
      },
      DEFAULT_TIMEOUT_MS
    );
    if (response.ok) {
      return {
        ok: true,
        status: "valid",
        httpStatus: response.status,
        latencyMs,
        message: "Connected. Chat completions responded successfully.",
        modelCount: null,
        safeProviderInfo: null,
      };
    }
    let safeBody = "";
    try {
      const text = await response.text();
      safeBody = text.length > 200 ? text.slice(0, 200) : text;
    } catch {
      // ignore
    }
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        status: "invalid",
        httpStatus: response.status,
        latencyMs,
        message: `Authentication failed (HTTP ${response.status}). Check the API key.`,
        modelCount: null,
        safeProviderInfo: null,
      };
    }
    if (response.status === 404) {
      return {
        ok: false,
        status: "invalid",
        httpStatus: response.status,
        latencyMs,
        message: `Provider returned 404 for chat-completions. Verify the base URL.`,
        modelCount: null,
        safeProviderInfo: null,
      };
    }
    return {
      ok: false,
      status: "error",
      httpStatus: response.status,
      latencyMs,
      message: `Provider responded with HTTP ${response.status}. ${redact(safeBody)}`.trim(),
      modelCount: null,
      safeProviderInfo: null,
    };
  } catch (err) {
    return {
      ok: false,
      status: "error",
      httpStatus: null,
      latencyMs: 0,
      message: `Could not reach provider: ${redact(err instanceof Error ? err.message : err)}`,
      modelCount: null,
      safeProviderInfo: null,
    };
  }
}

export { ConfigError, NotFoundError, AuthError };
