// src/lib/env/server.ts
//
// Server-only environment variable reader. NEVER import this file from a
// client component or any code that may be bundled into the browser.
//
// Use `getSupabaseEnv()` from `@/lib/utils` for the public Supabase values
// that are safe to expose to the browser (NEXT_PUBLIC_*).

import "server-only";

type ServerEnv = {
  // Public Supabase values (also exposed to the browser; included here for
  // convenience for server-side callers).
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseIsConfigured: boolean;

  // Server-only.
  supabaseServiceRoleKey: string;
  supabaseServiceRoleConfigured: boolean;

  // 32-byte base64 AES key used to encrypt provider secrets.
  providerKeyEncryptionKey: string;
  providerKeyEncryptionKeyConfigured: boolean;
};

const PLACEHOLDER_TOKENS = [
  "your-project-ref",
  "your-supabase-anon-key",
  "your-supabase-service-role-key",
  "base64-encoded-32-byte-key",
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_TOKENS.some((p) => lower.includes(p));
}

function readSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function readSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

function readSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

function readProviderKeyEncryptionKey(): string {
  return process.env.PROVIDER_KEY_ENCRYPTION_KEY ?? "";
}

/**
 * Read all relevant server-side environment variables. Safe to call
 * repeatedly; the implementation is intentionally synchronous and
 * side-effect free.
 *
 * `configured` flags are true only when the value is set AND does not
 * contain a placeholder token. This lets the rest of the app show a
 * helpful "not configured" state in development without crashing.
 */
export function getServerEnv(): ServerEnv {
  const supabaseUrl = readSupabaseUrl();
  const supabaseAnonKey = readSupabaseAnonKey();
  const supabaseServiceRoleKey = readSupabaseServiceRoleKey();
  const providerKeyEncryptionKey = readProviderKeyEncryptionKey();

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseIsConfigured:
      !!supabaseUrl &&
      !!supabaseAnonKey &&
      !isPlaceholder(supabaseUrl) &&
      !isPlaceholder(supabaseAnonKey),

    supabaseServiceRoleKey,
    supabaseServiceRoleConfigured:
      !!supabaseServiceRoleKey && !isPlaceholder(supabaseServiceRoleKey),

    providerKeyEncryptionKey,
    providerKeyEncryptionKeyConfigured:
      !!providerKeyEncryptionKey && !isPlaceholder(providerKeyEncryptionKey),
  };
}

/**
 * Throws a safe, redacted error if the Supabase service-role key is
 * missing. Use this in server-only modules that need privileged Supabase
 * access. The error message does NOT include the missing value.
 */
export function requireServiceRole(): string {
  const { supabaseServiceRoleKey, supabaseServiceRoleConfigured } =
    getServerEnv();
  if (!supabaseServiceRoleConfigured) {
    throw new ServerConfigError(
      "Supabase service role is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your server environment."
    );
  }
  return supabaseServiceRoleKey;
}

/**
 * Throws a safe, redacted error if the provider-key encryption key is
 * missing. The error message does NOT include the missing value.
 */
export function requireProviderKeyEncryptionKey(): string {
  const { providerKeyEncryptionKey, providerKeyEncryptionKeyConfigured } =
    getServerEnv();
  if (!providerKeyEncryptionKeyConfigured) {
    throw new ServerConfigError(
      "Provider-key encryption is not configured. Add PROVIDER_KEY_ENCRYPTION_KEY (base64 32-byte key) to your server environment."
    );
  }
  return providerKeyEncryptionKey;
}

export class ServerConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerConfigError";
  }
}
