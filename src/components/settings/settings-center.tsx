"use client";

import { useState, useCallback } from "react";
import {
  User,
  Palette,
  MessageSquare,
  KeyRound,
  Shield,
  Monitor,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Hash,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type PreferenceData = {
  user_id?: string;
  theme?: string;
  density?: string;
  sidebar_collapsed?: boolean;
  chat_enter_to_send?: boolean;
  chat_show_timestamps?: boolean;
  chat_show_token_usage?: boolean;
  chat_auto_scroll?: boolean;
  chat_markdown_enabled?: boolean;
  chat_code_copy_enabled?: boolean;
};

type SettingsCenterProps = {
  user: {
    email?: string;
    displayName?: string;
    createdAt?: string;
    providersCount: number;
    modelsCount: number;
  };
  initialPrefs: PreferenceData | null;
};

type TabId = "account" | "appearance" | "chat" | "providers" | "privacy";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "account", label: "Account", icon: <User className="h-4 w-4" /> },
  { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
  { id: "chat", label: "Chat behavior", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "providers", label: "Providers & models", icon: <KeyRound className="h-4 w-4" /> },
  { id: "privacy", label: "Data & privacy", icon: <Shield className="h-4 w-4" /> },
];

async function savePreferences(updates: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch("/api/settings/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function SettingsCenter({ user, initialPrefs }: SettingsCenterProps) {
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const [prefs, setPrefs] = useState<PreferenceData>(initialPrefs ?? {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName ?? "");

  const persist = useCallback(async (updates: Record<string, unknown>) => {
    setSaving(true);
    setSaved(false);
    const ok = await savePreferences(updates);
    if (ok) {
      setPrefs(prev => ({ ...prev, ...updates }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }, []);

  const toggle = (key: string) => {
    const current = (prefs as Record<string, unknown>)[key];
    persist({ [key]: !Boolean(current) });
  };

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      {/* Tab nav */}
      <nav className="flex shrink-0 flex-row overflow-x-auto sm:w-52 sm:flex-col sm:gap-1 sm:overflow-visible" aria-label="Settings tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        {saved && (
          <div className="mt-2 px-3 py-1 text-xs text-success animate-fade-in">
            ✓ Saved
          </div>
        )}
      </nav>

      {/* Tab content */}
      <div className="min-w-0 flex-1">
        {activeTab === "account" && (
          <AccountTab user={user} displayName={displayName} setDisplayName={setDisplayName} />
        )}
        {activeTab === "appearance" && (
          <AppearanceTab prefs={prefs} toggle={toggle} persist={persist} saving={saving} />
        )}
        {activeTab === "chat" && (
          <ChatTab prefs={prefs} toggle={toggle} saving={saving} />
        )}
        {activeTab === "providers" && (
          <ProvidersTab providersCount={user.providersCount} modelsCount={user.modelsCount} />
        )}
        {activeTab === "privacy" && (
          <PrivacyTab />
        )}
      </div>
    </div>
  );
}

function AccountTab({
  user,
  displayName,
  setDisplayName,
}: {
  user: SettingsCenterProps["user"];
  displayName: string;
  setDisplayName: (v: string) => void;
}) {
  const initials = (user.displayName ?? user.email ?? "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account identity and sign-in information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {initials}
            </div>
            <div>
              <CardTitle>{user.displayName ?? user.email?.split("@")[0] ?? "User"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
            <p className="text-xs text-muted-foreground">
              Profile updates are not yet persisted. This field shows your current session value.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
              {user.email ?? "—"}
            </div>
          </div>
          {user.createdAt && (
            <div className="flex flex-col gap-2">
              <Label>Member since</Label>
              <div className="text-sm text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AppearanceTab({
  prefs,
  toggle,
  persist,
  saving,
}: {
  prefs: PreferenceData;
  toggle: (key: string) => void;
  persist: (updates: Record<string, unknown>) => Promise<void>;
  saving: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize how Dirtchat looks and feels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Theme
          </CardTitle>
          <CardDescription>Choose a light, dark, or system theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                type="button"
                disabled={saving}
                onClick={() => persist({ theme: t })}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  prefs.theme === t
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Density
          </CardTitle>
          <CardDescription>Adjust the spacing and information density of the interface.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {([
              { key: "compact", icon: <Minimize2 className="h-3.5 w-3.5" />, label: "Compact" },
              { key: "comfortable", icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "Comfortable" },
              { key: "spacious", icon: <Maximize2 className="h-3.5 w-3.5" />, label: "Spacious" },
            ] as const).map((d) => (
              <button
                key={d.key}
                type="button"
                disabled={saving}
                onClick={() => persist({ density: d.key })}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  prefs.density === d.key
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20"
                }`}
              >
                {d.icon}
                {d.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <PreferenceSwitch
        icon={<Eye className="h-4 w-4" />}
        label="Show timestamps"
        description="Display message timestamps next to each message."
        checked={Boolean(prefs.chat_show_timestamps)}
        onToggle={() => toggle("chat_show_timestamps")}
        saving={saving}
      />

      <PreferenceSwitch
        icon={<Hash className="h-4 w-4" />}
        label="Show token usage"
        description="Display token counts for AI responses."
        checked={Boolean(prefs.chat_show_token_usage)}
        onToggle={() => toggle("chat_show_token_usage")}
        saving={saving}
      />
    </div>
  );
}

function ChatTab({
  prefs,
  toggle,
  saving,
}: {
  prefs: PreferenceData;
  toggle: (key: string) => void;
  saving: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Chat behavior</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how the chat workspace behaves.
        </p>
      </div>

      <PreferenceSwitch
        icon={<MessageSquare className="h-4 w-4" />}
        label="Enter to send"
        description="Press Enter to send a message. Shift+Enter inserts a new line."
        checked={Boolean(prefs.chat_enter_to_send ?? true)}
        onToggle={() => toggle("chat_enter_to_send")}
        saving={saving}
      />

      <PreferenceSwitch
        icon={<ArrowRight className="h-4 w-4" />}
        label="Auto-scroll"
        description="Automatically scroll to the latest message as responses stream."
        checked={Boolean(prefs.chat_auto_scroll ?? true)}
        onToggle={() => toggle("chat_auto_scroll")}
        saving={saving}
      />

      <PreferenceSwitch
        icon={<Eye className="h-4 w-4" />}
        label="Markdown rendering"
        description="Render AI responses with light formatting (code blocks, inline code)."
        checked={Boolean(prefs.chat_markdown_enabled ?? true)}
        onToggle={() => toggle("chat_markdown_enabled")}
        saving={saving}
      />

      <PreferenceSwitch
        icon={<EyeOff className="h-4 w-4" />}
        label="Code copy button"
        description="Show a copy-to-clipboard button on code blocks."
        checked={Boolean(prefs.chat_code_copy_enabled ?? true)}
        onToggle={() => toggle("chat_code_copy_enabled")}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle>Keyboard shortcuts</CardTitle>
          <CardDescription>Useful shortcuts while chatting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm">
            <ShortcutRow keys="Enter" description="Send message" />
            <ShortcutRow keys="Shift + Enter" description="New line" />
            <ShortcutRow keys="Esc" description="Cancel edit mode" />
            <ShortcutRow keys="Ctrl + N" description="New chat" />
            <ShortcutRow keys="Ctrl + K" description="Search conversations" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProvidersTab({ providersCount, modelsCount }: { providersCount: number; modelsCount: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Providers &amp; models</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your connected AI providers and discovered models.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Providers</CardTitle>
            </div>
            <CardDescription>
              {providersCount === 0
                ? "No providers connected yet."
                : `${providersCount} provider${providersCount !== 1 ? "s" : ""} connected.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button href="/settings/providers" variant="outline" size="sm">
              Manage providers
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Models</CardTitle>
            </div>
            <CardDescription>
              {modelsCount === 0
                ? "No models discovered yet."
                : `${modelsCount} model${modelsCount !== 1 ? "s" : ""} available.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {providersCount === 0 ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                Browse model catalog
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            ) : (
              <Button
                href="/settings/providers"
                variant="outline"
                size="sm"
              >
                Browse model catalog
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How provider connections work</CardTitle>
          <CardDescription>
            You control which providers power your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          <p>
            Your API keys are encrypted at rest and never exposed after saving.
            Each provider connection is scoped to your account — no other user
            can access your connections or models.
          </p>
          <p className="mt-3">
            When you send a message, the prompt is routed to the provider you
            select. The provider processes it according to its own terms and
            privacy policy. Different providers have different capabilities,
            pricing, and data handling practices. You should review each
            provider&apos;s documentation before connecting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Data &amp; privacy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Understand how your data is handled and what controls you have.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Your data and providers
          </CardTitle>
          <CardDescription>
            Data flow and privacy in your Dirtchat workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Your conversations are stored in your private workspace and are
            visible only to you. API keys are encrypted at rest and never
            displayed after saving.
          </p>
          <p>
            When you send a message, the content is routed to the AI provider
            you selected. That provider processes your prompt according to its
            own privacy policy and terms of service.
          </p>
          <p>
            You should review each provider&apos;s policies before sending data
            you consider sensitive. Only send confidential information to
            providers you trust and are authorized to use.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Conversation controls
          </CardTitle>
          <CardDescription>
            Manage your conversation data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <div className="text-sm font-medium">Archive conversations</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Individual conversations can be archived from the chat sidebar.
              </div>
            </div>
            <Badge variant="outline">Available</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <div className="text-sm font-medium">Delete conversations</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Individual conversations can be deleted from the chat sidebar.
              </div>
            </div>
            <Badge variant="outline">Available</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <div className="text-sm font-medium">Remove provider connections</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Removing a provider deletes stored keys and model data associated with it.
              </div>
            </div>
            <Badge variant="outline">Available</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4">
            <div>
              <div className="text-sm font-medium">Export data</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Conversation export is planned for a future update.
              </div>
            </div>
            <Badge variant="secondary">Coming later</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button href="/privacy" variant="outline" size="sm">
          View privacy page
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button href="/terms" variant="outline" size="sm">
          View terms
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function PreferenceSwitch({
  icon,
  label,
  description,
  checked,
  onToggle,
  saving,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  saving: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-muted-foreground">{icon}</div>
          <div>
            <div className="text-sm font-medium">{label}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={saving}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? "bg-primary" : "bg-muted-foreground/20"
          }`}
        >
          <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </Card>
  );
}

function ShortcutRow({ keys, description }: { keys: string; description: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{description}</span>
      <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
        {keys}
      </kbd>
    </div>
  );
}
