import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { WorkspacePreviewIllustration, ProviderFlowIllustration } from "@/components/marketing/marketing-illustrations";
import { ArrowRight, MessageSquare, KeyRound, Layers, Brain, FolderOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Multi-model workspace, bring your own keys, streaming chat, model catalog, and saved conversations — all in one private AI workspace.",
};

export default function FeaturesPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <h1 className="animate-fade-in-up text-4xl font-semibold tracking-tight sm:text-5xl">
            Features for a model-agnostic workspace
          </h1>
          <p className="animate-fade-in-up animate-delay-100 mx-auto mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
            Every feature is designed around provider choice, conversation
            ownership, and a calm interface for focused AI work.
          </p>
          <div className="animate-fade-in-up animate-delay-200 mt-10">
            <WorkspacePreviewIllustration />
          </div>
        </section>

        {/* Chat workspace */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Chat workspace
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Real-time streaming responses from any connected model. Messages
                  appear as they are generated, with controls to stop, cancel,
                  or regenerate. Every thread is saved automatically, so you can
                  return to any conversation and pick up where you left off.
                </p>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Switch models mid-conversation to compare outputs or pivot when one
                  model handles a task better than another. Provider connection
                  failures are surfaced clearly so you can recover without
                  losing your thread.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Provider connections */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Provider connections
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Add, update, or remove provider connections at any time. Your API
                keys are encrypted at rest and never exposed in the interface after
                saving. Keys are never shared between users, and no shared proxy
                routes your requests without your knowledge.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                You decide which providers power your workspace. Add a new
                provider, scan for available models, and start using it
                immediately. Remove a provider when you no longer need it.
              </p>
            </div>
          </div>
        </section>

        {/* Illustration break */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <ProviderFlowIllustration />
          </div>
        </section>

        {/* Model catalog */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Model catalog
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Every provider connection is scanned to discover available models.
                Browse what is available, see capability tags for each model, and
                compare options before you commit a conversation to a model.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                The catalog separates model owner from access provider, so you know
                who built each model and through which route you are connecting.
                No confusing router names presented as model owners.
              </p>
            </div>
          </div>
        </section>

        {/* Capability-aware selection */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Capability-aware selection
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Choose models based on what they can do, not just what name
                  appears in a dropdown. See reasoning depth, context window size,
                  tool support, and output behavior before you start a
                  conversation.
                </p>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Set default models per capability, or pick specifically for each
                  task. When a task calls for deep reasoning, pick a reasoning model.
                  When you need speed, pick a faster one. The interface helps you make
                  an informed choice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conversation history */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Conversation history
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Every thread is persisted, searchable, and organized. You can pin
                important conversations, archive old ones, and return to any thread
                across sessions. No more losing context because a chat window closed
                or a provider dashboard reset.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Threads are independent of provider subscriptions. Even if you
                stop using a particular provider, your conversation history remains
                in your workspace.
              </p>
            </div>
          </div>
        </section>

        {/* Error recovery */}
        <section className="border-t border-border/60 bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Safe setup and error recovery
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  API keys are validated at connection time, with clear feedback
                  when a connection fails. Error messages explain what went wrong
                  without exposing sensitive internal details.
                </p>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  When a provider returns an error mid-conversation, the thread
                  stays intact. You can retry with the same model or switch to
                  another — without losing your prompt or context.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming later */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            Coming later
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <ComingCard
              title="File and image workflows"
              description="Attach PDFs, screenshots, or code files. The workspace handles context assembly so you can work across modalities."
            />
            <ComingCard
              title="Reasoning controls"
              description="Configurable reasoning budgets and depth controls for models that support extended thinking."
            />
            <ComingCard
              title="Usage insights"
              description="Token usage and spend visibility across providers, with per-thread and per-model breakdowns."
            />
            <ComingCard
              title="Deeper workspace organization"
              description="Folders, tags, and project-level organization for threads that span long-running work."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Connect your first provider and start working across models in one
            private workspace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/sign-up" size="lg">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/why-dirtchat" size="lg" variant="outline">
              Why Dirtchat
            </Button>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function ComingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
