import { createClient } from "@/lib/supabase/server";
import { SettingsCenter } from "@/components/settings/settings-center";

export const metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const userData = {
    email: user?.email,
    displayName: (user?.user_metadata?.display_name as string) ?? user?.email?.split("@")[0],
    createdAt: user?.created_at,
    providersCount: 0,
    modelsCount: 0,
  };

  // Load counts and prefs in parallel
  if (user) {
    const userId = user.id;
    const [
      { count: providersCount },
      { count: modelsCount },
      { data: prefs },
    ] = await Promise.all([
      supabase.from("provider_connections").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("provider_models").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_available", true),
      supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    userData.providersCount = providersCount ?? 0;
    userData.modelsCount = modelsCount ?? 0;

    return (
      <SettingsCenter
        user={userData}
        initialPrefs={prefs as Record<string, unknown> | null}
      />
    );
  }

  return (
    <SettingsCenter user={userData} initialPrefs={null} />
  );
}
