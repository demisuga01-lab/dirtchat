export function WorkspacePreviewIllustration() {
  return (
    <div className="flex items-center justify-center p-4" aria-hidden="true">
      <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm">
        {/* Frame top bar */}
        <div className="mb-3 flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        {/* Sidebar chip row */}
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-12 rounded bg-secondary" />
          <div className="h-5 w-16 rounded bg-secondary/60" />
          <div className="h-5 w-10 rounded bg-secondary/40" />
        </div>
        {/* Model selector bar */}
        <div className="mb-3 flex items-center gap-2 rounded-md border border-border/50 bg-background/60 px-3 py-2">
          <div className="h-3 w-3 rounded-full bg-primary/70" />
          <div className="h-2.5 flex-1 rounded bg-muted-foreground/20" />
          <div className="h-2.5 w-4 rounded bg-muted-foreground/20" />
        </div>
        {/* Conversation area */}
        <div className="flex flex-col gap-2">
          {/* User message */}
          <div className="ml-auto h-8 w-3/5 rounded-lg bg-primary/10 px-3 py-2">
            <div className="h-1.5 w-3/4 rounded bg-muted-foreground/30" />
            <div className="mt-1 h-1.5 w-1/2 rounded bg-muted-foreground/20" />
          </div>
          {/* AI message */}
          <div className="h-14 w-4/5 rounded-lg border border-border/40 bg-background/50 px-3 py-2">
            <div className="h-1.5 w-full rounded bg-muted-foreground/30" />
            <div className="mt-1 h-1.5 w-5/6 rounded bg-muted-foreground/20" />
            <div className="mt-1 h-1.5 w-2/3 rounded bg-muted-foreground/20" />
            <div className="mt-1 h-1.5 w-1/2 rounded bg-muted-foreground/15" />
          </div>
          {/* User message */}
          <div className="ml-auto h-6 w-2/5 rounded-lg bg-primary/10 px-3 py-2">
            <div className="h-1.5 w-2/3 rounded bg-muted-foreground/30" />
          </div>
          {/* AI message */}
          <div className="h-10 w-4/5 rounded-lg border border-border/40 bg-background/50 px-3 py-2">
            <div className="h-1.5 w-full rounded bg-muted-foreground/30" />
            <div className="mt-1 h-1.5 w-3/5 rounded bg-muted-foreground/20" />
          </div>
        </div>
        {/* Input bar */}
        <div className="mt-3 flex items-center gap-2 rounded-md border border-border/50 bg-background/60 px-3 py-2">
          <div className="h-2 flex-1 rounded bg-muted-foreground/15" />
          <div className="h-5 w-5 rounded bg-primary/60" />
        </div>
      </div>
    </div>
  );
}

