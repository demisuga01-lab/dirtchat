import { Layers, FolderOpen, Cpu } from "lucide-react";

export function ProductPreview() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24">
      <div className="animate-fade-in-up animate-delay-400 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PreviewPanel
          icon={<FolderOpen className="h-4 w-4" />}
          label="Saved conversations"
          lines={[
            "Research workflow",
            "Code review thread",
            "Model comparison notes",
          ]}
          activeIndex={0}
        />
        <PreviewPanel
          icon={<Layers className="h-4 w-4" />}
          label="Model catalog"
          lines={[
            "GPT-5.5 \u00b7 OpenAI",
            "Claude Fable 5 \u00b7 Anthropic",
            "Current Gemini \u00b7 Google DeepMind",
          ]}
          activeIndex={1}
        />
        <PreviewPanel
          icon={<Cpu className="h-4 w-4" />}
          label="Provider-controlled"
          lines={[
            "Keys encrypted at rest",
            "Switch providers per conversation",
            "Capability-aware model routing",
          ]}
          activeIndex={2}
        />
      </div>
    </div>
  );
}

function PreviewPanel({
  icon,
  label,
  lines,
  activeIndex,
}: {
  icon: React.ReactNode;
  label: string;
  lines: string[];
  activeIndex: number;
}) {
  return (
    <div className="group rounded-xl border border-border/70 bg-card/30 p-5 backdrop-blur transition-all hover:border-foreground/20 hover:shadow-sm hover-lift">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex flex-col gap-1.5">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
              i === activeIndex
                ? "bg-primary/10 text-foreground font-medium"
                : "text-muted-foreground/70"
            }`}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
