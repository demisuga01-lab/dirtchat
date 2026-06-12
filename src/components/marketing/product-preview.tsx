"use client";

import { MessageSquare, Terminal, KeyRound, Sparkles, Send, PanelLeftOpen } from "lucide-react";

export function ProductPreview() {
  return (
    <div className="mx-auto mt-8 w-full max-w-4xl px-4 sm:mt-12">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-[#070708] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-border/50 bg-[#09090b] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/30" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
            <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/30" />
          </div>
          <span className="text-xs font-mono tracking-tight text-muted-foreground/85">
            dirtchat_workspace_preview.sh
          </span>
          <div className="w-12" />
        </div>

        {/* Dual pane mockup layout */}
        <div className="flex min-h-[420px] flex-col sm:flex-row">
          {/* Mockup Sidebar */}
          <div className="hidden w-60 shrink-0 flex-col border-r border-border/40 bg-[#050506] p-3.5 sm:flex">
            <div className="mb-4 flex items-center gap-2 px-2">
              {/* Mini Brand Mark */}
              <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground text-[10px] font-bold text-background">
                D
              </div>
              <span className="text-xs font-semibold text-foreground">Dirtchat</span>
            </div>

            {/* Mockup Sidebar Links */}
            <div className="flex flex-col gap-1 text-[11px] font-medium text-muted-foreground/90">
              <div className="flex items-center gap-2 rounded px-2.5 py-1.5 bg-[#18181b]/50 text-foreground">
                <MessageSquare className="h-3.5 w-3.5 text-success" />
                <span>Active thread</span>
              </div>
              <div className="flex items-center gap-2 rounded px-2.5 py-1.5 hover:bg-[#18181b]/30">
                <Terminal className="h-3.5 w-3.5" />
                <span>Model catalog</span>
              </div>
              <div className="flex items-center gap-2 rounded px-2.5 py-1.5 hover:bg-[#18181b]/30">
                <KeyRound className="h-3.5 w-3.5" />
                <span>Provider keys</span>
              </div>
            </div>

            {/* Saved Threads list */}
            <div className="mt-6">
              <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                Saved threads
              </span>
              <div className="mt-2 flex flex-col gap-0.5 text-[11px] text-muted-foreground/75">
                <div className="truncate rounded px-2.5 py-1.5 hover:bg-[#18181b]/30">
                  RAG Hybrid Architecture
                </div>
                <div className="truncate rounded px-2.5 py-1.5 hover:bg-[#18181b]/30">
                  Compare GPT-4o vs Claude
                </div>
                <div className="truncate rounded px-2.5 py-1.5 hover:bg-[#18181b]/30">
                  Refactor billing_service.go
                </div>
              </div>
            </div>
          </div>

          {/* Mockup Active Workspace */}
          <div className="flex flex-1 flex-col bg-[#070708]">
            {/* Top Workspace Bar */}
            <div className="flex items-center justify-between border-b border-border/40 bg-[#09090b]/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <PanelLeftOpen className="h-3.5 w-3.5 text-muted-foreground/50 sm:hidden" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-[#18181b]/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Claude 3.5 Sonnet
                </span>
                <span className="text-[10px] text-muted-foreground/60">via Anthropic</span>
              </div>
              <span className="rounded bg-success/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-success">
                Keys active
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 text-left">
              {/* User Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl bg-[#27272a] px-3.5 py-2 text-xs text-foreground shadow-sm">
                  Compare RAG vs fine-tuning for code comprehension tasks.
                </div>
              </div>

              {/* AI Bubble 1 */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                  <span>Claude 3.5 Sonnet</span>
                  <span>&middot;</span>
                  <span>Anthropic</span>
                </div>
                <div className="max-w-[90%] rounded-xl border border-border/40 bg-[#18181b]/40 px-3.5 py-2 text-xs text-foreground/90 leading-relaxed shadow-sm">
                  For dynamic data (like active codebases), <strong>RAG</strong> is superior because it retrieves the latest files. <strong>Fine-tuning</strong> is better for teaching the model a specific syntax style.
                </div>
              </div>

              {/* Provider routing switch divider */}
              <div className="flex items-center justify-center gap-2 py-1">
                <div className="h-px flex-1 bg-border/20" />
                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-muted-foreground/60">
                  <Sparkles className="h-2.5 w-2.5 text-success" />
                  Routed prompt to GPT-4o
                </span>
                <div className="h-px flex-1 bg-border/20" />
              </div>

              {/* AI Bubble 2 */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                  <span>GPT-4o</span>
                  <span>&middot;</span>
                  <span>OpenAI</span>
                </div>
                <div className="max-w-[90%] rounded-xl border border-border/40 bg-[#18181b]/40 px-3.5 py-2 text-xs text-foreground/90 leading-relaxed shadow-sm">
                  Agreed. If you want model-agnostic code routing, you can cache vectors on your server and feed context dynamically to either model without vendor lock-in.
                </div>
              </div>
            </div>

            {/* Mockup Chat Input */}
            <div className="border-t border-border/40 bg-[#09090b]/20 p-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-[#09090b] px-3 py-2">
                <div className="h-2 flex-1 rounded bg-muted-foreground/10" />
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background"
                  aria-hidden="true"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
