import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  appendUserMessage,
  createAssistantPlaceholder,
  createGenerationRun,
  updateAssistantMessageContent,
  updateGenerationRun,
  updateThreadLastMessage,
  resolveChatModel,
  readDecryptedProviderSecret,
  AuthError,
  NotFoundError,
} from "@/lib/chat/chat-service";
import { generateTitle } from "@/lib/chat/title";
import { buildProviderMessages } from "@/lib/chat/chat-context";
import { chatWithProvider, chatWithProviderNonStream } from "@/lib/chat/provider-chat";
import { encodeSSE, encodeDone } from "@/lib/chat/sse";
import { listMessages } from "@/lib/chat/chat-service";
import {
  CHAT_STREAM_TIMEOUT_MS,
  CHAT_MAX_INPUT_CHARS,
  CHAT_DEFAULT_MAX_TOKENS,
} from "@/lib/chat/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json(
        { ok: false, error: "You must be signed in." },
        { status: 401 }
      );
    }
    const userId = user.id;

    const json = await request.json();
    const message = typeof json.message === "string" ? json.message.trim() : "";
    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Message is required." },
        { status: 400 }
      );
    }
    if (message.length > CHAT_MAX_INPUT_CHARS) {
      return NextResponse.json(
        { ok: false, error: `Message too long (max ${CHAT_MAX_INPUT_CHARS} characters).` },
        { status: 400 }
      );
    }

    const threadId: string | undefined = json.threadId;
    const providerConnectionId: string | undefined = json.providerConnectionId;
    const providerModelId: string | undefined = json.providerModelId;
    const modelId: string | undefined = json.modelId;
    const temperature: number | undefined = json.temperature;
    const maxTokens: number | undefined = json.maxTokens;

    let targetThreadId: string;

    if (threadId) {
      const threadModule = await import("@/lib/chat/chat-service");
      await threadModule.getThread(userId, threadId);
      targetThreadId = threadId;
    } else {
      const threadModule = await import("@/lib/chat/chat-service");
      const title = generateTitle(message);
      const thread = await threadModule.createThread(userId, {
        title,
        defaultProviderConnectionId: providerConnectionId,
        defaultProviderModelId: providerModelId,
        defaultModelId: modelId,
      });
      targetThreadId = thread.id;
    }

    const resolved = await resolveChatModel(
      userId,
      providerModelId,
      providerConnectionId
    );

    const apiKey = await readDecryptedProviderSecret(
      userId,
      resolved.connection.id
    );

    const history = await listMessages(userId, targetThreadId);

    const providerMessages = buildProviderMessages(history, message);

    const userMsg = await appendUserMessage(userId, targetThreadId, message);

    const assistantMsg = await createAssistantPlaceholder(userId, targetThreadId, {
      providerConnectionId: resolved.connection.id,
      providerModelId: resolved.providerModelId,
      modelId: resolved.modelId,
    });

    const genRun = await createGenerationRun(userId, targetThreadId, userMsg.id, assistantMsg.id, {
      providerConnectionId: resolved.connection.id,
      providerModelId: resolved.providerModelId,
      modelId: resolved.modelId,
      protocol: resolved.protocol,
    });

    await updateThreadLastMessage(targetThreadId, userId, {
      defaultProviderConnectionId: resolved.connection.id,
      defaultProviderModelId: resolved.providerModelId,
      defaultModelId: resolved.modelId,
    });

    if (!history.some((m) => m.role === "assistant" && m.status === "complete")) {
      const title = generateTitle(message);
      const threadModule = await import("@/lib/chat/chat-service");
      await threadModule.renameThread(userId, targetThreadId, title);
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => {
      abortController.abort();
    }, CHAT_STREAM_TIMEOUT_MS);

    const streamStart = Date.now();

    const { stream, result: immediateResult } = await chatWithProvider(
      resolved.protocol,
      apiKey,
      resolved.chatUrl,
      resolved.modelId,
      providerMessages,
      {
        maxTokens: maxTokens ?? CHAT_DEFAULT_MAX_TOKENS,
        temperature: temperature ?? undefined,
        signal: abortController.signal,
      }
    );

    if (immediateResult) {
      clearTimeout(timeout);
      const durationMs = Date.now() - streamStart;

      let content = "";
      let finishReason: string | null = null;
      let usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | null = null;

      if (immediateResult.ok) {
        content = immediateResult.content;
        finishReason = immediateResult.finishReason;
        usage = immediateResult.usage;

        if (!content && !immediateResult.usedNonStreamFallback) {
          const fallback = await chatWithProviderNonStream(
            resolved.protocol,
            apiKey,
            resolved.chatUrl,
            resolved.modelId,
            providerMessages,
            {
              maxTokens: maxTokens ?? CHAT_DEFAULT_MAX_TOKENS,
              temperature: temperature ?? undefined,
              signal: undefined,
            }
          );

          if (fallback.ok) {
            content = fallback.content;
            usage = fallback.usage;
          } else {
            immediateResult.ok = false;
            immediateResult.errorMessage = fallback.errorMessage;
          }
        }
      }

      updateAssistantMessageContent(assistantMsg.id, content, {
        status: immediateResult.ok ? "complete" : "error",
        promptTokens: usage?.promptTokens,
        completionTokens: usage?.completionTokens,
        totalTokens: usage?.totalTokens,
        safeError: immediateResult.ok ? undefined : (immediateResult.errorMessage ?? undefined),
      }).catch(() => {});

      updateGenerationRun(genRun.id, {
        status: immediateResult.ok ? "complete" : "error",
        finishedAt: new Date().toISOString(),
        durationMs,
        httpStatus: immediateResult.httpStatus ?? undefined,
        inputTokens: usage?.promptTokens,
        outputTokens: usage?.completionTokens,
        totalTokens: usage?.totalTokens,
        safeError: immediateResult.ok ? undefined : (immediateResult.errorMessage ?? undefined),
        errorType: immediateResult.ok ? undefined : (finishReason ?? undefined),
      }).catch(() => {});

      const threadResult = await (await import("@/lib/chat/chat-service")).getThread(userId, targetThreadId);

      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(encodeSSE("thread", { thread: threadResult }))
          );
          controller.enqueue(
            new TextEncoder().encode(encodeSSE("user_message", { message: userMsg }))
          );
          controller.enqueue(
            new TextEncoder().encode(
              encodeSSE("assistant_message", {
                message: { ...assistantMsg, content, status: immediateResult.ok ? "complete" : "error" },
              })
            )
          );
          if (content) {
            controller.enqueue(new TextEncoder().encode(encodeSSE("delta", { content })));
          }
          if (!immediateResult.ok && immediateResult.errorMessage) {
            controller.enqueue(
              new TextEncoder().encode(encodeSSE("error", { error: immediateResult.errorMessage }))
            );
          }
          controller.enqueue(new TextEncoder().encode(encodeDone()));
          controller.close();
        },
      });

      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-store",
          Connection: "keep-alive",
        },
      });
    }

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 401 }
      );
    }
    if (err instanceof NotFoundError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Stream request failed.",
      },
      { status: 500 }
    );
  }
}
