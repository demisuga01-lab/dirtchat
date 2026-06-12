// src/lib/models/capability-inference.ts
//
// Conservative capability inference. Uses nullable booleans:
//   * true  — evidence says supported
//   * false — evidence says NOT supported (e.g. parameter explicitly absent)
//   * null  — unknown (default)
//
// Scoring:
//   * manual                -> 1.0
//   * rich metadata         -> 0.85
//   * metadata + probe      -> 0.75
//   * fallback text ping    -> 0.6
//   * id-only metadata      -> 0.35
//   * unknown               -> 0

import type {
  CapabilityConfidence,
  CapabilitySource,
} from "@/lib/models/types";
import type { NormalizedModelDescriptor } from "@/lib/models/model-normalize";

export interface CapabilityInferenceInput {
  descriptor: NormalizedModelDescriptor;
  /** Result of a successful chat-completions ping (if any). */
  probeSuccess?: boolean | null;
  /** How the inference source arrived (metadata, probe, fallback). */
  sourceHint?: "metadata" | "probe" | "fallback" | "manual" | "unknown";
}

export interface CapabilityInferenceResult {
  source: CapabilitySource;
  confidence: CapabilityConfidence;
  score: number;
  notes: string | null;
  metadata_evidence: Record<string, unknown>;
  probe_evidence: Record<string, unknown>;
  fields: {
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
  };
}

const IMAGE_INPUT_TOKENS = new Set([
  "image",
  "images",
  "image_url",
  "image-input",
  "vision",
]);
const FILE_INPUT_TOKENS = new Set([
  "file",
  "files",
  "file-input",
  "pdf",
  "document",
]);
const AUDIO_INPUT_TOKENS = new Set(["audio", "audio-input"]);
const AUDIO_OUTPUT_TOKENS = new Set(["audio", "audio-output", "tts"]);
const VIDEO_INPUT_TOKENS = new Set(["video", "video-input"]);
const TOOL_TOKENS = new Set(["tools", "tool_choice", "tool_calls", "function"]);
const FUNCTION_TOKENS = new Set([
  "functions",
  "function_call",
  "function_calling",
  "tools",
]);
const JSON_TOKENS = new Set([
  "response_format",
  "json",
  "json_object",
  "json_mode",
]);
const STRUCTURED_TOKENS = new Set([
  "structured_outputs",
  "response_format",
  "json_schema",
]);
const REASONING_TOKENS = new Set([
  "reasoning",
  "thinking",
  "reasoning_effort",
  "reasoning_tokens",
  "include_reasoning",
  "exclude_reasoning",
  "reasoning_content",
]);
const SYSTEM_TOKENS = new Set(["system"]);
const STOP_TOKENS = new Set(["stop", "stop_sequences"]);
const TEMP_TOKENS = new Set(["temperature"]);
const TOP_P_TOKENS = new Set(["top_p"]);

function paramHas(tokens: Set<string>, params: string[]): boolean {
  for (const p of params) {
    const lower = p.toLowerCase();
    for (const t of tokens) {
      if (lower.includes(t)) return true;
    }
  }
  return false;
}

function modalityHas(tokens: Set<string>, mods: string[]): boolean {
  return mods.some((m) => tokens.has(m.toLowerCase()));
}

