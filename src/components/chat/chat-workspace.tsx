"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatModelSelector } from "@/components/chat/chat-model-selector";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { useChatStream } from "@/components/chat/use-chat-stream";
import type { ChatModelOption } from "@/lib/chat/types";

export function ChatWorkspace() {
  const {
    thread,
    messages,
    isStreaming,
    error,
    modelOptions,
    fetchModels,
    loadThread,
    sendMessage,
    cancelStream,
    regenerate,
    editAndResend,
    clearThread,
  } = useChatStream();

  const searchParams = useSearchParams();
  const router = useRouter();
  const threadId = searchParams.get("thread");

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    if (threadId) {
      loadThread(threadId);
    } else {
      clearThread();
    }
  }, [threadId, loadThread, clearThread]);

  useEffect(() => {
    if (thread?.id && threadId !== thread.id) {
      router.replace(`/chat?thread=${thread.id}`);
    }
  }, [thread?.id, threadId, router]);

  useEffect(() => {
    if (modelOptions.length > 0 && !selectedModelId) {
      const first = modelOptions[0];
      setSelectedModelId(first.provider_model_id);
    }
  }, [modelOptions, selectedModelId]);

  async function handleNewThread() {
    router.push("/chat");
    cancelEdit();
  }

  function handleEditMessage(messageId: string, content: string) {
    setEditMessageId(messageId);
    setEditContent(content);
  }

  function cancelEdit() {
    setEditMessageId(null);
    setEditContent("");
  }

  async function handleEditSend(editedContent: string, originalMessageId: string) {
    const selectedModel = modelOptions.find(
      (m) => m.provider_model_id === selectedModelId
    );
    await editAndResend({
      threadId: thread?.id ?? "",
      originalUserMessageId: originalMessageId,
      editedContent,
      providerConnectionId: selectedModel?.provider_connection_id,
      providerModelId: selectedModel?.provider_model_id,
      modelId: selectedModel?.model_id,
    });
    cancelEdit();
  }

  async function handleSend(message: string) {
    const selectedModel = modelOptions.find(
      (m) => m.provider_model_id === selectedModelId
    );
    await sendMessage({
      threadId: thread?.id,
      message,
      providerConnectionId: selectedModel?.provider_connection_id,
      providerModelId: selectedModel?.provider_model_id,
      modelId: selectedModel?.model_id,
    });
  }

  function handleRegenerate() {
    if (!thread?.id || isStreaming) return;
    const selectedModel = modelOptions.find(
      (m) => m.provider_model_id === selectedModelId
    );
    regenerate({
      threadId: thread.id,
      providerConnectionId: selectedModel?.provider_connection_id,
      providerModelId: selectedModel?.provider_model_id,
      modelId: selectedModel?.model_id,
    });
  }

  function handleModelSelect(model: ChatModelOption) {
    setSelectedModelId(model.provider_model_id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      handleNewThread();
    }
  }

  return (
    <div
      className="-mx-4 -my-6 flex h-[calc(100dvh-3.5rem)] flex-col md:-mx-8 md:-my-8"
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-1 overflow-hidden">
        <section className="flex flex-1 flex-col overflow-hidden">
          {thread || messages.length > 0 ? (
            <>
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:px-6">
                <ChatModelSelector
                  models={modelOptions}
                  selectedId={selectedModelId}
                  onSelect={handleModelSelect}
                  disabled={isStreaming}
                />
                {error && (
                  <span className="text-xs text-destructive">{error}</span>
                )}
              </div>
              <ChatMessageList
                messages={messages}
                isLoading={false}
                onRegenerate={handleRegenerate}
                onEdit={handleEditMessage}
              />
              <ChatComposer
                onSend={handleSend}
                onCancel={cancelStream}
                isStreaming={isStreaming}
                disabled={modelOptions.length === 0}
                editValue={editContent}
                editOriginalMessageId={editMessageId ?? undefined}
                onEditSend={handleEditSend}
                onEditCancel={cancelEdit}
              />
            </>
          ) : (
            <>
              <ChatEmptyState />
              <ChatComposer
                onSend={handleSend}
                onCancel={cancelStream}
                isStreaming={isStreaming}
                disabled={modelOptions.length === 0}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
