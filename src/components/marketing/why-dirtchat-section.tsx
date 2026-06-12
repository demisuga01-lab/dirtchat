import { SwitchCamera, KeyRound, MessageSquare, ListChecks, Shield, Focus } from "lucide-react";

const reasons = [
  {
    icon: <SwitchCamera className="h-5 w-5" />,
    title: "Stop hopping between model dashboards",
    description:
      "Keep every provider and model in one workspace. Switch providers mid-conversation without losing context.",
  },
  {
    icon: <KeyRound className="h-5 w-5" />,
    title: "Bring your own providers",
    description:
      "Use the API keys you already have. No shared proxies, no hidden routing — your requests go directly to the providers you choose.",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Keep conversations organized",
    description:
      "Every thread is saved, searchable, and pinned when it matters. No more digging through terminal history or scraping chat logs.",
  },
  {
    icon: <ListChecks className="h-5 w-5" />,
    title: "Choose models by capability",
    description:
      "See what each model can do before you pick it. Reasoning, tool use, structured output, context window — browse by capability, not just by name.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Avoid provider lock-in",
    description:
      "Your prompts, your history, and your model catalog are independent of any single provider. Switch or add providers without rebuilding your workflow.",
  },
  {
    icon: <Focus className="h-5 w-5" />,
    title: "Built for focused work",
    description:
      "Clean interface, minimal distractions, keyboard-driven workflows. Dirtchat is designed for people who spend hours working with AI models every day.",
  },
];

export function WhyDirtchatSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Why Dirtchat
        </h2>
        <p className="mt-3 text-balance text-muted-foreground">
          A workspace built around provider choice, conversation ownership, and
          a calm interface for serious AI workflows.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r) => (
          <div key={r.title} className="flex flex-col gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              {r.icon}
            </div>
            <h3 className="text-base font-semibold">{r.title}</h3>
            <p className="text-sm text-muted-foreground">{r.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
