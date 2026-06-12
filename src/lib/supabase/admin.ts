// src/lib/supabase/admin.ts
//
// Server-only Supabase client that uses the service-role key. This client
// bypasses Row Level Security and must NEVER be imported from a client
// component or any code that may be bundled into the browser.

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, requireServiceRole } from "@/lib/env/server";

let cached: SupabaseClient | null = null;

/**
 * Return a singleton Supabase client that uses the service-role key.
 * Throws a safe error if the key is not configured.
 */
export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  const { supabaseUrl } = getServerEnv();
  if (!supabaseUrl) {
    throw new Error(
      "Supabase URL is not configured. Add NEXT_PUBLIC_SUPABASE_URL to your environment."
    );
  }
  const key = requireServiceRole();
  cached = createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}
