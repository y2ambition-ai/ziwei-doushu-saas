# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Product**: 紫微斗数在线排盘与 AI 命理解析 SaaS
**Version**: **v1.1.0** (Code Optimization - 2026-02-25)
**Business Model**: 单次付费 $1.99 USD
**Core Value**: 火山引擎豆包大模型将命盘数据转化为通俗、有情绪价值的命运解析长文
**Status**: MVP 完成，代码优化完成，支付功能待完善

**Production URL**: https://ziwei-doushu-saas.vercel.app
**GitHub**: https://github.com/y2ambition-ai/ziwei-doushu-saas

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| v1.1.0 | 2026-02-25 | 代码优化：提取共享组件，删除冗余代码 |
| v1.0.0 | 2026-02-24 | Baseline Release - MVP 完成 |

---

## v1.1.0 Changes

### Code Optimization
- ✅ 删除未使用组件：`AstrolabeForm.tsx`, `MiniChart.tsx`
- ✅ 提取共享模块：`chart-shared.tsx`
- ✅ 精简 `FullChart.tsx`: 486 → 192 行
- ✅ 精简 `ChartDisplay.tsx`: 735 → 411 行
- ✅ 净减少 ~1065 行代码

### Shared Components (`chart-shared.tsx`)
- Types: `PalaceData`, `RawAstrolabe`
- SVG Components: `TaiChiSymbol`, `BaguaRing`, `CloudPattern`, `Divider`
- Helper Functions: `getShichenName`, `getWesternZodiac`, `getPalaceByBranch`
- UI Components: `StarBadge`, `PalaceCell`
- Constants: `PALACE_LAYOUT`

---

## v1.0.0 Baseline Features

- ✅ 完整紫微斗数排盘（12宫格布局，iztro 引擎）
- ✅ 豆包 AI 命理解读（全球化提示词，通用职业/教育描述）
- ✅ Stripe 支付集成（$1.99 单次付费）- 框架已搭建，待完善
- ✅ 7天免费复用机制
- ✅ 东方禅意 UI 设计
- ✅ A4 打印格式支持
- ✅ 幸运元素展示（颜色/数字/方位）

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + Lucide Icons + Motion |
| Astrology Engine | `iztro` npm package |
| LLM | 火山引擎豆包 API (OpenAI SDK compatible) |
| Payment | PayPal Checkout (待接入) |
| Email | Resend |
| Database | Prisma + SQLite (dev) / PostgreSQL (prod) |
| Monitoring | Sentry |

---

## Payment Integration (PayPal)

**决定：** 放弃 Stripe（中国大陆无法直接注册），改用 PayPal

**PayPal 优势：**
- 中国大陆可直接注册
- 0 成本开通
- 开发接入简单
- 覆盖全球用户

**下次待办：**
1. 注册 PayPal 账户：https://www.paypal.com/cn
2. 创建开发者应用：https://developer.paypal.com
3. 获取 Client ID + Secret
4. 接入 PayPal SDK（前端按钮 + 后端 webhook）

**待删除：**
- `src/lib/stripe/` 目录
- `src/app/api/checkout/` 和 `src/app/api/webhook/`（Stripe 相关）
- `.mcp.json` 中的 Stripe MCP 配置

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
pnpm build                  # Build for production
vercel --prod               # Deploy to Vercel
```

---

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page with inline form
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles + print CSS
│   ├── chart/[id]/         # Chart display page
│   │   ├── page.tsx        # Server component
│   │   └── ChartDisplay.tsx # Client component (uses chart-shared)
│   ├── result/[id]/        # AI report display page
│   └── api/
│       ├── checkout/       # Stripe Checkout Session
│       ├── webhook/        # Stripe Webhook handler
│       └── report/         # Report generation APIs
│
├── components/
│   ├── chart-shared.tsx    # Shared chart components (v1.1.0)
│   ├── FullChart.tsx       # Full 12-palace chart (uses chart-shared)
│   └── BaguaBackground.tsx # Background decoration
│
├── lib/
│   ├── ziwei/wrapper.ts    # iztro wrapper + LLM formatter
│   ├── solar-time/         # True solar time calculation
│   ├── llm/index.ts        # Doubao API integration + prompts
│   ├── stripe/             # Stripe integration
│   ├── location/cities.ts  # City database (webhook legacy)
│   └── db.ts               # Prisma client
│
└── instrumentation.ts      # Sentry initialization
```

---

## Core Flows

### 1. Chart Generation Flow
1. User fills form (email, gender, birth date/time, birthplace current time)
2. System calculates longitude from time difference (vs Beijing time)
3. `calculateTrueSolarTime()` adjusts time based on longitude
4. `generateAstrolabe()` calls iztro's `astro.bySolar()`
5. Result stored in database with raw JSON

### 2. AI Report Generation Flow
1. `formatAstrolabeForLLM()` extracts palace data with stars, brightness, 12-spirits
2. Prompt built with country-specific localization (education/career/currency)
3. Doubao API called with 3500-4500 character response target
4. Report includes: Core Identity, Lucky Elements, 12 Palace Analysis, Major Period, Annual Fortune

### 3. Payment Flow (Current Implementation)
1. User clicks "获取大师解读" on chart page
2. `/api/checkout` checks 7-day free reuse
3. If no reuse: creates Stripe Checkout Session
4. User completes payment on Stripe
5. Stripe webhook → `/api/webhook`
6. Webhook generates AI report and stores in database

---

## Key Data Structures

### Report Model (Prisma)
```prisma
model Report {
  id            String    @id @default(cuid())
  orderId       String?   @unique
  email         String
  gender        String
  birthDate     String
  birthTime     Int
  birthMinute   Int       @default(0)
  birthCity     String
  longitude     Float
  latitude      Float     @default(0)
  trueSolarTime String?
  rawAstrolabe  String?
  aiReport      String?
  coreIdentity  String?
  paidAt        DateTime?
  createdAt     DateTime  @default(now())
}
```

### iztro Output Structure
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

### Longitude Calculation (Current Implementation)
- User provides birthplace current time
- Compare with Beijing time to calculate longitude offset
- 1 hour difference ≈ 15° longitude

### Print CSS
- `.print-chart-container`: Chart on separate page
- `.print-section`: Avoid page breaks mid-section
- A4 optimized: 15mm margins, 11px font

---

## Current Status

**Version**: v1.1.0
**Branch**: `refactor/cleanup-optimization` (pending merge)

| Phase | Status |
|-------|--------|
| Phase 1: Infrastructure | ✅ Done |
| Phase 2: Core Engine | ✅ Done |
| Phase 3: LLM Integration | ✅ Done |
| Phase 4: Frontend | ✅ Done |
| Phase 5: Code Optimization | ✅ Done (v1.1.0) |
| Phase 6: Payment | 🔄 Framework ready, needs polish |

**Next Steps:**
1. 注册 PayPal 获取 API 凭证
2. 接入 PayPal 支付（替换 Stripe）
3. 创建 `/success` 支付成功页面
4. 测试完整支付流程
5. Merge v1.1.0 to main
6. Deploy to production

---

## Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL`: PostgreSQL connection
- `DIRECT_URL`: PostgreSQL direct URL (for Vercel)
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

---

## Changelog

### v1.1.0 (2026-02-25)
- refactor: extract shared chart components
- delete unused AstrolabeForm.tsx, MiniChart.tsx
- create chart-shared.tsx with common components
- reduce codebase by ~1065 lines

### v1.0.0 (2026-02-24)
- Initial baseline release
- Complete MVP with 12-palace chart
- AI report generation with Doubao
- Basic Stripe integration
