"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProviderFormPlaceholder() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="provider-name">Provider name</Label>
        <Input
          id="provider-name"
          placeholder="e.g. TokenRouter"
          disabled
          aria-disabled
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="protocol">Protocol</Label>
        <Input
          id="protocol"
          placeholder="OpenAI-compatible / Anthropic-compatible"
          disabled
          aria-disabled
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="base-url">Base URL</Label>
        <Input
          id="base-url"
          placeholder="https://api.example.com/v1"
          disabled
          aria-disabled
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="api-key">API key</Label>
        <Input
          id="api-key"
          type="password"
          placeholder="•••••••• (never sent yet)"
          disabled
          aria-disabled
        />
      </div>
      <div className="md:col-span-2 flex flex-wrap items-center gap-2">
        <Button type="button" disabled aria-disabled>
          Test connection
        </Button>
        <Button type="button" variant="outline" disabled aria-disabled>
          Refresh models
        </Button>
        <span className="text-xs text-muted-foreground">
          Saving providers ships in Prompt 2.
        </span>
      </div>
    </form>
  );
}
