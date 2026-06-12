"use client";

import { useState, useEffect } from "react";
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
    archiveThread,
    deleteThread,
    renameThread,
    sendMessage,
    cancelStream,
  } = useChatStream();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);

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

  async function handleNewThread() {
    const t = await createThread();
    if (t) {
      const updated = await listThreads();
      setThreads(updated);
    }
  }

  async function handleSelectThread(id: string) {
    await loadThread(id);
  }

  async function handleDeleteThread(id: string) {
    await deleteThread(id);
    const updated = await listThreads();
    setThreads(updated);
  }

  async function handleArchiveThread(id: string) {
    await archiveThread(id);
    const updated = await listThreads();
    setThreads(updated);
  }

  async function handleRenameThread(id: string, title: string) {
    const newTitle = window.prompt("Rename conversation", title);
    if (newTitle && newTitle.trim()) {
      await renameThread(id, newTitle.trim());
      const updated = await listThreads();
      setThreads(updated);
    }
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
    const updated = await listThreads();
    setThreads(updated);
  }

  function handleModelSelect(model: ChatModelOption) {
    setSelectedModelId(model.provider_model_id);
  }

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-3.5rem)] flex-col md:-mx-8 md:-my-8">
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
              <ChatMessageList messages={messages} isLoading={false} />
              <ChatComposer
                onSend={handleSend}
                onCancel={cancelStream}
                isStreaming={isStreaming}
                disabled={modelOptions.length === 0}
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
