import { safeErrorMessage } from "@/lib/security/redact";
import type { ProviderProtocol } from "@/lib/providers/types";
import {
  streamOpenAICompatible,
  nonStreamOpenAICompatible,
} from "@/lib/chat/openai-compatible-stream";
import type { StreamChunk } from "@/lib/chat/openai-compatible-stream";

export interface ChatAdapterResult {
  ok: boolean;
  content: string;
  finishReason: string | null;
  usage: StreamChunk["usage"];
  httpStatus: number | null;
  durationMs: number;
  errorMessage: string | null;
  usedNonStreamFallback: boolean;
}

export async function chatWithProvider(
  protocol: string,
  apiKey: string,
  chatUrl: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  opts: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    signal?: AbortSignal;
  }
): Promise<{
  stream: ReadableStream<Uint8Array> | null;
  result: ChatAdapterResult | null;
}> {
  const proto = protocol as ProviderProtocol;

  if (proto !== "openai-compatible") {
    return {
      stream: null,
      result: {
        ok: false,
        content: "",
        finishReason: null,
        usage: null,
        httpStatus: null,
        durationMs: 0,
        errorMessage: `Unsupported provider protocol for chat: ${protocol}`,
        usedNonStreamFallback: false,
      },
    };
  }

  const start = Date.now();

  try {
    const bodyStream = await streamOpenAICompatible(apiKey, chatUrl, modelId, messages, {
      maxTokens: opts.maxTokens,
      temperature: opts.temperature,
      topP: opts.topP,
      signal: opts.signal,
    });

    if (!bodyStream) {
      return {
        stream: null,
        result: {
          ok: false,
          content: "",
          finishReason: null,
          usage: null,
          httpStatus: null,
          durationMs: Date.now() - start,
          errorMessage: "Provider returned no response body.",
          usedNonStreamFallback: false,
        },
      };
    }

    return { stream: bodyStream, result: null };
  } catch (err) {
    if (err instanceof Error && err.name === "ProviderHttpError") {
      const httpErr = err as Error & { httpStatus: number };
      const status = httpErr.httpStatus;

      if (status === 401 || status === 403) {
        return {
          stream: null,
          result: {
            ok: false,
            content: "",
            finishReason: null,
            usage: null,
            httpStatus: status,
            durationMs: Date.now() - start,
            errorMessage: "Provider rejected the request. Check your API key and model access.",
            usedNonStreamFallback: false,
          },
        };
      }

      if (status === 404) {
        return {
          stream: null,
          result: {
            ok: false,
            content: "",
            finishReason: null,
            usage: null,
            httpStatus: status,
            durationMs: Date.now() - start,
            errorMessage: "Provider endpoint not found. Verify the base URL and model ID.",
            usedNonStreamFallback: false,
          },
        };
      }

      if (status === 429) {
        return {
          stream: null,
          result: {
            ok: false,
            content: "",
            finishReason: null,
            usage: null,
            httpStatus: status,
            durationMs: Date.now() - start,
            errorMessage: "Provider rate limit exceeded. Try again later.",
            usedNonStreamFallback: false,
          },
        };
      }

      const errorMsg = `Provider responded with HTTP ${status}.`;
      return {
        stream: null,
        result: {
          ok: false,
          content: "",
          finishReason: null,
          usage: null,
          httpStatus: status,
          durationMs: Date.now() - start,
          errorMessage: errorMsg,
          usedNonStreamFallback: false,
        },
      };
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        stream: null,
        result: {
          ok: false,
          content: "",
          finishReason: null,
          usage: null,
          httpStatus: null,
          durationMs: Date.now() - start,
          errorMessage: "Request was cancelled.",
          usedNonStreamFallback: false,
        },
      };
    }

    return {
      stream: null,
      result: {
        ok: false,
        content: "",
        finishReason: null,
        usage: null,
        httpStatus: null,
        durationMs: Date.now() - start,
        errorMessage: `Provider request failed: ${safeErrorMessage(err)}`,
        usedNonStreamFallback: false,
      },
    };
  }
}

export async function chatWithProviderNonStream(
  protocol: string,
  apiKey: string,
  chatUrl: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  opts: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    signal?: AbortSignal;
  }
): Promise<ChatAdapterResult> {
  const proto = protocol as ProviderProtocol;
  const start = Date.now();

  if (proto !== "openai-compatible") {
    return {
      ok: false,
      content: "",
      finishReason: null,
      usage: null,
      httpStatus: null,
      durationMs: 0,
      errorMessage: `Unsupported provider protocol for chat: ${protocol}`,
      usedNonStreamFallback: false,
    };
  }

  try {
    const result = await nonStreamOpenAICompatible(apiKey, chatUrl, modelId, messages, {
      maxTokens: opts.maxTokens,
      temperature: opts.temperature,
      topP: opts.topP,
      signal: opts.signal,
    });

    return {
      ok: true,
      content: result.content,
      finishReason: "stop",
      usage: result.usage,
      httpStatus: result.httpStatus,
      durationMs: Date.now() - start,
      errorMessage: null,
      usedNonStreamFallback: true,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    if (err instanceof Error && err.name === "ProviderHttpError") {
      const httpErr = err as Error & { httpStatus: number };
      return {
        ok: false,
        content: "",
        finishReason: null,
        usage: null,
        httpStatus: httpErr.httpStatus,
        durationMs,
        errorMessage: `Provider responded with HTTP ${httpErr.httpStatus}.`,
        usedNonStreamFallback: false,
      };
    }
    return {
      ok: false,
      content: "",
      finishReason: null,
      usage: null,
      httpStatus: null,
      durationMs,
      errorMessage: `Provider request failed: ${safeErrorMessage(err)}`,
      usedNonStreamFallback: false,
    };
  }
}
