import { Button } from "@/components/ui/button";
import { RoutingMapBackground } from "./routing-map-background";

export function LandingHero() {
  return (
    <section className="relative w-full border-b border-border bg-background pt-20 pb-16 md:pt-28 md:pb-24">
      <RoutingMapBackground />
      <div className="relative z-10 mx-auto max-w-[1600px] px-6 lg:px-10 2xl:px-14">
        {/* Editorial Grid Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* System Status Tag */}
            <div className="mb-6 flex items-center gap-2 text-[11px] font-mono tracking-widest text-accent uppercase">
              <span>[ System Status: Ready ]</span>
              <span className="h-1.5 w-1.5 bg-accent" />
            </div>

            <h1 className="text-4xl font-bold leading-[0.95] tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl uppercase">
              Bring your
              <br />
              providers.
              <br />
              Keep your
              <br />
              threads.
            </h1>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-end lg:pb-2">
            <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-md">
              Connect your own model keys. Start chats, switch models, and keep the work in one private workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button href="/sign-up" size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold uppercase tracking-widest h-14 px-10">
                Get started
              </Button>
              <Button href="/sign-in" variant="outline" size="lg" className="rounded-none border-border bg-transparent hover:bg-secondary text-foreground text-xs font-bold uppercase tracking-widest h-14 px-10">
                Sign in
              </Button>
            </div>

            {/* Product Summary Rail */}
            <div className="border-t border-border pt-8 flex flex-col gap-6">
              <div className="text-xs font-mono tracking-widest text-accent uppercase">
                [ PRODUCT SPECIFICATION / CORE ]
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1 border-l-2 border-accent/40 pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Connect providers</span>
                  <span className="text-xs text-muted-foreground">Bring your own keys.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent/40 pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Choose a model</span>
                  <span className="text-xs text-muted-foreground">Switch without leaving the thread.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent/40 pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Keep context</span>
                  <span className="text-xs text-muted-foreground">Your chats stay organized in one place.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent/40 pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Work privately</span>
                  <span className="text-xs text-muted-foreground">Your workspace stays yours.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
