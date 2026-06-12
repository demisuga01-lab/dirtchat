# Dirtchat — Prompt 1 Foundation Audit

Audit performed before any code changes. Date: 2026-06-12.

## 1. Repository state

- **Working directory:** `E:\nvidiatest\hosting`
- **Git initialized:** No. `git status` returned `fatal: not a git repository`.
- **Current branch:** N/A
- **Current commit:** N/A
- **Untracked files:** Only `.claude/` and `.mcp.json` (both local-machine config, not source code).
- **Staged changes:** None.
- **Unstaged changes:** None.
- **Remote configured:** No. No `origin` configured.

## 2. Local tooling

- **Node.js:** v25.6.0 (`/c/Program Files/nodejs/node`)
- **npm:** 11.8.0
- **Git:** git 2.54.0.windows.1 (`/mingw64/bin/git`)

## 3. Directory contents (top-level)

```
.claude/                  # local Claude Code settings (settings.local.json, .bak) — must NOT be committed
.mcp.json                 # local Supabase MCP config (project_ref=dilfbodsntbnewrlluia) — must NOT be committed
```

No `package.json`, no `node_modules`, no framework files, no source tree, no `supabase/`, no `audits/`, no `README.md`, no `.gitignore`, no `.env*`.

The directory is empty other than local agent tooling files.

## 4. Existing framework / app

None. The repository has no web app, no package manager lockfile, no source files. This is a fresh-scaffold scenario.

## 5. Existing Supabase state (via MCP)

- **Supabase MCP:** connected to project ref `dilfbodsntbnewrlluia` (per local `.mcp.json`).
- **Public schema tables:** empty (`list_tables` returned `[]`).
- **No existing `profiles` table, no auth helpers, no migrations visible** through MCP read-only inspection.
- The Supabase Auth schema (`auth.users`, etc.) is managed by Supabase and not surfaced in `public`.

## 6. Local-only files that must NOT be committed

| Path | Reason |
| --- | --- |
| `.claude/settings.local.json` | Local Claude Code settings (machine-specific, not project content). |
| `.claude/settings.local.json.bak.*` | Local backup of Claude settings. |
| `.mcp.json` | Local MCP server config; references a specific project_ref. Sensitive to leak into a public repo. |

`.gitignore` must protect `.claude/`, `.mcp.json`, `.env`, `.env.local`, and standard Next.js/Node build artifacts.

## 7. Risks before editing

1. **No git history exists yet.** Initial commit will be the entire foundation. This is acceptable because the directory is empty.
2. **Local MCP/CCR config must stay local.** `.mcp.json` contains a project ref that should not be published in a public repo. `.claude/` is local agent state.
3. **No secrets to leak yet** — no `.env` file exists, so there is nothing secret-shaped in the working tree to begin with.
4. **Internet access for `npm install`** is required and assumed; will be verified at install time.
5. **Supabase MCP** is read-only used for inspection; no remote write is planned in Prompt 1.

## 8. Implementation plan for Prompt 1

In order, after this audit:

1. Initialize a fresh `git` repo on `main`.
2. Add the GitHub remote `https://github.com/demisuga01-lab/dirtchat.git`.
3. Scaffold a Next.js 15 (App Router) + TypeScript + Tailwind app in the root using a safe, non-destructive method (manual scaffold to avoid `create-next-app` overwriting local files like `.mcp.json` and `.claude/`).
4. Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `clsx`, `tailwind-merge`, `next-themes`.
5. Create the project structure under `src/`:
   - `src/app/` — routes: landing, sign-in, sign-up, auth/callback, dashboard, chat, settings.
   - `src/components/` — app shell, sidebar, topbar, auth forms, chat placeholder, marketing components, ui primitives.
   - `src/lib/supabase/` — client/server/middleware helpers.
   - `src/lib/utils.ts` — `cn` helper.
6. Implement Supabase auth baseline (SSR pattern), protected route guards, sign-in/sign-up/sign-out flows.
7. Build the premium UI shell with a cohesive visual system.
8. Prepare a local Supabase migration: `supabase/migrations/20260612000100_initial_profiles.sql` (profiles table, RLS, handle_new_user trigger). Do not apply remotely.
9. Write `README.md`, `.env.example`, harden `.gitignore`.
10. Run validation: `npm install`, `npm run lint`, `npm run build`, `git diff --check`, secret-shaped diff scan.
11. Stage precisely (excluding `.claude/`, `.mcp.json`, etc.), commit, push to `main`.

## 9. Out of scope for Prompt 1 (deferred to later prompts)

- Provider connection manager / BYOK.
- Model discovery and capability detection.
- Chat backend and streaming.
- File/image uploads.
- Reasoning/thinking controls.
- Conversation persistence.
- Usage logging, quotas, billing.
- Deployment.

These will be built on top of the foundation produced here.
