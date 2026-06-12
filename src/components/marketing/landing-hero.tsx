import { ArrowRight, MessageSquare, Layers, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelConstellation } from "@/components/marketing/model-constellation";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center overflow-hidden">
      {/* Subtle radial backdrop — NOT a generic gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_50%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 text-center sm:py-24">
        <div className="animate-fade-in-up">
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl md:text-7xl">
            One workspace for
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#6366f1] to-[#a78bfa] bg-clip-text text-transparent">
              every serious model.
            </span>
          </h1>
        </div>

        <p className="animate-fade-in-up animate-delay-100 mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Connect your own providers, compare models side by side, and keep
          every conversation in a private workspace built for focused AI work.
        </p>

        <div className="animate-fade-in-up animate-delay-200 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/sign-up" size="lg">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/sign-in" size="lg" variant="outline">
            Sign in
          </Button>
        </div>

        {/* Model routing constellation — the unique Dirtchat visual */}
        <div className="animate-fade-in-up animate-delay-300 mt-12 w-full sm:mt-16">
          <ModelConstellation className="opacity-90 transition-opacity hover:opacity-100" />
        </div>

        <p className="animate-fade-in animate-delay-300 mt-6 max-w-md text-xs text-muted-foreground">
          Model routing, saved conversations, and capability-aware
          workflows&mdash;without locking your work to one provider.
        </p>

        <div className="animate-fade-in-up animate-delay-300 mt-12 grid w-full grid-cols-1 items-stretch gap-4 text-left sm:grid-cols-3">
          <HeroStat
            icon={<MessageSquare className="h-4 w-4" />}
            label="Streaming chat"
            value="Real-time responses across any connected provider"
          />
          <HeroStat
            icon={<Layers className="h-4 w-4" />}
            label="Multi-model workspace"
            value="Switch between models without switching tools"
          />
          <HeroStat
            icon={<Shield className="h-4 w-4" />}
            label="Private by design"
            value="Your keys, your providers, your conversations"
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
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-5 backdrop-blur transition-colors hover:border-[#6366f1]/40">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
