"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import type { ChatMessage as ChatMessageType } from "@/lib/chat/types";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  onCopy,
  onRegenerate,
  onEdit,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant" && messages[i].status !== "streaming") {
        return i;
      }
    }
    return -1;
  })();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Start a conversation
          </h2>
          <p className="mt-2 text-balance text-sm text-muted-foreground">
            Send a message below to begin chatting with your provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-border/20">
        {messages.map((m, i) => (
          <ChatMessage
            key={m.id}
            message={m}
            isLastAssistant={i === lastAssistantIndex}
            onCopy={onCopy}
            onRegenerate={onRegenerate}
            onEdit={onEdit}
          />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
