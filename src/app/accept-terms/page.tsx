import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/utils";
import { DirtchatLogo } from "@/components/brand/dirtchat-logo";
import { AcceptTermsForm } from "./accept-terms-form";

export const metadata = {
  title: "Accept terms",
};

export default async function AcceptTermsPage() {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    redirect("/sign-in");
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/sign-in");
  }

  // Get active legal docs and existing acceptances
  const admin = createAdminClient();

  const [{ data: activeDocs }, { data: acceptances }] = await Promise.all([
    admin
      .from("legal_documents")
      .select("id, document_type, version, title, content, published_at")
      .eq("is_active", true)
      .order("document_type"),
    admin
      .from("user_legal_acceptances")
      .select("legal_document_id")
      .eq("user_id", userData.user.id),
  ]);

  const acceptedIds = new Set((acceptances ?? []).map((a: { legal_document_id: string }) => a.legal_document_id));
  const pendingDocs = (activeDocs ?? []).filter(
    (d: { id: string }) => !acceptedIds.has(d.id)
  );

  // If all accepted, redirect to dashboard
  if (pendingDocs.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 py-12">
      {/* Subtle clean background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,hsl(var(--success)/0.03),transparent_70%)]"
      />

      <div className="mb-4 flex items-center justify-between">
        <DirtchatLogo size="sm" showWordmark />
        <form action="/api/auth/sign-out" method="POST">
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Accept terms to continue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ve updated our legal documents. Please review and accept them to continue
          using Dirtchat.
        </p>
      </div>

      <AcceptTermsForm pendingDocs={pendingDocs} />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Having trouble?{" "}
        <Link href="/sign-in" className="underline underline-offset-4">
          Go back to sign in
        </Link>
      </p>
    </div>
  );
}
