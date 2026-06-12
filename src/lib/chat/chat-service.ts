import "server-only";
import { createClient as createUserClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/security/provider-crypto";
import { safeErrorMessage } from "@/lib/security/redact";
import { normalizeOpenAICompatibleUrl } from "@/lib/providers/url-normalize";
import type { ProviderConnection } from "@/lib/providers/types";
import type {
  ChatThread,
  ChatMessage,
  ChatGenerationRun,
  ChatModelOption,
} from "@/lib/chat/types";

class AuthError extends Error {
  code = "unauthenticated";
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

class NotFoundError extends Error {
  code = "not_found";
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

async function requireUserId(): Promise<string> {
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new AuthError("You must be signed in.");
  }
  return data.user.id;
}

async function loadThreadOrThrow(
  userId: string,
  threadId: string
): Promise<ChatThread> {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("id", threadId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) {
    throw new NotFoundError("Thread not found.");
  }
  return data as ChatThread;
}

async function loadProviderConnectionOrThrow(
  userId: string,
  connectionId: string
): Promise<ProviderConnection> {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("provider_connections")
    .select("*")
    .eq("id", connectionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) {
    throw new NotFoundError("Provider connection not found.");
  }
  return data as ProviderConnection;
}

async function getNextSequence(
  threadId: string
): Promise<number> {
  const supabase = await createUserClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("sequence")
    .eq("thread_id", threadId)
    .order("sequence", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data as { sequence: number } | null)?.sequence ?? 0) + 1;
}

export async function listThreads(
  userId?: string
): Promise<ChatThread[]> {
  const uid = userId ?? (await requireUserId());
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("user_id", uid)
    .eq("is_archived", false)
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) {
    throw new Error(`Could not list threads: ${safeErrorMessage(error)}`);
  }
  return (data ?? []) as ChatThread[];
}

export async function getThread(
  userId: string,
  threadId: string
): Promise<ChatThread> {
  return loadThreadOrThrow(userId, threadId);
}

export async function createThread(
  userId: string,
  opts?: {
    title?: string;
    defaultProviderConnectionId?: string;
    defaultProviderModelId?: string;
    defaultModelId?: string;
  }
): Promise<ChatThread> {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .insert({
      user_id: userId,
      title: opts?.title ?? "New chat",
      default_provider_connection_id: opts?.defaultProviderConnectionId ?? null,
      default_provider_model_id: opts?.defaultProviderModelId ?? null,
      default_model_id: opts?.defaultModelId ?? null,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Could not create thread: ${safeErrorMessage(error)}`);
  }
  return data as ChatThread;
}

export async function renameThread(
  userId: string,
  threadId: string,
  title: string
): Promise<void> {
  await loadThreadOrThrow(userId, threadId);
  const supabase = await createUserClient();
  const { error } = await supabase
    .from("chat_threads")
    .update({ title: title.slice(0, 200) })
    .eq("id", threadId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(`Could not rename thread: ${safeErrorMessage(error)}`);
  }
}

export async function archiveThread(
  userId: string,
  threadId: string,
  archived?: boolean
): Promise<void> {
  await loadThreadOrThrow(userId, threadId);
  const supabase = await createUserClient();
  const { error } = await supabase
    .from("chat_threads")
    .update({ is_archived: archived ?? true })
    .eq("id", threadId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(`Could not archive thread: ${safeErrorMessage(error)}`);
  }
}

export async function deleteThread(
  userId: string,
  threadId: string
): Promise<void> {
  await loadThreadOrThrow(userId, threadId);
  const supabase = await createUserClient();
  const { error } = await supabase
    .from("chat_threads")
    .delete()
    .eq("id", threadId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(`Could not delete thread: ${safeErrorMessage(error)}`);
  }
}

export async function getMessage(
  userId: string,
  messageId: string
): Promise<ChatMessage> {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("id", messageId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) {
    throw new NotFoundError("Message not found.");
  }
  return data as ChatMessage;
}

export async function createEditedUserMessage(
  userId: string,
  threadId: string,
  originalMessageId: string,
  newContent: string
): Promise<ChatMessage> {
  const sequence = await getNextSequence(threadId);
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      thread_id: threadId,
      user_id: userId,
      role: "user",
      content: newContent,
      status: "complete",
      sequence,
      parent_message_id: originalMessageId,
      safe_metadata: {
        edited_from_message_id: originalMessageId,
        action: "edit_and_resend",
      },
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Could not save edited message: ${safeErrorMessage(error)}`);
  }
  return data as ChatMessage;
}

