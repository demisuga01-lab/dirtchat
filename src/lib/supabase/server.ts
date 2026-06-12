import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/utils";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Server-side Supabase client.
 * Reads/writes session cookies through Next.js `cookies()`.
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(
    url || "https://placeholder.supabase.co",
    anonKey || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `set` was called from a Server Component. This is a no-op
            // when middleware refreshes sessions; safe to ignore here.
          }
        },
      },
    }
  );
}
