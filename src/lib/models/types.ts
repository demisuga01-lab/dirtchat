// src/lib/models/types.ts
//
// Shared model discovery / capability types. Safe to import from both
// client and server code (no secrets, no server-only imports).

export const MODEL_SOURCES = [
  "discovered",
  "manual",
  "fallback_default",
  "imported",
] as const;
export type ModelSource = (typeof MODEL_SOURCES)[number];

export const MODEL_DISCOVERY_STATUSES = [
  "available",
  "unavailable",
  "unknown",
  "error",
  "manual",
] as const;
export type ModelDiscoveryStatus = (typeof MODEL_DISCOVERY_STATUSES)[number];

export const CAPABILITY_CONFIDENCE = [
  "unknown",
  "low",
  "medium",
  "high",
  "manual",
] as const;
export type CapabilityConfidence = (typeof CAPABILITY_CONFIDENCE)[number];

export const CAPABILITY_SOURCES = [
  "unknown",
  "metadata",
  "probe",
  "metadata_and_probe",
  "manual",
  "provider_default",
  "fallback_default",
] as const;
export type CapabilitySource = (typeof CAPABILITY_SOURCES)[number];

export const DISCOVERY_RUN_STATUSES = [
  "running",
  "success",
  "partial",
  "failed",
  "cancelled",
] as const;
export type DiscoveryRunStatus = (typeof DISCOVERY_RUN_STATUSES)[number];

export const DISCOVERY_EVENT_LEVELS = [
  "debug",
  "info",
  "warning",
  "error",
] as const;
export type DiscoveryEventLevel = (typeof DISCOVERY_EVENT_LEVELS)[number];

export interface ProviderModel {
  id: string;
  user_id: string;
  provider_connection_id: string;
  provider_model_id: string;
  display_name: string | null;
  canonical_slug: string | null;
  model_family: string | null;
  provider_owned_by: string | null;
  description: string | null;
  source: ModelSource;
  discovery_status: ModelDiscoveryStatus;
  is_available: boolean;
  is_manual: boolean;
  is_default_for_provider: boolean;
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
  normalized_metadata: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModelCapabilities {
  id: string;
  user_id: string;
  provider_model_id: string;
  supports_text_input: boolean | null;
  supports_text_output: boolean | null;
  supports_image_input: boolean | null;
  supports_file_input: boolean | null;
  supports_audio_input: boolean | null;
  supports_audio_output: boolean | null;
  supports_video_input: boolean | null;
  supports_streaming: boolean | null;
  supports_tool_calling: boolean | null;
  supports_parallel_tool_calling: boolean | null;
  supports_json_mode: boolean | null;
  supports_structured_outputs: boolean | null;
  supports_function_calling: boolean | null;
  supports_reasoning: boolean | null;
  supports_reasoning_effort: boolean | null;
  supports_reasoning_tokens: boolean | null;
  supports_reasoning_exclude: boolean | null;
  supports_system_messages: boolean | null;
  supports_temperature: boolean | null;
  supports_top_p: boolean | null;
  supports_stop_sequences: boolean | null;
  supports_response_format: boolean | null;
  context_window_tokens: number | null;
  max_output_tokens: number | null;
  capability_confidence: CapabilityConfidence;
  capability_score: number;
  capability_source: CapabilitySource;
  capability_notes: string | null;
  metadata_evidence: Record<string, unknown>;
  probe_evidence: Record<string, unknown>;
  manual_overrides: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProviderModelWithCapabilities extends ProviderModel {
  capabilities: ModelCapabilities | null;
}

export interface ModelDiscoveryRun {
  id: string;
  user_id: string;
  provider_connection_id: string;
  status: DiscoveryRunStatus;
  triggered_by: string;
  protocol: string | null;
  base_url: string | null;
  default_model: string | null;
  started_at: string;
  completed_at: string | null;
  models_found: number;
  models_added: number;
  models_updated: number;
  models_marked_unavailable: number;
  errors_count: number;
  safe_summary: string | null;
  safe_error: string | null;
  request_latency_ms: number | null;
  raw_response_shape: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ModelDiscoveryEvent {
  id: string;
  user_id: string;
  discovery_run_id: string;
  provider_connection_id: string;
  level: DiscoveryEventLevel;
  event_type: string;
  message: string;
  http_status: number | null;
  latency_ms: number | null;
  safe_details: Record<string, unknown>;
  created_at: string;
}

// Public, safe input shapes for actions / route handlers.
export interface ManualModelInput {
  providerModelId: string; // required
  displayName?: string | null;
  contextWindowTokens?: number | null;
  maxOutputTokens?: number | null;
  isDefault?: boolean;
  capabilityOverrides?: {
    supportsImageInput?: boolean;
    supportsStreaming?: boolean;
    supportsToolCalling?: boolean;
    supportsFunctionCalling?: boolean;
    supportsJsonMode?: boolean;
    supportsStructuredOutputs?: boolean;
    supportsReasoning?: boolean;
    supportsTemperature?: boolean;
    supportsTopP?: boolean;
    supportsSystemMessages?: boolean;
  };
}

export interface DiscoveryResult {
  ok: boolean;
  status: DiscoveryRunStatus;
  runId: string | null;
  modelsFound: number;
  modelsAdded: number;
  modelsUpdated: number;
  modelsMarkedUnavailable: number;
  errorsCount: number;
  message: string;
}
