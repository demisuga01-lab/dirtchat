import { ArrowRight, MessageSquare, Layers, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center overflow-hidden">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center sm:py-32">
        <div className="animate-fade-in-up">
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Bring your providers.
            <br className="hidden sm:block" />
            Keep your threads.
          </h1>
        </div>

        <p className="animate-fade-in-up animate-delay-100 mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Connect your own model keys. Start chats, switch models, and keep the work in one place.
        </p>

        <div className="animate-fade-in-up animate-delay-200 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="/sign-up" size="lg" className="h-12 px-8 text-base">
            Get started
          </Button>
          <Button href="/sign-in" size="lg" variant="outline" className="h-12 px-8 text-base">
            Sign in
          </Button>
        </div>

        {/* Abstract Workflow Instead of Mockup */}
        <div className="animate-fade-in-up animate-delay-300 mt-20 w-full max-w-4xl rounded-2xl border border-border/50 bg-card/30 p-8 sm:p-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-4">
            <WorkflowStep number="1" title="Connect keys" />
            <ArrowRight className="hidden h-5 w-5 text-muted-foreground/40 md:block" />
            <WorkflowStep number="2" title="Pick a model" />
            <ArrowRight className="hidden h-5 w-5 text-muted-foreground/40 md:block" />
            <WorkflowStep number="3" title="Keep the thread" />
          </div>
        </div>

        <div className="animate-fade-in-up animate-delay-400 mt-16 grid w-full grid-cols-1 items-stretch gap-6 text-left sm:grid-cols-3">
          <HeroStat
            icon={<MessageSquare className="h-5 w-5 text-muted-foreground" />}
            label="Unified Workspace"
            value="All your conversations in one place."
          />
          <HeroStat
            icon={<Layers className="h-5 w-5 text-muted-foreground" />}
            label="Model Independence"
            value="Switch providers without friction."
          />
          <HeroStat
            icon={<Shield className="h-5 w-5 text-muted-foreground" />}
            label="True Privacy"
            value="Direct API connections. No middlemen."
          />
        </div>
      </div>
    </section>
  );
}

function WorkflowStep({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
        {number}
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
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
    <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card/20 p-6">
      {icon}
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-1 text-sm text-muted-foreground">{value}</div>
      </div>
    </div>
  );
}
