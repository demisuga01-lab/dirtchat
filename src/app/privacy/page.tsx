import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { PrivacyControlsIllustration } from "@/components/marketing/marketing-illustrations";
import { Shield, KeyRound, Globe, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy information for Dirtchat. Learn how your data, provider keys, and conversations are handled.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
          <h1 className="text-4xl font-semibold tracking-tight">
            Privacy in a workspace built around your providers
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: June 2026
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            This page explains how Dirtchat handles your information. It is a
            practical summary, not a formal legal document. It has not been
            reviewed by a legal professional and does not create legal
            obligations beyond applicable law.
          </p>

          {/* Plain-language summary cards */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<Shield className="h-4 w-4" />}
              label="You control providers"
              detail="You decide which providers to connect. Dirtchat does not route traffic through a shared proxy you did not choose."
            />
            <SummaryCard
              icon={<KeyRound className="h-4 w-4" />}
              label="Keys are encrypted"
              detail="API keys are encrypted at rest. They are never displayed after saving and are never shared."
            />
            <SummaryCard
              icon={<Globe className="h-4 w-4" />}
              label="Provider terms apply"
              detail="Prompts are processed by your chosen providers according to their own privacy policies."
            />
            <SummaryCard
              icon={<Trash2 className="h-4 w-4" />}
              label="You can delete data"
              detail="Conversations can be deleted at any time. Provider connections can be removed."
            />
          </div>

          {/* Visual illustration */}
          <div className="mt-16 rounded-2xl border border-border/60 bg-muted/20 p-6">
            <PrivacyControlsIllustration />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Dirtchat gives you control over your keys, providers, and data.
            </p>
          </div>

          {/* Detailed sections */}
          <div className="mt-16 flex flex-col gap-12">
            {/* What information may be stored */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                What information may be stored
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <StorageItem
                  label="Account details"
                  detail="Email address, display name, and authentication credentials. Used to identify your account and secure access."
                />
                <StorageItem
                  label="Workspace content"
                  detail="Conversation threads, prompts you submit, and AI-generated responses. Stored so you can return to your work across sessions."
                />
                <StorageItem
                  label="Provider connection metadata"
                  detail="Provider type, labels you assign, and connection status. Your actual API keys are stored separately in encrypted form and are never retrieved for display."
                />
                <StorageItem
                  label="Model catalog data"
                  detail="Models discovered from your connected providers, along with capability metadata. Stored so you can browse and select models efficiently."
                />
                <StorageItem
                  label="Usage and error metadata"
                  detail="Anonymized, high-level information about requests and errors, used to maintain service quality. Does not include the content of your prompts or responses."
                />
                <StorageItem
                  label="Support information"
                  detail="If you contact us, any information you provide may be stored so we can respond."
                />
              </div>
            </section>

            {/* Provider keys */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                About your provider keys
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                API keys are sensitive credentials. When you add a provider
                key, it is encrypted and stored securely. Once saved, the key
                is never displayed again in the interface — you will only see
                a label or masked reference.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <KeyCard
                  title="Save"
                  detail="Keys are encrypted at rest using strong encryption. They are not stored in plain text."
                />
                <KeyCard
                  title="Rotate"
                  detail="You can update or replace keys at any time. If you suspect a key is compromised, rotate it immediately."
                />
                <KeyCard
                  title="Remove"
                  detail="Removing a provider connection deletes the stored key from your account."
                />
              </div>
              <p className="mt-6 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Important: Treat your API keys like passwords. Dirtchat cannot
                recover a key you delete, and cannot prevent misuse of a key that
                has been exposed outside the service. Rotate keys with your
                provider immediately if you suspect unauthorized access.
              </p>
            </section>

            {/* Third-party providers */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Third-party AI providers
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                When you send a message through Dirtchat, the prompt is routed to
                the AI provider you selected. That provider processes your request
                according to its own terms of service and privacy policy.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Different providers have different data handling practices. Some
                may retain prompts for training or service improvement. Some may
                process data in different jurisdictions. You should review each
                provider&apos;s policies before sending data you consider sensitive
                or confidential.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Dirtchat does not control how third-party providers handle your
                prompts once they leave the workspace. If a provider changes its
                policy, you may need to adjust your use of that provider through
                Dirtchat.
              </p>
            </section>

            {/* User choices */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Choices you can make
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ChoiceCard
                  title="Delete conversations"
                  detail="You can delete individual threads or conversation history at any time. Deleted data is removed and cannot be recovered."
                />
                <ChoiceCard
                  title="Remove providers"
                  detail="When you remove a provider connection, the stored key and associated model catalog data are deleted."
                />
                <ChoiceCard
                  title="Rotate keys"
                  detail="If you suspect a key has been compromised, rotate it with the provider and update it in Dirtchat immediately."
                />
                <ChoiceCard
                  title="Limit sensitive data"
                  detail="Only send sensitive, personal, or confidential data to providers you trust and whose policies you have reviewed."
                />
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Security practices
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Dirtchat implements reasonable technical and organizational
                measures to protect your information:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span>API keys are encrypted at rest using industry-standard encryption.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span>Authentication protects access to your account and workspace.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span>Access to stored data is limited to what is needed for the service to function.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span>Error messages are designed not to expose sensitive internal details.</span>
                </li>
              </ul>
            </section>

            {/* Limitations */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Important limitations
              </h2>
              <div className="mt-6 space-y-4">
                <LimitationCard>
                  AI model outputs can be inaccurate, misleading, biased, or
                  incomplete. Always review AI-generated content before relying
                  on it. Dirtchat makes no guarantee about the correctness,
                  safety, or appropriateness of any model output.
                </LimitationCard>
                <LimitationCard>
                  When you send prompts to a third-party AI provider, that
                  provider processes your data. Their data handling, retention,
                  and use practices are governed by their own terms and policies,
                  not by Dirtchat.
                </LimitationCard>
                <LimitationCard>
                  Dirtchat is not designed for processing legally protected health
                  information, financial account data subject to regulatory
                  requirements, or any data that carries legal retention or
                  protection obligations beyond standard personal data. Do not
                  submit this type of data unless you have independently verified
                  that your setup meets all applicable legal requirements.
                </LimitationCard>
                <LimitationCard>
                  No security system is perfect. While Dirtchat implements
                  reasonable protections, no service can guarantee absolute
                  security against all possible threats.
                </LimitationCard>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Questions about privacy
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                If you have questions or concerns about how your information is
                handled, please open an issue on the Dirtchat repository or
                contact the project maintainers. We will respond as promptly as
                we can.
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
      <h3 className="mt-3 text-sm font-semibold text-foreground">{label}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function StorageItem({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
      <span className="font-medium text-foreground">{label}</span>
      {": "}
      <span>{detail}</span>
    </div>
  );
}

function KeyCard({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function ChoiceCard({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function LimitationCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-5">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
        !
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
