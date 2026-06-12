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
        fetch(
          `/api/chat/threads/${encodeURIComponent(threadId)}/messages`
        ),
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
        await fetch(
          `/api/chat/threads/${encodeURIComponent(threadId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          }
        );
      } catch {
        // silently fail
      }
    },
    []
  );

  const deleteThread = useCallback(async (threadId: string) => {
    try {
      await fetch(
        `/api/chat/threads/${encodeURIComponent(threadId)}`,
        { method: "DELETE" }
      );
      if (thread?.id === threadId) {
        setThread(null);
        setMessages([]);
      }
    } catch {
      // silently fail
    }
  }, [thread?.id]);

  const archiveThread = useCallback(async (threadId: string) => {
    try {
      await fetch(
        `/api/chat/threads/${encodeURIComponent(threadId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_archived: true }),
        }
      );
      if (thread?.id === threadId) {
        setThread(null);
        setMessages([]);
      }
    } catch {
      // silently fail
    }
  }, [thread?.id]);

  const sendMessage = useCallback(
    async (opts: StreamRequest) => {
      if (isStreaming) return;
      setError(null);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const userMsg: ChatMessage = {
          id: `temp-${Date.now()}`,
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        const assistantMsg: ChatMessage = {
          id: `temp-assistant-${Date.now()}`,
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threadId: opts.threadId,
            message: opts.message,
            providerConnectionId: opts.providerConnectionId,
            providerModelId: opts.providerModelId,
            modelId: opts.modelId,
            temperature: opts.temperature,
            maxTokens: opts.maxTokens,
          }),
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
              m.id === assistantMsg.id
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

        const decoder = new TextDecoder();
        let buffer = "";
        let assistantId = assistantMsg.id;

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
              const t = data.thread as ChatThread;
              setThread(t);
            }

            if (event === "user_message" && data.message) {
              const m = data.message as ChatMessage;
              setMessages((prev) =>
                prev.map((p) => (p.id === userMsg.id ? m : p))
              );
            }

            if (event === "assistant_message" && data.message) {
              const m = data.message as ChatMessage;
              assistantId = m.id;
              setMessages((prev) =>
                prev.map((p) =>
                  p.id === assistantMsg.id ? m : p.id === assistantId ? m : p
                )
              );
            }

            if (event === "delta" && typeof data.content === "string") {
              setMessages((prev) =>
                prev.map((p) =>
                  p.id === assistantId
                    ? { ...p, content: p.content + data.content }
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
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.status === "streaming" ? { ...m, status: "cancelled" } : m
            )
          );
        } else {
          setError(
            err instanceof Error ? err.message : "Stream failed."
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.status === "streaming"
                ? { ...m, status: "error", safe_error: "Stream failed." }
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

  const selectModel = useCallback(
    (modelOption: ChatModelOption) => {
      // store in a ref or state for next send
      return {
        providerConnectionId: modelOption.provider_connection_id,
        providerModelId: modelOption.provider_model_id,
        modelId: modelOption.model_id,
      };
    },
    []
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
    sendMessage,
    cancelStream,
    selectModel,
  };
}