export async function createRegenerationPlaceholder(
  userId: string,
  threadId: string,
  opts: {
    providerConnectionId?: string;
    providerModelId?: string;
    modelId?: string;
    parentMessageId?: string | null;
    regeneratedFromMessageId?: string;
    regenerationIndex?: number;
  }
): Promise<ChatMessage> {
  const sequence = await getNextSequence(threadId);
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      thread_id: threadId,
      user_id: userId,
      role: "assistant",
      content: "",
      status: "streaming",
      sequence,
      parent_message_id: opts.parentMessageId ?? null,
      provider_connection_id: opts.providerConnectionId ?? null,
      provider_model_id: opts.providerModelId ?? null,
      model_id: opts.modelId ?? null,
      safe_metadata: {
        regenerated_from_message_id: opts.regeneratedFromMessageId,
        regeneration_index: opts.regenerationIndex ?? 1,
        action: "regenerate",
      },
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(
      `Could not create regeneration: ${safeErrorMessage(error)}`
    );
  }
  return data as ChatMessage;
}

export async function listMessages(
  userId: string,
  threadId: string
): Promise<ChatMessage[]> {
  await loadThreadOrThrow(userId, threadId);
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("thread_id", threadId)
    .eq("user_id", userId)
    .order("sequence", { ascending: true });
  if (error) {
    throw new Error(`Could not list messages: ${safeErrorMessage(error)}`);
  }
  return (data ?? []) as ChatMessage[];
}

