"use client";

import { Plus, MessageSquare, Trash2, Archive, Pin, PinOff, Search, X } from "lucide-react";
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
  onPin?: (id: string, pinned: boolean) => void;
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
  onPin,
}: ChatThreadSidebarProps) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pinned = threads.filter((t) => t.is_pinned);
  const unpinned = threads.filter((t) => !t.is_pinned);

  const filteredPinned = pinned.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUnpinned = unpinned.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
        setConfirmDelete(null);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleRenameClick(t: ChatThread) {
    setMenuOpen(null);
    const newTitle = window.prompt("Rename conversation", t.title);
    if (newTitle && newTitle.trim()) {
      onRename(t.id, newTitle.trim());
    }
  }

  function handleDeleteClick(t: ChatThread) {
    setConfirmDelete(t.id);
  }

  function confirmDeleteThread(id: string) {
    onDelete(id);
    setConfirmDelete(null);
    setMenuOpen(null);
  }

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

      <div className="border-b border-border/60 p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations... (Ctrl+K)"
            aria-label="Search conversations"
            className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-8 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">Loading...</p>
        ) : threads.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet. Start a new chat.
          </p>
        ) : filteredPinned.length === 0 && filteredUnpinned.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations match &quot;{search}&quot;
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredPinned.length > 0 && (
              <>
                <p className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Pinned
                </p>
                {filteredPinned.map((t) => renderThread(t))}
                <div className="my-1 border-t border-border/20" />
              </>
            )}
            {filteredUnpinned.length > 0 && (
              <>
                {filteredPinned.length > 0 && (
                  <p className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Recent
                  </p>
                )}
                {filteredUnpinned.map((t) => renderThread(t))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 p-3 text-[11px] text-muted-foreground">
        {threads.length} conversation{threads.length !== 1 ? "s" : ""}
        {filteredPinned.length > 0 && ` (${filteredPinned.length} pinned)`}
      </div>
    </aside>
  );

  function renderThread(t: ChatThread) {
    const isActive = activeThreadId === t.id;
    const isConfirmingDelete = confirmDelete === t.id;

    return (
      <div key={t.id} className="relative group">
        <button
          type="button"
          onClick={() => {
            if (!isConfirmingDelete) onSelect(t.id);
          }}
          className={cn(
            "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
            isActive
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          )}
        >
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="block truncate font-medium">{t.title}</span>
            {t.last_message_at && (
              <span className="block truncate text-[11px] text-muted-foreground">
                {formatTime(t.last_message_at)}
              </span>
            )}
          </div>
        </button>

        {isConfirmingDelete ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-md bg-background/95 px-3">
            <span className="text-xs text-muted-foreground">Delete?</span>
            <div className="ml-2 flex gap-1">
              <button
                type="button"
                onClick={() => confirmDeleteThread(t.id)}
                className="rounded px-1.5 py-0.5 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute right-1 top-1 hidden group-hover:block">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(menuOpen === t.id ? null : t.id);
              }}
              aria-label="Thread actions"
            >
              <Search className="h-3 w-3" />
            </Button>
            {menuOpen === t.id && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full z-50 w-40 rounded-md border border-border bg-popover p-1 shadow-md"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-secondary"
                  onClick={() => handleRenameClick(t)}
                >
                  <MessageSquare className="h-3 w-3" />
                  Rename
                </button>
                {onPin && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-secondary"
                    onClick={() => {
                      setMenuOpen(null);
                      onPin(t.id, !t.is_pinned);
                    }}
                  >
                    {t.is_pinned ? (
                      <PinOff className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                    {t.is_pinned ? "Unpin" : "Pin"}
                  </button>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-secondary"
                  onClick={() => {
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
                  onClick={() => handleDeleteClick(t)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
