"use client";

import * as React from "react";
import {
  KeyRound,
  Loader2,
  Pencil,
  Plug,
  ShieldCheck,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff,
  Cpu,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { ProviderLogo } from "@/components/providers/provider-logo";
import { cn } from "@/lib/utils";
import {
  PRESETS,
  type PresetDefinition,
  type ProviderProtocol,
  type ProviderStatus,
  type ProviderType,
  type ProviderWithSecretMeta,
} from "@/lib/providers/types";
import {
  createProviderAction,
  deleteProviderAction,
  listProvidersAction,
  setProviderSecretAction,
  testProviderConnectionAction,
  updateProviderAction,
} from "@/app/(app)/settings/providers/actions";

interface FormState {
  id: string | null;
  presetId: string;
  label: string;
  providerType: ProviderType;
  protocol: ProviderProtocol;
  baseUrl: string;
  defaultModel: string;
  notes: string;
  isEnabled: boolean;
  apiKey: string;
  showKey: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  presetId: "",
  label: "",
  providerType: "custom",
  protocol: "openai-compatible",
  baseUrl: "",
  defaultModel: "",
  notes: "",
  isEnabled: true,
  apiKey: "",
  showKey: false,
};

function applyPreset(form: FormState, preset: PresetDefinition): FormState {
  return {
    ...form,
    presetId: preset.id,
    label: preset.label,
    providerType: preset.providerType,
    protocol: preset.protocol,
    baseUrl: preset.baseUrl,
    defaultModel: preset.defaultModel,
  };
}

function statusBadge(status: ProviderStatus) {
  if (status === "valid") {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" /> Valid
      </Badge>
    );
  }
  if (status === "invalid") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" /> Invalid
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" /> Error
      </Badge>
    );
  }
  if (status === "disabled") {
    return <Badge variant="outline">Disabled</Badge>;
  }
  return <Badge variant="outline">Untested</Badge>;
}