export async function appendUserMessage(
  userId: string,
  threadId: string,
  content: string
): Promise<ChatMessage> {
  const sequence = await getNextSequence(threadId);
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      thread_id: threadId,
      user_id: userId,
      role: "user",
      content,
      status: "complete",
      sequence,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Could not save message: ${safeErrorMessage(error)}`);
  }
  return data as ChatMessage;
}

export async function createAssistantPlaceholder(
  userId: string,
  threadId: string,
  opts?: {
    providerConnectionId?: string;
    providerModelId?: string;
    modelId?: string;
  }
): Promise<ChatMessage> {
  const sequence = await getNextSequence(threadId);
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      thread_id: threadId,
      user_id: userId,
      role: "assistant",
      content: "",
      status: "streaming",
      sequence,
      provider_connection_id: opts?.providerConnectionId ?? null,
      provider_model_id: opts?.providerModelId ?? null,
      model_id: opts?.modelId ?? null,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(
      `Could not create assistant message: ${safeErrorMessage(error)}`
    );
  }
  return data as ChatMessage;
}

export async function updateAssistantMessageContent(
  messageId: string,
  content: string,
  opts?: {
    status?: "complete" | "error" | "cancelled";
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    safeError?: string;
  }
): Promise<void> {
  const supabase = await createUserClient();
  const update: Record<string, unknown> = {
    content,
    updated_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };
  if (opts?.status) update.status = opts.status;
  if (opts?.promptTokens != null) update.prompt_tokens = opts.promptTokens;
  if (opts?.completionTokens != null)
    update.completion_tokens = opts.completionTokens;
  if (opts?.totalTokens != null) update.total_tokens = opts.totalTokens;
  if (opts?.safeError != null) update.safe_error = opts.safeError;
  if (!update.status) update.status = "complete";

  const { error } = await supabase
    .from("chat_messages")
    .update(update)
    .eq("id", messageId);
  if (error) {
    console.warn(
      "[chat-service] could not update message:",
      safeErrorMessage(error)
    );
  }
}

export async function createGenerationRun(
  userId: string,
  threadId: string,
  userMessageId: string,
  assistantMessageId: string,
  opts: {
    providerConnectionId?: string;
    providerModelId?: string;
    modelId?: string;
    protocol?: string;
  }
): Promise<ChatGenerationRun> {
  const supabase = await createUserClient();
  const { data, error } = await supabase
    .from("chat_generation_runs")
    .insert({
      user_id: userId,
      thread_id: threadId,
      user_message_id: userMessageId,
      assistant_message_id: assistantMessageId,
      provider_connection_id: opts.providerConnectionId ?? null,
      provider_model_id: opts.providerModelId ?? null,
      model_id: opts.modelId ?? null,
      protocol: opts.protocol ?? null,
      status: "streaming",
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(
      `Could not create generation run: ${safeErrorMessage(error)}`
    );
  }
  return data as ChatGenerationRun;
}

export async function updateGenerationRun(
  runId: string,
  opts: {
    status?: "complete" | "error" | "cancelled";
    finishedAt?: string;
    durationMs?: number;
    httpStatus?: number;
    providerRequestId?: string;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    safeResponseMetadata?: Record<string, unknown>;
    safeError?: string;
    errorType?: string;
  }
): Promise<void> {
  const supabase = await createUserClient();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (opts.status) update.status = opts.status;
  if (opts.finishedAt) update.finished_at = opts.finishedAt;
  if (opts.durationMs != null) update.duration_ms = opts.durationMs;
  if (opts.httpStatus != null) update.http_status = opts.httpStatus;
  if (opts.providerRequestId)
    update.provider_request_id = opts.providerRequestId;
  if (opts.inputTokens != null) update.input_tokens = opts.inputTokens;
  if (opts.outputTokens != null) update.output_tokens = opts.outputTokens;
  if (opts.totalTokens != null) update.total_tokens = opts.totalTokens;
  if (opts.safeResponseMetadata)
    update.safe_response_metadata = opts.safeResponseMetadata;
  if (opts.safeError != null) update.safe_error = opts.safeError;
  if (opts.errorType) update.error_type = opts.errorType;

  const { error } = await supabase
    .from("chat_generation_runs")
    .update(update)
    .eq("id", runId);
  if (error) {
    console.warn(
      "[chat-service] could not update run:",
      safeErrorMessage(error)
    );
  }
}

export async function updateThreadLastMessage(
  threadId: string,
  userId: string,
  opts?: {
    defaultProviderConnectionId?: string;
    defaultProviderModelId?: string;
    defaultModelId?: string;
  }
): Promise<void> {
  const supabase = await createUserClient();
  const update: Record<string, unknown> = {
    last_message_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (opts?.defaultProviderConnectionId != null)
    update.default_provider_connection_id = opts.defaultProviderConnectionId;
  if (opts?.defaultProviderModelId != null)
    update.default_provider_model_id = opts.defaultProviderModelId;
  if (opts?.defaultModelId != null)
    update.default_model_id = opts.defaultModelId;

  const { error } = await supabase
    .from("chat_threads")
    .update(update)
    .eq("id", threadId)
    .eq("user_id", userId);
  if (error) {
    console.warn(
      "[chat-service] could not update thread:",
      safeErrorMessage(error)
    );
  }
}

export async function getAvailableChatModels(
  userId?: string
): Promise<ChatModelOption[]> {
  const uid = userId ?? (await requireUserId());
  const supabase = await createUserClient();

  const { data: connections, error: connErr } = await supabase
    .from("provider_connections")
    .select("id, label, provider_type, protocol, is_enabled")
    .eq("user_id", uid)
    .eq("is_enabled", true);
  if (connErr || !connections) return [];

  const connMap = new Map(
    (connections as Array<{
      id: string;
      label: string;
      provider_type: string;
      protocol: string;
      is_enabled: boolean;
    }>).map((c) => [c.id, c])
  );

  const connIds = (connections as Array<{ id: string }>).map((c) => c.id);
  if (connIds.length === 0) return [];

  const { data: models, error: modelErr } = await supabase
    .from("provider_models")
    .select(
      "id, provider_model_id, display_name, is_default_for_provider, is_available, context_window_tokens, max_output_tokens"
    )
    .eq("user_id", uid)
    .in("provider_connection_id", connIds)
    .eq("is_available", true);
  if (modelErr || !models) return [];

  const modelIds = (models as Array<{ id: string }>).map((m) => m.id);
  const capsByModel = new Map<string, { supports_streaming: boolean | null; supports_text_input: boolean | null; supports_text_output: boolean | null }>();

  if (modelIds.length > 0) {
    const { data: caps } = await supabase
      .from("model_capabilities")
      .select(
        "provider_model_id, supports_streaming, supports_text_input, supports_text_output"
      )
      .eq("user_id", uid)
      .in("provider_model_id", modelIds);
    if (caps) {
      for (const c of caps as Array<{
        provider_model_id: string;
        supports_streaming: boolean | null;
        supports_text_input: boolean | null;
        supports_text_output: boolean | null;
      }>) {
        capsByModel.set(c.provider_model_id, {
          supports_streaming: c.supports_streaming,
          supports_text_input: c.supports_text_input,
          supports_text_output: c.supports_text_output,
        });
      }
    }
  }

  const options: ChatModelOption[] = [];
  for (const m of models as Array<{
    id: string;
    provider_model_id: string;
    display_name: string | null;
    is_default_for_provider: boolean;
    is_available: boolean;
    context_window_tokens: number | null;
    max_output_tokens: number | null;
    provider_connection_id: string;
  }>) {
    const conn = connMap.get(m.provider_connection_id);
    if (!conn) continue;
    const cap = capsByModel.get(m.id);
    options.push({
      provider_model_id: m.id,
      provider_connection_id: m.provider_connection_id,
      provider_label: conn.label,
      provider_type: conn.provider_type,
      protocol: conn.protocol,
      model_id: m.provider_model_id,
      display_name: m.display_name ?? m.provider_model_id,
      is_default: m.is_default_for_provider,
      is_enabled: conn.is_enabled,
      is_available: m.is_available,
      context_window_tokens: m.context_window_tokens,
      max_output_tokens: m.max_output_tokens,
      supports_streaming: cap?.supports_streaming ?? null,
      supports_text_input: cap?.supports_text_input ?? null,
      supports_text_output: cap?.supports_text_output ?? null,
    });
  }

  return options;
}

export async function resolveChatModel(
  userId: string,
  providerModelId?: string,
  providerConnectionId?: string
): Promise<{
  connection: ProviderConnection;
  providerModelId: string;
  modelId: string;
  maxOutputTokens: number | null;
  protocol: string;
  chatUrl: string;
}> {
  const supabase = await createUserClient();

  if (providerModelId) {
    const { data: modelRow, error: modelErr } = await supabase
      .from("provider_models")
      .select(
        "id, provider_model_id, max_output_tokens, provider_connection_id"
      )
      .eq("id", providerModelId)
      .eq("user_id", userId)
      .maybeSingle();
    if (modelErr || !modelRow) {
      throw new NotFoundError("Selected model not found.");
    }
    const row = modelRow as {
      id: string;
      provider_model_id: string;
      max_output_tokens: number | null;
      provider_connection_id: string;
    };
    const conn = await loadProviderConnectionOrThrow(
      userId,
      row.provider_connection_id
    );
    if (!conn.is_enabled) {
      throw new Error("This provider is disabled.");
    }
    const normalized = normalizeOpenAICompatibleUrl(conn.base_url);
    if (!normalized.ok) {
      throw new Error("Invalid provider base URL.");
    }
    return {
      connection: conn,
      providerModelId: row.id,
      modelId: row.provider_model_id,
      maxOutputTokens: row.max_output_tokens,
      protocol: conn.protocol,
      chatUrl: normalized.value.chatCompletionsUrl,
    };
  }

  if (providerConnectionId) {
    const conn = await loadProviderConnectionOrThrow(
      userId,
      providerConnectionId
    );
    if (!conn.is_enabled) {
      throw new Error("This provider is disabled.");
    }
    if (!conn.default_model) {
      throw new Error(
        "Provider has no default model set. Select a model first."
      );
    }
    const { data: modelRow } = await supabase
      .from("provider_models")
      .select("id, max_output_tokens")
      .eq("user_id", userId)
      .eq("provider_connection_id", providerConnectionId)
      .eq("provider_model_id", conn.default_model)
      .maybeSingle();
    const normalized = normalizeOpenAICompatibleUrl(conn.base_url);
    if (!normalized.ok) {
      throw new Error("Invalid provider base URL.");
    }
    return {
      connection: conn,
      providerModelId: (modelRow as { id: string } | null)?.id ?? "",
      modelId: conn.default_model,
      maxOutputTokens:
        (modelRow as { max_output_tokens: number | null } | null)
          ?.max_output_tokens ?? null,
      protocol: conn.protocol,
      chatUrl: normalized.value.chatCompletionsUrl,
    };
  }

  const options = await getAvailableChatModels(userId);
  if (options.length === 0) {
    throw new Error(
      "No chat model is available. Add a provider and discover models first."
    );
  }
  const first = options[0];
  const conn = await loadProviderConnectionOrThrow(
    userId,
    first.provider_connection_id
  );
  const normalized = normalizeOpenAICompatibleUrl(conn.base_url);
  if (!normalized.ok) {
    throw new Error("Invalid provider base URL.");
  }
  return {
    connection: conn,
    providerModelId: first.provider_model_id,
    modelId: first.model_id,
    maxOutputTokens: first.max_output_tokens,
    protocol: first.protocol,
    chatUrl: normalized.value.chatCompletionsUrl,
  };
}

export async function readDecryptedProviderSecret(
  userId: string,
  providerConnectionId: string
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("provider_connection_secrets")
    .select("encrypted_secret")
    .eq("provider_connection_id", providerConnectionId)
    .eq("user_id", userId)
    .eq("secret_kind", "api_key")
    .maybeSingle();
  if (error || !data) {
    throw new Error(
      "No saved API key for this provider. Add a key in provider settings."
    );
  }
  try {
    return decryptSecret(
      (data as { encrypted_secret: string }).encrypted_secret
    );
  } catch {
    throw new Error("Could not decrypt provider API key.");
  }
}

export { AuthError, NotFoundError };
