"use client";

import { useState, useCallback } from "react";
import { User, Bot, Copy, Check, RefreshCw, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageContent } from "@/components/chat/chat-message-content";
import type { ChatMessage as ChatMessageType } from "@/lib/chat/types";

interface ChatMessageProps {
  message: ChatMessageType;
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
    <div className="w-full border-b border-border/40 py-6 hover:bg-secondary/10 transition-colors group">
      <div className="mx-auto flex max-w-3xl gap-4 px-4 md:px-6">
        {/* Avatar Area */}
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center border text-foreground",
          isUser ? "border-foreground bg-foreground text-background" : "border-border bg-card"
        )}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4 text-success" />
          )}
        </div>

        {/* Message Content Area */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {isUser ? "You" : (message.provider_model_id ? "Assistant" : "System")}
            </span>
            {message.total_tokens != null && !isStreaming && (
              <span className="text-[10px] font-bold text-foreground/60 tracking-wider uppercase">
                {message.total_tokens} tokens
              </span>
            )}
          </div>

          <div className="text-sm text-foreground/90 leading-relaxed font-normal">
            {isError || isCancelled ? (
              <div className="space-y-2">
                <span className={cn(isError ? "text-destructive" : "text-foreground/80", "text-xs font-bold uppercase tracking-wider")}>
                  {isError ? "Error Response" : "Generation Cancelled"}
                </span>
                {message.content ? (
                  <MessageContent content={message.content} />
                ) : null}
                {message.safe_error ? (
                  <p className="text-xs border border-destructive/20 bg-destructive/5 p-3 font-mono text-destructive">
                    {message.safe_error}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                {isRegeneration && (
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-success">
                    Regenerated response
                  </span>
                )}
                <MessageContent content={message.content} />
                {isStreaming && (
                  <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-success align-middle" />
                )}
              </div>
            )}
          </div>

          {/* Action buttons (copy, edit, regenerate) */}
          {!isStreaming && message.content && (
            <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              {isUser && onEdit && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              )}
              {!isUser && isLastAssistant && onRegenerate && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3 w-3 text-success" />
                  Regenerate
                </button>
              )}
              {!isUser && isError && onRegenerate && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3 w-3 text-success" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
