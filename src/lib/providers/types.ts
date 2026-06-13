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

  // Rich metadata extensions
  companyName?: string;
  category?: "popular" | "direct" | "router" | "local" | "custom";
  apiStyle?: ProviderProtocol;
  docsUrl?: string;
  authHeaderType?: "bearer" | "custom" | "none";
  modelDiscoveryType?: "v1-models" | "openrouter" | "anthropic" | "none";
  supportsStreaming?: boolean;
  supportsCustomModels?: boolean;
  logoKey?: string;
  shortDescription?: string;
  setupHint?: string;
  isPopular?: boolean;
  isRouter?: boolean;
  isDirectProvider?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

import { PRESETS } from "./provider-presets";
export { PRESETS };
