"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Settings,
  KeyRound,
  LayoutDashboard,
  Search,
  Plus,
  Pin,
  MoreHorizontal,
} from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DirtchatLogo } from "@/components/brand/dirtchat-logo";

type Thread = {
  id: string;
  title: string;
  is_pinned: boolean;
  is_archived: boolean;
  last_message_at: string | null;
  created_at: string;
};

export function WorkspaceSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/threads");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads ?? []);
      }
    } catch {
      // silent — sidebar gracefully shows empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Re-fetch when path changes (user may have created/deleted threads)
  useEffect(() => {
    fetchThreads();
  }, [pathname, fetchThreads]);

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/chat/threads/${id}`, { method: "DELETE" });
      setThreads((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // silent
    }
    setMenuOpen(null);
  };

  const handleArchive = async (id: string) => {
    try {
      await fetch(`/api/chat/threads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: true }),
      });
      setThreads((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // silent
    }
    setMenuOpen(null);
  };

  const filteredThreads = search
    ? threads.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      )
    : threads;

  const pinnedThreads = filteredThreads.filter((t) => t.is_pinned);
  const unpinnedThreads = filteredThreads.filter((t) => !t.is_pinned);

  function formatTime(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  // Close context menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-background">
      {/* Brand header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center">
          <DirtchatLogo size="sm" showWordmark />
        </Link>
        <ThemeToggle />
      </div>

      {/* New chat + Search */}
      <div className="flex flex-col gap-2 p-3">
        <Button
          onClick={handleNewChat}
          variant="outline"
          size="default"
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Conversation list */}
      <nav className="flex-1 overflow-y-auto px-2" aria-label="Conversations">
        {isLoading && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            Loading conversations...
          </div>
        )}

        {!isLoading && filteredThreads.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            {search ? "No conversations match your search." : "No conversations yet."}
          </div>
        )}

        {pinnedThreads.length > 0 && (
          <div className="mb-2">
            <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
              Pinned
            </div>
            {pinnedThreads.map((t) => (
              <ThreadRow
                key={t.id}
                thread={t}
                isActive={pathname === `/chat?thread=${t.id}`}
                formatTime={formatTime}
                onDelete={handleDelete}
                onArchive={handleArchive}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
              />
            ))}
          </div>
        )}

        {unpinnedThreads.length > 0 && (
          <div>
            {pinnedThreads.length > 0 && (
              <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Recent
              </div>
            )}
            {unpinnedThreads.map((t) => (
              <ThreadRow
                key={t.id}
                thread={t}
                isActive={pathname === `/chat?thread=${t.id}`}
                formatTime={formatTime}
                onDelete={handleDelete}
                onArchive={handleArchive}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
              />
            ))}
          </div>
        )}
      </nav>

      {/* Navigation links */}
      <div className="border-t border-border/60 p-3">
        <div className="flex flex-col gap-0.5">
          <SidebarNavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" pathname={pathname} />
          <SidebarNavLink href="/chat" icon={<MessageSquare className="h-4 w-4" />} label="Chat" pathname={pathname} />
          <SidebarNavLink href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" pathname={pathname} />
          <SidebarNavLink href="/settings/providers" icon={<KeyRound className="h-4 w-4" />} label="Providers" pathname={pathname} />
        </div>
      </div>

      {/* Account footer */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
            {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-muted-foreground">
              {userEmail ?? "User"}
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}

function ThreadRow({
  thread,
  isActive,
  formatTime,
  onDelete,
  onArchive,
  menuOpen,
  setMenuOpen,
}: {
  thread: Thread;
  isActive: boolean;
  formatTime: (iso: string | null) => string;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
}) {
  const isOwnMenuOpen = menuOpen === thread.id;

  return (
    <div className="relative group">
      <Link
        href={`/chat?thread=${thread.id}`}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        }`}
      >
        <span className="shrink-0">
          {thread.is_pinned ? (
            <Pin className="h-3.5 w-3.5" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5" />
          )}
        </span>
        <span className="truncate flex-1">{thread.title}</span>
        <span className="shrink-0 text-[10px] text-muted-foreground/60">
          {formatTime(thread.last_message_at ?? thread.created_at)}
        </span>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(isOwnMenuOpen ? null : thread.id);
        }}
        className={`absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 transition-opacity ${
          isOwnMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        } hover:bg-secondary`}
        aria-label="Thread menu"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {isOwnMenuOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-border bg-popover p-1 shadow-md">
          <button
            type="button"
            onClick={() => onArchive(thread.id)}
            className="w-full rounded px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={() => onDelete(thread.id)}
            className="w-full rounded px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarNavLink({
  href,
  icon,
  label,
  pathname,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  pathname: string;
}) {
  const isActive = pathname.startsWith(href) && href !== "/dashboard"
    ? true
    : pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