export function inferCapabilities(
  input: CapabilityInferenceInput
): CapabilityInferenceResult {
  const { descriptor, probeSuccess, sourceHint } = input;
  const params = descriptor.supported_parameters ?? [];
  const inputs = descriptor.input_modalities ?? [];
  const outputs = descriptor.output_modalities ?? [];

  // Text input/output: every chat model supports text. Only mark false if
  // metadata explicitly removes it (rare).
  const supportsTextInput = true;
  const supportsTextOutput = true;

  const supportsImageInput = modalityHas(IMAGE_INPUT_TOKENS, inputs) ? true : null;
  const supportsFileInput = modalityHas(FILE_INPUT_TOKENS, inputs) ? true : null;
  const supportsAudioInput = modalityHas(AUDIO_INPUT_TOKENS, inputs) ? true : null;
  const supportsAudioOutput = modalityHas(AUDIO_OUTPUT_TOKENS, outputs)
    ? true
    : null;
  const supportsVideoInput = modalityHas(VIDEO_INPUT_TOKENS, inputs) ? true : null;

  // Tool / function / json / structured outputs: only true if param list
  // explicitly mentions them. Otherwise null (unknown).
  const supportsToolCalling = paramHas(TOOL_TOKENS, params) ? true : null;
  const supportsFunctionCalling = paramHas(FUNCTION_TOKENS, params) ? true : null;
  const supportsJsonMode = paramHas(JSON_TOKENS, params) ? true : null;
  const supportsStructuredOutputs = paramHas(STRUCTURED_TOKENS, params)
    ? true
    : null;

  // Parallel tool calling: usually implicit when tools are supported,
  // but we keep null unless metadata says so.
  const supportsParallelToolCalling = null;

  // Reasoning: only true if metadata explicitly lists reasoning params.
  // Do NOT mark reasoning true just because the route is on a known
  // reasoning provider — wait for evidence.
  const supportsReasoning = paramHas(REASONING_TOKENS, params) ? true : null;
  const supportsReasoningEffort = params.some((p) =>
    p.toLowerCase().includes("reasoning_effort")
  )
    ? true
    : null;
  const supportsReasoningTokens = params.some((p) =>
    p.toLowerCase().includes("reasoning_tokens")
  )
    ? true
    : null;
  const supportsReasoningExclude = params.some((p) =>
    p.toLowerCase().includes("exclude_reasoning") ||
    p.toLowerCase().includes("hide_reasoning")
  )
    ? true
    : null;

  // System / temperature / top_p / stop / response_format.
  const supportsSystemMessages = paramHas(SYSTEM_TOKENS, params) ? true : null;
  const supportsTemperature = paramHas(TEMP_TOKENS, params) ? true : null;
  const supportsTopP = paramHas(TOP_P_TOKENS, params) ? true : null;
  const supportsStopSequences = paramHas(STOP_TOKENS, params) ? true : null;
  const supportsResponseFormat = paramHas(JSON_TOKENS, params) ? true : null;

  // Streaming: most OpenAI-compatible models support it. Mark true when
  // probe succeeded (since the probe used stream:false but a successful
  // response implies the model is at least reachable). Otherwise null.
  const supportsStreaming = probeSuccess === true ? true : null;

  // Determine source / confidence / score.
  const hasRichMetadata =
    descriptor.context_window_tokens != null ||
    descriptor.pricing_prompt != null ||
    descriptor.pricing_completion != null ||
    (descriptor.supported_parameters?.length ?? 0) > 0 ||
    (descriptor.input_modalities?.length ?? 0) > 1 ||
    (descriptor.output_modalities?.length ?? 0) > 1 ||
    descriptor.description != null;
  const hasOpenRouterShape =
    (descriptor.raw_provider_metadata as { architecture?: unknown })?.architecture !=
    null;

  let source: CapabilitySource = "unknown";
  let confidence: CapabilityConfidence = "unknown";
  let score = 0;

  if (sourceHint === "manual") {
    source = "manual";
    confidence = "manual";
    score = 1.0;
  } else if (probeSuccess && hasRichMetadata) {
    source = "metadata_and_probe";
    confidence = "high";
    score = 0.75;
  } else if (hasRichMetadata && hasOpenRouterShape) {
    source = "metadata";
    confidence = "high";
    score = 0.85;
  } else if (hasRichMetadata) {
    source = "metadata";
    confidence = "medium";
    score = 0.6;
  } else if (probeSuccess) {
    source = "probe";
    confidence = "medium";
    score = 0.6;
  } else if (sourceHint === "fallback") {
    source = "fallback_default";
    confidence = "low";
    score = 0.4;
  } else {
    source = "unknown";
    confidence = "low";
    score = 0.35;
  }

  const notes = buildNotes(input, {
    supportsToolCalling,
    supportsImageInput,
    supportsReasoning,
  });

  const metadata_evidence: Record<string, unknown> = {
    input_modalities: inputs,
    output_modalities: outputs,
    supported_parameters: params,
    context_window_tokens: descriptor.context_window_tokens,
    has_pricing:
      descriptor.pricing_prompt != null ||
      descriptor.pricing_completion != null,
  };

  const probe_evidence: Record<string, unknown> = {
    probe_success: probeSuccess ?? null,
    source_hint: sourceHint ?? null,
  };

  return {
    source,
    confidence,
    score,
    notes,
    metadata_evidence,
    probe_evidence,
    fields: {
      supports_text_input: supportsTextInput,
      supports_text_output: supportsTextOutput,
      supports_image_input: supportsImageInput,
      supports_file_input: supportsFileInput,
      supports_audio_input: supportsAudioInput,
      supports_audio_output: supportsAudioOutput,
      supports_video_input: supportsVideoInput,
      supports_streaming: supportsStreaming,
      supports_tool_calling: supportsToolCalling,
      supports_parallel_tool_calling: supportsParallelToolCalling,
      supports_json_mode: supportsJsonMode,
      supports_structured_outputs: supportsStructuredOutputs,
      supports_function_calling: supportsFunctionCalling,
      supports_reasoning: supportsReasoning,
      supports_reasoning_effort: supportsReasoningEffort,
      supports_reasoning_tokens: supportsReasoningTokens,
      supports_reasoning_exclude: supportsReasoningExclude,
      supports_system_messages: supportsSystemMessages,
      supports_temperature: supportsTemperature,
      supports_top_p: supportsTopP,
      supports_stop_sequences: supportsStopSequences,
      supports_response_format: supportsResponseFormat,
    },
  };
}

function buildNotes(
  input: CapabilityInferenceInput,
  hints: { supportsToolCalling: boolean | null; supportsImageInput: boolean | null; supportsReasoning: boolean | null }
): string | null {
  const { descriptor, probeSuccess, sourceHint } = input;
  const parts: string[] = [];
  if (sourceHint === "fallback") {
    parts.push(
      "Inferred from a chat-completions ping only; advanced capabilities unknown."
    );
  } else if (sourceHint === "metadata" && descriptor.supported_parameters.length > 0) {
    parts.push(
      `Inferred from ${descriptor.supported_parameters.length} supported-parameter signal(s).`
    );
  } else if (probeSuccess && !descriptor.supported_parameters.length) {
    parts.push(
      "Inferred from a successful probe; no parameter metadata available."
    );
  } else {
    parts.push("Inferred from id-only metadata.");
  }
  if (hints.supportsImageInput === true) parts.push("Vision supported.");
  if (hints.supportsToolCalling === true) parts.push("Tools supported.");
  if (hints.supportsReasoning === true) parts.push("Reasoning parameters present.");
  if (hints.supportsImageInput === null && hints.supportsToolCalling === null) {
    parts.push("Vision/tools not confirmed.");
  }
  return parts.join(" ").slice(0, 500);
}
