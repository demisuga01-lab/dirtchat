# Prompt 5 — Premium Chat UX Audit

## Repository State
- Branch: `main`
- Commit: `8c4e793` (`feat: add streaming chat backend`)
- Remote: `origin  https://github.com/demisuga01-lab/dirtchat.git`
- Status: clean, 1 ahead of origin, 3 untracked agent/skill files only
- All Prompt 1/2/3/4 commits present: `52e3a8a`, `4541b6d`, `a269e8f`, `8c4e793`

## Files Read Before Editing
- `package.json` — Next.js 15.5.19, React 19, no react-markdown dependency
- `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`
- All 7 lib/chat modules: `types.ts`, `chat-service.ts`, `sse.ts`, `title.ts`, `chat-context.ts`, `openai-compatible-stream.ts`, `provider-chat.ts`
- All 8 chat UI components: `chat-workspace.tsx`, `chat-thread-sidebar.tsx`, `chat-message.tsx`, `chat-message-list.tsx`, `chat-composer.tsx`, `chat-model-selector.tsx`, `chat-empty-state.tsx`, `use-chat-stream.ts`
- All 5 API routes: `models/route.ts`, `threads/route.ts`, `threads/[id]/route.ts`, `threads/[id]/messages/route.ts`, `stream/route.ts`
- `chat/page.tsx`, `sidebar.tsx`, `app-shell.tsx`
- Existing Supabase migration: `20260612000400_chat_backend.sql`

## Supabase Schema Inspection (via MCP execute_sql)
- 10 public tables confirmed
- `chat_threads`: has `is_pinned`, `is_archived`, `parent_message_id` NOT on threads (it's on messages), `safe_metadata`, `sequence` on messages
- `chat_messages`: has `parent_message_id` (uuid, nullable), `safe_metadata` (jsonb, NOT NULL), `status`, `sequence`, `role`, `content`
- `chat_generation_runs`: has `safe_request`, `safe_response_metadata`, `safe_error`, `status`
- 12 RLS policies on chat tables (select/insert/update/delete per table)
- `provider_connection_secrets`: NO authenticated SELECT policy (only INSERT, UPDATE, DELETE)
- **No schema changes needed for Prompt 5** — existing columns support regenerate/edit via `parent_message_id` and `safe_metadata`

## Current Chat Backend
- Server-only modules in `src/lib/chat/` — 7 modules
- 5 API routes in `src/app/api/chat/`
- Auth-required, user-scoped, RLS-enforced
- Provider-agnostic, SSE streaming, non-stream fallback
- Secret decryption via admin client only

## Current Chat UI
- Basic workspace with sidebar, message list, composer, model selector
- No message actions (copy, regenerate, edit)
- No markdown/code block rendering
- No thread search
- No keyboard shortcuts
- No edit mode
- No pinning in sidebar

## Implementation Plan
1. Add `regenerateAndStream` and `editAndResend` to `chat-service.ts`
2. Add `POST /api/chat/threads/[id]/regenerate` route
3. Add `POST /api/chat/threads/[id]/edit-and-resend` route  
4. Create `chat-message-content.tsx` — safe markdown-like renderer with code block copy
5. Rewrite `chat-message.tsx` — add copy, regenerate, edit buttons, enhanced rendering
6. Rewrite `chat-message-list.tsx` — edit mode support
7. Rewrite `chat-composer.tsx` — autosize, char count, edit mode
8. Rewrite `use-chat-stream.ts` — add regenerate, editAndResend, pinThread actions
9. Rewrite `chat-thread-sidebar.tsx` — search, pin support, confirm dialogs
10. Rewrite `chat-workspace.tsx` — keyboard shortcuts, edit/regenerate integration
11. Update `StreamRequest` in types.ts to include action
12. Update stream route to handle regenerate and edit actions
13. Update README, .env.example

## Risks
- No heavy markdown library — must build lightweight safe renderer
- Must not break existing streaming path
- Must preserve history on regenerate/edit
- Must avoid duplicate stream requests
- Must maintain accessible controls
