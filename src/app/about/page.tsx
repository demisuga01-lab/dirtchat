import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { WorkspacePreviewIllustration } from "@/components/marketing/marketing-illustrations";
import { ArrowRight, Shield, Layers, KeyRound, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Dirtchat is a private AI workspace for people who use more than one model and want one clean place to work.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <h1 className="animate-fade-in-up text-4xl font-semibold tracking-tight sm:text-5xl">
            A private workspace for serious AI work
          </h1>
          <p className="animate-fade-in-up animate-delay-100 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Dirtchat is built for people who work across more than one model.
            Connect your own providers, compare models by capability, and keep
            every conversation in one focused, private workspace.
          </p>
          <div className="animate-fade-in-up animate-delay-200 mt-8">
            <WorkspacePreviewIllustration />
          </div>
        </section>

        {/* What it is */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What Dirtchat is
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <p className="text-muted-foreground leading-relaxed">
                Dirtchat is a private, model-agnostic AI workspace. You bring
                your own API keys, connect the providers you trust, and work
                across models without scattering your conversations across
                different dashboards.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every conversation is saved, searchable, and organized by
                thread. You can switch models mid-workflow, compare outputs
                side by side, and keep your entire history in one place —
                independent of any single provider.
              </p>
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Unlike services that lock you into one model family or route your
              requests through a shared proxy, Dirtchat puts you in control.
              Your keys, your providers, your conversations. No hidden routing.
              No vendor lock-in.
            </p>
          </div>
        </section>

        {/* Who it is for */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Who it is for
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AudienceCard
              title="Engineers"
              description="Work across coding models, compare completions, review diffs, and keep your technical threads organized without juggling tabs."
            />
            <AudienceCard
              title="Researchers"
              description="Track model behavior across providers, document prompts and results, and maintain a clean research trail in a single workspace."
            />
            <AudienceCard
              title="Writers &amp; creators"
              description="Draft, revise, and compare output from different models. Keep every draft and edit organized without losing earlier versions."
            />
            <AudienceCard
              title="Technical learners"
              description="Explore how different models explain concepts, solve problems, and handle reasoning tasks — all from one interface."
            />
            <AudienceCard
              title="Solo founders"
              description="One workspace for product planning, technical research, writing, and analysis — without paying for multiple subscriptions you don't need."
            />
            <AudienceCard
              title="Teams comparing models"
              description="Evaluate model outputs side by side, share workspace context, and make informed decisions about which model to use for each task."
            />
          </div>
        </section>

        {/* Illustration break */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-lg font-medium text-muted-foreground">
              One workspace. Your providers. No lock-in.
            </h2>
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What guides this product
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <PrincipleCard
              icon={<Shield className="h-5 w-5" />}
              title="User control"
              description="You decide which providers to connect, which models to use, and how your data is handled. No hidden routing. No forced defaults."
            />
            <PrincipleCard
              icon={<Layers className="h-5 w-5" />}
              title="Model choice"
              description="Work across any connected model. Compare outputs, switch mid-task, and keep your options open — without rebuilding your workflow."
            />
            <PrincipleCard
              icon={<KeyRound className="h-5 w-5" />}
              title="Conversation ownership"
              description="Your threads belong to you. Save, search, archive, or delete conversations. No vendor holds your history behind a subscription wall."
            />
            <PrincipleCard
              icon={<Focus className="h-5 w-5" />}
              title="Quiet interface"
              description="Clean typography, minimal chrome, keyboard-first workflows. Designed for people who spend hours working with AI models every day."
            />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <PrincipleCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              }
              title="Capability awareness"
              description="Know what each model can do before you pick it. Reasoning depth, context window, tool support — browse by capability, not just by name."
            />
            <PrincipleCard
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              }
              title="No provider lock-in"
              description="Your prompts, threads, and model catalog are independent of any single provider. Add, remove, or switch providers without losing your history or workflow."
            />
          </div>
        </section>

        {/* How it is different */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              How Dirtchat is different
            </h2>
            <div className="mt-10 space-y-8">
              <DiffItem
                label="One workspace"
                detail="Most AI tools are tied to a single provider or model. Dirtchat brings every connected model into one interface, with saved threads that persist regardless of which provider you use."
              />
              <DiffItem
                label="Model catalog"
                detail="You can see what models are available from your connected providers, what they can do, and which defaults make sense — before you start a conversation."
              />
              <DiffItem
                label="Saved threads"
                detail="Conversations are not ephemeral chat sessions. They are organized threads you can return to, search, and keep. No more losing important context between sessions."
              />
              <DiffItem
                label="Your keys, your control"
                detail="You connect your own provider API keys. No shared proxy, no hidden markup, no routing through a third party you did not choose."
              />
            </div>
          </div>
        </section>

        {/* Product vision */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Where this is going
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Dirtchat is under active development. The current version includes
            workspace chat, provider connections, model catalog, and saved
            conversations. Future releases will add file and image workflows,
            reasoning controls, usage insights across providers, and deeper
            workspace organization.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            The goal is a workspace that stays calm, stays private, and stays
            independent — even as the model landscape keeps changing.
          </p>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start building your workspace
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Connect your first provider, browse available models, and start
            chatting — all from one clean interface.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/sign-up" size="lg">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/features" size="lg" variant="outline">
              View features
            </Button>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function AudienceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-sm">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PrincipleCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function DiffItem({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-base font-semibold">{label}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
