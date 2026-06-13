"use client";

import {
  ArrowRight,
  MessageSquare,
  Settings as SettingsIcon,
  KeyRound,
  Layers,
  Pin,
  CheckCircle2,
  Bot,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardThread } from "@/lib/dashboard/dashboard-service";

type DashboardData = {
  user: {
    email?: string;
    displayName?: string;
    createdAt?: string;
  };
  readiness: {
    accountReady: boolean;
    providersCount: number;
    modelsCount: number;
    chatsCount: number;
    defaultModelId?: string;
  };
  recentChats: DashboardThread[];
  timeOfDay: string;
};

const HOUR_MS = 60 * 60 * 1000;

function formatTime(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / HOUR_MS;
  if (diffHrs < 24) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diffHrs < 168) return `${Math.floor(diffHrs / 24)}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function DashboardHome({ data }: { data: DashboardData }) {
  const { user, readiness, recentChats, timeOfDay } = data;
  const displayName = user.displayName ?? user.email?.split("@")[0] ?? "there";

  const hasProviders = readiness.providersCount > 0;
  const hasModels = readiness.modelsCount > 0;

  const readyCount = [
    readiness.accountReady,
    hasProviders,
    hasModels,
    readiness.chatsCount > 0,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* 1. Header Grid Block */}
      <header className="border-b border-border pb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-success/15 text-success border border-success/30">
              System Active
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground uppercase">
              Good {timeOfDay}, {displayName}
            </h1>
            <p className="max-w-2xl text-base text-foreground/90 leading-relaxed font-normal">
              Your private AI workspace is ready. Connect API providers, manage model catalogs,
              and query multiple services directly from a unified, secure dashboard.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-wrap gap-2 md:justify-end">
            <Button href="/chat" size="default" className="font-semibold uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90">
              <MessageSquare className="h-4 w-4" />
              New chat
            </Button>
            <Button href="/settings/providers" variant="outline" size="default" className="font-semibold uppercase tracking-wider border-border hover:bg-secondary">
              <KeyRound className="h-4 w-4" />
              Connect APIs
            </Button>
          </div>
        </div>
      </header>

      {/* 2. System Readiness & Setup Checklist */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Col: Checklist or System Summary */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            System Workspace Configuration ({readyCount}/4 Completed)
          </h2>
          <div className="border border-border bg-card divide-y divide-border">
            <ChecklistItem done={readiness.accountReady} label="Account registration completed" />
            <ChecklistItem
              done={hasProviders}
              label="Connect at least one LLM provider (Bring Your Own Key)"
              action={!hasProviders ? { label: "Configure API", href: "/settings/providers" } : undefined}
            />
            <ChecklistItem
              done={hasModels}
              label="Discover model specifications and endpoints"
              action={hasProviders && !hasModels ? { label: "Scan catalog", href: "/settings/providers" } : undefined}
            />
            <ChecklistItem
              done={readiness.chatsCount > 0}
              label="Initiate your first secure conversation thread"
              action={hasModels ? { label: "Start Thread", href: "/chat" } : undefined}
            />
          </div>
        </div>

        {/* Right Col: Readiness Stats Grid */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            Resource Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Account Status" value="Active" ready={readiness.accountReady} />
            <StatCard label="Connected APIs" value={readiness.providersCount} ready={hasProviders} />
            <StatCard label="Available Models" value={readiness.modelsCount} ready={hasModels} />
            <StatCard label="Total Threads" value={readiness.chatsCount} ready={readiness.chatsCount > 0} />
          </div>
        </div>
      </section>

      {/* 3. Recent Conversations */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
            Recent Conversations
          </h2>
          {recentChats.length > 0 && (
            <Link href="/chat" className="text-xs font-bold uppercase tracking-wider text-success hover:underline">
              View all threads &rarr;
            </Link>
          )}
        </div>

        {recentChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border/80 bg-card/30 p-12 text-center">
            <MessageSquare className="h-10 w-10 text-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground mb-4">
              No active conversation history detected.
            </p>
            <Button href="/chat" variant="outline" size="sm" className="font-semibold uppercase tracking-wider border-border hover:bg-secondary">
              <Plus className="h-3.5 w-3.5" />
              New chat
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentChats.slice(0, 6).map((chat) => (
              <Link
                key={chat.id}
                href={`/chat?thread=${chat.id}`}
                className="group flex flex-col justify-between border border-border bg-card p-5 hover:border-foreground/30 hover:shadow-sm transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-8 w-8 items-center justify-center bg-secondary border border-border text-foreground">
                      {chat.isPinned ? (
                        <Pin className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5" />
                      )}
                    </div>
                    {chat.isPinned && (
                      <Badge variant="secondary" className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-none">
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-success transition-colors line-clamp-1">
                    {chat.title}
                  </h3>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                    {formatTime(chat.lastMessageAt ?? chat.createdAt)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Action suggestions */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
          Workspace Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SuggestionCard
            icon={<Layers className="h-4 w-4" />}
            title="Multi-Model Testing"
            description="Query and compare outputs across different vendor models within a single thread."
          />
          <SuggestionCard
            icon={<Bot className="h-4 w-4" />}
            title="Code Diagnostics"
            description="Analyze, review, or refactor code syntax using specialized instruction models."
          />
          <SuggestionCard
            icon={<KeyRound className="h-4 w-4" />}
            title="API Keys Isolation"
            description="Manage and secure your provider keys with server-side decryption policies."
          />
          <SuggestionCard
            icon={<SettingsIcon className="h-4 w-4" />}
            title="Application Preferences"
            description="Configure markdown rendering, keyboard shortcuts, and UI spacing density."
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, ready }: { label: string; value: string | number; ready: boolean }) {
  return (
    <div className="border border-border bg-card p-5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
          {label}
        </span>
        <span className={`h-2 w-2 rounded-full ${ready ? "bg-success" : "bg-foreground/25"}`} />
      </div>
      <div className="text-3xl font-extrabold text-foreground tracking-tight">
        {value}
      </div>
    </div>
  );
}

function ChecklistItem({
  done,
  label,
  action,
}: {
  done: boolean;
  label: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 text-sm font-medium">
      <div className="flex items-center gap-3">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-border shrink-0" />
        )}
        <span className={done ? "text-foreground line-through decoration-foreground/30" : "text-foreground/90"}>
          {label}
        </span>
      </div>
      {!done && action && (
        <Button href={action.href} variant="outline" size="sm" className="font-semibold uppercase tracking-wider text-xs border-border hover:bg-secondary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

function SuggestionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Button
      href="/chat"
      variant="ghost"
      className="group flex h-auto flex-col items-start gap-3 border border-border bg-card p-5 text-left rounded-none hover:border-foreground/30 hover:bg-card/80 transition-all"
    >
      <div className="flex h-8 w-8 items-center justify-center bg-secondary border border-border text-foreground">
        {icon}
      </div>
      <div className="space-y-1 w-full">
        <h3 className="text-sm font-bold text-foreground group-hover:text-success transition-colors">
          {title}
        </h3>
        <p className="text-xs text-foreground/80 leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </Button>
  );
}
