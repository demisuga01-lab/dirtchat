"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatComposer({
  onSend,
  onCancel,
  isStreaming,
  disabled,
}: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border/60 bg-background/40 px-4 py-3 md:px-6">
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
                  ? "Select a model to start chatting"
                  : "Send a message..."
            }
            disabled={isStreaming || disabled}
            className={cn(
              "w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              (isStreaming || disabled) && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        {isStreaming ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onCancel}
            aria-label="Cancel stream"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!draft.trim() || disabled}
            aria-disabled={!draft.trim() || disabled}
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        )}
      </form>
    </div>
  );
}