function truncateUrl(url: string, max = 64): string {
  if (!url) return "";
  if (url.length <= max) return url;
  return url.slice(0, max - 1) + "…";
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return "Never";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function getLogoKeyForProvider(provider: { provider_type: string; base_url: string }) {
  const preset = PRESETS.find(
    (p) => p.baseUrl && provider.base_url.toLowerCase().startsWith(p.baseUrl.toLowerCase())
  );
  if (preset) return preset.logoKey;
  return provider.provider_type;
}

export function ProviderManager() {
  const { push } = useToast();
  const [providers, setProviders] = React.useState<ProviderWithSecretMeta[] | null>(
    null
  );
  const [loadingList, setLoadingList] = React.useState(true);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [errorBanner, setErrorBanner] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoadingList(true);
    const result = await listProvidersAction();
    if (result.ok) {
      setProviders(result.data);
      setErrorBanner(null);
    } else {
      setProviders([]);
      setErrorBanner(result.error);
    }
    setLoadingList(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  function onPresetChange(presetId: string) {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) {
      setForm((f) => ({ ...f, presetId: "" }));
      return;
    }
    setForm((f) => applyPreset(f, preset));
  }

  function startNew() {
    setForm(EMPTY_FORM);
    setEditing(true);
  }

  function startEdit(p: ProviderWithSecretMeta) {
    setForm({
      id: p.id,
      presetId: "",
      label: p.label,
      providerType: p.provider_type as ProviderType,
      protocol: p.protocol as ProviderProtocol,
      baseUrl: p.base_url,
      defaultModel: p.default_model ?? "",
      notes: p.notes ?? "",
      isEnabled: p.is_enabled,
      apiKey: "",
      showKey: false,
    });
    setEditing(true);
  }

  async function onSave() {
    setSaving(true);
    setErrorBanner(null);
    try {
      if (form.id) {
        const metaResult = await updateProviderAction(form.id, {
          label: form.label,
          providerType: form.providerType,
          protocol: form.protocol,
          baseUrl: form.baseUrl,
          defaultModel: form.defaultModel || null,
          notes: form.notes || null,
          isEnabled: form.isEnabled,
        });
        if (!metaResult.ok) {
          push({
            title: "Could not save provider",
            description: metaResult.error,
            variant: "destructive",
          });
          return;
        }
        if (form.apiKey) {
          const keyResult = await setProviderSecretAction(form.id, form.apiKey);
          if (!keyResult.ok) {
            push({
              title: "Metadata saved, but key was not",
              description: keyResult.error,
              variant: "destructive",
            });
            return;
          }
        }
        push({
          title: "Provider updated",
          description: form.label,
          variant: "success",
        });
      } else {
        const result = await createProviderAction({
          label: form.label,
          providerType: form.providerType,
          protocol: form.protocol,
          baseUrl: form.baseUrl,
          defaultModel: form.defaultModel || null,
          notes: form.notes || null,
          isEnabled: form.isEnabled,
          presetId: form.presetId || undefined,
          apiKey: form.apiKey || undefined,
        });
        if (!result.ok) {
          push({
            title: "Could not create provider",
            description: result.error,
            variant: "destructive",
          });
          return;
        }
        push({
          title: "Provider added",
          description: form.label,
          variant: "success",
        });
      }
      setEditing(false);
      setForm(EMPTY_FORM);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function onTest() {
    if (!form.id) {
      push({
        title: "Save the provider first",
        description: "Test connection runs against the saved configuration.",
        variant: "default",
      });
      return;
    }
    setTesting(true);
    setErrorBanner(null);
    try {
      const result = await testProviderConnectionAction(form.id, {
        baseUrl: form.baseUrl,
        protocol: form.protocol,
        defaultModel: form.defaultModel || null,
        apiKey: form.apiKey || undefined,
      });
      if (result.ok) {
        push({
          title: "Connection valid",
          description: result.message,
          variant: "success",
        });
      } else {
        push({
          title: "Connection test failed",
          description: result.message,
          variant: "destructive",
        });
      }
      await refresh();
    } finally {
      setTesting(false);
    }
  }

  async function onDelete(p: ProviderWithSecretMeta) {
    const ok = window.confirm(
      `Delete "${p.label}"? This also removes the encrypted API key.`
    );
    if (!ok) return;
    setDeleting(p.id);
    setErrorBanner(null);
    try {
      const result = await deleteProviderAction(p.id);
      if (!result.ok) {
        push({
          title: "Could not delete",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      push({
        title: "Provider removed",
        description: p.label,
        variant: "default",
      });
      if (form.id === p.id) {
        setEditing(false);
        setForm(EMPTY_FORM);
      }
      await refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {errorBanner ? (
        <div
          role="alert"
          className="rounded-none border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errorBanner}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-none border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
            <ShieldCheck className="h-3.5 w-3.5" /> Encrypted at rest
          </div>
          <p className="mt-1.5 text-sm text-foreground">
            Keys are encrypted with AES-256-GCM using a server-only key.
          </p>
        </div>
        <div className="rounded-none border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
            <Zap className="h-3.5 w-3.5" /> OpenAI-compatible
          </div>
          <p className="mt-1.5 text-sm text-foreground">
            TokenRouter, OpenRouter, and custom routers supported.
          </p>
        </div>
        <div className="rounded-none border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
            <KeyRound className="h-3.5 w-3.5" /> Never shown again
          </div>
          <p className="mt-1.5 text-sm text-foreground">
            Once saved, the API key is never displayed. Rotate to change it.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Your providers</h2>
          {!editing ? (
            <Button onClick={startNew} size="sm" className="rounded-none font-semibold uppercase tracking-wider text-xs border-border hover:bg-secondary">
              <Plus className="h-4 w-4" /> Add provider
            </Button>
          ) : null}
        </div>

        {loadingList ? (
          <div className="flex items-center gap-2 rounded-none border border-dashed border-border/60 p-6 text-sm text-foreground/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading providers…
          </div>
        ) : providers && providers.length === 0 && !editing ? (
          <EmptyState onAdd={startNew} />
        ) : providers && providers.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {providers.map((p) => {
              const logoKey = getLogoKeyForProvider(p);
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between rounded-none"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-1">
                      <ProviderLogo logoKey={logoKey} className="h-5 w-5" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-bold">
                          {p.label}
                        </span>
                        {statusBadge(p.status as ProviderStatus)}
                        {p.secret ? (
                          <Badge variant="outline" className="gap-1 rounded-none text-[10px] font-bold uppercase tracking-wider">
                            <KeyRound className="h-3 w-3" />
                            Key ····{p.secret.key_last4 ?? "????"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-none text-[10px] font-bold uppercase tracking-wider">No key</Badge>
                        )}
                        {!p.is_enabled ? <Badge variant="outline" className="rounded-none text-[10px] font-bold uppercase tracking-wider">Off</Badge> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/80 font-medium">
                        <span>{p.protocol}</span>
                        <span>·</span>
                        <span className="font-mono text-xs text-foreground/75" title={p.base_url}>
                          {truncateUrl(p.base_url, 56)}
                        </span>
                        {p.default_model ? (
                          <>
                            <span>·</span>
                            <span>default: {p.default_model}</span>
                          </>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-foreground/60 font-medium">
                        Last tested: {formatTimestamp(p.last_tested_at)}
                        {p.last_test_latency_ms != null
                          ? ` · ${p.last_test_latency_ms}ms`
                          : ""}
                        {p.last_test_error ? ` · ${p.last_test_error}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      href={`/settings/providers/${p.id}/models`}
                      className="font-semibold uppercase tracking-wider text-xs border-border hover:bg-secondary rounded-none"
                    >
                      <Cpu className="h-3.5 w-3.5" /> Models
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(p)}
                      disabled={deleting === p.id}
                      className="font-semibold uppercase tracking-wider text-xs border-border hover:bg-secondary rounded-none"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(p)}
                      disabled={deleting === p.id}
                      className="font-semibold uppercase tracking-wider text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-none"
                    >
                      {deleting === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {editing ? (
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <header className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">
              {form.id ? "Edit provider" : "Add provider"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Save metadata first, then add or rotate the API key. Test
              connection runs against the saved configuration.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 md:col-span-2 relative">
              <Label>Preset</Label>
              {form.id ? (
                <div className="flex items-center gap-2.5 h-10 rounded-none border border-border bg-secondary/50 px-3 text-sm text-foreground/80 font-medium">
                  {form.presetId ? PRESETS.find((p) => p.id === form.presetId)?.label ?? form.presetId : "Custom connection"}
                </div>
              ) : (
                <ProviderPicker
                  value={form.presetId}
                  onChange={onPresetChange}
                />
              )}
              {form.id ? (
                <p className="text-xs text-foreground/75">
                  Presets are only applied on create. Edit individual fields below.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="TokenRouter MiniMax-M3"
                maxLength={120}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="protocol">Protocol</Label>
              <select
                id="protocol"
                value={form.protocol}
                onChange={(e) =>
                  setForm({
                    ...form,
                    protocol: e.target.value as ProviderProtocol,
                  })
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="openai-compatible">OpenAI-compatible</option>
                <option value="anthropic-compatible">
                  Anthropic-compatible
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="base-url">Base URL</Label>
              <Input
                id="base-url"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="https://api.tokenrouter.com/v1/chat/completions"
              />
              <p className="text-xs text-muted-foreground">
                Accepts a base API root (…/v1) or a full chat-completions URL.
                TokenRouter is{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  https://api.tokenrouter.com/v1/chat/completions
                </code>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="default-model">Default model</Label>
              <Input
                id="default-model"
                value={form.defaultModel}
                onChange={(e) =>
                  setForm({ ...form, defaultModel: e.target.value })
                }
                placeholder="MiniMax-M3"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                placeholder="Anything you want to remember about this connection."
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="api-key">
                {form.id ? "Rotate API key (optional)" : "API key"}
              </Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={form.showKey ? "text" : "password"}
                  value={form.apiKey}
                  onChange={(e) =>
                    setForm({ ...form, apiKey: e.target.value })
                  }
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={
                    form.id
                      ? "Leave blank to keep the saved key"
                      : "Paste your provider API key"
                  }
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, showKey: !form.showKey })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label={form.showKey ? "Hide key" : "Show key"}
                  tabIndex={-1}
                >
                  {form.showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Encrypted. Never displayed again after save.
              </p>
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="is-enabled"
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) =>
                  setForm({ ...form, isEnabled: e.target.checked })
                }
                className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              <Label htmlFor="is-enabled" className="cursor-pointer">
                Enabled
              </Label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onSave} disabled={saving || testing}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {form.id ? "Save changes" : "Create provider"}
            </Button>
            {form.id ? (
              <Button
                variant="outline"
                onClick={onTest}
                disabled={saving || testing}
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plug className="h-4 w-4" />
                )}
                Test connection
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setForm(EMPTY_FORM);
              }}
              disabled={saving || testing}
            >
              Cancel
            </Button>
            <span className="ml-auto text-xs text-muted-foreground">
              Keys are encrypted with a server-only AES-256-GCM key.
            </span>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-none border border-dashed border-border/60 p-6">
      <div className="flex h-9 w-9 items-center justify-center bg-secondary border border-border">
        <Plug className="h-4 w-4" />
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">No active API providers</h3>
        <p className="mt-1 text-xs text-foreground/75 leading-relaxed">
          Connect OpenAI, Google Gemini, OpenRouter, or other self-hosted/local model servers to start chatting.
        </p>
      </div>
      <Button onClick={onAdd} size="sm" className="rounded-none font-semibold uppercase tracking-wider text-xs border-border hover:bg-secondary">
        Add your first provider
      </Button>
    </div>
  );
}

function ProviderPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (presetId: string) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedPreset = PRESETS.find((p) => p.id === value);

  const filteredPresets = PRESETS.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.label.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.companyName && p.companyName.toLowerCase().includes(query))
    );
  });

  const categories = [
    { id: "popular", name: "Popular" },
    { id: "direct", name: "Direct Providers" },
    { id: "router", name: "Routers & Gateways" },
    { id: "local", name: "Local / Self-hosted" },
    { id: "custom", name: "Custom Setup" },
  ] as const;

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring rounded-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedPreset ? (
            <>
              <ProviderLogo logoKey={selectedPreset.logoKey} className="h-4.5 w-4.5" />
              <span className="font-semibold text-foreground truncate">{selectedPreset.label}</span>
              {selectedPreset.protocol && (
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 border border-border bg-secondary text-foreground/80">
                  {selectedPreset.protocol === "openai-compatible" ? "OpenAI API" : "Anthropic API"}
                </span>
              )}
            </>
          ) : (
            <span className="text-foreground/80 font-medium">Custom (no preset)</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-[380px] flex flex-col border border-border bg-popover shadow-md overflow-hidden rounded-none">
          <div className="relative border-b border-border p-2 bg-popover">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search providers..."
              className="h-9 w-full border border-input bg-background pl-9 pr-3 text-xs placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring rounded-none"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto p-1 bg-popover divide-y divide-border/30">
            {categories.map((cat) => {
              const items = filteredPresets.filter((p) => p.category === cat.id);
              if (items.length === 0) return null;

              return (
                <div key={cat.id} className="py-1.5">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                    {cat.name}
                  </div>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {items.map((preset) => {
                      const isSelected = preset.id === value;
                      const isDisabled = preset.disabled;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            onChange(preset.id);
                            setOpen(false);
                            setSearch("");
                          }}
                          className={cn(
                            "flex w-full items-start gap-3 px-3 py-2 text-left transition-colors rounded-none",
                            isSelected
                              ? "bg-secondary text-foreground"
                              : isDisabled
                                ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                                : "hover:bg-secondary/50 text-foreground"
                          )}
                        >
                          <div className="mt-0.5 shrink-0">
                            <ProviderLogo logoKey={preset.logoKey} className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {preset.label}
                              </span>
                              {preset.protocol && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/60 border border-border px-1">
                                  {preset.protocol === "openai-compatible" ? "OpenAI" : "Anthropic"}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-foreground/80 leading-normal line-clamp-2">
                              {preset.description}
                            </p>
                            {isDisabled && preset.disabledReason && (
                              <p className="text-[9px] font-bold text-destructive uppercase tracking-wide">
                                {preset.disabledReason}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-success shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredPresets.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-foreground/60">
                No providers match your search query.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
