import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="border-t border-border/60 px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Start building your workspace
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-balance text-muted-foreground">
          Connect your first provider, browse available models, and start
          chatting — all from one clean interface.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/sign-up" size="lg">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/features" size="lg" variant="outline">
            View features
          </Button>
        </div>
      </div>
    </section>
  );
}
