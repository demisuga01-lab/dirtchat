export function HowItWorks() {
  const steps = [
    {
      num: "01",
      tag: "CONNECT PROVIDERS",
      title: "Add your API keys",
      description:
        "Input keys for OpenAI, Anthropic, Gemini, Groq, or local endpoints. Your credentials are encrypted and stored in your browser or database—no middleman, no logging.",
    },
    {
      num: "02",
      tag: "PICK A MODEL",
      title: "Select from the catalog",
      description:
        "Access the latest LLMs from a unified dropdown. Compare capabilities, view token rates, and select standard configurations.",
    },
    {
      num: "03",
      tag: "START A THREAD",
      title: "Begin a clean conversation",
      description:
        "Initiate focused conversations in a distraction-free environment. Stream responses in real-time, format markdown, and manage outputs.",
    },
    {
      num: "04",
      tag: "SWITCH OR COMPARE",
      title: "Change models mid-chat",
      description:
        "Route the next message in your active thread to a different provider. Compare outputs side-by-side without losing conversation context.",
    },
    {
      num: "05",
      tag: "KEEP THE HISTORY",
      title: "Save threads locally",
      description:
        "All conversations are stored locally in your history. Search past code, retrieve previous discussions, and maintain absolute data ownership.",
    },
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1600px]">
        {/* Header Block */}
        <div className="border-b border-border px-6 py-12 lg:px-10 2xl:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="mb-2 text-[10px] font-mono tracking-widest text-accent uppercase">
                [ WORKFLOW / METHODOLOGY ]
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                The Real Workflow
              </h2>
            </div>
            <p className="max-w-md text-xs uppercase tracking-wider text-muted-foreground leading-relaxed">
              No wrappers, no visual markup. Direct integration from key connection to persistent threads.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col justify-between p-6 lg:p-8 hover:bg-muted/10 transition-colors duration-200"
            >
              <div>
                {/* Step Num & Tag */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl font-bold tracking-tighter text-foreground font-mono">
                    {step.num}
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-accent uppercase">
                    [ {step.tag} ]
                  </span>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-tight text-foreground mb-3">
                  {step.title}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-4">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
