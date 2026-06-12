# Dirtchat

> A premium, privacy-first AI chat workspace that routes your prompts across
> the best models — with a calm, focused interface.

Dirtchat is being built as a multi-model AI chat product. It is a
[Next.js](https://nextjs.org) 15 app (App Router) on
[Supabase](https://supabase.com) Auth + Postgres + Storage, with a custom
LLM router layer planned to support TokenRouter, OpenRouter, OpenAI,
Anthropic, and self-hosted OpenAI-compatible endpoints.

> **Status:** Prompt 1 of 10. This commit ships the **foundation only**:
> project scaffold, Supabase auth baseline, premium app shell, dashboard,
> chat workspace placeholder, settings, provider placeholders, and a local
> Supabase migration. The actual chat backend, LLM routing, file uploads,
> and provider key storage arrive in later prompts.

## Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS, with a small set of in-house UI primitives
- **Auth + DB:** Supabase (Auth, Postgres, Storage — Storage in a later prompt)
- **Theming:** `next-themes` (light / dark / system)
- **Icons:** `lucide-react`
- **Class utilities:** `clsx` + `tailwind-merge`

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
│   │   ├── auth/callback/       # OAuth / email-link callback
│   │   ├── sign-in/             # /sign-in
│   │   ├── sign-up/             # /sign-up
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page (/)
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── app/                 # App shell, sidebar, topbar, theme toggle
│   │   ├── auth/                # Sign-in / sign-up / sign-out forms
│   │   ├── chat/                # Conversation sidebar, chat placeholder
│   │   ├── marketing/           # Landing page sections
│   │   ├── providers/           # Theme provider
│   │   └── ui/                  # Button, card, input, label, badge, toaster
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser Supabase client
│   │   │   ├── server.ts        # Server Supabase client (cookies)
│   │   │   └── middleware.ts    # Session refresh helper
│   │   └── utils.ts             # `cn()` + Supabase env helper
│   └── middleware.ts            # Next.js middleware -> Supabase session
├── supabase/
│   └── migrations/              # Local SQL migrations (not yet applied)
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
- npm (a `package-lock.json` is checked in; if you prefer `pnpm` or `yarn`,
  remove the lockfile and use your package manager of choice).
- A Supabase project (free tier is fine for development).

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your real Supabase project values:

```bash
cp .env.example .env.local
```

`.env.local` is **gitignored** and must never be committed. The expected
variables are:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

You can find both values in your Supabase dashboard under
**Project Settings → API**.

> The app builds and renders even without these values. Protected pages
> show a "Supabase is not configured" notice until the env vars are set,
> so you can preview the layout before wiring up Supabase.

### 4. Apply the local migration (optional but recommended)

The repository ships a local SQL migration under
`supabase/migrations/20260612000100_initial_profiles.sql`. It is **not**
applied to your Supabase project automatically.

To apply it, you can either:

- Open the Supabase dashboard → **SQL Editor** → paste the file's
  contents and run it, **or**
- Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and run
  `supabase db push` once the project is linked.

The migration is idempotent and only creates:

- `public.profiles` (user-owned profile rows)
- Row-level security policies
- A trigger that creates a `profiles` row for every new `auth.users` row

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
- `http://localhost:3000/settings/providers` — provider placeholders

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Production build. |
| `npm run start` | Run the production build. |
| `npm run lint` | Run ESLint using Next.js's recommended config. |

## Prompt 1 scope

✅ Built in this prompt:

- Next.js 15 + TypeScript + Tailwind scaffold (`src/` layout, `@/*` alias,
  ESLint, `next-themes`).
- Premium landing page with hero, features, and footer.
- Supabase SSR auth baseline (`@supabase/supabase-js` + `@supabase/ssr`)
  with browser, server, and middleware clients.
- Email/password sign-up and sign-in flows with safe error handling.
- Auth callback route for OAuth / email-link confirmation.
- Protected route group `(app)` with sidebar, topbar, mobile nav, theme
  toggle, and sign-out.
- Dashboard with status cards and quick links.
- Chat workspace placeholder with conversation sidebar, composer, and a
  model selector — **no live LLM call**.
- Settings page with profile fields and a disabled provider form.
- Provider settings page showing the planned shape of TokenRouter,
  OpenRouter, OpenAI, Anthropic, and a custom router.
- Local Supabase migration: `profiles` table, RLS, and
  `handle_new_user` trigger.
- Hardened `.gitignore` and placeholder-only `.env.example`.
- `audits/prompt-1-foundation-audit.md`.

⛔ **Not** built in this prompt (deferred):

- Live LLM chat, streaming responses, or any provider call.
- User API key storage or encryption.
- Model discovery, capability detection, or reasoning controls.
- File / image upload or Supabase Storage wiring.
- Usage logging, quotas, billing, or admin tools.
- Production deployment.

## Security & secrets

- The `NEXT_PUBLIC_*` env vars are safe to expose to the browser. They are
  the only Supabase variables used in Prompt 1.
- The Supabase **service-role** key is **not** required and **must not** be
  added to `.env.local` in Prompt 1. It is intentionally not used yet.
- Never commit `.env`, `.env.local`, or any file with a real key.
- `.gitignore` already excludes `.claude/`, `.mcp.json`, and other local
  agent / MCP configuration files. These must not be published.

## License

Private — internal Dirtchat project. Add a license before opening the
repository to outside contributors.
