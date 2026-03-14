# 项目索引 - 天命玄机 / Tianming Secrets

> 最后更新：2026-03-11

## 文档入口

| 文件 | 用途 |
|------|------|
| [README.md](./README.md) | 项目总览、开发方式、主流程 |
| [PROJECT_INDEX.md](./PROJECT_INDEX.md) | 结构索引与关键路径映射 |
| [AGENTS.md](./AGENTS.md) | 代理协作规范与仓库快照 |
| [package.json](./package.json) | 脚本与依赖 |
| [prisma/schema.prisma](./prisma/schema.prisma) | 数据模型 |

## 当前结构总览

```text
/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── chart/[id]/page.tsx
│   │   │   ├── result/[id]/page.tsx
│   │   │   └── success/page.tsx
│   │   ├── api/
│   │   │   ├── checkout/route.ts
│   │   │   ├── webhook/route.ts
│   │   │   └── report/
│   │   │       ├── generate/route.ts
│   │   │       ├── ai-generate/route.ts
│   │   │       └── [id]/route.ts
│   │   ├── chart/[id]/
│   │   ├── result/[id]/
│   │   ├── success/page.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── home/HomePage.tsx
│   │   ├── CheckoutSuccess.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── LocaleHtmlUpdater.tsx
│   │   ├── BaguaBackground.tsx
│   │   ├── FullChart.tsx
│   │   └── chart-shared.tsx
│   └── lib/
│       ├── i18n/
│       ├── llm/
│       ├── stripe/
│       ├── monitoring/
│       ├── solar-time/
│       ├── ziwei/
│       ├── location/
│       ├── report-view.ts
│       ├── temp-report-store.ts
│       └── db.ts
├── prisma/schema.prisma
├── tests/astrolabe.test.ts
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
└── vercel.json
```

## 关键路径映射

| 用户阶段 | 页面 / 接口 | 说明 |
|----------|-------------|------|
| 默认入口 | `/` | 重定向到 `/en` |
| 本地化首页 | `src/app/[locale]/page.tsx` | 渲染首页与表单 |
| 免费命盘生成 | `src/app/api/report/generate/route.ts` | 创建基础 `Report` |
| 命盘预览 | `src/app/chart/[id]/ChartDisplay.tsx` | 展示命盘与付费入口 |
| 支付发起 | `src/app/api/checkout/route.ts` | 复用已付费报告或发起 Stripe |
| 支付回写 | `src/app/api/webhook/route.ts` | 回写原始 `Report` |
| 成功页轮询 | `src/components/CheckoutSuccess.tsx` | 轮询 `/api/report/[id]` |
| 结果页展示 | `src/app/result/[id]/ReportContent.tsx` | paid gate / generating / completed |

## 运行时与数据层

| 模块 | 关键文件 | 作用 |
|------|----------|------|
| 语言路由 | `src/lib/i18n/config.ts` / `src/lib/i18n/routes.ts` | 默认语言、locale 路径处理 |
| 双语文案 | `src/lib/i18n/dictionaries.ts` | 首页、命盘、结果、成功页文案 |
| 命盘读取 | `src/lib/report-view.ts` | 服务端页面共享报告标准化读取 |
| 本地兜底 | `src/lib/temp-report-store.ts` | 无库场景的临时报告存储 |
| Stripe | `src/lib/stripe/index.ts` | Checkout session、回跳 URL |
| AI 解读 | `src/lib/llm/index.ts` / `src/app/api/report/ai-generate/route.ts` | English report contract, LLM config, and generation gate |
| 命盘渲染 | `src/components/FullChart.tsx` / `src/components/chart-shared.tsx` | 共享命盘组件 |

## 环境变量速查

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | 主数据库连接 |
| `DIRECT_URL` | Prisma / Vercel 直连 |
| `OPENAI_API_KEY` | 首选的 OpenAI-compatible API key |
| `OPENAI_BASE_URL` | 首选的 OpenAI-compatible base URL（根路径会自动归一到 `/v1`） |
| `OPENAI_MODEL` | 首选模型名 |
| `DOUBAO_API_KEY` | 兼容旧部署的 legacy fallback |
| `DOUBAO_BASE_URL` | 兼容旧部署的 legacy fallback |
| `DOUBAO_MODEL` | 兼容旧部署的 legacy fallback |
| `STRIPE_SECRET_KEY` | Stripe 服务端密钥 |
| `STRIPE_WEBHOOK_SECRET` | Webhook 验签密钥 |
| `NEXT_PUBLIC_URL` | 站点外部 URL |
| `RESEND_API_KEY` | 邮件服务 |
| `EMAIL_FROM` | 发件邮箱 |

## 常用命令

```bash
pnpm dev
pnpm prisma:generate
pnpm prisma:push
pnpm exec tsc --noEmit
pnpm test -- --run
pnpm build
```

## 清理结果

- `CLAUDE.md` 与 `agent.md` 已从文档体系移除
- 根目录调试截图、`scratch/` 等产物已归类为本地调试文件
- `.gitignore` 已补充对应忽略规则，避免再次污染仓库

## 维护提示

- 当前真实支付实现是 Stripe，不要按旧资料误判为 PayPal
- `pnpm lint` 当前不是稳定的无交互验证命令
- 如果继续改支付链路，请联动检查 `checkout / webhook / stripe helper`
- 如果继续改首页或转化页，请优先保持 `HomePage` 与 `ChartDisplay`、`ReportContent` 的品牌一致性