export function ModelOwnershipIllustration() {
  return (
    <div className="flex items-center justify-center p-4" aria-hidden="true">
      <div className="flex w-full max-w-md flex-col gap-3">
        {/* Header row */}
        <div className="rounded-lg border border-border/60 bg-card/60 px-3 py-2">
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="flex-1">Model</span>
            <span className="w-24">Original lab</span>
            <span className="w-24">Available through</span>
          </div>
        </div>
        {/* Row 1 */}
        <div className="group rounded-lg border border-border/40 bg-card/40 px-3 py-3 transition-all hover:border-foreground/15 hover:shadow-sm">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex-1 font-medium text-foreground">GPT-5.5</span>
            <span className="w-24 rounded bg-primary/10 px-2 py-0.5 text-center text-muted-foreground">OpenAI</span>
            <span className="w-24 rounded bg-secondary px-2 py-0.5 text-center text-muted-foreground">Connected provider</span>
          </div>
        </div>
        {/* Row 2 - highlighted */}
        <div className="rounded-lg border border-foreground/15 bg-card/50 px-3 py-3 shadow-sm ring-1 ring-primary/20">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex-1 font-medium text-foreground">Claude Fable 5</span>
            <span className="w-24 rounded bg-primary/10 px-2 py-0.5 text-center font-medium text-foreground">Anthropic</span>
            <span className="w-24 rounded bg-secondary px-2 py-0.5 text-center text-muted-foreground">Connected provider</span>
          </div>
        </div>
        {/* Row 3 */}
        <div className="group rounded-lg border border-border/40 bg-card/40 px-3 py-3 transition-all hover:border-foreground/15 hover:shadow-sm">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex-1 font-medium text-foreground">Current Gemini</span>
            <span className="w-24 rounded bg-primary/10 px-2 py-0.5 text-center text-muted-foreground">Google DeepMind</span>
            <span className="w-24 rounded bg-secondary px-2 py-0.5 text-center text-muted-foreground">Connected provider</span>
          </div>
        </div>
        {/* Row 4 */}
        <div className="group rounded-lg border border-border/40 bg-card/40 px-3 py-3 transition-all hover:border-foreground/15 hover:shadow-sm">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex-1 font-medium text-foreground">Current Grok</span>
            <span className="w-24 rounded bg-primary/10 px-2 py-0.5 text-center text-muted-foreground">xAI</span>
            <span className="w-24 rounded bg-secondary px-2 py-0.5 text-center text-muted-foreground">Connected provider</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyControlsIllustration() {
  return (
    <div className="flex items-center justify-center p-4" aria-hidden="true">
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {/* Key management */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <div className="text-xs font-semibold text-foreground">Key encryption</div>
          <div className="mt-1 text-[11px] text-muted-foreground">API keys are encrypted at rest and never displayed after saving.</div>
        </div>
        {/* Provider control */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div className="text-xs font-semibold text-foreground">Provider choice</div>
          <div className="mt-1 text-[11px] text-muted-foreground">You choose which providers process your prompts.</div>
        </div>
        {/* Delete control */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <div className="text-xs font-semibold text-foreground">Data control</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Delete or archive conversations whenever you choose.</div>
        </div>
        {/* Responsible use */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="text-xs font-semibold text-foreground">Responsible use</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Review provider policies before sending sensitive data.</div>
        </div>
      </div>
    </div>
  );
}

export function TermsResponsibilityIllustration() {
  return (
    <div className="flex items-center justify-center p-4" aria-hidden="true">
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        {/* User */}
        <div className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-foreground">You</div>
          <div className="flex-1">
            <div className="text-xs font-medium text-foreground">Account &amp; keys</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">You control your account, provide API keys, and submit content.</div>
          </div>
        </div>
        {/* Arrow */}
        <div className="flex h-8 w-0.5 items-center justify-center bg-border/60">
          <div className="absolute h-2 w-2 rotate-45 border-b-2 border-r-2 border-border/60" />
        </div>
        {/* Dirtchat */}
        <div className="flex w-full items-center gap-3 rounded-xl border border-foreground/15 bg-card/40 px-4 py-3 ring-1 ring-primary/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">D</div>
          <div className="flex-1">
            <div className="text-xs font-medium text-foreground">Dirtchat</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Routes requests, saves conversations, encrypts keys.</div>
          </div>
        </div>
        {/* Arrow */}
        <div className="flex h-8 w-0.5 items-center justify-center bg-border/60">
          <div className="absolute h-2 w-2 rotate-45 border-b-2 border-r-2 border-border/60" />
        </div>
        {/* Provider */}
        <div className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">AI</div>
          <div className="flex-1">
            <div className="text-xs font-medium text-foreground">Provider</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Processes prompts per its own terms. Outputs may be inaccurate.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProviderFlowIllustration() {
  return (
    <div className="flex items-center justify-center p-4" aria-hidden="true">
      <div className="flex w-full max-w-md flex-col gap-2">
        {/* Step 1 */}
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</div>
          <div className="flex-1">
            <div className="text-xs font-medium text-foreground">Add provider key</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">ORGANIZATION_ID=..., API_KEY=... &mdash; encrypted at rest</div>
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-[10px] text-success">&#10003;</div>
        </div>
        {/* Connector line */}
        <div className="relative mx-6 h-6">
          <div className="absolute left-3.5 top-0 h-full w-0.5 bg-border/40" />
        </div>
        {/* Step 2 */}
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/60 text-[10px] font-bold text-primary-foreground">2</div>
          <div className="flex-1">
            <div className="text-xs font-medium text-foreground">Catalog models</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Available models detected with capabilities and defaults</div>
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px]">&#9679;</div>
        </div>
        {/* Connector line */}
        <div className="relative mx-6 h-6">
          <div className="absolute left-3.5 top-0 h-full w-0.5 bg-border/40" />
        </div>
        {/* Step 3 */}
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/40 text-[10px] font-bold text-primary-foreground">3</div>
          <div className="flex-1">
            <div className="text-xs font-medium text-foreground">Choose model &amp; chat</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Select by capability, start streaming, save thread</div>
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px]">&#9679;</div>
        </div>
      </div>
    </div>
  );
}
