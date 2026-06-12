"use client";

import { useState, useCallback } from "react";
import { User, Bot, Copy, Check, RefreshCw, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageContent } from "@/components/chat/chat-message-content";
import type { ChatMessage } from "@/lib/chat/types";

interface ChatMessageProps {
  message: ChatMessage;
  isLastAssistant?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
}

export function ChatMessage({
  message,
  isLastAssistant,
  onCopy,
  onRegenerate,
  onEdit,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isCancelled = message.status === "cancelled";
  const isStreaming = message.status === "streaming";

  const isRegeneration =
    !isUser &&
    message.safe_metadata &&
    typeof message.safe_metadata === "object" &&
    (message.safe_metadata as Record<string, unknown>).action === "regenerate";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(message.content);
    } catch {}
  }, [message.content, onCopy]);

  const handleEdit = useCallback(() => {
    onEdit?.(message.id, message.content);
  }, [message.id, message.content, onEdit]);

  const handleRegenerate = useCallback(() => {
    onRegenerate?.(message.id);
  }, [message.id, onRegenerate]);

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-4 md:px-6 animate-fade-in",
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
          "flex flex-col gap-1",
          isUser ? "items-end" : "items-start",
          "max-w-[85%] md:max-w-[75%]"
        )}
      >
        <div
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm w-full",
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
                <MessageContent content={message.content} />
              ) : null}
              {message.safe_error ? (
                <p className="text-xs text-muted-foreground">{message.safe_error}</p>
              ) : null}
            </div>
          ) : (
            <>
              {isRegeneration && (
                <span className="mb-1 block text-[10px] font-medium text-muted-foreground/70">
                  Regenerated
                </span>
              )}
              <MessageContent content={message.content} />
              {isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-foreground/60 align-text-bottom" />
              )}
            </>
          )}
        </div>

        {message.total_tokens != null && !isStreaming && (
          <p className="px-1 text-[10px] text-muted-foreground/50">
            {message.total_tokens} tokens
          </p>
        )}

        {!isStreaming && message.content && (
          <div className="flex items-center gap-0.5 px-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy message"}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {isUser && onEdit && (
              <button
                type="button"
                onClick={handleEdit}
                aria-label="Edit message"
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
            {!isUser && isLastAssistant && onRegenerate && (
              <button
                type="button"
                onClick={handleRegenerate}
                aria-label="Regenerate response"
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            )}
            {!isUser && isError && onRegenerate && (
              <button
                type="button"
                onClick={handleRegenerate}
                aria-label="Retry"
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
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
