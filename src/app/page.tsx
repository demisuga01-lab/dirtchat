import { LandingHero } from "@/components/marketing/landing-hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <LandingHero />
        <div id="features">
          <FeatureGrid />
        </div>
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to set up your workspace?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">
              Create an account to lock in your settings, then connect your
              own providers from a single dashboard.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/sign-up" size="lg">
                Create your account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/dashboard" size="lg" variant="outline">
                Open dashboard
              </Button>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
