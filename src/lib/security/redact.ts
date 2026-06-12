// src/lib/security/redact.ts
//
// Redact secret-shaped substrings from any string before logging,
// rendering, or returning to a client. Intentionally conservative: better
// to over-redact than to leak.

const REDACTED = "[REDACTED]";

const BEARER_RE = /Bearer\s+[A-Za-z0-9_\-\.=]+/gi;
const SK_RE = /sk-[A-Za-z0-9_\-]{16,}/g;
const JWT_RE = /eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g;
// Provider API key patterns
const API_KEY_FIELD_RE = /(api[_-]?key|apikey|secret|token|password|service[_-]?role)\s*[:=]\s*["']?[^\s"',}]+/gi;
// Common JSON-y secrets
const QUOTED_SECRET_RE = /"(api[_-]?key|apikey|secret|token|password)"\s*:\s*"[^"]*"/gi;

export function redact(input: unknown): string {
  if (input == null) return "";
  let s: string;
  if (typeof input === "string") s = input;
  else {
    try {
      s = JSON.stringify(input);
    } catch {
      s = String(input);
    }
  }
  s = s.replace(BEARER_RE, `Bearer ${REDACTED}`);
  s = s.replace(SK_RE, REDACTED);
  s = s.replace(JWT_RE, REDACTED);
  s = s.replace(API_KEY_FIELD_RE, (m) => m.split(/[:=]/)[0] + ": " + REDACTED);
  s = s.replace(QUOTED_SECRET_RE, (m) => m.split(":")[0] + `: "${REDACTED}"`);
  return s;
}

export function safeErrorMessage(err: unknown): string {
  return redact(err instanceof Error ? err.message : String(err));
}
