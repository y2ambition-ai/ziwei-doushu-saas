# Repository Guidelines

## Project Snapshot

- Product: `Tianming Secrets`
- Tech stack: Next.js 15 App Router, React 19, TypeScript, Prisma, Stripe + AI
- Default locale: `en`
- Chinese entry: removed (English-only site)
- Production domain: `https://ziwei-doushu-saas.vercel.app`
- Current payment flow: Stripe Checkout + Webhook + localized Success page
- Last cleanup: `2026-03-12`

## Directory Ownership

- `src/app/`: pages, layouts, API routes
- `src/app/[locale]/`: localized landing, chart, result, and success pages
- `src/app/chart/[id]/`: shared chart implementation
- `src/app/result/[id]/`: shared result implementation
- `src/components/`: homepage, success page, shared chart components, language switcher
- `src/lib/i18n/`: locale config, dictionaries, routing, formatting
- `src/lib/stripe/`: checkout session and return URLs
- `src/lib/llm/`: AI interpretation prompt and mock output
- `src/lib/report-preferences.ts`: report locale lock, legacy locale inference, preference write-back
- `src/lib/report-view.ts`: unified report read and normalization
- `src/lib/temp-report-store.ts`: local no-DB fallback storage
- `prisma/schema.prisma`: `Customer / Order / Report` data models
- `tests/`: Vitest tests

## Current Flow

1. Visit `/`, auto-redirect to `/${defaultLocale}` (currently `/en`)
2. `src/app/[locale]/page.tsx` renders the localized landing page `src/components/home/HomePage.tsx`
3. The home form submits to `src/app/api/report/generate/route.ts` to create the base `Report`
4. The home page calls `src/app/api/report/[id]/route.ts` for status and triggers Stripe Checkout via `src/app/api/checkout/route.ts` (or reuse/Mock)
5. Stripe returns to `/${locale}/success?session_id=...&report_id=...`
6. `src/app/api/webhook/route.ts` updates the original `Report` without creating duplicates
7. `src/app/api/report/[id]/route.ts` powers success polling and result fetching
8. `/${locale}/result/[id]` only generates the premium AI reading after payment or mock mode
9. `/${locale}/chart/[id]` remains the chart display page (reachable from other entry points)

## UI/UX Design Spec (Updated 2026-03-12)

- **Homepage layout**: Two-Viewport Layout. First viewport is the hero, second viewport is the input form.
- **Visual style**: Minimal modern Chinese aesthetic. Use a light rice-paper background with deep ink/coffee text for clarity.
- **Panel feel**: Glassmorphism with subtle gold glow to add depth.
- **Typography rules**:
  - Concentrate core information, remove marketing fluff and extra CTA buttons.
  - Keep the split ratio at `1fr : 1.4fr` so the hero Taiji and the form grid align.
  - Titles stay concise and restrained (single-line headline).
- **Accessibility**: Ensure contrast for all text, especially action buttons (e.g., "Unlock Full Reading") and critical notices.

## Local No-DB Fallback

- When `DATABASE_URL` is missing/invalid or Prisma is unavailable, local preview paths fall back to `src/lib/temp-report-store.ts`.
- Local temp data writes to `.local/temp-reports.json`.
- Vercel runtime uses system temp to avoid writing `.next/cache` into Serverless Functions.
- This fallback is for local preview/testing only; it does not replace database or payment/webhook persistence.
- In no-DB mode, webhook writeback updates the temp report to complete local Stripe testing.

## Key Files

- `src/components/home/HomePage.tsx`: landing page and form (two-viewport layout)
- `src/app/chart/[id]/ChartDisplay.tsx`: chart page implementation with payment jump and mock fallback
- `src/app/result/[id]/ReportContent.tsx`: result page implementation
- `src/components/LanguageSwitcher.tsx`: locale switcher for light theme
- `src/lib/i18n/dictionaries.ts`: English copy dictionary
- `src/lib/llm/index.ts`: English report prompt, summary extraction, output validation + retry
- `tests/llm.test.ts`: minimal regression test for output contract and summary extraction
- `tests/report-preferences.test.ts`: locale lock and legacy fallback logic tests

## Development & Validation

Run in repo root:

- `pnpm install`
- `pnpm dev`
- `pnpm exec tsc --noEmit`
- `pnpm test -- --run`
- `pnpm build`

## Deployment Snapshot (2026-03-12)

- Latest release branch: `release/locale-lock-age-neutral`
- Latest release commit: `b793b37d2`
- Vercel Preview: `https://ziwei-doushu-saas-7lgsx6i63-y2ambition-ais-projects.vercel.app`
- Vercel Production: `https://ziwei-doushu-saas.vercel.app`
- The function size issue was fixed. Root cause: the local no-DB fallback wrote to `.next/cache`; now it uses `.local/temp-reports.json` or the Vercel system temp directory.
- The codebase now prefers `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL` and normalizes root URLs to `/v1`; legacy `DOUBAO_*` variables remain supported as fallback for older deployments.
- Production Stripe keys are still missing. Without `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`, production stays on the no-key fallback.

## Documentation

- `README.md`: product and development overview
- `PROJECT_INDEX.md`: structure index and critical paths
- `AGENTS.md`: agent collaboration rules and repository snapshot

## Current Notes

- **Style consistency**: keep global tone unified and avoid abrupt background or typography shifts.
- **Layout alignment**: the homepage responsive grid must keep both viewports aligned for `max-width` and `grid-cols`.
- **Payment flow**: `src/app/chart/[id]/ChartDisplay.tsx` `handleGetReading` includes a mock fallback when keys are missing.
- **LLM runtime config**: runtime prefers project-local `.env.local` values for `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` before inherited host environment variables, then falls back to legacy `DOUBAO_*`; root-only compatible bases are normalized to `/v1`.
- **Report language contract**: `src/lib/llm/index.ts` requires English output to start with `Core Identity:` and use the fixed six section headings. Update summary extraction and result display if the prompt changes.
- **Report locale lock**: the first submission locale is stored; chart/success/result/AI must follow the report locale and should not allow manual URL switching.
- **Age and region neutrality**: reports must adapt to life stage; avoid region-specific systems (SAT, A-Level, etc.) and school exam references.
- When changing payment flow, check: `src/app/api/checkout/route.ts`, `src/app/api/webhook/route.ts`, `src/lib/stripe/index.ts`
- When changing chart logic, check: `src/lib/solar-time/index.ts`, `src/lib/ziwei/wrapper.ts`, `tests/astrolabe.test.ts`
