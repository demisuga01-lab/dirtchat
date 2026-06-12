"use client";

import {
  ArrowRight,
  MessageSquare,
  Settings as SettingsIcon,
  KeyRound,
  Layers,
  Clock,
  Pin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const HOUR_MS = 60 * 60 * 1000;

export function DashboardHome({ data }: { data: DashboardData }) {
  const { user, readiness, recentChats, timeOfDay } = data;
  const displayName = user.displayName ?? user.email?.split("@")[0] ?? "there";

  const readyCount = [
    readiness.accountReady,
    readiness.providersCount > 0,
    readiness.modelsCount > 0,
    readiness.chatsCount >= 0,
  ].filter(Boolean).length;

  const hasProviders = readiness.providersCount > 0;
  const hasModels = readiness.modelsCount > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Good {timeOfDay}, {displayName}
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground">
          Your private AI workspace is ready. Connect providers, browse models,
          and keep every conversation in one place.
        </p>
      </header>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button href="/chat" size="default">
          <MessageSquare className="h-4 w-4" />
          New chat
        </Button>
        {recentChats.length > 0 && (
          <Button href={`/chat?thread=${recentChats[0].id}`} variant="outline" size="default">
            <Clock className="h-4 w-4" />
            Continue recent chat
          </Button>
        )}
        <Button href="/settings/providers" variant="outline" size="default">
          <KeyRound className="h-4 w-4" />
          Manage providers
        </Button>
        <Button href="/settings" variant="ghost" size="default">
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Readiness strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReadinessChip
          label="Account"
          ready={readiness.accountReady}
        />
        <ReadinessChip
          label={`${readiness.providersCount} provider${readiness.providersCount !== 1 ? "s" : ""}`}
          ready={hasProviders}
        />
        <ReadinessChip
          label={`${readiness.modelsCount} model${readiness.modelsCount !== 1 ? "s" : ""}`}
          ready={hasModels}
        />
        <ReadinessChip
          label={`${readiness.chatsCount} chat${readiness.chatsCount !== 1 ? "s" : ""}`}
          ready={true}
        />
      </div>

      {/* Setup checklist when not ready */}
      {readyCount < 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Finish setup</CardTitle>
            <CardDescription>
              Complete these steps to get the most out of your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ChecklistItem done={readiness.accountReady} label="Account created" />
            <ChecklistItem
              done={hasProviders}
              label="Connect a provider"
              action={!hasProviders ? { label: "Add provider", href: "/settings/providers" } : undefined}
            />
            <ChecklistItem
              done={hasModels}
              label="Discover available models"
              action={hasProviders && !hasModels ? { label: "Browse models", href: "/settings/providers" } : undefined}
            />
            <ChecklistItem
              done={readiness.chatsCount > 0}
              label="Start your first chat"
              action={hasModels ? { label: "New chat", href: "/chat" } : undefined}
            />
          </CardContent>
        </Card>
      )}

      {/* Recent chats */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent conversations</h2>
          {recentChats.length > 0 && (
            <Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          )}
        </div>
        {recentChats.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-10">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No conversations yet. Start a new chat to see it here.
              </p>
              <Button href="/chat" variant="outline" size="sm">
                <MessageSquare className="h-3.5 w-3.5" />
                New chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentChats.slice(0, 6).map((chat) => (
              <Link
                key={chat.id}
                href={`/chat?thread=${chat.id}`}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  {chat.isPinned ? (
                    <Pin className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium">{chat.title}</h3>
                    {chat.isPinned && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatTime(chat.lastMessageAt ?? chat.createdAt)}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Starter suggestions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Try something</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SuggestionCard
            icon={<Layers className="h-4 w-4" />}
            title="Compare models"
            description="Send the same prompt to different models and compare outputs."
          />
          <SuggestionCard
            icon={<MessageSquare className="h-4 w-4" />}
            title="Review code"
            description="Use a coding model to review, refactor, or explain code snippets."
          />
          <SuggestionCard
            icon={<SettingsIcon className="h-4 w-4" />}
            title="Plan a project"
            description="Brainstorm features, architecture, and steps with a reasoning model."
          />
          <SuggestionCard
            icon={<KeyRound className="h-4 w-4" />}
            title="Draft a document"
            description="Outline, draft, and refine writing with different models per pass."
          />
        </div>
      </section>
    </div>
  );
}

function ReadinessChip({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        ready
          ? "border-success/30 bg-success/5 text-foreground"
          : "border-border bg-muted/30 text-muted-foreground"
      }`}
    >
      <span
        className={`block h-2 w-2 rounded-full ${
          ready ? "bg-success" : "bg-muted-foreground/30"
        }`}
      />
      {label}
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
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
          done
            ? "bg-success/20 text-success"
            : "border border-border text-muted-foreground"
        }`}
      >
        {done ? "✓" : "○"}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      {!done && action && (
        <Button href={action.href} variant="ghost" size="sm" className="ml-auto">
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
      className="group flex h-auto flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Button>
  );
}
