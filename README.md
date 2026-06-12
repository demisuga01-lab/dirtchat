# Dirtchat

> A premium, privacy-first AI chat workspace that routes your prompts across
> the best models — with a calm, focused interface.

Dirtchat is being built as a multi-model AI chat product. It is a
[Next.js](https://nextjs.org) 15 app (App Router) on
[Supabase](https://supabase.com) Auth + Postgres, with a custom LLM router
layer that supports TokenRouter, OpenRouter, OpenAI, Anthropic, and
self-hosted OpenAI-compatible endpoints.

> **Status:** Prompt 5 of 10. This commit ships:
> **premium conversation UX** on top of the Prompt 4 streaming chat backend.
> Message actions: copy-to-clipboard, regenerate (new assistant message),
> edit-and-resend (new user + assistant pair, history preserved). Safe
> markdown-like content renderer with fenced code blocks (language label,
> copy button, inline code support — no `dangerouslySetInnerHTML`).
> Thread sidebar: search/filter by title, pin/unpin, archive, delete
> with confirmation. Composer: autosizing textarea (max 200px),
> character count with warning near limit, edit mode with inline cancel.
> Keyboard shortcuts: Ctrl+N new thread, Ctrl+K focus sidebar search,
> Esc cancel edit. Provider-agnostic — no hardcoded model/vendor.
> File uploads, reasoning controls, and deployment ship in later prompts.

## Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS, with a small set of in-house UI primitives
- **Auth + DB:** Supabase (Auth, Postgres) + a service-role admin client
  for encrypted-secret reads/writes
- **Theming:** `next-themes` (light / dark / system)
- **Icons:** `lucide-react`
- **Validation:** `zod`
- **Class utilities:** `clsx` + `tailwind-merge`
- **Encryption:** Node `crypto` (AES-256-GCM) — see
  `src/lib/security/provider-crypto.ts`

## Repository layout

```
.
├── audits/                      # Per-prompt audit logs
├── public/                      # Static assets served by Next.js
├── src/
│   ├── app/
│   │   ├── (app)/               # Auth-protected route group
│   │   │   ├── dashboard/       # /dashboard
│   │   │   ├── chat/            # /chat
│   │   │   └── settings/        # /settings, /settings/providers
│   │   ├── api/providers/[id]/test/  # POST -> connection test
│   │   ├── auth/callback/       # OAuth / email-link callback
│   │   ├── sign-in/             # /sign-in
│   │   ├── sign-up/             # /sign-up
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page (/)
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── app/                 # App shell, sidebar, theme toggle
│   │   ├── auth/                # Sign-in / sign-up / sign-out forms
│   │   ├── chat/                # Conversation sidebar, message list, composer
│   │   ├── marketing/           # Landing page sections
│   │   ├── providers/           # Theme + provider-manager
│   │   └── ui/                  # Button, card, input, label, badge, toaster
│   ├── lib/
│   │   ├── env/server.ts        # Server-only env reader
│   │   ├── providers/           # URL normalize, types, provider service
│   │   ├── security/            # Provider crypto + redaction
│   │   ├── supabase/            # client / server / middleware / admin
│   │   └── utils.ts             # `cn()` + public Supabase env helper
│   └── middleware.ts            # Next.js middleware -> Supabase session
├── supabase/
│   └── migrations/              # Local SQL migrations (also applied via MCP)
├── audits/                      # Audit artifacts per prompt
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Local setup

### 1. Prerequisites

- Node.js **20+** (tested on Node 20 LTS and Node 25).
- npm (a `package-lock.json` is checked in).
- A Supabase project (free tier is fine for development).

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env.local
```

`.env.local` is **gitignored** and must never be committed.

| Variable | Required? | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for live auth) | Project URL from **Project Settings → API**. For Dirtchat this is `https://dilfbodsntbnewrlluia.supabase.co`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for live auth) | Publishable anon key. Safe in the browser. From Supabase Dashboard → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for admin operations | Server-only. Used to bypass RLS for legal docs, account events, and provider secrets. **Never** expose to the browser. From Supabase Dashboard → API → service_role. |
| `PROVIDER_KEY_ENCRYPTION_KEY` | Required for provider key storage | Base64-encoded 32-byte AES-256-GCM key. See generation commands below. |

Generate a 32-byte encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> **Three-state env detection:** The app shows distinct messages for:
> - **Missing:** One or both `NEXT_PUBLIC_*` vars are absent.
> - **Demo:** Placeholder patterns detected (e.g. `DEMO_REPLACE`, `your-supabase`).
> - **Ready:** Values look real. Sign-in and sign-up forms are enabled.

### 4. Supabase dashboard checklist

