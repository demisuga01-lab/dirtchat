# Runtime / Supabase / Storage Integration Audit

## Current State

| Check | Status |
|---|---|
| **Branch** | `main` |
| **Commit** | `7d198aa` |
| **Remote** | `origin https://github.com/demisuga01-lab/dirtchat.git` |
| **Uncommitted** | None (clean working tree) |
| **Untracked** | `.commandcode/taste/taste.md` (unrelated) |
| **`.gitignore`** | Already ignores `.env`, `.env*.local`, `.env.production`, `.env.development` |
| **`.env.local` tracked?** | No |
| **`.env.local` exists?** | Yes |

## Environment Variables (names only — values never printed)

| Variable | Status |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Present |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Present |
| `SUPABASE_SERVICE_ROLE_KEY` | Present |
| `PROVIDER_KEY_ENCRYPTION_KEY` | Present |
| Optional tuning vars (CHAT_*/MODEL_*) | Missing from `.env.local` |

## Supabase MCP Status

| Check | Status |
|---|---|
| **MCP connected** | Yes |
| **Project-authorized** | Yes |
| **MCP tools used** | `get_project_url`, `get_publishable_keys`, `list_migrations`, `list_tables`, `execute_sql`, `apply_migration` |
| **Permission errors** | None |

## Database Status

| Table | Exists | RLS | Policies |
|---|---|---|---|
| `profiles` | Yes | Yes | user-owned SELECT/INSERT/UPDATE |
| `provider_connections` | Yes | Yes | user-owned SELECT/INSERT/UPDATE/DELETE |
| `provider_connection_secrets` | Yes | Yes | INSERT/UPDATE/DELETE only (no SELECT) |
| `provider_models` | Yes | Yes | user-owned SELECT/INSERT/UPDATE/DELETE |
| `model_capabilities` | Yes | Yes | user-owned SELECT/INSERT/UPDATE/DELETE |
| `model_discovery_runs` | Yes | Yes | user-owned SELECT/INSERT/UPDATE/DELETE |
| `model_discovery_events` | Yes | Yes | user-owned SELECT/INSERT/UPDATE/DELETE |
| `chat_threads` | Yes | Yes | user-owned SELECT/INSERT/UPDATE/DELETE |
| `chat_messages` | Yes | Yes | user-owned SELECT/INSERT/UPDATE/DELETE |
| `chat_generation_runs` | Yes | Yes | user-owned SELECT/INSERT/UPDATE/DELETE |

**Migrations applied (4 of 5):**
- `20260612005846` — initial_profiles
- `20260612005939` — provider_connections
- `20260612013209` — model_discovery
- `20260612113545` — chat_backend

**Missing migration (now applied):**
- `20260612000500` — storage_buckets (applied via MCP during this prompt)

**Indexes:** All expected indexes present, including unique partial index on `provider_models_one_default_per_provider_uniq`.

## Storage Status

| Bucket | Public | Size Limit | Policies |
|---|---|---|---|
| `chat-attachments` | No (private) | 50 MB | user-owned SELECT/INSERT/UPDATE/DELETE |
| `temp-uploads` | No (private) | 100 MB | user-owned SELECT/INSERT/UPDATE/DELETE |
| `avatars` | Yes (public-read) | 5 MB | public SELECT, user-owned INSERT/UPDATE/DELETE |

All storage policies use `auth.uid()::text = (storage.foldername(name))[1]` for user-scoped access. No anonymous writes.

## Code Paths Requiring Runtime Env Values

| File | Env Used | Behavior When Missing |
|---|---|---|
| `src/lib/env/server.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PROVIDER_KEY_ENCRYPTION_KEY` | Returns `configured: false` flags; `requireServiceRole()` / `requireProviderKeyEncryptionKey()` throw `ServerConfigError` |
| `src/lib/utils.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Returns `isConfigured: false` |
| `src/lib/supabase/client.ts` | URL + anon key | Falls back to placeholder URL |
| `src/lib/supabase/server.ts` | URL + anon key | Falls back to placeholder URL |
| `src/lib/supabase/admin.ts` | URL + service-role key | Throws error if missing |
| `src/lib/security/provider-crypto.ts` | `PROVIDER_KEY_ENCRYPTION_KEY` | Throws `ServerConfigError` |
| `src/lib/providers/provider-service.ts` | Service-role key, encryption key | Returns `ok: false` with config error code |
| `src/lib/chat/chat-service.ts` | Service-role key (for decrypt) | Throws error |
| `src/lib/models/model-discovery-service.ts` | `MODEL_DISCOVERY_TIMEOUT_MS` | Defaults to 10000 |
| `src/lib/chat/provider-chat.ts` | None directly | N/A |

All code paths handle missing config gracefully by returning `configured: false` flags or throwing safe errors. No crashes during build.

## Implementation Plan

1. ✅ Audit complete
2. ✅ Apply storage buckets migration (done)
3. [ ] Add optional tuning vars to `.env.local`
4. [ ] Create `src/lib/storage/constants.ts`
5. [ ] Create `src/lib/storage/path.ts`
6. [ ] Add `GET /api/health/runtime` endpoint
7. [ ] Build validation
8. [ ] Secret scan

## Risks

- `.env.local` already exists with 4 required vars — no risk of overwriting if we preserve them
- Storage migration already applied — no risk
- `.gitignore` already ignores `.env.local` — no risk of commit

## Values Required From User

None — all required values are already present in `.env.local`. Optional tuning vars will use defaults.
