import { LandingHero } from "@/components/marketing/landing-hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { WhyDirtchatSection } from "@/components/marketing/why-dirtchat-section";
import { CtaBand } from "@/components/marketing/cta-band";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export default function HomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <LandingHero />
        <div id="features">
          <FeatureGrid />
        </div>
        <HowItWorks />
        <WhyDirtchatSection />
        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
