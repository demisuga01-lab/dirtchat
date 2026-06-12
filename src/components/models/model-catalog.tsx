"use client";

import * as React from "react";
import { ArrowLeft, Plus, Loader2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import type { ProviderConnection } from "@/lib/providers/types";
import type {
  ProviderModelWithCapabilities,
  DiscoveryResult,
  ManualModelInput,
} from "@/lib/models/types";
import { ModelCard } from "@/components/models/model-card";
import { ModelDiscoveryPanel, type LastRunSummary } from "@/components/models/model-discovery-panel";
import {
  addManualModelAction,
  deleteManualModelAction,
  listModelsAction,
  refreshModelsAction,
  setDefaultModelAction,
} from "@/app/(app)/settings/providers/[id]/models/actions";

interface ModelCatalogProps {
  provider: ProviderConnection;
  initialModels: ProviderModelWithCapabilities[];
  hasSecret: boolean;
  lastRunSummary: LastRunSummary | null;
}

interface ManualForm {
  providerModelId: string;
  displayName: string;
  contextWindowTokens: string;
  maxOutputTokens: string;
  isDefault: boolean;
  supportsImageInput: boolean;
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  supportsFunctionCalling: boolean;
  supportsJsonMode: boolean;
  supportsStructuredOutputs: boolean;
  supportsReasoning: boolean;
  supportsTemperature: boolean;
  supportsTopP: boolean;
  supportsSystemMessages: boolean;
}

const EMPTY_MANUAL: ManualForm = {
  providerModelId: "",
  displayName: "",
  contextWindowTokens: "",
  maxOutputTokens: "",
  isDefault: false,
  supportsImageInput: false,
  supportsStreaming: false,
  supportsToolCalling: false,
  supportsFunctionCalling: false,
  supportsJsonMode: false,
  supportsStructuredOutputs: false,
  supportsReasoning: false,
  supportsTemperature: false,
  supportsTopP: false,
  supportsSystemMessages: false,
};

export function ModelCatalog({
  provider,
  initialModels,
  hasSecret,
  lastRunSummary,
}: ModelCatalogProps) {
  const { push } = useToast();
  const [models, setModels] = React.useState<ProviderModelWithCapabilities[]>(
    initialModels
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const [settingDefault, setSettingDefault] = React.useState<string | null>(
    null
  );
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [refreshError, setRefreshError] = React.useState<string | null>(null);
  const [lastRun, setLastRun] = React.useState<LastRunSummary | null>(
    lastRunSummary
  );
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [manual, setManual] = React.useState<ManualForm>(EMPTY_MANUAL);
  const [manualError, setManualError] = React.useState<string | null>(null);
  const [savingManual, setSavingManual] = React.useState(false);

  async function refresh() {
    setRefreshing(true);
    setRefreshError(null);
    const result = await listModelsAction(provider.id);
    if (result.ok) {
      setModels(result.data.models);
    } else {
      setRefreshError(result.error);
    }
    setRefreshing(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    setRefreshError(null);
    const result = await refreshModelsAction(provider.id);
    if (result.ok) {
      const data: DiscoveryResult = result.data;
      setLastRun({
        status: data.status,
        startedAt: null,
        completedAt: new Date().toISOString(),
        modelsFound: data.modelsFound,
        modelsAdded: data.modelsAdded,
        modelsUpdated: data.modelsUpdated,
        modelsMarkedUnavailable: data.modelsMarkedUnavailable,
        errorsCount: data.errorsCount,
        safeSummary: data.message,
        safeError: data.status === "failed" ? data.message : null,
        latencyMs: null,
        rawResponseShape: null,
      });
      push({
        title: "Discovery complete",
        description: data.message,
        variant: data.ok ? "success" : "destructive",
      });
      await refresh();
    } else {
      setRefreshError(result.error);
      push({
        title: "Refresh failed",
        description: result.error,
        variant: "destructive",
      });
    }
    setRefreshing(false);
  }

  async function onSetDefault(internalId: string) {
    setSettingDefault(internalId);
    const result = await setDefaultModelAction(provider.id, internalId);
    setSettingDefault(null);
    if (!result.ok) {
      push({
        title: "Could not set default",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    push({
      title: "Default model updated",
      variant: "success",
    });
    await refresh();
  }

  async function onDelete(internalId: string) {
    if (!window.confirm("Delete this manual model? This cannot be undone."))
      return;
    setDeleting(internalId);
    const result = await deleteManualModelAction(provider.id, internalId);
    setDeleting(null);
    if (!result.ok) {
      push({
        title: "Could not delete model",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    push({ title: "Model deleted", variant: "default" });
    await refresh();
  }

  async function onAddManual() {
    setManualError(null);
    if (!manual.providerModelId.trim()) {
      setManualError("Model id is required.");
      return;
    }
    const input: ManualModelInput = {
      providerModelId: manual.providerModelId.trim(),
      displayName: manual.displayName.trim() || null,
      contextWindowTokens: manual.contextWindowTokens
        ? Number.parseInt(manual.contextWindowTokens, 10)
        : null,
      maxOutputTokens: manual.maxOutputTokens
        ? Number.parseInt(manual.maxOutputTokens, 10)
        : null,
      isDefault: manual.isDefault,
      capabilityOverrides: {
        supportsImageInput: manual.supportsImageInput,
        supportsStreaming: manual.supportsStreaming,
        supportsToolCalling: manual.supportsToolCalling,
        supportsFunctionCalling: manual.supportsFunctionCalling,
        supportsJsonMode: manual.supportsJsonMode,
        supportsStructuredOutputs: manual.supportsStructuredOutputs,
        supportsReasoning: manual.supportsReasoning,
        supportsTemperature: manual.supportsTemperature,
        supportsTopP: manual.supportsTopP,
        supportsSystemMessages: manual.supportsSystemMessages,
      },
    };
    setSavingManual(true);
    const result = await addManualModelAction(provider.id, input);
    setSavingManual(false);
    if (!result.ok) {
      setManualError(result.error);
      return;
    }
    push({
      title: "Model added",
      description: input.providerModelId,
      variant: "success",
    });
    setManual(EMPTY_MANUAL);
    setShowAddForm(false);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Button
          href={`/settings/providers`}
          variant="ghost"
          size="sm"
          className="w-fit gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to providers
        </Button>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Cpu className="h-5 w-5 text-muted-foreground" />
          {provider.label}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <Badge variant="outline">{provider.protocol}</Badge>
          <span className="font-mono" title={provider.base_url}>
            {provider.base_url}
          </span>
          {provider.default_model ? (
            <span>· default: {provider.default_model}</span>
          ) : null}
          <span>· last test: {provider.status}</span>
        </div>
      </div>

      <ModelDiscoveryPanel
        lastRun={lastRun}
        hasSecret={hasSecret}
        refreshing={refreshing}
        onRefresh={onRefresh}
        refreshError={refreshError}
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Models</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm((v) => !v)}
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? "Cancel" : "Add model manually"}
          </Button>
        </div>

        {showAddForm ? (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="manual-model-id">Model id</Label>
                <Input
                  id="manual-model-id"
                  value={manual.providerModelId}
                  onChange={(e) =>
                    setManual({ ...manual, providerModelId: e.target.value })
                  }
                  placeholder="MiniMax-M3"
                  maxLength={200}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="manual-display-name">Display name</Label>
                <Input
                  id="manual-display-name"
                  value={manual.displayName}
                  onChange={(e) =>
                    setManual({ ...manual, displayName: e.target.value })
                  }
                  placeholder="(optional)"
                  maxLength={200}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="manual-context">Context window</Label>
                <Input
                  id="manual-context"
                  type="number"
                  min={1}
                  value={manual.contextWindowTokens}
                  onChange={(e) =>
                    setManual({ ...manual, contextWindowTokens: e.target.value })
                  }
                  placeholder="e.g. 200000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="manual-max-output">Max output</Label>
                <Input
                  id="manual-max-output"
                  type="number"
                  min={1}
                  value={manual.maxOutputTokens}
                  onChange={(e) =>
                    setManual({ ...manual, maxOutputTokens: e.target.value })
                  }
                  placeholder="e.g. 8192"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Capabilities
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {(
                  [
                    ["supportsImageInput", "Vision"],
                    ["supportsStreaming", "Streaming"],
                    ["supportsToolCalling", "Tools"],
                    ["supportsFunctionCalling", "Functions"],
                    ["supportsJsonMode", "JSON mode"],
                    ["supportsStructuredOutputs", "Structured outputs"],
                    ["supportsReasoning", "Reasoning"],
                    ["supportsTemperature", "Temperature"],
                    ["supportsTopP", "Top-p"],
                    ["supportsSystemMessages", "System messages"],
                  ] as const
                ).map(([k, label]) => (
                  <label
                    key={k}
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={manual[k]}
                      onChange={(e) =>
                        setManual({ ...manual, [k]: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="manual-default"
                type="checkbox"
                checked={manual.isDefault}
                onChange={(e) =>
                  setManual({ ...manual, isDefault: e.target.checked })
                }
                className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <Label htmlFor="manual-default" className="cursor-pointer">
                Set as provider default
              </Label>
            </div>

            {manualError ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive"
              >
                {manualError}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button onClick={onAddManual} disabled={savingManual}>
                {savingManual ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Save model
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setManual(EMPTY_MANUAL);
                  setManualError(null);
                }}
                disabled={savingManual}
              >
                Cancel
              </Button>
              <span className="ml-auto text-[11px] text-muted-foreground">
                Manual models are user-owned and clearly marked.
              </span>
            </div>
          </div>
        ) : null}

        {models.length === 0 ? (
          <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
            <p>No models yet for this provider.</p>
            <p className="text-xs">
              Try <em>Refresh models</em> first. If the provider does not
              expose a <code>/models</code> endpoint, click{" "}
              <em>Add model manually</em> to add MiniMax-M3 or any other
              id you know about.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {models.map((m) => (
              <li key={m.id}>
                <ModelCard
                  model={m}
                  onSetDefault={onSetDefault}
                  onDelete={onDelete}
                  settingDefault={settingDefault === m.id}
                  deleting={deleting === m.id}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
