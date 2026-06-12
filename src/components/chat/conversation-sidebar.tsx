"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  preview: string;
  active?: boolean;
}

const placeholderConversations: Conversation[] = [
  {
    id: "welcome",
    title: "Welcome to Dirtchat",
    preview: "A short tour of the workspace.",
    active: true,
  },
  {
    id: "design",
    title: "Designing the multi-model router",
    preview: "Provider abstraction, capability tags…",
  },
  {
    id: "prompts",
    title: "Refactor a React form",
    preview: "Server actions, validation, errors…",
  },
];

export function ConversationSidebar() {
  return (
    <aside
      className="hidden w-72 shrink-0 border-r border-border/60 bg-background/40 md:flex md:flex-col"
      aria-label="Conversations"
    >
      <div className="flex items-center justify-between border-b border-border/60 p-3">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button size="sm" variant="outline" disabled aria-disabled>
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {placeholderConversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  c.active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
                disabled
                aria-disabled
              >
                <div className="flex w-full items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate font-medium">{c.title}</span>
                </div>
                <span className="line-clamp-1 pl-5 text-xs text-muted-foreground">
                  {c.preview}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-border/60 p-3 text-[11px] text-muted-foreground">
        Conversation persistence arrives in a later prompt. This list is
        static for now.
      </div>
    </aside>
  );
}
