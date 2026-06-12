import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/utils";

/**
 * Browser-side Supabase client.
 * Uses only publishable NEXT_PUBLIC_* env vars. Safe to use in
 * client components.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient(
    url || "https://placeholder.supabase.co",
    anonKey || "placeholder-anon-key"
  );
}
