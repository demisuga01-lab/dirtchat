# Dirtchat — Prompt 4 Chat Backend + Streaming Audit

Audit performed before any code changes. Date: 2026-06-12.

## 1. Repository state

- **Working directory:** `E:\nvidiatest\hosting`
- **Current branch:** `main` (tracking `origin/main`)
- **Current commit:** `a269e8f` (Prompt 3 commit, "feat: add model discovery catalog")
- **Remote:** `https://github.com/demisuga01-lab/dirtchat.git` (push/pull OK)
- **Untracked files:** `.agents/`, `opencode.json`, `skills-lock.json` (all local agent config, gitignored patterns)
- **Staged changes:** None
- **Unstaged changes:** None
- **Prompt 1/2/3 commits present:** Yes — `52e3a8a` (scaffold), `4541b6d` (provider manager), `a269e8f` (model discovery)

## 2. Local tooling

- **Node.js:** v25.6.0
- **npm:** 11.8.0
- **Git:** git 2.54.0.windows.1
- **Package manager:** npm (no `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`)

## 3. Live Supabase state (via MCP)

Inspected with `supabase_list_tables` (public schema, verbose), `supabase_execute_sql` (pg_policies, pg_indexes), and `supabase_list_migrations`.

### Tables present (all RLS enabled):

| Table | RLS | Notes |
|---|---|---|
| `public.profiles` | Yes | Prompt 1 — profiles, handle_new_user trigger |
| `public.provider_connections` | Yes | Prompt 2 — provider metadata |
| `public.provider_connection_secrets` | Yes | Prompt 2 — encrypted secrets, NO authenticated SELECT |
| `public.provider_models` | Yes | Prompt 3 — discovered/manual models |
| `public.model_capabilities` | Yes | Prompt 3 — capability rows |
| `public.model_discovery_runs` | Yes | Prompt 3 — discovery audit |
| `public.model_discovery_events` | Yes | Prompt 3 — discovery events |

### Missing (need to be created in Prompt 4):
- `public.chat_threads`
- `public.chat_messages`
- `public.chat_generation_runs`

### provider_connection_secrets SELECT policy status:
**Confirmed: No authenticated SELECT policy exists.** Only INSERT/UPDATE/DELETE policies for authenticated users. All secret reads happen through service-role admin client.

### Existing functions:
- `public.set_updated_at()` — reusable trigger function from Prompt 1
- `public.handle_new_user()` — auth trigger

## 4. Prompt 1/2/3 structure

### Provider manager (Prompt 2):
- `src/lib/providers/types.ts` — ProviderConnection, ProviderSecretMeta, PRESETS, ProviderType, ProviderProtocol
- `src/lib/providers/url-normalize.ts` — URL normalizer for OpenAI-compatible
- `src/lib/providers/provider-service.ts` — CRUD, secret management, test connection
- `src/lib/security/provider-crypto.ts` — AES-256-GCM encrypt/decrypt
- `src/lib/security/redact.ts` — secret redaction
- `src/lib/env/server.ts` — server-only env reader, getServerEnv, requireServiceRole, requireProviderKeyEncryptionKey
- `src/lib/supabase/admin.ts` — service-role admin client singleton
- `src/components/providers/provider-manager.tsx` — CRUD UI

### Model discovery (Prompt 3):
- `src/lib/models/types.ts` — ProviderModel, ModelCapabilities, DiscoveryResult
- `src/lib/models/model-normalize.ts` — parse provider model lists
- `src/lib/models/capability-inference.ts` — conservative capability inference
- `src/lib/models/model-discovery-service.ts` — orchestrator, probes, upsert
- `src/components/models/model-catalog.tsx` — model catalog UI
- `src/components/models/model-card.tsx` — single model card
- `src/components/models/model-capability-badges.tsx` — capability badges
- `src/components/models/model-discovery-panel.tsx` — refresh panel

### Chat placeholder state (Prompt 1, needs replacement):
- `src/components/chat/chat-placeholder.tsx` — static placeholder with disabled send
- `src/components/chat/conversation-sidebar.tsx` — static placeholder sidebar
- `src/app/(app)/chat/page.tsx` — renders ConversationSidebar + ChatPlaceholder

## 5. Existing migrations

- `supabase/migrations/20260612000100_initial_profiles.sql` (applied)
- `supabase/migrations/20260612000200_provider_connections.sql` (applied)
- `supabase/migrations/20260612000300_model_discovery.sql` (applied)

## 6. Files read before editing

