"use client";

import { useState, useRef, useCallback } from "react";
import type {
  ChatThread,
  ChatMessage,
  ChatModelOption,
  StreamRequest,
} from "@/lib/chat/types";

export interface StreamState {
  thread: ChatThread | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  modelOptions: ChatModelOption[];
}

export function useChatStream() {
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelOptions, setModelOptions] = useState<ChatModelOption[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/models");
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok && Array.isArray(json.models)) {
        setModelOptions(json.models);
      }
    } catch {
      // silently fail
    }
  }, []);

  const loadThread = useCallback(async (threadId: string) => {
    try {
      const [threadRes, msgRes] = await Promise.all([
        fetch(`/api/chat/threads/${encodeURIComponent(threadId)}`),
        fetch(`/api/chat/threads/${encodeURIComponent(threadId)}/messages`),
      ]);
      if (!threadRes.ok || !msgRes.ok) return;
      const threadJson = await threadRes.json();
      const msgJson = await msgRes.json();
      if (threadJson.ok) setThread(threadJson.thread);
      if (msgJson.ok) setMessages(msgJson.messages);
      setError(null);
    } catch {
      setError("Could not load thread.");
    }
  }, []);

  const listThreads = useCallback(async (): Promise<ChatThread[]> => {
    try {
      const res = await fetch("/api/chat/threads");
      if (!res.ok) return [];
      const json = await res.json();
      return json.ok ? (json.threads ?? []) : [];
    } catch {
      return [];
    }
  }, []);

  const createThread = useCallback(async (): Promise<ChatThread | null> => {
    try {
      const res = await fetch("/api/chat/threads", { method: "POST" });
      if (!res.ok) return null;
      const json = await res.json();
      if (json.ok) {
        setThread(json.thread);
        setMessages([]);
        setError(null);
        return json.thread;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const renameThread = useCallback(
    async (threadId: string, title: string) => {
      try {
        await fetch(`/api/chat/threads/${encodeURIComponent(threadId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
      } catch {
        // silently fail
      }
    },
    []
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      try {
        await fetch(`/api/chat/threads/${encodeURIComponent(threadId)}`, {
          method: "DELETE",
        });
        if (thread?.id === threadId) {
          setThread(null);
          setMessages([]);
        }
      } catch {
        // silently fail
      }
    },
    [thread?.id]
  );

  const archiveThread = useCallback(
    async (threadId: string) => {
      try {
        await fetch(`/api/chat/threads/${encodeURIComponent(threadId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_archived: true }),
        });
        if (thread?.id === threadId) {
          setThread(null);
          setMessages([]);
        }
      } catch {
        // silently fail
      }
    },
    [thread?.id]
  );

  const pinThread = useCallback(
    async (threadId: string, pinned: boolean) => {
      try {
        await fetch(`/api/chat/threads/${encodeURIComponent(threadId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_pinned: pinned }),
        });
        if (thread?.id === threadId) {
          setThread((prev) => (prev ? { ...prev, is_pinned: pinned } : prev));
        }
      } catch {
        // silently fail
      }
    },
    [thread?.id]
  );

  function streamSSE(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    userMsg: ChatMessage,
    assistantMsg: ChatMessage
  ): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantId = assistantMsg.id;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const eventLine = part.match(/^event: (.+)$/m);
            const dataLine = part.match(/^data: (.+)$/m);
            if (!eventLine || !dataLine) continue;

            const event = eventLine[1];
            let data: Record<string, unknown> = {};
            try {
              data = JSON.parse(dataLine[1]);
            } catch {}

            if (event === "thread" && data.thread) {
              setThread(data.thread as ChatThread);
            }

            if (event === "user_message" && data.message) {
              const m = data.message as ChatMessage;
              setMessages((prev) => prev.map((p) => (p.id === userMsg.id ? m : p)));
            }

            if (event === "assistant_message" && data.message) {
              const m = data.message as ChatMessage;
              assistantId = m.id;
              setMessages((prev) => {
                const exists = prev.some((p) => p.id === m.id);
                if (exists) return prev.map((p) => (p.id === m.id ? m : p));
                return prev.map((p) => (p.id === assistantMsg.id ? m : p));
              });
            }

            if (event === "delta" && typeof data.content === "string") {
              setMessages((prev) =>
                prev.map((p) =>
                  p.id === assistantId
                    ? { ...p, content: p.content + (data.content as string) }
                    : p
                )
              );
            }

            if (event === "error" && typeof data.error === "string") {
              setError(data.error);
              setMessages((prev) =>
                prev.map((p) =>
                  p.id === assistantId
                    ? { ...p, status: "error", safe_error: data.error as string }
                    : p
                )
              );
            }
          }
        }
      } catch {
        // stream error handled externally
      }
      resolve();
    });
  }

  const sendMessage = useCallback(
    async (opts: StreamRequest) => {
      if (isStreaming) return;
      setError(null);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      const tempId = `temp-${Date.now()}`;
      const tempAssistantId = `temp-assistant-${Date.now()}`;
      const now = new Date().toISOString();

      const userMsg: ChatMessage = {
        id: tempId,
        thread_id: opts.threadId ?? thread?.id ?? "",
        user_id: "",
        role: "user",
        content: opts.message,
        status: "complete",
        sequence: messages.length + 1,
        parent_message_id: null,
        provider_connection_id: null,
        provider_model_id: null,
        model_id: null,
        prompt_tokens: null,
        completion_tokens: null,
        total_tokens: null,
        safe_error: null,
        safe_metadata: {},
        created_at: now,
        updated_at: now,
        completed_at: now,
      };

      const assistantMsg: ChatMessage = {
        id: tempAssistantId,
        thread_id: opts.threadId ?? thread?.id ?? "",
        user_id: "",
        role: "assistant",
        content: "",
        status: "streaming",
        sequence: messages.length + 2,
        parent_message_id: null,
        provider_connection_id: null,
        provider_model_id: null,
        model_id: null,
        prompt_tokens: null,
        completion_tokens: null,
        total_tokens: null,
        safe_error: null,
        safe_metadata: {},
        created_at: now,
        updated_at: now,
        completed_at: null,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      try {
        const body: Record<string, unknown> = {
          threadId: opts.threadId,
          message: opts.message,
          providerConnectionId: opts.providerConnectionId,
          providerModelId: opts.providerModelId,
          modelId: opts.modelId,
          temperature: opts.temperature,
          maxTokens: opts.maxTokens,
          action: opts.action ?? "normal",
        };
        if (opts.originalUserMessageId) body.originalUserMessageId = opts.originalUserMessageId;
        if (opts.assistantMessageId) body.assistantMessageId = opts.assistantMessageId;

        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          let errMsg = "Stream request failed.";
          try {
            const errJson = await res.json();
            if (errJson.error) errMsg = errJson.error;
          } catch {}
          setError(errMsg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId
                ? { ...m, status: "error", safe_error: errMsg }
                : m
            )
          );
          setIsStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setError("No response stream.");
          setIsStreaming(false);
          return;
        }

        await streamSSE(reader, userMsg, assistantMsg);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.status === "streaming" ? { ...m, status: "cancelled" } : m
            )
          );
        } else {
          const msg = err instanceof Error ? err.message : "Stream failed.";
          setError(msg);
          setMessages((prev) =>
            prev.map((m) =>
              m.status === "streaming"
                ? { ...m, status: "error", safe_error: msg }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, thread, messages]
  );

  const cancelStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const regenerate = useCallback(
    async (opts: {
      threadId: string;
      providerConnectionId?: string;
      providerModelId?: string;
      modelId?: string;
    }) => {
      if (isStreaming) return;
      setError(null);
      setIsStreaming(true);
      abortRef.current = new AbortController();

      const tempAssistantId = `temp-regenerate-${Date.now()}`;
      const now = new Date().toISOString();

      const placeholderMsg: ChatMessage = {
        id: tempAssistantId,
        thread_id: opts.threadId,
        user_id: "",
        role: "assistant",
        content: "",
        status: "streaming",
        sequence: messages.length + 1,
        parent_message_id: null,
        provider_connection_id: null,
        provider_model_id: null,
        model_id: null,
        prompt_tokens: null,
        completion_tokens: null,
        total_tokens: null,
        safe_error: null,
        safe_metadata: {},
        created_at: now,
        updated_at: now,
        completed_at: null,
      };

      setMessages((prev) => [...prev, placeholderMsg]);

      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threadId: opts.threadId,
            action: "regenerate",
            providerConnectionId: opts.providerConnectionId,
            providerModelId: opts.providerModelId,
            modelId: opts.modelId,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          let errMsg = "Regeneration failed.";
          try {
            const errJson = await res.json();
            if (errJson.error) errMsg = errJson.error;
          } catch {}
          setError(errMsg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId
                ? { ...m, status: "error", safe_error: errMsg }
                : m
            )
          );
          setIsStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setError("No response stream.");
          setIsStreaming(false);
          return;
        }

        await streamSSE(reader, { id: "", content: "", role: "user", status: "complete", sequence: 0, thread_id: opts.threadId, user_id: "", parent_message_id: null, provider_connection_id: null, provider_model_id: null, model_id: null, prompt_tokens: null, completion_tokens: null, total_tokens: null, safe_error: null, safe_metadata: {}, created_at: now, updated_at: now, completed_at: now } as ChatMessage, placeholderMsg);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.status === "streaming" ? { ...m, status: "cancelled" } : m
            )
          );
        } else {
          setError(err instanceof Error ? err.message : "Regeneration failed.");
          setMessages((prev) =>
            prev.map((m) =>
              m.status === "streaming"
                ? { ...m, status: "error", safe_error: "Regeneration failed." }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messages]
  );

  const editAndResend = useCallback(
    async (opts: {
      threadId: string;
      originalUserMessageId: string;
      editedContent: string;
      providerConnectionId?: string;
      providerModelId?: string;
      modelId?: string;
    }) => {
      if (isStreaming) return;
      return sendMessage({
        threadId: opts.threadId,
        message: opts.editedContent,
        providerConnectionId: opts.providerConnectionId,
        providerModelId: opts.providerModelId,
        modelId: opts.modelId,
        action: "edit",
        originalUserMessageId: opts.originalUserMessageId,
      });
    },
    [sendMessage, isStreaming]
  );

  return {
    thread,
    messages,
    isStreaming,
    error,
    modelOptions,
    fetchModels,
    loadThread,
    listThreads,
    createThread,
    renameThread,
    deleteThread,
    archiveThread,
    pinThread,
    sendMessage,
    cancelStream,
    regenerate,
    editAndResend,
  };
}
