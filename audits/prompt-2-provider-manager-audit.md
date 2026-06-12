# Dirtchat — Prompt 2 Provider Manager + Landing Polish Audit

Audit performed before any code changes. Date: 2026-06-12.

## 1. Repository state

- **Working directory:** `E:\nvidiatest\hosting`
- **Git initialized:** Yes.
- **Current branch:** `main` (tracking `origin/main`)
- **Current commit:** `52e3a8a` (Prompt 1 commit)
- **Remote:** `https://github.com/demisuga01-lab/dirtchat.git` (push and pull are working)
- **Untracked files:** None besides `.claude/` and `.mcp.json` (both ignored).
- **Staged changes:** None.
- **Unstaged changes:** None.
- **Prompt 1 commit is present:** Yes — full foundation scaffolded.

## 2. Local tooling

- **Node.js:** v25.6.0
- **npm:** 11.8.0
- **Git:** git 2.54.0.windows.1
- **Package manager:** npm.

## 3. Prompt 1 foundation

Next.js 15.5.19 + React 19 + TS 5.7, Tailwind, `next-themes`, Supabase SSR auth, polymorphic `Button`, `Card`, `Input`, `Label`, `Badge`, `Toaster`, pages `/`, `/sign-in`, `/sign-up`, `/auth/callback`, `/(app)/dashboard`, `/(app)/chat`, `/(app)/settings`, `/(app)/settings/providers`, `/not-found`, `/loading`. Local migration `20260612000100_initial_profiles.sql` prepared.

## 4. Supabase state (via MCP)

- `mcp__supabase__list_tables` on `public` returned `[]` (schema is empty).
- No remote migrations applied.

## 5. Landing page issues (from screenshot)

- `<Badge>Prompt 1 · Foundation preview</Badge>` rendered above headline — must be removed.
- No `min-h`; hero vertical centering is fragile on common laptop heights.
- Headline `text-4xl sm:text-5xl md:text-6xl`; muted impact.
- 3 hero-stat cards use `sm:grid-cols-3 gap-3 max-w-4xl`; under-weight and uneven.
- `src/app/page.tsx` bottom CTA references "Prompt 2".

## 6. Settings / providers state

- `/(app)/settings/providers/page.tsx` is a static preview; form fields disabled.
- `/(app)/settings/page.tsx` shows `Badge>Coming next`.
- No CRUD, encryption, test connection, or Supabase schema for providers yet.

## 7. Environment / encryption state

- `getSupabaseEnv()` only checks public Supabase URL + anon key.
- No `PROVIDER_KEY_ENCRYPTION_KEY` or `SUPABASE_SERVICE_ROLE_KEY` placeholder.
- No server-side env helper exists.

## 8. Auth / RLS state

- `(app)/layout.tsx` redirects unauthenticated users to `/sign-in`.
- No RLS policies exist remotely.

## 9. Files read

`package.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/(app)/layout.tsx`, `src/app/(app)/settings/page.tsx`, `src/app/(app)/settings/providers/page.tsx`, `src/components/marketing/landing-hero.tsx`, `src/components/marketing/feature-grid.tsx`, `src/components/marketing/marketing-header.tsx`, `src/components/providers/provider-form-placeholder.tsx`, `src/components/app/app-shell.tsx`, `src/components/app/sidebar.tsx`, `src/components/ui/{button,card,input,badge}.tsx`, `src/lib/utils.ts`, `src/lib/supabase/server.ts`, `supabase/migrations/20260612000100_initial_profiles.sql`, `.env.example`, `audits/prompt-1-foundation-audit.md`.

## 10. Risks

1. Landing page edits must not break the build (badge removal needs import cleanup).
2. Server-side encryption requires runtime env — app must still build/render when env missing and show a safe error.
3. Service-role key must never be exposed to the browser.
4. `.env.example` may carry placeholder names; no real values may be committed.
5. Remote Supabase writes must NOT be applied without explicit approval.
6. Manual dev-server testing out of scope; build + lint validation only.

## 11. Implementation plan

1. `src/lib/env/server.ts` — server-only env helper.
2. `src/lib/security/provider-crypto.ts` — AES-256-GCM, base64 32-byte key, encrypt/decrypt, last4/keyHash. Server-only.
3. `src/lib/security/redact.ts`.
4. `src/lib/providers/types.ts` and `src/lib/providers/url-normalize.ts`.
5. `src/lib/providers/provider-service.ts` — list/get/create/update/delete/setSecret/testConnection. Never return encrypted secret.
6. `src/lib/supabase/admin.ts` — service-role client. Server-only.
7. `supabase/migrations/20260612000200_provider_connections.sql` — `provider_connections` + `provider_connection_secrets` with RLS, no authenticated `select` on secrets.
8. `src/app/(app)/settings/providers/actions.ts` — zod-validated, ownership-checked, safe errors.
9. `src/app/api/providers/[id]/test/route.ts` — OpenAI-compatible probe.
10. `src/components/providers/provider-manager.tsx` — real client component with preset selector, TokenRouter pre-fill, form, test, status badges, empty state.
11. Rewrite `/(app)/settings/providers/page.tsx`.
12. Update `/(app)/settings/page.tsx` card to reflect Prompt 2.
13. Polish landing: remove badge, viewport-aware hero, balanced 3-column stat grid, reword bottom CTA.
14. Update `.env.example` and `README.md`.
15. Validate: `npm install` (zod), `npm run lint`, `npm run build`, `git diff --check`, secret scan.
16. Commit and push.

## 12. Out of scope for Prompt 2

- Real chat streaming.
- Model discovery / capability detection.
- Reasoning controls.
- File/image upload.
- Conversation persistence.
- Usage logging, quotas, billing.
- Anthropic-compatible test (show "not implemented" message).
- Remote database writes.

## 13. Supabase MCP

- Connected to `project_ref=dilfbodsntbnewrlluia`.
- Public schema empty. Local migrations prepared; not applied remotely.
