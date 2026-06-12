# Dirtchat

> A premium, privacy-first AI chat workspace that routes your prompts across
> the best models — with a calm, focused interface.

Dirtchat is being built as a multi-model AI chat product. It is a
[Next.js](https://nextjs.org) 15 app (App Router) on
[Supabase](https://supabase.com) Auth + Postgres, with a custom LLM router
layer that supports TokenRouter, OpenRouter, OpenAI, Anthropic, and
self-hosted OpenAI-compatible endpoints.

> **Status:** Prompt 3 of 10. This commit ships:
> **model discovery and capability detection** on top of the Prompt 2
> provider manager. New Supabase tables: `provider_models`,
> `model_capabilities`, `model_discovery_runs`, and
> `model_discovery_events`. Server-only discovery probes
> (`GET /models` for OpenAI / OpenRouter, with a tiny chat-completions
> fallback for full-endpoint providers like TokenRouter), conservative
> capability inference with nullable booleans, manual model addition,
> per-provider default model selection, and a polished model catalog UI
> at `/settings/providers/[id]/models`. Real chat streaming, file
> uploads, reasoning controls, and deployment ship in later prompts.

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
│   │   ├── chat/                # Conversation sidebar, chat placeholder
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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for live auth) | Project URL from **Project Settings → API**. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for live auth) | Publishable key. Safe in the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for Prompt 2 | Server-only. Used to bypass RLS for the encrypted secrets table. **Never** expose to the browser. |
| `PROVIDER_KEY_ENCRYPTION_KEY` | Required for Prompt 2 | Base64-encoded 32-byte AES-256-GCM key. See generation commands below. |

Generate a 32-byte key with PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Or with OpenSSL:

```bash
openssl rand -base64 32
```

> The app builds and renders without these values, but provider CRUD
> (and the connection test) will surface a safe configuration error until
> they are set.

### 4. Apply Supabase migrations

The repo ships two local SQL migrations under `supabase/migrations/`:

- `20260612000100_initial_profiles.sql` — `public.profiles` + RLS +
  `handle_new_user` trigger
- `20260612000200_provider_connections.sql` — `provider_connections` +
  `provider_connection_secrets` + RLS

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
- `http://localhost:3000/chat` — protected chat placeholder
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

- Live LLM chat, streaming responses.
- Model discovery, capability detection, reasoning controls.
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

## License

Private — internal Dirtchat project. Add a license before opening the
repository to outside contributors.
