"use client";

import * as React from "react";
import { Loader2, RefreshCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface LastRunSummary {
  status: string | null;
  startedAt: string | null;
  completedAt: string | null;
  modelsFound: number;
  modelsAdded: number;
  modelsUpdated: number;
  modelsMarkedUnavailable: number;
  errorsCount: number;
  safeSummary: string | null;
  safeError: string | null;
  latencyMs: number | null;
  rawResponseShape: string | null;
}

export function ModelDiscoveryPanel({
  lastRun,
  hasSecret,
  refreshing,
  onRefresh,
  refreshError,
}: {
  lastRun: LastRunSummary | null;
  hasSecret: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  refreshError: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">Refresh models</div>
          <p className="text-xs text-muted-foreground">
            Calls the provider&rsquo;s <code>/models</code> endpoint. Falls
            back to a tiny chat-completions ping if a default model is
            set.
          </p>
        </div>
        <Button
          size="sm"
          onClick={onRefresh}
          disabled={refreshing || !hasSecret}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          {refreshing ? "Refreshing…" : "Refresh models"}
        </Button>
      </div>

      {!hasSecret ? (
        <p className="text-xs text-muted-foreground">
          Add an API key on the provider connection before refreshing models.
        </p>
      ) : null}

      {refreshError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            {refreshError}
          </div>
        </div>
      ) : null}

      {lastRun ? (
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span>Status:</span>
            <Badge
              variant={
                lastRun.status === "success"
                  ? "success"
                  : lastRun.status === "partial" || lastRun.status === "failed"
                    ? "destructive"
                    : "outline"
              }
            >
              {lastRun.status ?? "unknown"}
            </Badge>
            {lastRun.rawResponseShape ? (
              <Badge variant="outline">shape: {lastRun.rawResponseShape}</Badge>
            ) : null}
            {lastRun.latencyMs != null ? (
              <Badge variant="outline">{lastRun.latencyMs}ms</Badge>
            ) : null}
          </div>
          {lastRun.safeSummary ? (
            <p className="text-foreground/80">{lastRun.safeSummary}</p>
          ) : null}
          {lastRun.safeError ? (
            <p className="text-destructive/90">{lastRun.safeError}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <span>found {lastRun.modelsFound}</span>
            <span>added {lastRun.modelsAdded}</span>
            <span>updated {lastRun.modelsUpdated}</span>
            <span>unavailable {lastRun.modelsMarkedUnavailable}</span>
            {lastRun.errorsCount > 0 ? (
              <span>errors {lastRun.errorsCount}</span>
            ) : null}
            {lastRun.completedAt ? (
              <span>· {new Date(lastRun.completedAt).toLocaleString()}</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
