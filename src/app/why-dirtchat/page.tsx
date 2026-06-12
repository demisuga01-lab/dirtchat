import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ModelOwnershipIllustration } from "@/components/marketing/marketing-illustrations";
import { ArrowRight, Code2, FileText, Lightbulb, Search, GitBranch, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why Dirtchat",
  description:
    "Stop working around model silos. One workspace, your providers, saved threads — without locking your work to one provider.",
};

export default function WhyDirtchatPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <h1 className="animate-fade-in-up text-4xl font-semibold tracking-tight sm:text-5xl">
            Stop working around model silos
          </h1>
          <p className="animate-fade-in-up animate-delay-100 mx-auto mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
            You use more than one AI model. Your tools should not force you to
            hop between dashboards, lose context, or confuse who built each
            model with who routes it.
          </p>
        </section>

        {/* The problem */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              The problem
            </h2>
            <div className="mt-8 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Serious AI work today often spans multiple models and providers.
                You might use one model for coding, another for long-form
                reasoning, and a third for quick research questions. But most AI
                tools are built around a single provider or model family.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The result is fragmentation. Conversations scattered across
                different dashboards. Prompts copy-pasted between tabs.
                Subscription plans that overlap or leave gaps. And confusion about
                which company actually built the model you are using — especially
                when routers and marketplaces repackage models under their own
                branding.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You should not have to rebuild your workflow every time a new
                model appears, a provider changes pricing, or a router starts
                labeling models as if it built them.
              </p>
            </div>
          </div>
        </section>

        {/* Illustration break */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <ModelOwnershipIllustration />
          </div>
        </section>

        {/* The Dirtchat solution */}
        <section className="border-t border-border/60 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              The Dirtchat solution
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <SolutionCard
                title="One interface"
                description="All your connected models appear in one workspace. Switch between them without changing dashboards or losing your place."
              />
              <SolutionCard
                title="Provider choice"
                description="You connect your own API keys. No shared proxy, no hidden routing, no vendor lock-in. Add or remove providers freely."
              />
              <SolutionCard
                title="Saved threads"
                description="Every conversation is saved, searchable, and independent of any provider. Your history stays yours."
              />
              <SolutionCard
                title="Model catalog"
                description="See what models are available, what they can do, and who built them — before you start a conversation."
              />
            </div>
          </div>
        </section>

        {/* Comparison without attacking */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Compared to single-provider dashboards
            </h2>
            <div className="mt-10 space-y-6">
              <CompareRow
                label="Provider choice"
                dirtchat="Connect any supported provider with your own keys. No walled garden."
                other="Locked to one provider's models and pricing."
              />
              <CompareRow
                label="Model ownership clarity"
                dirtchat="See original lab and access route separately. No confusing router labels."
                other="Models often repackaged under the platform brand regardless of who built them."
              />
              <CompareRow
                label="Conversation portability"
                dirtchat="Threads stay in your workspace even if you change providers."
                other="Conversations may be lost when you stop a subscription or change services."
              />
              <CompareRow
                label="Capability-aware decisions"
                dirtchat="Browse models by what they can do, not just by name in a dropdown."
                other="Models listed by name only, often without capability context."
              />
              <CompareRow
                label="Switching cost"
                dirtchat="Add or remove providers without rebuilding your workflow."
                other="Moving between services means starting over with setup, history, and defaults."
              />
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Use cases
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={<Code2 className="h-5 w-5" />}
              title="Coding"
              description="Use one model for code completion, another for architecture review, and a third for debugging — all in one workspace."
            />
            <UseCaseCard
              icon={<FileText className="h-5 w-5" />}
              title="Research &amp; writing"
              description="Gather context with one model, draft with another, edit with a third. Keep the entire thread organized."
            />
            <UseCaseCard
              icon={<Lightbulb className="h-5 w-5" />}
              title="Planning"
              description="Brainstorm product ideas, compare model perspectives, and document decisions in saved threads."
            />
            <UseCaseCard
              icon={<Search className="h-5 w-5" />}
              title="Technical learning"
              description="Ask different models to explain the same concept. Compare answers and save the thread for reference."
            />
            <UseCaseCard
              icon={<GitBranch className="h-5 w-5" />}
              title="Model comparison"
              description="Send the same prompt to multiple models. Compare outputs side by side in linked threads."
            />
            <UseCaseCard
              icon={<Flame className="h-5 w-5" />}
              title="Long-running work"
              description="Keep project threads alive across days or weeks, switching models as needed without losing context."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to stop hopping between model silos?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Start with one provider. Add more as your needs grow. Your
            workspace stays yours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/sign-up" size="lg">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/about" size="lg" variant="outline">
              About Dirtchat
            </Button>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function SolutionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CompareRow({
  label,
  dirtchat,
  other,
}: {
  label: string;
  dirtchat: string;
  other: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold">{label}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-primary/70">
            Dirtchat
          </div>
          <p className="mt-1 text-sm text-foreground">{dirtchat}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/50 px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Typical single-provider tool
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{other}</p>
        </div>
      </div>
    </div>
  );
}

function UseCaseCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
