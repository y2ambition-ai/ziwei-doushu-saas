# 天命玄机 / Tianming Secrets

一个基于 Next.js 15 App Router 构建的紫微斗数独立站。用户先生成免费命盘，再决定是否通过 Stripe 解锁 AI 深度解读；默认英文，同时支持中文。

> Snapshot: 2026-03-11

## 当前状态

- 根路径 `/` 自动跳转到 `/en`
- 核心页面与主流程支持 `en / zh`
- 用户先看命盘，再决定是否付费解锁长文报告
- 支付链路已串通：`Checkout -> Webhook -> Success -> Result`
- 本地无库场景支持临时报告兜底，方便首页到结果页整链路预览

## 核心能力

- 紫微斗数排盘：基于 `iztro`
- 真太阳时校正：结合出生地时间与经度逻辑
- 双语 AI 解读：同一套流程支持中文与英文输出
- Stripe 支付：同一份 `Report` 贯穿命盘、支付、结果页
- 7 天复看：相同邮箱和参数可在复用窗口内再次打开

## 用户主流程

1. 访问 `/`，自动进入 `/en`
2. 在 `/${locale}` 首页填写出生信息，调用 `/api/report/generate`
3. 进入 `/${locale}/chart/[id]` 查看免费命盘
4. 决定是否调用 `/api/checkout` 发起支付
5. 支付成功后返回 `/${locale}/success?report_id=...`
6. `/api/webhook` 回写原始 `Report`
7. 成功页轮询 `/api/report/[id]`
8. 就绪后跳转 `/${locale}/result/[id]`

## 关键目录

```text
src/
├── app/
│   ├── [locale]/             # 本地化首页、命盘页、结果页、成功页
│   ├── api/                  # checkout、webhook、report APIs
│   ├── chart/[id]/           # 命盘共享实现
│   ├── result/[id]/          # 结果页共享实现
│   └── success/              # 旧成功页兼容跳转
├── components/
│   ├── home/                 # 首页落地页
│   ├── CheckoutSuccess.tsx   # Success 轮询界面
│   ├── LanguageSwitcher.tsx  # 语言切换
│   ├── FullChart.tsx         # 完整命盘渲染
│   └── chart-shared.tsx      # 命盘共享组件
└── lib/
    ├── i18n/                 # 语言配置、字典、路由
    ├── llm/                  # AI 解读
    ├── stripe/               # 支付辅助
    ├── report-view.ts        # 统一报告读取
    ├── temp-report-store.ts  # 本地无库兜底
    ├── solar-time/           # 真太阳时
    └── ziwei/                # 排盘封装
```

## 快速开始

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

默认开发地址：`http://localhost:3000`

## 本地预览说明

- 如果 `DATABASE_URL` 缺失、无效或本地数据库不可用，部分链路会退化到 `.next/cache/temp-reports.json`
- 该兜底主要用于本地预览和联调，不替代真实的数据库、支付和 webhook 数据
- 真实支付联调仍建议完整配置 `DATABASE_URL`、`STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`

## 常用命令

```bash
pnpm dev
pnpm exec tsc --noEmit
pnpm test -- --run
pnpm build
```

说明：`pnpm lint` 当前会触发 Next.js ESLint 的交互式初始化，不适合作为无交互验证命令。

## 文档入口

- `README.md`：项目总览
- `PROJECT_INDEX.md`：结构索引与关键路径
- `AGENTS.md`：代理协作规范与仓库快照

## 当前注意事项

- 当前真实支付实现是 Stripe，不是 PayPal
- 旧 `/chart/[id]`、`/result/[id]`、`/success` 路由仍保留兼容跳转
- 根目录调试截图与 `scratch/` 已归类为本地调试产物，不应提交

## License

私有项目。
