// src/lib/models/model-normalize.ts
//
// Provider response normalization. The output is a safe, bounded list
// of normalized model descriptors. No secrets, no Authorization headers,
// no raw response bodies.
//
// Supported shapes:
//   * OpenAI:     { data: [{ id, owned_by, ... }] }
//   * OpenRouter: { data: [{ id, name, description, context_length,
//                            architecture: { input_modalities, output_modalities },
//                            top_provider, supported_parameters, pricing, ... }] }
//   * Generic:    [{ id, name, ... }]  or  { models: [{ id, ... }] }
//
// All parse errors are caught and returned as safe events; the parser
// never throws. Counts and metadata sizes are capped.

import { redact } from "@/lib/security/redact";

export interface NormalizedModelDescriptor {
  provider_model_id: string;
  display_name: string | null;
  canonical_slug: string | null;
  model_family: string | null;
  provider_owned_by: string | null;
  description: string | null;
  context_window_tokens: number | null;
  max_output_tokens: number | null;
  input_modalities: string[];
  output_modalities: string[];
  supported_parameters: string[];
  pricing_prompt: string | null;
  pricing_completion: string | null;
  pricing_image: string | null;
  pricing_request: string | null;
  raw_provider_metadata: Record<string, unknown>;
}

export interface NormalizeResult {
  ok: boolean;
  models: NormalizedModelDescriptor[];
  shape: "openai" | "openrouter" | "array" | "unknown";
  errorMessage: string | null;
}

const MAX_MODELS = Number.parseInt(
  process.env.MODEL_DISCOVERY_MAX_MODELS_PER_RUN ?? "500",
  10
);
const MAX_STRING = 4_000; // 4 KB per string field
const MAX_OBJECT_KEYS = 80; // per raw_provider_metadata object
const MAX_NESTED_DEPTH = 6; // metadata depth

function asString(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function asStringArray(v: unknown, max = 32): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    if (typeof item !== "string") continue;
    const s = item.trim();
    if (!s) continue;
    out.push(s.length > 64 ? s.slice(0, 64) : s);
    if (out.length >= max) break;
  }
  return out;
}

function canonicalizeSlug(id: string): string {
  return id
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function modelFamilyFromId(id: string): string | null {
  const lower = id.toLowerCase();
  // Common family signals.
  const tokens = [
    "gpt-4o",
    "gpt-4",
    "gpt-3.5",
    "claude-3",
    "claude-2",
    "claude-instant",
    "gemini",
    "llama-3",
    "llama-2",
    "mistral",
    "mixtral",
    "qwen",
    "deepseek",
    "command",
    "grok",
    "minimax",
    "m3",
  ];
  for (const t of tokens) {
    if (lower.includes(t)) return t;
  }
  // Fallback: leading family up to first `-` or `:`
  const m = id.match(/^[a-z0-9.\-]+/i);
  return m ? m[0].toLowerCase() : null;
}

function capAndRedactMetadata(
  input: unknown,
  depth = 0
): Record<string, unknown> {
  if (depth > MAX_NESTED_DEPTH) return {};
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return input == null ? {} : { value: redact(input) };
  }
  const obj = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  let keys = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (keys >= MAX_OBJECT_KEYS) break;
    if (typeof k !== "string" || k.length === 0 || k.length > 80) continue;
    // Skip keys whose name hints at secrets or that are known
    // sensitive. Never store Authorization, key, secret, etc.
    const lower = k.toLowerCase();
    if (
      lower.includes("authorization") ||
      lower.includes("api_key") ||
      lower.includes("apikey") ||
      lower === "secret" ||
      lower === "password" ||
      lower.includes("service_role")
    ) {
      continue;
    }
    if (v == null) {
      out[k] = null;
    } else if (typeof v === "string") {
      out[k] = v.length > MAX_STRING ? v.slice(0, MAX_STRING) : v;
    } else if (typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else if (Array.isArray(v)) {
      out[k] = v
        .slice(0, 32)
        .map((item) =>
          typeof item === "string"
            ? item.length > MAX_STRING
              ? item.slice(0, MAX_STRING)
              : item
            : item
        );
    } else if (typeof v === "object") {
      out[k] = capAndRedactMetadata(v, depth + 1);
    }
    keys++;
  }
  return out;
}

