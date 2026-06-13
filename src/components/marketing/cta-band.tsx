import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8 flex flex-col justify-center">
            {/* System Tag */}
            <div className="mb-4 flex items-center gap-2 text-[10px] font-mono tracking-widest text-accent uppercase">
              <span>[ DEPLOYMENT / WORKSPACE_INIT ]</span>
              <span className="h-1.5 w-1.5 bg-accent" />
            </div>

            <h2 className="text-3xl font-bold uppercase tracking-tighter text-foreground sm:text-5xl lg:text-6xl max-w-2xl leading-[1.05]">
              Start building your workspace
            </h2>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end lg:pb-2">
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm">
              Connect your first provider, browse available models, and start
              chatting — all from one clean interface.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button href="/sign-up" size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold uppercase tracking-widest h-12 px-8">
                Get started
              </Button>
              <Button href="/features" variant="outline" size="lg" className="rounded-none border-border bg-transparent hover:bg-secondary text-foreground text-xs font-bold uppercase tracking-widest h-12 px-8">
                View features
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
