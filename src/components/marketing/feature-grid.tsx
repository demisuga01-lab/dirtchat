export function FeatureGrid() {
  const features = [
    {
      num: "01",
      title: "Multi-model workspace",
      description:
        "Switch between providers and models without scattering conversations across disconnected dashboards.",
    },
    {
      num: "02",
      title: "Bring your own keys",
      description:
        "Your provider keys stay tied to your account, encrypted at rest. We never route your requests through a shared proxy.",
    },
    {
      num: "03",
      title: "Model catalog",
      description:
        "Browse available models per provider, see capability tags, and pick the right model for each task — including controls for reasoning and output limits.",
    },
    {
      num: "04",
      title: "File workflows",
      description:
        "Drop a PDF, paste a screenshot, or attach a code file. Dirtchat handles the rest through an integrated workspace.",
    },
    {
      num: "05",
      title: "Private workspace",
      description:
        "Your conversations belong to you. Authentication, encryption, and granular access controls keep your data where it belongs.",
    },
    {
      num: "06",
      title: "Usage insights",
      description:
        "See token spend per conversation, compare model performance, and stay in control of how you use each provider.",
    },
  ];

  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 2xl:px-14">
        {/* Header Block */}
        <div className="mb-12 max-w-3xl">
          <div className="mb-2 text-[10px] font-mono tracking-widest text-accent uppercase">
            [ SYSTEM FEATURES / SPECS ]
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl md:text-5xl mb-4">
            Built for serious AI work
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A workspace that respects your time, your data, and your choice of
            models — without locking you into one provider.
          </p>
        </div>

        {/* Swiss Grid Layout: 1px borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
          {features.map((f) => (
            <div
              key={f.title}
              className="group flex flex-col justify-between border-r border-b border-border p-6 lg:p-8 hover:bg-muted/10 transition-colors duration-200"
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold tracking-wider text-muted-foreground">
                    {f.num} {"// SPEC"}
                  </span>
                  <span className="h-1 w-1 bg-accent/40 group-hover:bg-accent transition-colors" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-tight text-foreground mb-3">
                  {f.title}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-4">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
