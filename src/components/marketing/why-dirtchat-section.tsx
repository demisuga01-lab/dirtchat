export function WhyDirtchatSection() {
  const reasons = [
    {
      title: "Stop hopping between model dashboards",
      description:
        "Keep every provider and model in one workspace. Switch providers mid-conversation without losing context.",
    },
    {
      title: "Bring your own providers",
      description:
        "Use the API keys you already have. No shared proxies, no hidden routing — your requests go directly to the providers you choose.",
    },
    {
      title: "Keep conversations organized",
      description:
        "Every thread is saved, searchable, and pinned when it matters. No more digging through terminal history or scraping chat logs.",
    },
    {
      title: "Choose models by capability",
      description:
        "See what each model can do before you pick it. Reasoning, tool use, structured output, context window — browse by capability, not just by name.",
    },
    {
      title: "Avoid provider lock-in",
      description:
        "Your prompts, your history, and your model catalog are independent of any single provider. Switch or add providers without rebuilding your workflow.",
    },
    {
      title: "Built for focused work",
      description:
        "Clean interface, minimal distractions, keyboard-driven workflows. Dirtchat is designed for people who spend hours working with AI models every day.",
    },
  ];

  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 2xl:px-14">
        {/* Header Block */}
        <div className="mb-12 max-w-3xl">
          <div className="mb-2 text-[10px] font-mono tracking-widest text-accent uppercase">
            [ COMPARISON / ADVANTAGE ]
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl md:text-5xl mb-4">
            Why Dirtchat
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A workspace built around provider choice, conversation ownership, and
            a calm interface for serious AI workflows.
          </p>
        </div>

        {/* Reasons Grid with Left Border Markers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="flex flex-col border-l border-accent/30 pl-4 py-1 hover:border-accent transition-colors duration-200"
            >
              <div className="text-[10px] font-mono text-accent mb-2 uppercase">
                [ PARAMETER {String(i + 1).padStart(2, "0")} ]
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-foreground mb-3">
                {r.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
