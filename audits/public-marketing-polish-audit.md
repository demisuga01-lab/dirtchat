# Public Marketing Polish Audit

## Current state

- **Branch:** main
- **Commit:** 49eb539
- **Remote:** https://github.com/demisuga01-lab/dirtchat.git
- **Uncommitted changes:** none (clean working tree)
- **Recent commits:** 5 total, last 2 are Prompt 4 (chat backend) and Prompt 5 (premium chat UX)

## Files read

- `src/app/page.tsx` — home page with hero, feature grid, CTA, footer
- `src/app/layout.tsx` — root layout with Inter font, ThemeProvider, metadata (includes "Supabase" in keywords)
- `src/app/globals.css` — CSS variables for light/dark, Tailwind layers, some utilities
- `src/components/marketing/marketing-header.tsx` — 56px sticky header, logo left, Features + Sign in center, theme/Sign in/Get started right
- `src/components/marketing/marketing-header.tsx` — Duplicate Sign in in center nav and right side
- `src/components/marketing/landing-hero.tsx` — centered hero with radial gradient, headline, 3 stat cards
- `src/components/marketing/feature-grid.tsx` — 6 feature cards grid
- `src/components/marketing/marketing-footer.tsx` — minimal footer with brand, Sign in, Get started, Dashboard
- `src/components/app/theme-toggle.tsx` — client component, dehydrated-stable

## Current public routes

- `/` — landing page
- `/sign-in` — sign in page
- `/sign-up` — sign up page

No `/features`, `/about`, `/why-dirtchat`, `/privacy`, `/terms` exist yet.

## Header structure

- Height: 56px (h-14)
- Left: Logo (7x7 D mark + "Dirtchat" in text-sm)
- Center nav: Features (#features anchor), Sign in
- Right: ThemeToggle, Sign in (ghost button, hidden mobile), Get started (primary button)
- Problem: Sign in appears in both center nav and right side

## Internal stack terms found in public UI (after previous cleanup)

Previously cleaned:
- `feature-grid.tsx` — "Supabase-backed workspace" → "integrated workspace"; "Supabase auth & storage" → "Secure auth & storage" ✅
- `landing-hero.tsx` — no internal terms currently
- `marketing-footer.tsx` — no internal terms
- `marketing-header.tsx` — no internal terms
- `page.tsx` — no internal terms

Remaining metadata issue:
- `src/app/layout.tsx` line 28: `"Supabase"` in keywords — should be removed from public-facing metadata

## README/audits

README and audit files still contain internal terms (Prompt references, Supabase, migrations, etc.). These are developer-facing and allowed.

## Implementation plan

1. Create audit file (this)
2. Rewrite `marketing-header.tsx`:
   - Height: h-16 (64px)
   - Bigger logo mark (h-8 w-8) and text (text-base font-bold)
   - Center nav: Features → /features, About → /about, Why Dirtchat → /why-dirtchat (only on desktop, hidden mobile)
   - Remove Sign in from center nav
   - Right side: ThemeToggle, Sign in (ghost), Get started (primary)
   - Mobile: hamburger menu for center links
3. Rewrite `landing-hero.tsx`:
   - New headline: "One interface for every serious model."
   - New subheadline about BYO providers, model switching, focused workspace
   - CSS animation: fade/slide reveal on page load
   - Animated gradient mesh background
   - Product preview below hero with stylized panels
4. Add new landing components:
   - `how-it-works.tsx` — 3-step process
   - `why-dirtchat-section.tsx` — persuasive section
   - `product-preview.tsx` — CSS-animated preview panels
   - `cta-band.tsx` — final call-to-action before footer
5. Rewrite `marketing-footer.tsx`:
   - Expanded with Features, About, Why Dirtchat, Privacy, Terms, Sign in, Get started
   - Brief value prop, copyright
6. Create public pages:
   - `/features` — full feature page
   - `/about` — about page
   - `/why-dirtchat` — persuasion page
   - `/privacy` — practical privacy page
   - `/terms` — practical terms page (both placeholder, not legal advice)
7. Update `src/app/layout.tsx` — remove "Supabase" from metadata keywords
8. Update `src/app/page.tsx` — compose with new sections
9. Add animation CSS to globals.css
10. Run validation, commit, push

## Risks

- Animations must not be distracting or layout-shifting
- Mobile header must not overflow
- Privacy/terms must not make false legal claims
- No backend/chat/provider changes needed
- No Supabase/database changes needed
- Must preserve existing sign-in/sign-up flows
