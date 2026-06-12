# Dirtchat — Prompt 3 Model Discovery + Capability Detection Audit

Audit performed before any code changes. Date: 2026-06-12.

## 1. Repository state

- **Working directory:** `E:\nvidiatest\hosting`
- **Git initialized:** Yes, clean working tree.
- **Current branch:** `main` (tracking `origin/main`)
- **Current commit:** `4541b6d` (Prompt 2 commit, "feat: add provider connection manager") — matches expected.
- **Remote:** `https://github.com/demisuga01-lab/dirtchat.git` (push/pull OK).
- **Untracked files:** none (only `.claude/` and `.mcp.json` which are gitignored).
- **Prompt 2 commit is present:** yes. `provider_connections`, `provider_connection_secrets`, encrypted-secret helpers, and the provider manager are all in place.

## 2. Local tooling

- **Node.js:** v25.6.0
- **npm:** 11.8.0
- **Git:** git 2.54.0.windows.1
- **Package manager:** npm (no `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`)

## 3. Live Supabase state (via MCP)

Inspected with `mcp__supabase__list_tables` (public schema, verbose) and `mcp__supabase__list_migrations`:

- **Tables present:** `public.profiles`, `public.provider_connections`, `public.provider_connection_secrets`.
- **RLS enabled** on all three.
- **Prompt 1 + Prompt 2 migrations applied** as `prompt_1_initial_profiles` and `prompt_2_provider_connections`.
- **No `provider_models`, `model_capabilities`, `model_discovery_runs`, or `model_discovery_events` tables** — these need to be created in Prompt 3.
- **`provider_connection_secrets` still has no authenticated SELECT policy** (verified by inspecting policies via `execute_sql` in Prompt 2; will re-verify before/after Prompt 3).

## 4. Prompt 2 surface to extend

Files re-read (or referenced from in-memory copies in earlier turns):

- `src/lib/providers/types.ts` — `ProviderConnection`, `ProviderWithSecretMeta`, `PRESETS`, `ProviderType`, `ProviderProtocol`, `ProviderStatus`.
- `src/lib/providers/provider-service.ts` — `listProviders`, `getProvider`, `createProvider`, `updateProvider`, `deleteProvider`, `setSecret`, `testConnection`, `setSecretInternal`, `readDecryptedSecret`, `runOpenAICompatibleProbe`. Uses `createAdminClient` (service-role) for the secrets table; uses the user-scoped `createUserClient` for everything else.
- `src/lib/providers/url-normalize.ts` — already normalizes OpenAI-compatible URLs (returns `apiRootUrl`, `chatCompletionsUrl`, `modelsUrl`). To be re-used by the discovery probe.
- `src/lib/security/provider-crypto.ts` — `encryptSecret`, `decryptSecret`, `secretLast4`, `secretHash`. `import "server-only"`.
- `src/lib/security/redact.ts` — `redact()`, `safeErrorMessage()`. Used to scrub Bearer tokens, `sk-…`, JWT shapes, and `key|secret|token|password|service[_-]?role` field/value pairs.
- `src/lib/env/server.ts` — `getServerEnv`, `requireServiceRole`, `requireProviderKeyEncryptionKey`, `ServerConfigError`.
- `src/lib/supabase/admin.ts` — service-role client singleton.
- `src/lib/supabase/server.ts` — user-scoped SSR client (used for RLS-respecting reads).
- `src/app/(app)/settings/providers/actions.ts` — server actions: `listProvidersAction`, `createProviderAction`, `updateProviderAction`, `deleteProviderAction`, `setProviderSecretAction`, `testProviderConnectionAction`. To be extended with model-related actions.
- `src/app/api/providers/[id]/test/route.ts` — existing POST route handler. New model routes will follow the same pattern.
- `src/components/providers/provider-manager.tsx` — provider CRUD UI; will gain a "Models" link per row.
- `src/app/(app)/settings/page.tsx` — settings hub; will be updated to point at the model catalog.
- `src/components/app/sidebar.tsx` — already includes `/settings/providers`. No sidebar change strictly required.
- `src/app/(app)/layout.tsx` — protected layout; already redirects unauthenticated users.
- `README.md`, `.env.example` — to be updated.

## 5. Local migrations on disk

- `supabase/migrations/20260612000100_initial_profiles.sql` (applied)
- `supabase/migrations/20260612000200_provider_connections.sql` (applied)
- New: `supabase/migrations/20260612000300_model_discovery.sql` (to be created and applied via MCP).

## 6. Risks

