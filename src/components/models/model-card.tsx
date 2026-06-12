"use client";

import * as React from "react";
import {
  Check,
  Loader2,
  Star,
  Trash2,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProviderModelWithCapabilities } from "@/lib/models/types";
import {
  ModelCapabilityBadges,
  CapabilityConfidenceLabel,
  UnavailableBadge,
} from "@/components/models/model-capability-badges";
import { cn } from "@/lib/utils";

interface ModelCardProps {
  model: ProviderModelWithCapabilities;
  onSetDefault?: (internalId: string) => void | Promise<void>;
  onDelete?: (internalId: string) => void | Promise<void>;
  settingDefault?: boolean;
  deleting?: boolean;
}

function truncate(value: string, max = 36): string {
  if (!value) return "";
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + "…";
}

function formatNumber(n: number | null): string | null {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ModelCard({
  model,
  onSetDefault,
  onDelete,
  settingDefault,
  deleting,
}: ModelCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors",
        !model.is_available && "opacity-70"
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {model.display_name ?? model.provider_model_id}
          </span>
          {model.is_default_for_provider ? (
            <Badge variant="success" className="gap-1">
              <Star className="h-3 w-3" /> Default
            </Badge>
          ) : null}
          {model.is_manual ? (
            <Badge variant="outline" className="gap-1">
              <Wrench className="h-3 w-3" /> Manual
            </Badge>
          ) : null}
          {!model.is_available ? <UnavailableBadge /> : null}
        </div>
        <div
          className="font-mono text-xs text-muted-foreground"
          title={model.provider_model_id}
        >
          {truncate(model.provider_model_id, 56)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {model.context_window_tokens != null ? (
          <span title="Context window">
            ctx {formatNumber(model.context_window_tokens)}
          </span>
        ) : null}
        {model.max_output_tokens != null ? (
          <span title="Max output tokens">
            out {formatNumber(model.max_output_tokens)}
          </span>
        ) : null}
        <span title="Last seen">
          seen {new Date(model.last_seen_at).toLocaleDateString()}
        </span>
      </div>

      <ModelCapabilityBadges capabilities={model.capabilities} />

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <CapabilityConfidenceLabel capabilities={model.capabilities} />
        <span>
          {model.capabilities
            ? `score ${model.capabilities.capability_score.toFixed(2)}`
            : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onSetDefault && !model.is_default_for_provider && model.is_available ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSetDefault(model.id)}
            disabled={settingDefault || deleting}
          >
            {settingDefault ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Set default
          </Button>
        ) : null}
        {onDelete && model.is_manual ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(model.id)}
            disabled={deleting || settingDefault}
            className="text-destructive hover:text-destructive"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}
