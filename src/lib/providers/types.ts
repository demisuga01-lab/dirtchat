// src/lib/providers/types.ts
//
// Shared provider types. Safe to import from both client and server code.

export const PROVIDER_TYPES = [
  "tokenrouter",
  "openrouter",
  "openai",
  "anthropic",
  "custom",
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const PROTOCOLS = [
  "openai-compatible",
  "anthropic-compatible",
] as const;

export type ProviderProtocol = (typeof PROTOCOLS)[number];

export const PROVIDER_STATUSES = [
  "untested",
  "valid",
  "invalid",
  "error",
  "disabled",
] as const;

export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

export interface ProviderConnection {
  id: string;
  user_id: string;
  label: string;
  provider_type: ProviderType;
  protocol: ProviderProtocol;
  base_url: string;
  default_model: string | null;
  notes: string | null;
  is_enabled: boolean;
  status: ProviderStatus;
  last_tested_at: string | null;
  last_test_status: ProviderStatus | null;
  last_test_latency_ms: number | null;
  last_test_error: string | null;
  safe_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProviderSecretMeta {
  provider_connection_id: string;
  has_secret: boolean;
  key_last4: string | null;
  key_hash: string | null;
  encryption_version: number;
  updated_at: string | null;
}

export type ProviderWithSecretMeta = ProviderConnection & {
  secret: ProviderSecretMeta | null;
};

export interface PresetDefinition {
  id: string;
  label: string;
  providerType: ProviderType;
  protocol: ProviderProtocol;
  baseUrl: string;
  defaultModel: string;
  description: string;
}

export const PRESETS: PresetDefinition[] = [
  {
    id: "tokenrouter-minimax-m3",
    label: "TokenRouter (MiniMax-M3)",
    providerType: "tokenrouter",
    protocol: "openai-compatible",
    baseUrl: "https://api.tokenrouter.com/v1/chat/completions",
    defaultModel: "MiniMax-M3",
    description:
      "Recommended preset. TokenRouter with the MiniMax-M3 model on the OpenAI-compatible chat completions endpoint.",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    providerType: "openrouter",
    protocol: "openai-compatible",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "",
    description:
      "OpenAI-compatible multi-provider router. Set a default model after connection.",
  },
  {
    id: "openai-compatible",
    label: "OpenAI-compatible custom",
    providerType: "custom",
    protocol: "openai-compatible",
    baseUrl: "",
    defaultModel: "",
    description:
      "Any OpenAI-compatible endpoint, including self-hosted routers and proxies.",
  },
  {
    id: "anthropic-compatible",
    label: "Anthropic-compatible custom",
    providerType: "custom",
    protocol: "anthropic-compatible",
    baseUrl: "",
    defaultModel: "",
    description:
      "Anthropic-style Messages API. Connection testing ships in a later prompt.",
  },
];
