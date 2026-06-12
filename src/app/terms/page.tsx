import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { TermsResponsibilityIllustration } from "@/components/marketing/marketing-illustrations";
import { User, ShieldCheck, AlertTriangle, FileWarning } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms of service for Dirtchat. Please read these terms before using the service.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
          <h1 className="text-4xl font-semibold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 2026
          </p>
          <p className="mt-4 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
            These terms are a practical placeholder and have not been reviewed
            by a legal professional. They are provided to help you understand
            expectations, not to create binding legal obligations beyond what
            applicable law requires. Use the service at your own risk.
          </p>

          {/* Plain-language summary */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<User className="h-4 w-4" />}
              label="Your account"
              detail="You are responsible for your account, credentials, and activity."
            />
            <SummaryCard
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Provider keys"
              detail="You provide and manage your own API keys. Third-party provider terms also apply."
            />
            <SummaryCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="AI output"
              detail="Model outputs may be inaccurate. Review everything before relying on it."
            />
            <SummaryCard
              icon={<FileWarning className="h-4 w-4" />}
              label="No warranty"
              detail="The service is provided as-is without warranties of any kind."
            />
          </div>

          {/* Responsibility diagram */}
          <div className="mt-16 rounded-2xl border border-border/60 bg-muted/20 p-6">
            <TermsResponsibilityIllustration />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              You, Dirtchat, and providers each have responsibilities.
            </p>
          </div>

          {/* Detailed sections */}
          <div className="mt-16 flex flex-col gap-12">
            {/* Account responsibility */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Account responsibility
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activity that occurs under your
                account. You agree to provide accurate and complete information
                when creating an account and to keep that information up to date.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                If you believe your account has been compromised, you should take
                immediate steps to secure it, including changing your password
                and rotating any connected provider API keys.
              </p>
            </section>

            {/* Provider responsibility */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Provider connections and API keys
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                You are responsible for the provider connections you configure
                and the API keys you provide. You should safeguard your keys
                and treat them as sensitive credentials. Dirtchat encrypts
                stored keys but cannot prevent misuse of a key that is exposed
                outside the service.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <ProviderCard
                  title="Your responsibility"
                  items={[
                    "Provide and manage your own API keys",
                    "Rotate keys if compromised",
                    "Review provider terms and policies",
                    "Monitor your provider usage and billing",
                  ]}
                />
                <ProviderCard
                  title="Provider responsibility"
                  items={[
                    "Process prompts per their terms",
                    "Handle data according to their privacy policy",
                    "Apply rate limits and usage restrictions",
                    "May change models, pricing, or availability",
                  ]}
                />
                <ProviderCard
                  title="Dirtchat responsibility"
                  items={[
                    "Encrypt stored keys at rest",
                    "Route requests to your selected provider",
                    "Save conversations in your workspace",
                    "Surface provider errors clearly",
                  ]}
                />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Revoking or removing a provider key may interrupt your ability to
                use models from that provider in your workspace. Your conversation
                history remains, but new messages through that provider will fail.
              </p>
            </section>

            {/* Acceptable use */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Acceptable use
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                You agree to use Dirtchat in compliance with all applicable laws
                and regulations. You must not use the service:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>For any illegal activity or to facilitate harm to others.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>To send spam, malware, or engage in unauthorized automation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>To attempt unauthorized access to systems, accounts, or data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>In violation of any third-party provider&apos;s acceptable use policy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>To generate content that is illegal, defamatory, harassing, or that infringes on the rights of others.</span>
                </li>
              </ul>
            </section>

            {/* AI output */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                AI-generated output
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                AI models can produce inaccurate, misleading, biased, or
                harmful output. They can generate content that appears
                authoritative but is factually wrong. They can produce output
                that is inconsistent, outdated, or inappropriate for your
                intended use.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                You are responsible for reviewing and verifying any AI-generated
                content before relying on it. Dirtchat does not provide
                professional advice of any kind — legal, medical, financial,
                technical, or otherwise. AI outputs should not be treated as
                professional guidance.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                You are also responsible for ensuring that your use of AI outputs
                does not infringe on the intellectual property rights of others.
                Different providers have different policies regarding the
                ownership and use of generated outputs.
              </p>
            </section>

            {/* Data and content */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Your data and content
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                You retain responsibility for the content you submit through
                Dirtchat, including prompts, files, and any other data. You are
                responsible for ensuring you have the necessary rights and
                permissions to submit the content you provide.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Dirtchat stores your conversations as part of providing the
                workspace service. You can delete your conversations and remove
                your provider connections. Deleted data is removed and cannot be
                recovered.
              </p>
            </section>

            {/* Availability */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Service availability
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Dirtchat is provided on an as-available basis. The service, or
                specific features, may be unavailable at times due to
                maintenance, updates, or circumstances beyond our control.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Third-party AI providers may also experience outages, rate
                limits, model deprecations, or policy changes that affect your
                ability to use them through Dirtchat. These are outside of
                Dirtchat&apos;s control.
              </p>
            </section>

            {/* No warranty */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Disclaimer of warranties
              </h2>
              <div className="mt-4 rounded-xl border border-border bg-card p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The service is provided &ldquo;as is&rdquo; and &ldquo;as
                  available&rdquo; without any warranty, express or implied.
                  To the fullest extent permitted by law, the maintainers
                  disclaim all warranties, including without limitation
                  warranties of merchantability, fitness for a particular
                  purpose, non-infringement, and any warranties arising from
                  course of dealing or usage of trade.
                </p>
              </div>
            </section>

            {/* Limitation of liability */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Limitation of liability
              </h2>
              <div className="mt-4 rounded-xl border border-border bg-card p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  To the fullest extent permitted by law, in no event shall the
                  maintainers of Dirtchat be liable for any indirect, incidental,
                  special, consequential, or punitive damages, including without
                  limitation loss of profits, data, use, or goodwill, arising out
                  of or in connection with your use or inability to use the
                  service, whether based on warranty, contract, tort, or any
                  other legal theory.
                </p>
              </div>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Changes to these terms
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                These terms may be updated from time to time. When material
                changes are made, we will update the date at the top of this
                page. Your continued use of Dirtchat after changes are posted
                constitutes your acceptance of the updated terms. If you do
                not agree with the updated terms, you should stop using the
                service.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Questions about these terms
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                If you have questions or concerns about these terms, please
                open an issue on the Dirtchat repository or contact the project
                maintainers.
              </p>
            </section>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-foreground">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{label}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function ProviderCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-primary/50" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
