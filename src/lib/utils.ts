import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Read a public Supabase env var with a safe fallback to placeholder
 * values. Used so the app can build and render even when env is not
 * configured. Pages can detect the placeholder values and show a
 * clear "Supabase environment not configured" message.
 */
export function getSupabaseEnv(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const isPlaceholder =
    !url ||
    !anonKey ||
    url.includes("your-project-ref") ||
    anonKey.includes("your-supabase-anon-key");

  return { url, anonKey, isConfigured: !isPlaceholder };
}
