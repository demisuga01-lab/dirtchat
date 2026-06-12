"use client";

import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat/types";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isCancelled = message.status === "cancelled";
  const isStreaming = message.status === "streaming";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-4 md:px-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2.5 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary/60 text-foreground"
        )}
      >
        {isError || isCancelled ? (
          <div className="flex flex-col gap-1">
            <span className={cn(isError && "text-destructive", "text-xs font-medium")}>
              {isError ? "Error" : "Cancelled"}
            </span>
            {message.content ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : null}
            {message.safe_error ? (
              <p className="text-xs text-muted-foreground">{message.safe_error}</p>
            ) : null}
          </div>
        ) : (
          <p className="whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-foreground/60 align-text-bottom" />
            )}
          </p>
        )}
        {message.total_tokens != null && !isStreaming && (
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            {message.total_tokens} tokens
          </p>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