Audit phase inspected:
- `README.md`, `.env.example`, `package.json`, `next.config.mjs`, `tsconfig.json`
- `audits/prompt-1-*`, `audits/prompt-2-*`, `audits/prompt-3-*`
- `supabase/migrations/20260612000*`
- `src/lib/providers/types.ts`, `url-normalize.ts`, `provider-service.ts`
- `src/lib/security/provider-crypto.ts`, `redact.ts`
- `src/lib/env/server.ts`
- `src/lib/supabase/server.ts`, `admin.ts`, `middleware.ts`
- `src/lib/utils.ts`
- `src/lib/models/types.ts`, `model-normalize.ts`, `capability-inference.ts`, `model-discovery-service.ts`
- `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/(app)/layout.tsx`
- `src/app/(app)/chat/page.tsx`
- `src/app/(app)/settings/page.tsx`
- `src/app/(app)/settings/providers/page.tsx`
- `src/components/app/app-shell.tsx`, `sidebar.tsx`
- `src/components/chat/chat-placeholder.tsx`, `conversation-sidebar.tsx`
- `src/components/providers/provider-manager.tsx`
- `src/components/models/model-catalog.tsx`, `model-card.tsx`, `model-capability-badges.tsx`, `model-discovery-panel.tsx`
- `src/components/ui/button.tsx`, `input.tsx`, `badge.tsx`
- `src/middleware.ts`

## 7. Risks

1. **Chat schema must be applied via MCP** — if MCP is unavailable or fails, stop and report.
2. **Secret handling** — decrypted provider keys must never leave server, never appear in UI, never be logged.
3. **Provider-agnostic** — must not hardcode any specific vendor; use selected provider_model from catalog.
4. **Ownership checks** — every thread, message, run, provider access must verify user_id = auth.uid().
5. **Streaming reliability** — must handle network failures, provider errors, partial content.
6. **No file/image upload** — attachment buttons should be disabled/present but non-functional.
7. **No fake responses** — must call real provider through saved connection.
8. **Existing Prompt 2/3 structure must be preserved** — no rewrites of provider manager/model catalog.

## 8. Implementation plan

Order:

1. Write audit file (this file).
2. Create `supabase/migrations/20260612000400_chat_backend.sql`:
   - `chat_threads` — user-owned conversation containers
   - `chat_messages` — messages with sequence, role, status, token tracking
   - `chat_generation_runs` — one row per generation attempt
   - RLS policies for all three (user-owned)
   - Indexes, constraints, updated_at triggers
   - No destructive SQL
3. Read migration back from disk, scan for destructive terms, apply via `supabase_apply_migration`.
4. Verify new tables, RLS, policies, indexes via MCP.
5. Re-verify `provider_connection_secrets` still has no authenticated SELECT.
6. Create server-only chat modules:
   - `src/lib/chat/types.ts` — ChatThread, ChatMessage, ChatGenerationRun, etc.
   - `src/lib/chat/title.ts` — deterministic title from first message
   - `src/lib/chat/sse.ts` — SSE event formatting helpers
   - `src/lib/chat/openai-compatible-stream.ts` — parse OpenAI SSE chunks
   - `src/lib/chat/chat-context.ts` — build provider messages from history
   - `src/lib/chat/provider-chat.ts` — choose adapter by protocol
   - `src/lib/chat/chat-service.ts` — thread/message/run CRUD, model resolution
7. Create API routes:
   - `src/app/api/chat/models/route.ts` — GET available chat models
   - `src/app/api/chat/threads/route.ts` — GET list, POST create
   - `src/app/api/chat/threads/[id]/route.ts` — GET, PATCH, DELETE thread
   - `src/app/api/chat/threads/[id]/messages/route.ts` — GET messages
   - `src/app/api/chat/stream/route.ts` — POST streaming chat
8. Create chat UI components:
   - `src/components/chat/chat-workspace.tsx` — main workspace container
   - `src/components/chat/chat-thread-sidebar.tsx` — real thread list
   - `src/components/chat/chat-message-list.tsx` — message rendering
   - `src/components/chat/chat-message.tsx` — single message bubble
   - `src/components/chat/chat-composer.tsx` — message input + send
   - `src/components/chat/chat-model-selector.tsx` — model picker
   - `src/components/chat/chat-empty-state.tsx` — empty/CTA states
   - `src/components/chat/use-chat-stream.ts` — streaming hook
9. Update existing files:
   - `src/app/(app)/chat/page.tsx` — render real workspace
   - `src/components/app/sidebar.tsx` — update sidebar text
10. Update docs:
    - `README.md` — add Prompt 4 section
    - `.env.example` — add optional chat tuning vars
11. Run validation:
    - `npm install` (add react-markdown + remark-gfm if needed)
    - `npm run lint`
    - `npm run build`
    - `git diff --check`
    - Secret-shaped diff scan
12. Commit and push.

## 9. Out of scope for Prompt 4

- File/image upload
- Tool calling
- Reasoning controls
- Web search
- Billing/quotas
- Admin dashboards
- Teams/multi-user
- Anthropic-compatible chat protocol (unsupported protocol → safe error)
- Production deployment

## 10. Supabase MCP

- Connected to `project_ref=dilfbodsntbnewrlluia`.
- Will be used for: `apply_migration`, `list_tables` (post-apply), `execute_sql` for `pg_policies` and `pg_indexes`.
- No destructive operations.
