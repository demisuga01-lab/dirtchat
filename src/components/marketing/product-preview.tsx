"use client";

/**
 * ProductPreview — A CSS-only mockup of the Dirtchat chat interface
 * showing model routing indicators and conversation threading.
 */
export function ProductPreview() {
  return (
    <div className="mx-auto mt-8 w-full max-w-3xl px-6 sm:mt-12">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60 shadow-2xl backdrop-blur">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Dirtchat — Model Workspace
          </span>
          <div className="w-12" />
        </div>

        {/* Chat area */}
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-br-md bg-[#6366f1]/15 px-4 py-3">
              <p className="text-sm text-foreground">
                Compare the trade-offs between fine-tuning and RAG for this use case.
              </p>
            </div>
          </div>

          {/* AI response with model indicator */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 px-2 py-0.5 text-[10px] font-medium text-[#a78bfa]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                Claude 3.5 Sonnet · Anthropic
              </span>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border/40 bg-muted/30 px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed">
                For your dataset size (~50K examples), fine-tuning gives better consistency
                but RAG provides more flexibility when your knowledge base changes frequently.
                Here&apos;s a comparison&hellip;
              </p>
            </div>
          </div>

          {/* Model switch indicator */}
          <div className="flex items-center justify-center gap-2 py-1">
            <div className="h-px flex-1 bg-border/30" />
            <span className="text-[10px] text-muted-foreground">
              Switched to GPT-4o · OpenAI
            </span>
            <div className="h-px flex-1 bg-border/30" />
          </div>

          {/* Second AI response */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 px-2 py-0.5 text-[10px] font-medium text-[#6366f1]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                GPT-4o · OpenAI
              </span>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border/40 bg-muted/30 px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed">
                I&apos;d recommend a hybrid approach: use RAG for the dynamic portions
                and a fine-tuned classifier for routing queries&hellip;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
