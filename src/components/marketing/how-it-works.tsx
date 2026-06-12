import { PlugZap, Search, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: <PlugZap className="h-5 w-5" />,
    title: "Connect a provider",
    description:
      "Add your API key for any supported provider or OpenAI-compatible endpoint. Keys are encrypted and never exposed.",
  },
  {
    icon: <Search className="h-5 w-5" />,
    title: "Discover available models",
    description:
      "Your provider connections are automatically scanned. Browse model names, capability tags, and default settings — all in one place.",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Chat in one workspace",
    description:
      "Pick a model and start a conversation. Switch providers mid-task, compare responses, and keep your entire history organized in threads.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border/60 bg-muted/30 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-balance text-center text-muted-foreground">
          From provider setup to streaming chat in a few steps.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-foreground">
                {step.icon}
              </div>
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-muted-foreground animate-connecting-pulse" style={{ animationDelay: `${i * 800}ms` }}>
                {i + 1}
              </div>
              <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
