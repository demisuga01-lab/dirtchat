import { ArrowRight, MessageSquare, Layers, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPreview } from "@/components/marketing/product-preview";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.07),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)] animate-fade-in" />
        <div className="animate-gradient-shift absolute -inset-[50%] bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.03),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--muted-foreground)/0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.06),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--muted-foreground)/0.06),transparent_50%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center sm:py-28">
        <div className="animate-fade-in-up">
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl md:text-7xl">
            One interface for
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              every serious model.
            </span>
          </h1>
        </div>

        <p className="animate-fade-in-up animate-delay-100 mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Connect your own providers, compare models, and keep every
          conversation in a private workspace built for fast, focused AI work.
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

        <p className="animate-fade-in animate-delay-300 mt-4 max-w-md text-xs text-muted-foreground">
          Model routing, saved conversations, and capability-aware
          workflows &mdash; without locking your work to one provider.
        </p>

        <div className="animate-fade-in-up animate-delay-300 mt-16 grid w-full grid-cols-1 items-stretch gap-4 text-left sm:grid-cols-3">
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

      <ProductPreview />
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
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-5 backdrop-blur transition-colors hover:border-foreground/20">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
