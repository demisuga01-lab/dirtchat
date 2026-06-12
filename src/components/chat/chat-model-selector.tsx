"use client";

import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatModelOption } from "@/lib/chat/types";

interface ChatModelSelectorProps {
  models: ChatModelOption[];
  selectedId: string | null;
  onSelect: (model: ChatModelOption) => void;
  disabled?: boolean;
}

export function ChatModelSelector({
  models,
  selectedId,
  onSelect,
  disabled,
}: ChatModelSelectorProps) {
  const selected = models.find((m) => m.provider_model_id === selectedId);

  return (
    <div className="flex items-center gap-2">
      <Cpu className="h-4 w-4 text-muted-foreground" />
      <label htmlFor="chat-model-select" className="sr-only">
        Choose model
      </label>
      <select
        id="chat-model-select"
        value={selectedId ?? ""}
        onChange={(e) => {
          const m = models.find(
            (model) => model.provider_model_id === e.target.value
          );
          if (m) onSelect(m);
        }}
        disabled={disabled || models.length === 0}
        className={cn(
          "h-8 max-w-[200px] rounded-md border border-input bg-background px-2 text-xs font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          (disabled || models.length === 0) && "opacity-50 cursor-not-allowed"
        )}
      >
        {models.length === 0 ? (
          <option value="">No models available</option>
        ) : (
          models.map((m) => (
            <option key={m.provider_model_id} value={m.provider_model_id}>
              {m.display_name ?? m.model_id} — {m.provider_label}
            </option>
          ))
        )}
      </select>
      {selected && (
        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          {selected.context_window_tokens
            ? `${selected.context_window_tokens.toLocaleString()} ctx`
            : ""}
        </span>
      )}
    </div>
  );
}