function isOpenRouterShape(value: unknown): value is {
  data: Array<Record<string, unknown>>;
} {
  if (!value || typeof value !== "object") return false;
  const data = (value as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length === 0) return false;
  const first = data[0];
  if (!first || typeof first !== "object") return false;
  const keys = Object.keys(first);
  return (
    keys.includes("id") &&
    (keys.includes("architecture") ||
      keys.includes("context_length") ||
      keys.includes("supported_parameters") ||
      keys.includes("pricing"))
  );
}

function isOpenAIShape(value: unknown): value is {
  data: Array<Record<string, unknown>>;
} {
  if (!value || typeof value !== "object") return false;
  const data = (value as { data?: unknown }).data;
  if (!Array.isArray(data)) return false;
  return data.every(
    (m) => m && typeof m === "object" && typeof (m as { id?: unknown }).id === "string"
  );
}

function isArrayShape(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.length > 0;
}

function isObjectWithModels(
  value: unknown
): value is { models: Array<Record<string, unknown>> } {
  if (!value || typeof value !== "object") return false;
  const models = (value as { models?: unknown }).models;
  return (
    Array.isArray(models) &&
    models.length > 0 &&
    models.every(
      (m) => m && typeof m === "object" && typeof (m as { id?: unknown }).id === "string"
    )
  );
}

function normalizeOpenRouterEntry(
  entry: Record<string, unknown>
): NormalizedModelDescriptor {
  const id = asString(entry.id, 200) ?? "";
  const arch = (entry.architecture as Record<string, unknown> | undefined) ?? {};
  const top = (entry.top_provider as Record<string, unknown> | undefined) ?? {};
  const pricing = (entry.pricing as Record<string, unknown> | undefined) ?? {};
  const inputModalities = asStringArray(arch.input_modalities);
  const outputModalities = asStringArray(arch.output_modalities);
  const supportedParams = asStringArray(entry.supported_parameters);
  return {
    provider_model_id: id,
    display_name: asString(entry.name, 200),
    canonical_slug: id ? canonicalizeSlug(id) : null,
    model_family: id ? modelFamilyFromId(id) : null,
    provider_owned_by: asString(entry.owned_by, 80),
    description: asString(entry.description, MAX_STRING),
    context_window_tokens: asNumber(entry.context_length),
    max_output_tokens: asNumber(top.max_completion_tokens),
    input_modalities: inputModalities.length > 0 ? inputModalities : ["text"],
    output_modalities: outputModalities.length > 0 ? outputModalities : ["text"],
    supported_parameters: supportedParams,
    pricing_prompt: asString(pricing.prompt, 64),
    pricing_completion: asString(pricing.completion, 64),
    pricing_image: asString(pricing.image, 64),
    pricing_request: asString(pricing.request, 64),
    raw_provider_metadata: capAndRedactMetadata(entry),
  };
}

function normalizeOpenAIEntry(
  entry: Record<string, unknown>
): NormalizedModelDescriptor {
  const id = asString(entry.id, 200) ?? "";
  return {
    provider_model_id: id,
    display_name: asString(entry.id, 200),
    canonical_slug: id ? canonicalizeSlug(id) : null,
    model_family: id ? modelFamilyFromId(id) : null,
    provider_owned_by: asString(entry.owned_by, 80),
    description: null,
    context_window_tokens: null,
    max_output_tokens: null,
    input_modalities: ["text"],
    output_modalities: ["text"],
    supported_parameters: [],
    pricing_prompt: null,
    pricing_completion: null,
    pricing_image: null,
    pricing_request: null,
    raw_provider_metadata: capAndRedactMetadata(entry),
  };
}

