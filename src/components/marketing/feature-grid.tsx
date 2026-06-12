import {
  Brain,
  KeyRound,
  Layers,
  Image as ImageIcon,
  Lock,
  Activity,
} from "lucide-react";

const features = [
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Multi-model routing",
    description:
      "Switch between OpenAI, Anthropic, OpenRouter, TokenRouter, or your own self-hosted endpoint — from the same calm interface.",
  },
  {
    icon: <KeyRound className="h-5 w-5" />,
    title: "Bring your own keys",
    description:
      "Your provider keys stay tied to your account, encrypted at rest. We never see your prompts through a shared proxy.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Reasoning controls",
    description:
      "Toggle deep thinking, set budgets, and let the router pick the right model for the job — without leaving the conversation.",
  },
  {
    icon: <ImageIcon className="h-5 w-5" />,
    title: "Files and images",
    description:
      "Drop a PDF, paste a screenshot, or attach a code file. Dirtchat handles the rest through a Supabase-backed workspace.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Supabase auth & storage",
    description:
      "Server-rendered auth, row-level security, and a clean path to scale. Your data lives in your Supabase project, not ours.",
  },
  {
    icon: <Activity className="h-5 w-5" />,
    title: "Usage and budgets",
    description:
      "See token spend per conversation, set daily limits, and keep your experiments honest with first-class usage logging.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          A premium surface for serious work
        </h2>
        <p className="mt-3 text-balance text-muted-foreground">
          Dirtchat is built for people who already use AI for real work — and
          who want a workspace that respects their time, their data, and their
          taste.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              {f.icon}
            </div>
            <h3 className="text-base font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
