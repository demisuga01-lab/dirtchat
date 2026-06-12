import { ArrowRight, MessageSquare, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[linear-gradient(to_bottom,hsl(var(--muted)/0.4),transparent)]"
      />
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-16 pt-24 text-center sm:pt-32">
        <Badge variant="outline" className="mb-6 gap-2 rounded-full px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          Prompt 1 · Foundation preview
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          One quiet workspace.
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Every model that matters.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
          Dirtchat is a premium, privacy-first AI chat workspace. Bring your own
          keys, route prompts across providers, and keep your conversations
          exactly where they belong — with you.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button href="/sign-up" size="lg">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/sign-in" size="lg" variant="outline">
            Sign in
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          BYOK support, multi-model routing, and a focused interface — coming
          progressively across upcoming releases.
        </p>

        <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          <HeroStat
            icon={<MessageSquare className="h-4 w-4" />}
            label="Streaming chat"
            value="Engineered for speed and clarity"
          />
          <HeroStat
            icon={<Sparkles className="h-4 w-4" />}
            label="Multi-model router"
            value="OpenAI, Anthropic, OpenRouter, custom"
          />
          <HeroStat
            icon={<Shield className="h-4 w-4" />}
            label="Privacy by design"
            value="Bring your own keys, keep your data"
          />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
