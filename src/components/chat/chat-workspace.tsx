"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatThreadSidebar } from "@/components/chat/chat-thread-sidebar";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatModelSelector } from "@/components/chat/chat-model-selector";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { useChatStream } from "@/components/chat/use-chat-stream";
import type { ChatThread, ChatModelOption } from "@/lib/chat/types";

export function ChatWorkspace() {
  const {
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
  } = useChatStream();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  useEffect(() => {
    async function init() {
      setIsLoadingThreads(true);
      const [loadedThreads] = await Promise.all([
        listThreads(),
        fetchModels(),
      ]);
      setThreads(loadedThreads);
      setIsLoadingThreads(false);
    }
    init();
  }, [fetchModels, listThreads]);

  useEffect(() => {
    if (modelOptions.length > 0 && !selectedModelId) {
      const first = modelOptions[0];
      setSelectedModelId(first.provider_model_id);
    }
  }, [modelOptions, selectedModelId]);

  const refreshThreads = useCallback(async () => {
    const updated = await listThreads();
    setThreads(updated);
  }, [listThreads]);

  async function handleNewThread() {
    if (!thread?.id) {
      const t = await createThread();
      if (t) await refreshThreads();
    } else {
      const t = await createThread();
      if (t) await refreshThreads();
    }
    cancelEdit();
  }

  async function handleSelectThread(id: string) {
    await loadThread(id);
    cancelEdit();
  }

  async function handleDeleteThread(id: string) {
    await deleteThread(id);
    await refreshThreads();
  }

  async function handleArchiveThread(id: string) {
    await archiveThread(id);
    await refreshThreads();
  }

  async function handleRenameThread(id: string, title: string) {
    await renameThread(id, title);
    await refreshThreads();
  }

  async function handlePinThread(id: string, pinned: boolean) {
    await pinThread(id, pinned);
    await refreshThreads();
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
    await refreshThreads();
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
    await refreshThreads();
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
        <ChatThreadSidebar
          threads={threads}
          activeThreadId={thread?.id ?? null}
          isLoading={isLoadingThreads}
          onSelect={handleSelectThread}
          onNew={handleNewThread}
          onDelete={handleDeleteThread}
          onArchive={handleArchiveThread}
          onRename={handleRenameThread}
          onPin={handlePinThread}
        />
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
              <div className="border-t border-border/60 bg-background/40 px-4 py-3 md:px-6">
                <ChatComposer
                  onSend={handleSend}
                  onCancel={cancelStream}
                  isStreaming={isStreaming}
                  disabled={modelOptions.length === 0}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