In your Supabase project dashboard, verify:

- **Authentication → Providers → Email:** Email provider **enabled**.
- **Authentication → Email Templates:** If your email template says "magic link", update it to say "one-time code" for consistency.
- **Authentication → URL Configuration:** Site URL and redirect URLs set to your local dev URL (e.g. `http://localhost:3000`).
- **All social/OAuth providers disabled** (Google, GitHub, Discord, Apple, etc.).
- **Anonymous sign-ins disabled**.
- **Password-based authentication enabled**.
- **Email OTP enabled.**

### 5. Auth methods

Dirtchat supports two sign-in methods:

| Method | UI label | Supabase API |
| --- | --- | --- |
| Email + password | Password | `signInWithPassword` |
| Email one-time code | Email code | `signInWithOtp` + `verifyOtp` |

**Not supported:** OAuth/SSO, social login (Google, GitHub, Discord, etc.), magic links, anonymous login.

### 6. Legal acceptance

New accounts must accept the active Terms of Service and Privacy Policy during sign-up. Acceptance is recorded in `user_legal_acceptances` and tracked through account events. Existing users who haven't accepted the latest versions are redirected to `/accept-terms` on login.

### 7. Run the dev server

```bash
npm run dev
```

Restart the dev server after changing `.env.local`. Ensure you open the exact port printed in the terminal (e.g. `localhost:3000`, `localhost:3002`, etc.).

### 4. Apply Supabase migrations

The repo ships local SQL migrations under `supabase/migrations/`:

- `20260612000100_initial_profiles.sql` — `public.profiles` + RLS +
  `handle_new_user` trigger
- `20260612000200_provider_connections.sql` — `provider_connections` +
  `provider_connection_secrets` + RLS
- `20260612000300_model_discovery.sql` — `provider_models`,
  `model_capabilities`, `model_discovery_runs`, `model_discovery_events`
- `20260612000400_chat_backend.sql` — `chat_threads`, `chat_messages`,
  `chat_generation_runs` + RLS + indexes
- `20260612000500_storage_buckets.sql` — `chat-attachments`, `avatars`,
  `temp-uploads` buckets + storage RLS policies

Apply them in one of these ways:

- **Supabase CLI**: link the project, then `supabase db push`.
- **Supabase SQL editor**: paste each file's contents and run.
- **Programmatically via MCP** (used during this prompt): the
  `mcp__supabase__apply_migration` tool was called to apply both
  migrations to the connected dev project.

The migrations are idempotent (`create … if not exists`, `drop … if
exists`). They do not drop tables, do not disable RLS, and do not
modify `auth.users` rows.

### 5. Run the dev server

```bash
npm run dev
```

Then open:

- `http://localhost:3000` — landing page
- `http://localhost:3000/sign-up` — create an account
- `http://localhost:3000/sign-in` — sign in
- `http://localhost:3000/dashboard` — protected dashboard
- `http://localhost:3000/chat` — protected live chat workspace
- `http://localhost:3000/settings` — protected settings
- `http://localhost:3000/settings/providers` — provider manager
- `http://localhost:3000/settings/providers/[id]/models` — model catalog

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Production build. |
| `npm run start` | Run the production build. |
| `npm run lint` | Run ESLint using Next.js's recommended config. |

## Provider manager (Prompt 2)

`/settings/providers` is a real, persisted connection manager.

- **Presets:** TokenRouter (recommended), OpenRouter, OpenAI-compatible
  custom, Anthropic-compatible custom.
- **TokenRouter preset:** label `TokenRouter (MiniMax-M3)`, base URL
  `https://api.tokenrouter.com/v1/chat/completions`, default model
  `MiniMax-M3`.
- **Encryption:** keys are encrypted server-side with AES-256-GCM using
  `PROVIDER_KEY_ENCRYPTION_KEY`. Only the last 4 characters are ever
  returned to the browser. The full secret is never displayed, never
  logged, and never returned in any provider API response.
- **RLS:** `provider_connections` is fully user-owned (SELECT / INSERT /
  UPDATE / DELETE). `provider_connection_secrets` has **no** SELECT policy
  for `authenticated` — reads only via the service-role admin client.
- **Connection test:** `/api/providers/[id]/test` runs an
  OpenAI-compatible probe (`GET /models` if available, else a
  single-token chat-completions ping) and returns a safe, redacted
  result. Anthropic-compatible test support ships in a later prompt.
- **Anthropic-compatible:** the form accepts the URL, but the test
  endpoint returns "test support ships in a later prompt" so the UI
  never fakes success.

## Model discovery (Prompt 3)

`/settings/providers/[id]/models` is a real, persisted model catalog and
capability catalog per provider connection.

