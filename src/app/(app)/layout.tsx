import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";
import { AppShell } from "@/components/app/app-shell";
import { SetupNotice } from "@/components/app/setup-notice";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col gap-4 px-4 py-12">
        <SetupNotice
          title="Supabase is not configured"
          description="This area is protected. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local, then restart the dev server."
        />
        {children}
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/sign-in");
  }

  const userLabel = data.user.email ?? data.user.user_metadata?.display_name ?? undefined;

  return (
    <AppShell
      title="Dirtchat"
      userLabel={userLabel}
      userEmail={data.user.email}
    >
      {children}
    </AppShell>
  );
}
