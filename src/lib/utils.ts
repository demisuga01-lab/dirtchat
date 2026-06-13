import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Supabase public env detection — three states
// ---------------------------------------------------------------------------

const DEMO_PATTERNS = [
  "DEMO_REPLACE",
  "your-supabase",
  "your-project-ref",
  "PASTE_",
  "REPLACE_",
];

/**
 * Three-state result for NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY detection.
 *
 * - `missing` – one or both vars are not set at all.
 * - `demo`    – vars are set but contain obvious placeholder patterns.
 * - `ready`   – vars look real (or at least don't match known placeholders).
 */
export type SupabasePublicConfigState =
  | { status: "missing"; missing: string[] }
  | { status: "demo"; demo: string[] }
  | { status: "ready" };

function looksDemo(value: string): boolean {
  return DEMO_PATTERNS.some((p) => value.includes(p));
}

export function getSupabasePublicConfig(): SupabasePublicConfigState {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const missing: string[] = [];
  if (!rawUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) return { status: "missing", missing };

  const demo: string[] = [];
  if (looksDemo(rawUrl)) demo.push("NEXT_PUBLIC_SUPABASE_URL");
  if (looksDemo(anonKey)) demo.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (demo.length > 0) return { status: "demo", demo };

  return { status: "ready" };
}

/**
 * Legacy helper – returns the same shape as before so existing consumers
 * that only need `url` / `anonKey` / `isConfigured` continue to work.
 *
 * New code should prefer `getSupabasePublicConfig()`.
 */
export function getSupabaseEnv(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  configState: SupabasePublicConfigState;
} {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const configState = getSupabasePublicConfig();

  return {
    url,
    anonKey,
    isConfigured: configState.status === "ready",
    configState,
  };
}
