# Dirtchat Public Website Deep Repair Audit

**Date:** 2026-06-12
**Branch:** main
**Commit:** 49eb539
**Remote:** https://github.com/demisuga01-lab/dirtchat.git

## Files Read

1. `package.json` - Next.js 15.5.19, React 19, Tailwind CSS 3.4, lucide-react
2. `next.config.mjs` - Standard Next config
3. `tsconfig.json` - Strict TS config with path aliases @/*
4. `tailwind.config.ts` - Custom design tokens, animations (fade-in, pulse-soft)
5. `postcss.config.mjs` - Tailwind + autoprefixer
6. `.eslintrc.json` - next/core-web-vitals + next/typescript
7. `.gitignore` - Proper env/secret exclusions
8. `src/app/globals.css` - Complete theme system, animations (fade-in-up, gradient-shift), reduced-motion support
9. `src/app/layout.tsx` - Root layout with ThemeProvider, ToastProvider
10. `src/app/page.tsx` - Home page composition (MarketingHeader, LandingHero, FeatureGrid, HowItWorks, WhyDirtchatSection, CtaBand, MarketingFooter)
11. `src/components/marketing/marketing-header.tsx` - Current header: flex layout, max-w-6xl, h-16, brand left, nav center, actions right
12. `src/components/marketing/landing-hero.tsx` - Hero with acceptable heading ("One interface for every serious model"), includes ProductPreview
13. `src/components/marketing/product-preview.tsx` - **PROBLEMATIC**: Uses GPT-4o · OpenAI, Claude Sonnet · Anthropic, MiniMax-M3 · TokenRouter, "Anthropic vs OpenAI comparison", "Prompt optimization notes"
14. `src/components/marketing/feature-grid.tsx` - Feature cards, mentions OpenAI/Anthropic/OpenRouter/TokenRouter appropriately as provider connection options
15. `src/components/marketing/how-it-works.tsx` - Steps: Connect, Discover, Chat. Mentions provider names.
16. `src/components/marketing/why-dirtchat-section.tsx` - Reason cards, mentions OpenAI/Anthropic
17. `src/components/marketing/cta-band.tsx` - CTA section
18. `src/components/marketing/marketing-footer.tsx` - Footer with product/legal/account links
19. `src/app/about/page.tsx` - Thin about page (100 lines, 4 sections)
20. `src/app/features/page.tsx` - Thin features page (103 lines, mentions provider names appropriate for provider connection context)
21. `src/app/why-dirtchat/page.tsx` - Thin why page (99 lines)
22. `src/app/privacy/page.tsx` - Thin privacy page (83 lines, basic text sections)
23. `src/app/terms/page.tsx` - Thin terms page (107 lines, basic text sections)
24. `src/components/ui/button.tsx` - Polymorphic button, sm/lg sizes
25. `src/components/auth/sign-in-form.tsx` - Auth form (not public marketing, internal Supabase references OK here)
26. `src/components/auth/sign-up-form.tsx` - Auth form (not public marketing, internal Supabase references OK here)
27. `src/components/app/theme-toggle.tsx` - Theme toggle icon button

## Current Header Structure

- Layout: CSS flex `justify-between` on a `max-w-6xl` container
- Height: `h-16` (64px)
- Brand: Logo mark (D div) + "Dirtchat" text, `text-base font-bold`
- Center nav: hidden on mobile, `md:flex`, items: Features, About, Why Dirtchat
- Right actions: ThemeToggle, Sign in (ghost sm), Get started (default sm), mobile menu toggle
- Mobile: hamburger menu, dropdown nav
- Problem: Center nav is only centered between left/right, not truly viewport-centered. Flex layout creates asymmetric centering.

## Current Hero Structure

- Heading: "One interface for every serious model." - Good
- Subheadline: "Connect your own providers, compare models, and keep every conversation in a private workspace built for fast, focused AI work." - Good
- Supporting line: "Model routing, saved conversations, and capability-aware workflows — without locking your work to one provider." - Acceptable
- Hero stats cards: Streaming chat, Multi-model workspace, Private by design
- CTA buttons: Get started, Sign in

## CRITICAL: Product Preview Model Copy Issues

**`src/components/marketing/product-preview.tsx`** contains the following problematic strings:

1. **"GPT-4o · OpenAI"** - Uses outdated model name. GPT-5.5 is current as of June 2026. However since exact current name cannot be verified from our codebase, should use "Current OpenAI model · OpenAI" or avoid static name.
2. **"Claude Sonnet · Anthropic"** - "Claude Sonnet" is ambiguous (Haiku/Sonnet/Opus 4/5?), not a current specific model name. Should use "Claude Fable 5 · Anthropic" or "Current Anthropic model · Anthropic"
3. **"MiniMax-M3 · TokenRouter"** - TokenRouter is a ROUTER/ACCESS PROVIDER, not a model owner. MiniMax-M3's original lab is MiniMax. This is the most egregious violation - it labels a router as the model owner.
4. **"Anthropic vs OpenAI comparison"** - Reads like a scaffold/prompt-internal saved conversation example
5. **"Prompt optimization notes"** - Reads like a scaffold/prompt-internal example

**`src/components/marketing/feature-grid.tsx`** contains provider names in feature descriptions:
- "Switch between OpenAI, Anthropic, OpenRouter, TokenRouter, or your own self-hosted endpoint" - OK, these are listed as providers you can connect to, not as model owners
- However, public preview should not use router-as-owner pattern

**`src/components/marketing/how-it-works.tsx`**:
- "Add your API key for OpenAI, Anthropic, OpenRouter, TokenRouter" - OK for provider connection context
- But better to use generic: "Add your API key for any supported provider"

**`src/app/features/page.tsx`**:
- "Switch between OpenAI, Anthropic, OpenRouter, TokenRouter, or self-hosted endpoints" - OK but could be more generic

**`src/app/why-dirtchat/page.tsx`**:
- "Keep OpenAI, Anthropic, and your self-hosted models" - OK as generic examples, but could remove
- Actually this is inside a feature card about provider switching, so naming example providers is reasonable

## Current Public Page Depth Assessment

| Page | Lines | Depth |
|------|-------|-------|
| About | 100 | Thin - 4 sections, basic cards |
| Features | 103 | Thin - hero + cards + coming later + CTA |
| Why Dirtchat | 99 | Thin - hero + reasons + CTA |
| Privacy | 83 | Very thin - 6 basic text sections |
| Terms | 107 | Thin - 8 basic text sections |

All pages lack:
- Visual illustrations/diagrams
- Animation
- Depth and substance
- Visual cards/structure (except basic border cards)
- Diagrams showing model ownership, provider flow, workspace preview

## Internal Stack References in Public UI

Using the built-in grep tool, I attempted to scan for: Supabase, MCP, RLS, migrations, Claude Code, server-side, service-role, provider_connection, encrypted_secret, database schema, Next.js, Row Level Security, Model Context Protocol, decryption

**Auth forms (sign-in-form.tsx, sign-up-form.tsx):** These reference Supabase but this is expected - they contain:
- "Supabase environment is not configured" (internal/auth error message shown to user when app isn't configured)
- These are technical setup messages, not marketing copy

**No internal stack references found in marketing/landing/product-preview/footer components.**

However, the grep tool didn't work on Windows. I'll need to verify via build output and manual inspection.

## Implementation Plan

### Phase 1: Header Repair
1. Change header from flex `justify-between` to CSS grid three-zone layout
2. Increase header height from `h-16` to `h-[72px]` or `h-20`
3. Increase logo size and Dirtchat text weight
4. Push brand more left `justify-self-start`
5. Push right actions more right `justify-self-end`
6. Center nav truly centered `justify-self-center`
7. Enlarge Sign in text and Get started button
8. Use wider max-width or full-width container

### Phase 2: Model Copy Repair
1. Replace product-preview.tsx model rows with owner-aware catalog format
2. Remove router-as-owner labels (TokenRouter as model owner)
3. Remove stale model names (GPT-4o, Claude Sonnet)
4. Remove scaffold-y saved conversation titles
5. Update feature-grid.tsx provider references as needed
6. Update how-it-works.tsx to use generic provider references
7. Update features page and why-dirtchat page provider references

### Phase 3: Page Depth
1. Significantly expand About page (8+ sections, illustrations)
2. Significantly expand Features page (grouped features, illustrations)
3. Significantly expand Why Dirtchat page (problem/solution, use cases, comparison)
4. Significantly expand Privacy page (cards, diagrams, control illustrations)
5. Significantly expand Terms page (cards, responsibility diagrams)

### Phase 4: Visuals & Animation
1. Create marketing-illustrations.tsx with CSS/SVG product illustrations
2. Add fade-in-up animations to page sections
3. Add connecting-line animation to HowItWorks
4. Add hover-lift effects to cards
5. Ensure reduced-motion support

### Phase 5: Validation
1. npm run lint
2. npm run build
3. Public UI internal stack scan
4. Model copy scan
5. Secret diff scan
6. Git commit and push

## Risks

1. **Low Risk:** CSS grid header changes may affect mobile layout - test responsive
2. **Low Risk:** Wider container classes may need responsive tuning
3. **Medium Risk:** Changing model names to generic labels could over-correct. Some provider mentions in connection-settings context are appropriate.
4. **Low Risk:** Adding many sections to pages increases bundle size - keep components efficient
5. **No risk:** No database/schema changes needed

## Confirmation

- No database/schema changes needed
- No backend changes needed
- No auth logic changes needed
- No provider manager changes needed
- No chat logic changes needed
- Only public-facing marketing UI files will be modified