function normalizeGenericEntry(
  entry: Record<string, unknown>
): NormalizedModelDescriptor {
  const id = asString(entry.id, 200) ?? "";
  return {
    provider_model_id: id,
    display_name:
      asString(entry.name, 200) ??
      asString(entry.display_name, 200) ??
      asString(entry.id, 200),
    canonical_slug: id ? canonicalizeSlug(id) : null,
    model_family: id ? modelFamilyFromId(id) : null,
    provider_owned_by: asString(entry.owned_by, 80),
    description: asString(entry.description, MAX_STRING),
    context_window_tokens: null,
    max_output_tokens: null,
    input_modalities: ["text"],
    output_modalities: ["text"],
    supported_parameters: [],
    pricing_prompt: null,
    pricing_completion: null,
    pricing_image: null,
    pricing_request: null,
    raw_provider_metadata: capAndRedactMetadata(entry),
  };
}

/**
 * Parse a provider response body into a bounded list of normalized model
 * descriptors. Never throws; returns ok=false on parse failure.
 */
export function normalizeProviderModelsResponse(
  raw: unknown
): NormalizeResult {
  if (raw == null) {
    return { ok: false, models: [], shape: "unknown", errorMessage: "empty body" };
  }

  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch (err) {
      return {
        ok: false,
        models: [],
        shape: "unknown",
        errorMessage: `could not parse JSON (${redact(
          err instanceof Error ? err.message : err
        )})`,
      };
    }
  }

  if (isOpenRouterShape(value)) {
    const out: NormalizedModelDescriptor[] = [];
    for (const entry of value.data) {
      const id = asString(entry.id, 200);
      if (!id) continue;
      out.push(normalizeOpenRouterEntry(entry));
      if (out.length >= MAX_MODELS) break;
    }
    return { ok: true, models: out, shape: "openrouter", errorMessage: null };
  }

  if (isOpenAIShape(value)) {
    const out: NormalizedModelDescriptor[] = [];
    for (const entry of value.data) {
      const id = asString(entry.id, 200);
      if (!id) continue;
      out.push(normalizeOpenAIEntry(entry));
      if (out.length >= MAX_MODELS) break;
    }
    return { ok: true, models: out, shape: "openai", errorMessage: null };
  }

  if (isArrayShape(value)) {
    const out: NormalizedModelDescriptor[] = [];
    for (const entry of value) {
      const id = asString(entry.id, 200);
      if (!id) continue;
      out.push(normalizeGenericEntry(entry));
      if (out.length >= MAX_MODELS) break;
    }
    return { ok: true, models: out, shape: "array", errorMessage: null };
  }

  if (isObjectWithModels(value)) {
    const out: NormalizedModelDescriptor[] = [];
    for (const entry of (value as { models: Array<Record<string, unknown>> }).models) {
      const id = asString(entry.id, 200);
      if (!id) continue;
      out.push(normalizeGenericEntry(entry));
      if (out.length >= MAX_MODELS) break;
    }
    return { ok: true, models: out, shape: "array", errorMessage: null };
  }

  return {
    ok: false,
    models: [],
    shape: "unknown",
    errorMessage: "response did not match any known model-list shape",
  };
}

/**
 * Build a minimal, safe fallback descriptor for a manual / fallback
 * default model (no provider metadata available).
 */
export function fallbackDefaultDescriptor(
  modelId: string,
  baseUrl: string | null
): NormalizedModelDescriptor {
  return {
    provider_model_id: modelId,
    display_name: modelId,
    canonical_slug: canonicalizeSlug(modelId),
    model_family: modelFamilyFromId(modelId),
    provider_owned_by: null,
    description: null,
    context_window_tokens: null,
    max_output_tokens: null,
    input_modalities: ["text"],
    output_modalities: ["text"],
    supported_parameters: [],
    pricing_prompt: null,
    pricing_completion: null,
    pricing_image: null,
    pricing_request: null,
    raw_provider_metadata: { source: "fallback_default", base_url: baseUrl },
  };
}
