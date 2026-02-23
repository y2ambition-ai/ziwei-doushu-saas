# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Product**: 紫微斗数在线排盘与 AI 命理解析 SaaS
**Business Model**: 单次付费 $1.99 USD
**Core Value**: 火山引擎豆包大模型将命盘数据转化为通俗、有情绪价值的命运解析长文
**Status**: MVP 完成，生产环境稳定运行

**Production URL**: https://ziwei-doushu-saas.vercel.app
**GitHub**: https://github.com/y2ambition-ai/ziwei-doushu-saas

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + Lucide Icons + Motion |
| Astrology Engine | `iztro` npm package |
| LLM | 火山引擎豆包 API (OpenAI SDK compatible) |
| Payment | Stripe Checkout |
| Email | Resend |
| Database | Prisma + SQLite (dev) / PostgreSQL (prod) |
| Monitoring | Sentry |

---

## Key Commands

```bash
# Development
pnpm dev                    # Start dev server on port 3000

# Database
pnpm prisma generate        # Generate Prisma Client
pnpm prisma db push         # Push schema changes
pnpm prisma studio          # Open Prisma Studio

# Testing
pnpm test                   # Run Vitest tests

# Build & Deploy
pnpm build                  # Build for production (includes prisma generate + db push)
vercel --prod               # Deploy to Vercel
```

---

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page with form
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles + print CSS
│   ├── chart/[id]/         # Chart display page (12-palace grid)
│   ├── result/[id]/        # AI report display page
│   └── api/
│       ├── checkout/       # Stripe Checkout Session
│       ├── webhook/        # Stripe Webhook handler
│       └── report/         # Report generation APIs
│
├── components/
│   ├── AstrolabeForm.tsx   # Main form component
│   ├── FullChart.tsx       # Full 12-palace chart (SVG decorations)
│   ├── MiniChart.tsx       # Simplified chart for reports
│   └── BaguaBackground.tsx # Background decoration
│
├── lib/
│   ├── ziwei/wrapper.ts    # iztro wrapper + LLM formatter
│   ├── solar-time/         # True solar time calculation
│   ├── llm/index.ts        # Doubao API integration + prompts
│   ├── stripe/             # Stripe integration
│   └── db.ts               # Prisma client
│
└── instrumentation.ts      # Sentry initialization
```

---

## Core Flows

### 1. Chart Generation Flow
1. User fills form (email, gender, birth date/time, birthplace current time)
2. System calculates longitude from time difference
3. `calculateTrueSolarTime()` adjusts time based on longitude
4. `generateAstrolabe()` calls iztro's `astro.bySolar()`
5. Result stored in database with raw JSON

### 2. AI Report Generation Flow
1. `formatAstrolabeForLLM()` extracts palace data with stars, brightness, 12-spirits
2. Prompt built with country-specific localization (education/career/currency)
3. Doubao API called with 3500-4500 character response target
4. Report includes: Core Identity, Lucky Elements, 12 Palace Analysis, Major Period, Annual Fortune

### 3. Key Data Structures

**Report Model** (Prisma):
- `rawAstrolabe`: JSON string of full iztro output
- `aiReport`: Markdown content from LLM
- `coreIdentity`: Short summary string
- Payment & completion timestamps

**iztro Output Structure**:
- `chineseDate`: "庚午 壬午 辛亥 甲午" (4 pillars)
- `palaces[]`: Each contains majorStars, minorStars, adjectiveStars, decadal range, ages
- `fiveElementsClass`: e.g., "土五局"

---

## Important Patterns

### Four Pillars (四柱) Extraction
```typescript
// From chineseDate field: "庚午 壬午 辛亥 甲午"
const chineseDate = String(data?.chineseDate || '');
const dateParts = chineseDate.split(' ');
const siZhu = {
  year: dateParts[0], month: dateParts[1],
  day: dateParts[2], hour: dateParts[3]
};
```

### Shichen (时辰) Conversion
- `birthTime`: 0-23 hour input
- `solarResult.shichen`: 0-11 mapped to 子-亥
- Hour 23 belongs to next day's 子时 (0)

### Country Localization
LLM prompt includes country-specific terms:
- CN: 高考, 考公, 公务员
- US: SAT/ACT, Tech, Finance, USD
- SG: A-Level, Banking, SGD
- etc.

### Print CSS
- `.print-chart-container`: Chart on separate page
- `.print-section`: Avoid page breaks mid-section
- A4 optimized: 15mm margins, 11px font

---

## Current Status

**Progress**: 27/28 features complete (96%)

| Phase | Status |
|-------|--------|
| Phase 1: Infrastructure | Done |
| Phase 2: Core Engine | Done |
| Phase 3: LLM Integration | Done |
| Phase 4: Frontend | Done |
| Phase 5: Payment & Email | Done |
| Phase 6: Production | Done |

**Remaining**: F026 - Project Documentation

**Last Session** (2026-02-24):
- Report page chart redesign
- Four pillars extraction fix (from `chineseDate` field)
- Country field removed from form
- FullChart component created

---

## Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL`: PostgreSQL connection
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `DOUBAO_API_KEY`, `DOUBAO_BASE_URL`, `DOUBAO_MODEL`
- `RESEND_API_KEY`, `EMAIL_FROM`
- `NEXT_PUBLIC_URL`

---

## Test Data (Famous Charts)

| Name | Birth | Ming Gong Stars |
|------|-------|-----------------|
| Mao Zedong | 1893-12-26 辰时 | 紫微·贪狼 |
| Deng Xiaoping | 1904-08-22 申时 | 太阳·巨门 |
| Jack Ma | 1964-09-10 卯时 | 天机·太阴 |
