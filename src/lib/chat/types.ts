export const CHAT_MESSAGE_ROLES = ["system", "user", "assistant", "tool"] as const;
export type ChatMessageRole = (typeof CHAT_MESSAGE_ROLES)[number];

export const CHAT_MESSAGE_STATUSES = [
  "queued",
  "streaming",
  "complete",
  "error",
  "cancelled",
] as const;
export type ChatMessageStatus = (typeof CHAT_MESSAGE_STATUSES)[number];

export const CHAT_GEN_RUN_STATUSES = [
  "queued",
  "streaming",
  "complete",
  "error",
  "cancelled",
] as const;
export type ChatGenRunStatus = (typeof CHAT_GEN_RUN_STATUSES)[number];

export interface ChatThread {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
  default_provider_connection_id: string | null;
  default_provider_model_id: string | null;
  default_model_id: string | null;
  is_archived: boolean;
  is_pinned: boolean;
  last_message_at: string | null;
  safe_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  user_id: string;
  role: ChatMessageRole;
  content: string;
  status: ChatMessageStatus;
  sequence: number;
  parent_message_id: string | null;
  provider_connection_id: string | null;
  provider_model_id: string | null;
  model_id: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  safe_error: string | null;
  safe_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ChatGenerationRun {
  id: string;
  user_id: string;
  thread_id: string;
  user_message_id: string | null;
  assistant_message_id: string | null;
  provider_connection_id: string | null;
  provider_model_id: string | null;
  model_id: string | null;
  protocol: string | null;
  status: ChatGenRunStatus;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  http_status: number | null;
  provider_request_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  safe_request: Record<string, unknown>;
  safe_response_metadata: Record<string, unknown>;
  safe_error: string | null;
  error_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatModelOption {
  provider_model_id: string;
  provider_connection_id: string;
  provider_label: string;
  provider_type: string;
  protocol: string;
  model_id: string;
  display_name: string | null;
  is_default: boolean;
  is_enabled: boolean;
  is_available: boolean;
  context_window_tokens: number | null;
  max_output_tokens: number | null;
  supports_streaming: boolean | null;
  supports_text_input: boolean | null;
  supports_text_output: boolean | null;
}

export interface StreamRequest {
  threadId?: string;
  message: string;
  providerConnectionId?: string;
  providerModelId?: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  action?: "normal" | "regenerate" | "edit";
  originalUserMessageId?: string;
  assistantMessageId?: string;
}

export interface StreamEvent {
  event: "thread" | "user_message" | "assistant_message" | "delta" | "done" | "error" | "warning";
  data: Record<string, unknown>;
}

export interface ChatErrorResult {
  code: string;
  message: string;
}

export const CHAT_STREAM_TIMEOUT_MS = Number.parseInt(
  process.env.CHAT_STREAM_TIMEOUT_MS ?? "60000",
  10
);
export const CHAT_MAX_INPUT_CHARS = Number.parseInt(
  process.env.CHAT_MAX_INPUT_CHARS ?? "20000",
  10
);
export const CHAT_CONTEXT_MAX_MESSAGES = Number.parseInt(
  process.env.CHAT_CONTEXT_MAX_MESSAGES ?? "30",
  10
);
export const CHAT_CONTEXT_MAX_CHARS = Number.parseInt(
  process.env.CHAT_CONTEXT_MAX_CHARS ?? "60000",
  10
);
export const CHAT_DEFAULT_MAX_TOKENS = Number.parseInt(
  process.env.CHAT_DEFAULT_MAX_TOKENS ?? "4096",
  10
);
