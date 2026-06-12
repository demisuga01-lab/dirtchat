"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHAT_MAX_INPUT_CHARS } from "@/lib/chat/types";

interface ChatComposerProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  editValue?: string | null;
  onEditCancel?: () => void;
  onEditSend?: (message: string, originalMessageId: string) => void;
  editOriginalMessageId?: string;
}

export function ChatComposer({
  onSend,
  onCancel,
  isStreaming,
  disabled,
  editValue,
  onEditCancel,
  onEditSend,
  editOriginalMessageId,
}: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = editValue !== undefined && editValue !== null;

  useEffect(() => {
    if (isEditing && editValue !== undefined && editValue !== null) {
      setDraft(editValue);
    }
  }, [editValue, isEditing]);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [draft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isStreaming || disabled) return;
    if (isEditing && onEditSend && editOriginalMessageId) {
      onEditSend(trimmed, editOriginalMessageId);
    } else {
      onSend(trimmed);
    }
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === "Escape" && isEditing) {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  function handleCancelEdit() {
    setDraft("");
    onEditCancel?.();
  }

  const charCount = draft.length;
  const isOverLimit = charCount > CHAT_MAX_INPUT_CHARS;

  return (
    <div className="border-t border-border/60 bg-background/40 px-4 py-3 md:px-6">
      {isEditing && (
        <div className="mx-auto mb-2 flex max-w-3xl items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Editing message
          </span>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-end gap-2"
      >
        <div className="flex-1">
          <label htmlFor="chat-composer" className="sr-only">
            Message
          </label>
          <textarea
            ref={textareaRef}
            id="chat-composer"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? "Waiting for response..."
                : disabled
                  ? "No models available — add a provider"
                  : "Send a message... (Enter to send, Shift+Enter for new line)"
            }
            disabled={isStreaming || disabled}
            className={cn(
              "w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              (isStreaming || disabled) && "opacity-50 cursor-not-allowed",
              isOverLimit && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {charCount > 0 && (
            <p
              className={cn(
                "mt-1 text-right text-[11px]",
                isOverLimit ? "text-destructive" : "text-muted-foreground/60"
              )}
            >
              {charCount.toLocaleString()}
              {isOverLimit && ` / ${CHAT_MAX_INPUT_CHARS.toLocaleString()}`}
            </p>
          )}
        </div>
        {isStreaming ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onCancel}
            aria-label="Stop streaming"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!draft.trim() || disabled || isOverLimit}
            aria-disabled={!draft.trim() || disabled || isOverLimit}
          >
            <Send className="h-4 w-4" />
            {isEditing ? "Save" : "Send"}
          </Button>
        )}
      </form>
    </div>
  );
}
