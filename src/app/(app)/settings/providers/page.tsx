import { KeyRound, BookOpen, ShieldCheck } from "lucide-react";
import { ProviderManager } from "@/components/providers/provider-manager";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";

export const metadata = {
  title: "Providers",
};

export default async function ProvidersPage() {
  const { isConfigured } = getSupabaseEnv();

  // Server-side pre-check: if Supabase is not configured, still render the
  // page shell but the manager will surface its own error banner. We do
  // not redirect here — the user has a usable page either way.
  if (isConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      // The (app) layout already redirects unauthenticated users, but be
      // explicit. This is unreachable in practice.
      return null;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-3xl font-semibold tracking-tight">Providers</h1>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Connect your own model routers. Secrets are encrypted
          and never shown again.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Encrypted at rest
          </div>
          <p className="mt-1.5 text-sm text-foreground">
            API keys are encrypted at rest using a server-only key.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" /> First preset
          </div>
          <p className="mt-1.5 text-sm text-foreground">
            TokenRouter on
            <code className="mx-1 rounded bg-muted px-1 py-0.5">
              https://api.tokenrouter.com/v1/chat/completions
            </code>
            with default model
            <code className="mx-1 rounded bg-muted px-1 py-0.5">MiniMax-M3</code>.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" /> What is stored
          </div>
          <p className="mt-1.5 text-sm text-foreground">
            Only the last 4 characters of the key are shown back to you. The
            full secret is encrypted and never returned to the browser.
          </p>
        </div>
      </section>

      <ProviderManager />
    </div>
  );
}
