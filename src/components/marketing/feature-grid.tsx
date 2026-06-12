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
    title: "Multi-model workspace",
    description:
      "Switch between providers and models without scattering conversations across disconnected dashboards.",
  },
  {
    icon: <KeyRound className="h-5 w-5" />,
    title: "Bring your own keys",
    description:
      "Your provider keys stay tied to your account, encrypted at rest. We never route your requests through a shared proxy.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Model catalog",
    description:
      "Browse available models per provider, see capability tags, and pick the right model for each task — including controls for reasoning and output limits.",
  },
  {
    icon: <ImageIcon className="h-5 w-5" />,
    title: "File workflows",
    description:
      "Drop a PDF, paste a screenshot, or attach a code file. Dirtchat handles the rest through an integrated workspace.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Private workspace",
    description:
      "Your conversations belong to you. Authentication, encryption, and granular access controls keep your data where it belongs.",
  },
  {
    icon: <Activity className="h-5 w-5" />,
    title: "Usage insights",
    description:
      "See token spend per conversation, compare model performance, and stay in control of how you use each provider.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for serious AI work
        </h2>
        <p className="mt-3 text-balance text-muted-foreground">
          A workspace that respects your time, your data, and your choice of
          models — without locking you into one provider.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-sm"
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