- **Discovery probes** run server-side and require the saved encrypted
  API key (decrypted only inside server-only modules).
- **OpenAI / OpenRouter / generic providers:** a `GET <apiRoot>/models`
  request is issued. Responses are parsed into three known shapes:
  OpenRouter rich metadata, OpenAI list, or generic `data|models` array.
  Metadata is capped (500 models per run by default) and stripped of any
  secret-shaped keys.
- **TokenRouter-style full chat-completions URL** (`…/v1/chat/completions`):
  if `/models` is not available and a `default_model` is configured, a
  single-token chat-completions ping is performed to synthesize a
  fallback model row (e.g. `MiniMax-M3`).
- **Anthropic-compatible:** discovery returns a clear "not implemented"
  message. Manual model add still works.
- **Capability inference** is conservative: `null` (unknown) is the
  default for most capabilities; only metadata that explicitly mentions
  tools, JSON mode, structured outputs, reasoning parameters, etc.
  produces `true`. Confidence and source are stored on every row.
- **Manual model add:** provider id, display name, optional context /
  max-output, and a small set of capability toggles. Manual models are
  user-owned and clearly marked.
- **Default model:** a partial unique index ensures only one
  `is_default_for_provider = true` per `(user_id, provider_connection_id)`,
  and `provider_connections.default_model` is updated to match.
- **Storage:** four new tables (`provider_models`, `model_capabilities`,
  `model_discovery_runs`, `model_discovery_events`) — all with
  user-owned RLS, all created and verified through Supabase MCP.
- **Secrets:** decrypted only inside server-only modules for the
  duration of the probe. The decrypted key is never logged, never
  returned, never persisted in events. Re-encrypted bytes live only in
  `provider_connection_secrets` (carried over from Prompt 2).

## Live chat backend (Prompt 4)

The `/chat` workspace now connects to real provider models through the
existing `provider_connections` and `provider_models` catalog.

- **Backend API routes:**
  - `GET /api/chat/models` — list available chat models from the user's
    provider connections.
  - `GET|POST /api/chat/threads` — list threads or create a new one.
  - `GET|PATCH|DELETE /api/chat/threads/[id]` — fetch, rename/archive, or
    delete a thread.
  - `GET /api/chat/threads/[id]/messages` — list messages for a thread.
  - `POST /api/chat/stream` — send a message and receive SSE-streamed
    response from the provider.
- **Streaming:** server-sent events (`text/event-stream`) with events:
  `thread`, `user_message`, `assistant_message`, `delta`, `done`,
  `error`, `warning`.
- **Provider-agnostic:** only `openai-compatible` protocol is implemented.
  Unsupported protocols return a clear safe error.
- **Context builder:** caps provider context at 30 messages / 60k chars,
  oldest dropped first.
- **Token tracking:** `chat_messages` stores `prompt_tokens`,
  `completion_tokens`, `total_tokens` per message. `chat_generation_runs`
  tracks full request metadata including timing, HTTP status, and error
  type.
- **Title generation:** deterministic from first message (first 10 words,
  max 60 chars, markdown stripped).
- **Generation runs:** status lifecycle: `queued` → `streaming` →
  `complete` | `error` | `cancelled`.
- **Client hook:** `useChatStream()` manages thread/message state, model
  fetching, SSE parsing, abort/cancel, and optimistic local updates.

### New chat tables

| Table | Purpose |
| --- | --- |
| `chat_threads` | User-owned conversation threads with title, default model. |
| `chat_messages` | Individual messages (user/assistant) with role, content, status, token counts. |
| `chat_generation_runs` | Metadata per generation: timing, HTTP status, provider request ID, error. |

### Environment variables

| Variable | Default | Notes |
| --- | --- | --- |
| `CHAT_STREAM_TIMEOUT_MS` | `60000` | HTTP timeout per streaming request. |
| `CHAT_MAX_INPUT_CHARS` | `20000` | Max message length from the client. |
| `CHAT_CONTEXT_MAX_MESSAGES` | `30` | Max messages sent to the provider. |
| `CHAT_CONTEXT_MAX_CHARS` | `60000` | Max total char length for provider context. |
| `CHAT_DEFAULT_MAX_TOKENS` | `4096` | Default `max_tokens` sent to the provider. |

## Premium chat UX (Prompt 5)

The `/chat` workspace now includes message actions, a safe content renderer,
and a polished thread sidebar.

- **Message actions:** each assistant message has a copy button (copies
  content to clipboard) and a regenerate button on the last assistant
  message (creates a new response while preserving the old one). User
  messages have an edit button that opens the composer in edit mode.