1. **Decryption of provider API keys happens server-side** during discovery. The decrypted key must never appear in any UI render, API response, JSON column, log, or discovery event.
2. **MCP must remain available.** If MCP is disconnected, the schema for model discovery cannot be applied, and the prompt must stop and report — not silently fall back.
3. **Capability inference must be conservative.** `null` (unknown) is preferred over `false`. Show "Unknown" rather than false-negative badges.
4. **TokenRouter may not expose `/v1/models`.** Discovery must not fail the whole provider in that case; fall back to a single-token chat-completions ping against the default model.
5. **OpenRouter rich metadata is heterogeneous** — only infer capabilities from fields that are actually present.
6. **Manual model entries** are essential, since many routers hide model listing. Must be clearly marked and user-owned.
7. **Default model enforcement** at the database level via a partial unique index (`is_default_for_provider = true` → one per `(user_id, provider_connection_id)`).
8. **No destructive SQL** — only `create … if not exists` / `drop … if exists`.
9. **No authenticated SELECT on the secrets table** — must not be weakened.
10. **Provider keys remain in `provider_connection_secrets`** — discovery code uses the same admin client + decryptSecret path as Prompt 2.

## 7. Implementation plan

Order:

1. Write the audit file (this file).
2. Create `supabase/migrations/20260612000300_model_discovery.sql`:
   - `public.provider_models` (user-owned, FK to `provider_connections`, `unique(user_id, provider_connection_id, provider_model_id)`, partial unique index for one-default-per-provider).
   - `public.model_capabilities` (1:1 with `provider_models`, nullable booleans + confidence + source + safe evidence JSON).
   - `public.model_discovery_runs` (one row per refresh).
   - `public.model_discovery_events` (safe events/errors, no secrets).
   - Reuse the existing `public.set_updated_at()` trigger function.
   - RLS on all four tables, user-owned SELECT/INSERT/UPDATE/DELETE policies, no anonymous access.
3. Read the migration back from disk, scan for destructive terms (`drop table`, `truncate`, `disable row level security`, `delete from auth.users`), confirm non-destructive, then apply via `mcp__supabase__apply_migration`.
4. Verify via MCP: `list_tables`, `execute_sql` against `pg_policies`, `pg_indexes` for the new tables.
5. Re-verify that `provider_connection_secrets` still has no authenticated SELECT policy.
6. Create server-only model discovery modules:
   - `src/lib/models/types.ts` — shared types, capability flag set, status enums.
   - `src/lib/models/model-normalize.ts` — parse OpenAI / OpenRouter / generic array shapes safely. Cap model count and metadata size.
   - `src/lib/models/capability-inference.ts` — conservative capability mapping. Uses null for unknown; produces a confidence + source.
   - `src/lib/models/model-discovery-service.ts` — orchestrates URL normalization, secret decryption, OpenAI-compatible probe, OpenRouter metadata parsing, fallback chat-completions ping, upsert models, upsert capabilities, write run + events. Reuses Prompt 2's `readDecryptedSecret` style.
7. Server actions and route handlers:
   - `src/app/(app)/settings/providers/[id]/models/actions.ts` — `listModelsForProviderAction`, `refreshProviderModelsAction`, `addManualProviderModelAction`, `setProviderDefaultModelAction`, `deleteManualProviderModelAction`. All zod-validated, ownership-checked.
   - `src/app/api/providers/[id]/models/route.ts` — `GET` (list), `POST` (manual add). Safe response.
   - `src/app/api/providers/[id]/models/refresh/route.ts` — `POST`. Returns a safe, redacted summary.
   - `src/app/api/providers/[id]/models/[modelId]/default/route.ts` — `POST`. Sets default.
8. UI:
   - `src/components/models/model-catalog.tsx` — client component, lists models with capability badges, supports manual add and set-default.
   - `src/components/models/model-card.tsx` — single-model card.
   - `src/components/models/model-capability-badges.tsx` — true-only / unknown / manual badges.
   - `src/components/models/model-discovery-panel.tsx` — refresh button, last-run summary, error display.
   - `src/app/(app)/settings/providers/[id]/models/page.tsx` — protected server-rendered page that loads the model list and the provider connection.
   - `src/components/providers/provider-manager.tsx` — add a "Models" button per row.
   - `src/app/(app)/settings/page.tsx` — link to "Provider models" instead of just "Manage providers".
9. Documentation:
   - `README.md` — add a "Model discovery (Prompt 3)" section explaining TokenRouter / OpenRouter / generic / Anthropic-not-implemented behavior, manual model addition, default selection, and the new Supabase tables.
   - `.env.example` — add optional `MODEL_DISCOVERY_TIMEOUT_MS` and `MODEL_DISCOVERY_MAX_MODELS_PER_RUN` placeholders.
   - `audits/prompt-3-model-discovery-audit.md` — this file.
10. Validation:
    - `npm run lint`
    - `npm run build`
    - `git diff --check`
    - Secret-shaped diff scan.
    - Re-verify RLS on every new table.
11. Commit and push.

## 8. Out of scope for Prompt 3

- Real chat streaming.
- File/image upload.
- Conversation persistence (only per-row display).
- Reasoning controls.
- Usage logging, quotas, billing.
- Production deployment.
- Anthropic-compatible discovery (returned as "not implemented" — manual model add still works).

## 9. Supabase MCP

- Connected to `project_ref=dilfbodsntbnewrlluia`.
- Pre-apply: `list_tables` (public), `list_migrations` confirmed.
- Will be used for: `apply_migration`, `list_tables` (post-apply), `execute_sql` for `pg_policies` and `pg_indexes`.
- No destructive operations.
