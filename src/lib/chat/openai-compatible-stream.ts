import { safeErrorMessage } from "@/lib/security/redact";
import { CHAT_STREAM_TIMEOUT_MS } from "@/lib/chat/types";

export interface StreamChunk {
  content: string;
  finishReason: string | null;
  usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  } | null;
}

export interface StreamResult {
  ok: boolean;
  content: string;
  finishReason: string | null;
  usage: StreamChunk["usage"];
  httpStatus: number | null;
  durationMs: number;
  errorMessage: string | null;
  usedNonStreamFallback: boolean;
}

export class OpenAICompatibleStreamParser {
  private buffer = "";
  private done = false;

  feed(chunk: string): StreamChunk[] {
    this.buffer += chunk;
    const chunks: StreamChunk[] = [];
    const lines = this.buffer.split("\n");
    this.buffer = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          this.done = true;
          continue;
        }
        try {
          const parsed = JSON.parse(data);
          const processed = this.processChunk(parsed);
          if (processed) chunks.push(processed);
        } catch {
          continue;
        }
      }
    }

    const lastLine = lines[lines.length - 1];
    if (lastLine && !lastLine.startsWith("data: ") && lastLine.trim() !== "") {
      this.buffer = lastLine;
    }

    return chunks;
  }

  isDone(): boolean {
    return this.done;
  }

  private processChunk(parsed: Record<string, unknown>): StreamChunk | null {
    const choices = parsed.choices as Array<Record<string, unknown>> | undefined;
    if (!choices || choices.length === 0) return null;

    const choice = choices[0];
    const delta = choice.delta as Record<string, unknown> | undefined;
    const message = choice.message as Record<string, unknown> | undefined;
    const finishReason = (choice.finish_reason as string | null) ?? null;

    let content = "";
    if (delta?.content) {
      content = typeof delta.content === "string" ? delta.content : "";
    } else if (message?.content) {
      content = typeof message.content === "string" ? message.content : "";
    }

    const usageRaw = parsed.usage as
      | {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        }
      | undefined;

    const usage: StreamChunk["usage"] =
      usageRaw && (usageRaw.prompt_tokens != null || usageRaw.completion_tokens != null)
        ? {
            promptTokens: usageRaw.prompt_tokens,
            completionTokens: usageRaw.completion_tokens,
            totalTokens: usageRaw.total_tokens,
          }
        : null;

    return { content, finishReason, usage };
  }
}

export async function streamOpenAICompatible(
  apiKey: string,
  chatUrl: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  opts?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stream?: boolean;
    signal?: AbortSignal;
  }
): Promise<ReadableStream<Uint8Array> | null> {
  const body: Record<string, unknown> = {
    model: modelId,
    messages,
    stream: opts?.stream !== false,
  };

  if (opts?.maxTokens != null) body.max_tokens = opts.maxTokens;
  if (opts?.temperature != null) body.temperature = opts.temperature;
  if (opts?.topP != null) body.top_p = opts.topP;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHAT_STREAM_TIMEOUT_MS);
  const combinedSignal = opts?.signal
    ? combineAbortSignals(controller.signal, opts.signal)
    : controller.signal;

  try {
    const response = await fetch(chatUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: combinedSignal,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown error");
      throw new ProviderHttpError(
        response.status,
        errorText.length > 200 ? errorText.slice(0, 200) : errorText
      );
    }

    return response.body;
  } finally {
    clearTimeout(timeout);
  }
}

export async function nonStreamOpenAICompatible(
  apiKey: string,
  chatUrl: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  opts?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    signal?: AbortSignal;
  }
): Promise<{ content: string; usage: StreamChunk["usage"]; httpStatus: number }> {
  const body: Record<string, unknown> = {
    model: modelId,
    messages,
    stream: false,
  };

  if (opts?.maxTokens != null) body.max_tokens = opts.maxTokens;
  if (opts?.temperature != null) body.temperature = opts.temperature;
  if (opts?.topP != null) body.top_p = opts.topP;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHAT_STREAM_TIMEOUT_MS);
  const combinedSignal = opts?.signal
    ? combineAbortSignals(controller.signal, opts.signal)
    : controller.signal;

  try {
    const response = await fetch(chatUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: combinedSignal,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown error");
      throw new ProviderHttpError(
        response.status,
        errorText.length > 200 ? errorText.slice(0, 200) : errorText
      );
    }

    const json = (await response.json()) as Record<string, unknown>;
    const choice = (json.choices as Array<Record<string, unknown>> | undefined)?.[0];
    const content =
      (choice?.message as Record<string, unknown> | undefined)?.content ??
      (choice?.text as string | undefined) ??
      "";

    const usageRaw = json.usage as
      | { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
      | undefined;

    const usage: StreamChunk["usage"] =
      usageRaw && (usageRaw.prompt_tokens != null || usageRaw.completion_tokens != null)
        ? {
            promptTokens: usageRaw.prompt_tokens,
            completionTokens: usageRaw.completion_tokens,
            totalTokens: usageRaw.total_tokens,
          }
        : null;

    return {
      content: typeof content === "string" ? content : "",
      usage,
      httpStatus: response.status,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export class ProviderHttpError extends Error {
  httpStatus: number;
  constructor(status: number, message: string) {
    super(`Provider HTTP ${status}: ${safeErrorMessage(message)}`);
    this.httpStatus = status;
    this.name = "ProviderHttpError";
  }
}

function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
    });
  }
  return controller.signal;
}
