import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  appendUserMessage,
  createAssistantPlaceholder,
  createEditedUserMessage,
  createRegenerationPlaceholder,
  createGenerationRun,
  updateAssistantMessageContent,
  updateGenerationRun,
  updateThreadLastMessage,
  resolveChatModel,
  readDecryptedProviderSecret,
  listMessages,
  getMessage,
  getThread,
  AuthError,
  NotFoundError,
} from "@/lib/chat/chat-service";
import { generateTitle } from "@/lib/chat/title";
import { buildProviderMessages } from "@/lib/chat/chat-context";
import { chatWithProvider, chatWithProviderNonStream } from "@/lib/chat/provider-chat";
import { encodeSSE, encodeDone } from "@/lib/chat/sse";
import {
  CHAT_STREAM_TIMEOUT_MS,
  CHAT_MAX_INPUT_CHARS,
  CHAT_DEFAULT_MAX_TOKENS,
} from "@/lib/chat/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function doStream(
  userId: string,
  targetThreadId: string,
  resolved: Awaited<ReturnType<typeof resolveChatModel>>,
  providerMessages: Array<{ role: string; content: string }>,
  userMsg: { id: string },
  assistantMsg: { id: string },
  genRun: { id: string },
  opts: { maxTokens?: number; temperature?: number }
): Promise<Response> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), CHAT_STREAM_TIMEOUT_MS);
  const streamStart = Date.now();

  const apiKey = await readDecryptedProviderSecret(userId, resolved.connection.id);

  const { stream, result: immediateResult } = await chatWithProvider(
    resolved.protocol,
    apiKey,
    resolved.chatUrl,
    resolved.modelId,
    providerMessages,
    {
      maxTokens: opts.maxTokens ?? CHAT_DEFAULT_MAX_TOKENS,
      temperature: opts.temperature ?? undefined,
      signal: abortController.signal,
    }
  );

  if (immediateResult) {
    clearTimeout(timeout);
    const durationMs = Date.now() - streamStart;
    let content = "";
    let usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | null = null;
    let ok = immediateResult.ok;

    if (immediateResult.ok) {
      content = immediateResult.content;
      usage = immediateResult.usage;
      if (!content && !immediateResult.usedNonStreamFallback) {
        const fallback = await chatWithProviderNonStream(
          resolved.protocol,
          apiKey,
          resolved.chatUrl,
          resolved.modelId,
          providerMessages,
          {
            maxTokens: opts.maxTokens ?? CHAT_DEFAULT_MAX_TOKENS,
            temperature: opts.temperature ?? undefined,
          }
        );
        if (fallback.ok) {
          content = fallback.content;
          usage = fallback.usage;
        } else {
          ok = false;
          immediateResult.errorMessage = fallback.errorMessage;
        }
      }
    }

    updateAssistantMessageContent(assistantMsg.id, content, {
      status: ok ? "complete" : "error",
      promptTokens: usage?.promptTokens,
      completionTokens: usage?.completionTokens,
      totalTokens: usage?.totalTokens,
      safeError: ok ? undefined : (immediateResult.errorMessage ?? undefined),
    }).catch(() => {});

    updateGenerationRun(genRun.id, {
      status: ok ? "complete" : "error",
      finishedAt: new Date().toISOString(),
      durationMs,
      httpStatus: immediateResult.httpStatus ?? undefined,
      inputTokens: usage?.promptTokens,
      outputTokens: usage?.completionTokens,
      totalTokens: usage?.totalTokens,
      safeError: ok ? undefined : (immediateResult.errorMessage ?? undefined),
      errorType: ok ? undefined : (immediateResult.finishReason ?? undefined),
    }).catch(() => {});

    const threadResult = await getThread(userId, targetThreadId);

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(encodeSSE("thread", { thread: threadResult })));
        controller.enqueue(new TextEncoder().encode(encodeSSE("user_message", { message: userMsg })));
        controller.enqueue(
          new TextEncoder().encode(
            encodeSSE("assistant_message", {
              message: { ...assistantMsg, content, status: ok ? "complete" : "error" },
            })
          )
        );
        if (content) {
          controller.enqueue(new TextEncoder().encode(encodeSSE("delta", { content })));
        }
        if (!ok && immediateResult.errorMessage) {
          controller.enqueue(new TextEncoder().encode(encodeSSE("error", { error: immediateResult.errorMessage })));
        }
        controller.enqueue(new TextEncoder().encode(encodeDone()));
        controller.close();
      },
    });

    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" },
    });
  }

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ ok: false, error: "You must be signed in." }, { status: 401 });
    }
    const userId = user.id;

    const json = await request.json();
    const action: string = json.action ?? "normal";
    const message = typeof json.message === "string" ? json.message.trim() : "";
    const threadId: string | undefined = json.threadId;
    const originalUserMessageId: string | undefined = json.originalUserMessageId;
    const providerConnectionId: string | undefined = json.providerConnectionId;
    const providerModelId: string | undefined = json.providerModelId;
    const modelId: string | undefined = json.modelId;
    const temperature: number | undefined = json.temperature;
    const maxTokens: number | undefined = json.maxTokens;

    let targetThreadId: string;
    let userMsg: { id: string; thread_id?: string };
    let assistantMsg: { id: string };
    let genRun: { id: string };

    if (action === "regenerate") {
      if (!threadId) {
        return NextResponse.json({ ok: false, error: "Thread ID is required for regenerate." }, { status: 400 });
      }
      await getThread(userId, threadId);
      targetThreadId = threadId;

      const history = await listMessages(userId, targetThreadId);
      const lastUserMsg = [...history].reverse().find((m) => m.role === "user" && m.status === "complete");
      if (!lastUserMsg) {
        return NextResponse.json({ ok: false, error: "No user message to regenerate from." }, { status: 400 });
      }

      const existingRegenerations = history.filter(
        (m) => m.role === "assistant" && m.parent_message_id === lastUserMsg.id && m.status !== "streaming"
      );

      const resolved = await resolveChatModel(userId, providerModelId, providerConnectionId);
      const providerMessages = buildProviderMessages(history, lastUserMsg.content);

      userMsg = lastUserMsg;
      assistantMsg = await createRegenerationPlaceholder(userId, targetThreadId, {
        providerConnectionId: resolved.connection.id,
        providerModelId: resolved.providerModelId,
        modelId: resolved.modelId,
        parentMessageId: lastUserMsg.id,
        regeneratedFromMessageId: lastUserMsg.id,
        regenerationIndex: existingRegenerations.length + 1,
      });

      genRun = await createGenerationRun(userId, targetThreadId, lastUserMsg.id, assistantMsg.id, {
        providerConnectionId: resolved.connection.id,
        providerModelId: resolved.providerModelId,
        modelId: resolved.modelId,
        protocol: resolved.protocol,
      });

      await updateThreadLastMessage(targetThreadId, userId);
      return doStream(userId, targetThreadId, resolved, providerMessages, userMsg, assistantMsg, genRun, { maxTokens, temperature });
    }

    if (action === "edit") {
      if (!threadId || !originalUserMessageId) {
        return NextResponse.json(
          { ok: false, error: "Thread ID and original message ID are required." },
          { status: 400 }
        );
      }
      if (!message || message.length > CHAT_MAX_INPUT_CHARS) {
        return NextResponse.json(
          { ok: false, error: !message ? "Edited content is required." : `Message too long (max ${CHAT_MAX_INPUT_CHARS}).` },
          { status: 400 }
        );
      }

      await getThread(userId, threadId);
      targetThreadId = threadId;
      await getMessage(userId, originalUserMessageId);

      userMsg = await createEditedUserMessage(userId, targetThreadId, originalUserMessageId, message);

      const history = await listMessages(userId, targetThreadId);
      const resolved = await resolveChatModel(userId, providerModelId, providerConnectionId);
      const providerMessages = buildProviderMessages(history, message);

      assistantMsg = await createAssistantPlaceholder(userId, targetThreadId, {
        providerConnectionId: resolved.connection.id,
        providerModelId: resolved.providerModelId,
        modelId: resolved.modelId,
      });

      genRun = await createGenerationRun(userId, targetThreadId, userMsg.id, assistantMsg.id, {
        providerConnectionId: resolved.connection.id,
        providerModelId: resolved.providerModelId,
        modelId: resolved.modelId,
        protocol: resolved.protocol,
      });

      await updateThreadLastMessage(targetThreadId, userId);
      return doStream(userId, targetThreadId, resolved, providerMessages, userMsg, assistantMsg, genRun, { maxTokens, temperature });
    }

    if (!message) {
      return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
    }
    if (message.length > CHAT_MAX_INPUT_CHARS) {
      return NextResponse.json(
        { ok: false, error: `Message too long (max ${CHAT_MAX_INPUT_CHARS} characters).` },
        { status: 400 }
      );
    }

    if (threadId) {
      await getThread(userId, threadId);
      targetThreadId = threadId;
    } else {
      const thread = await (await import("@/lib/chat/chat-service")).createThread(userId, {
        title: generateTitle(message),
        defaultProviderConnectionId: providerConnectionId,
        defaultProviderModelId: providerModelId,
        defaultModelId: modelId,
      });
      targetThreadId = thread.id;
    }

    const resolved = await resolveChatModel(userId, providerModelId, providerConnectionId);
    const history = await listMessages(userId, targetThreadId);
    const providerMessages = buildProviderMessages(history, message);

    userMsg = await appendUserMessage(userId, targetThreadId, message);

    assistantMsg = await createAssistantPlaceholder(userId, targetThreadId, {
      providerConnectionId: resolved.connection.id,
      providerModelId: resolved.providerModelId,
      modelId: resolved.modelId,
    });

    genRun = await createGenerationRun(userId, targetThreadId, userMsg.id, assistantMsg.id, {
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
      await (await import("@/lib/chat/chat-service")).renameThread(userId, targetThreadId, generateTitle(message));
    }

    return doStream(userId, targetThreadId, resolved, providerMessages, userMsg, assistantMsg, genRun, { maxTokens, temperature });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    if (err instanceof NotFoundError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 404 });
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Stream request failed." },
      { status: 500 }
    );
  }
}