- **Edit-and-resend:** creates a new user message (with
  `safe_metadata.action: "edit_and_resend"` and
  `edited_from_message_id`) followed by a new assistant response. The
  original user message and old response are preserved in the thread
  history — no destructive deletion.
- **Regenerate:** creates a new assistant message (with
  `safe_metadata.action: "regenerate"`,
  `regenerated_from_message_id`, and `regeneration_index`). Previous
  assistant response remains in the history with a "Regenerated" badge.
- **Safe content renderer** (`chat-message-content.tsx`): lightweight
  custom renderer for markdown-like content. Supports fenced code blocks
  (language label + copy button), inline code (single backticks), and
  plain paragraph text. No `dangerouslySetInnerHTML` or external
  markdown dependencies.
- **Error recovery:** assistant messages with `status: "error"` show a
  retry button and the error message text.
- **Composer:** `textarea` auto-sizes up to 200px, character count
  displayed (warning color near `CHAT_MAX_INPUT_CHARS` limit),
  edit mode pre-fills the textarea and shows a cancel button. Esc key
  cancels edit mode. Buttons are disabled during streaming; a stop
  button replaces send while streaming.
- **Thread sidebar:** search/filter by title (Ctrl+K to focus), pinned
  section at the top with separator, context menu per thread (rename,
  pin/unpin, archive, delete with Yes/No confirmation).
- **Keyboard shortcuts:** Ctrl+N to create a new thread, Ctrl+K to
  focus sidebar search, Esc to cancel edit or close menus.
- **Schema reuse:** no new database tables or columns. All metadata
  (action type, linked message IDs) stored in the existing
  `safe_metadata` JSONB column on `chat_messages`. The existing
  `parent_message_id` column links edited user messages to their origin.

## Prompt 1 scope recap

✅ Built in Prompt 1:

- Next.js 15 + TypeScript + Tailwind scaffold.
- Premium landing page (subsequently polished in Prompt 2 — the
  `Prompt 1 · Foundation preview` badge has been removed).
- Supabase SSR auth baseline, email/password flows, auth callback.
- Protected route group `(app)` with sidebar, topbar, mobile nav, theme
  toggle, sign-out.
- Dashboard with status cards.
- Chat workspace placeholder (no live LLM).
- Settings with profile fields and provider placeholders (now real in
  Prompt 2).
- Local Supabase migration: `profiles` table, RLS, `handle_new_user`
  trigger (also applied to the dev project).
- Hardened `.gitignore` and placeholder-only `.env.example`.

⛔ **Not yet built** (deferred):

- Reasoning controls (temperature, top_p, frequency/presence penalty UI).
- File / image upload or Supabase Storage wiring.
- Usage logging, quotas, billing, or admin tools.
- Production deployment.

## Security & secrets

- The `NEXT_PUBLIC_*` env vars are safe to expose to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` and `PROVIDER_KEY_ENCRYPTION_KEY` are
  server-only and must never be exposed to the browser, never logged,
  and never committed.
- Never commit `.env`, `.env.local`, or any file with a real key.
- `.gitignore` already excludes `.claude/`, `.mcp.json`, and other local
  agent / MCP configuration files. These must not be published.
- Errors are redacted before logging or surfacing to the client. The
  `redact()` helper in `src/lib/security/redact.ts` strips
  `Bearer …`, `sk-…`, JWT-shaped values, and key/value pairs whose
  field name contains `key`, `secret`, `token`, `password`, or
  `service[_-]?role`.

## Supabase Storage

Three buckets are defined in migration `20260612000500_storage_buckets.sql`:

| Bucket | Access | Limit | Purpose |
| --- | --- | --- | --- |
| `chat-attachments` | Private | 50 MB | Chat file/image uploads. User-scoped RLS. |
| `avatars` | Public-read | 5 MB | User profile images. Public SELECT, owner-only writes. |
| `temp-uploads` | Private | 100 MB | Temporary upload processing. User-scoped RLS. |

All buckets use `auth.uid()::text = (storage.foldername(name))[1]` to
scope access to the owning user. Upload clients must prefix object paths
with `{user_id}/`.

Private buckets (`chat-attachments`, `temp-uploads`) require signed URLs
generated server-side via the service-role client. The `avatars` bucket
is public-read so avatar images render without signed tokens.

### Applying the storage migration

If your Supabase project already has the earlier migrations applied,
run `20260612000500_storage_buckets.sql` in the Supabase SQL editor or via:

```bash
supabase db push
```

The migration is idempotent — it uses `on conflict (id) do nothing` for
bucket creation and standard `create policy` for RLS.

## License

Private — internal Dirtchat project. Add a license before opening the
repository to outside contributors.
