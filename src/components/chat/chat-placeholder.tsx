"use client";

import { useState } from "react";
import { Send, Sparkles, Paperclip, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const placeholderModels = [
  { id: "default", label: "Default model" },
  { id: "fast", label: "Fast model" },
  { id: "reasoning", label: "Reasoning model" },
];

export function ChatPlaceholder() {
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState("default");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <label htmlFor="model-select" className="sr-only">
            Choose model
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={cn(
              "h-8 rounded-md border border-input bg-background px-2 text-xs font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            {placeholderModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
          Foundation build
        </Badge>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Your quiet AI workspace
          </h2>
          <p className="mt-2 text-balance text-sm text-muted-foreground">
            The chat surface is wired up and ready, but the live model backend
            is intentionally not connected yet. Sending a message will show a
            placeholder notice.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Streaming</Badge>
            <Badge variant="outline">Reasoning controls</Badge>
            <Badge variant="outline">File uploads</Badge>
            <Badge variant="outline">Provider routing</Badge>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/40 px-4 py-3 md:px-6">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled
            aria-disabled
            title="File upload arrives in a later prompt"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <label htmlFor="composer" className="sr-only">
              Message Dirtchat
            </label>
            <textarea
              id="composer"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything. (Backend arrives in Prompt 4.)"
              className={cn(
                "w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            />
          </div>
          <Button type="submit" disabled aria-disabled>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
          Chat backend will be added in Prompt 4. The send button is disabled
          on purpose.
        </p>
      </div>
    </div>
  );
}
