import { ArrowRight, MessageSquare, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] w-full items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(to_bottom,hsl(var(--muted)/0.4),transparent)]"
      />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl md:text-7xl">
          One quiet workspace.
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Every model that matters.
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Dirtchat is a premium, privacy-first AI chat workspace. Bring your
          own keys, route prompts across providers, and keep your
          conversations exactly where they belong &mdash; with you.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/sign-up" size="lg">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/sign-in" size="lg" variant="outline">
            Sign in
          </Button>
        </div>
        <p className="mt-6 max-w-md text-xs text-muted-foreground">
          BYOK, multi-model routing, and a focused interface &mdash;
          built for serious AI work.
        </p>

        <div className="mt-20 grid w-full grid-cols-1 items-stretch gap-4 text-left sm:grid-cols-3">
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
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-5 backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
