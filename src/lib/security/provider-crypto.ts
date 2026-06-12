// src/lib/security/provider-crypto.ts
//
// Server-only encryption helpers for provider API keys.
//
// Algorithm: AES-256-GCM.
// Key source: PROVIDER_KEY_ENCRYPTION_KEY env var, expected to be a
// base64-encoded 32-byte (256-bit) key.
//
// Stored payload shape (versioned JSON string):
//   { v: 1, alg: "AES-256-GCM", iv: "<base64>", tag: "<base64>", ct: "<base64>" }
//
// Public helpers:
//   encryptSecret(plaintext) -> string
//   decryptSecret(payload)   -> string
//   secretLast4(plaintext)    -> string
//   secretHash(plaintext, pepper?) -> hex string
//
// IMPORTANT: This module imports "server-only" so it can never be bundled
// into a client component.

import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { requireProviderKeyEncryptionKey } from "@/lib/env/server";

const ALGO = "aes-256-gcm";
const VERSION = 1 as const;

type PayloadV1 = {
  v: 1;
  alg: typeof ALGO;
  iv: string;
  tag: string;
  ct: string;
};

function decodeKey(base64Key: string): Buffer {
  const buf = Buffer.from(base64Key, "base64");
  if (buf.length !== 32) {
    throw new Error(
      "PROVIDER_KEY_ENCRYPTION_KEY must be a base64-encoded 32-byte key."
    );
  }
  return buf;
}

function decodePayload(payload: string): PayloadV1 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("Encrypted payload is not valid JSON.");
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as PayloadV1).v !== VERSION ||
    (parsed as PayloadV1).alg !== ALGO
  ) {
    throw new Error("Encrypted payload has unsupported version or algorithm.");
  }
  const { iv, tag, ct } = parsed as PayloadV1;
  if (typeof iv !== "string" || typeof tag !== "string" || typeof ct !== "string") {
    throw new Error("Encrypted payload is malformed.");
  }
  return parsed as PayloadV1;
}

export function encryptSecret(plaintext: string): string {
  if (typeof plaintext !== "string" || plaintext.length === 0) {
    throw new Error("Cannot encrypt an empty secret.");
  }
  const key = decodeKey(requireProviderKeyEncryptionKey());
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const ctParts: Buffer[] = [];
  ctParts.push(cipher.update(plaintext, "utf8"));
  ctParts.push(cipher.final());
  const tag = cipher.getAuthTag();
  const payload: PayloadV1 = {
    v: VERSION,
    alg: ALGO,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ct: Buffer.concat(ctParts).toString("base64"),
  };
  return JSON.stringify(payload);
}

export function decryptSecret(payload: string): string {
  if (typeof payload !== "string" || payload.length === 0) {
    throw new Error("Cannot decrypt an empty payload.");
  }
  const key = decodeKey(requireProviderKeyEncryptionKey());
  const { iv, tag, ct } = decodePayload(payload);
  const decipher = createDecipheriv(ALGO, key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  const parts: Buffer[] = [];
  parts.push(decipher.update(Buffer.from(ct, "base64")));
  parts.push(decipher.final());
  return Buffer.concat(parts).toString("utf8");
}

export function secretLast4(plaintext: string): string {
  if (typeof plaintext !== "string" || plaintext.length === 0) return "";
  return plaintext.slice(-4);
}

export function secretHash(plaintext: string, pepper?: string): string {
  if (typeof plaintext !== "string" || plaintext.length === 0) return "";
  const h = createHash("sha256");
  h.update(pepper ?? "");
  h.update(plaintext);
  return h.digest("hex");
}
