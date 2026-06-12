"use client";

import { Plus, MessageSquare, Trash2, Archive, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import type { ChatThread } from "@/lib/chat/types";

interface ChatThreadSidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function ChatThreadSidebar({
  threads,
  activeThreadId,
  isLoading,
  onSelect,
  onNew,
  onDelete,
  onArchive,
  onRename,
}: ChatThreadSidebarProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpen]);

  return (
    <aside
      className="hidden w-72 shrink-0 border-r border-border/60 bg-background/40 md:flex md:flex-col"
      aria-label="Conversations"
    >
      <div className="flex items-center justify-between border-b border-border/60 p-3">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button size="sm" variant="outline" onClick={onNew} disabled={isLoading}>
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {threads.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            {isLoading ? "Loading..." : "No conversations yet."}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {threads.map((t) => (
              <li key={t.id} className="relative group">
                <button
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    activeThreadId === t.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{t.title}</span>
                    {t.last_message_at && (
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {new Date(t.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </button>
                <div className="absolute right-1 top-1 hidden group-hover:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === t.id ? null : t.id);
                    }}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                  {menuOpen === t.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-full z-50 w-36 rounded-md border border-border bg-popover p-1 shadow-md"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          onRename(t.id, t.title);
                        }}
                      >
                        <Archive className="h-3 w-3" />
                        Rename
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          onArchive(t.id);
                        }}
                      >
                        <Archive className="h-3 w-3" />
                        Archive
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          onDelete(t.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-border/60 p-3 text-[11px] text-muted-foreground">
        {threads.length} conversation{threads.length !== 1 ? "s" : ""}
      </div>
    </aside>
  );
}
