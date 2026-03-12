# Repository Guidelines

## 项目快照

- 产品：`天命玄机 / Tianming Secrets`
- 技术栈：Next.js 15 App Router、React 19、TypeScript、Prisma、Stripe + AI
- 默认语言：`en`
- 中文入口：`/zh`
- 当前支付路径：Stripe Checkout + Webhook + 本地化 Success 页
- 最近清理时间：`2026-03-12`

## 目录职责

- `src/app/`：页面、布局、API 路由
- `src/app/[locale]/`：本地化入口页、命盘页、结果页、成功页
- `src/app/chart/[id]/`：命盘共享实现
- `src/app/result/[id]/`：结果页共享实现
- `src/components/`：首页、成功页、命盘共享组件、语言切换等
- `src/lib/i18n/`：语言配置、字典、路由与格式化
- `src/lib/stripe/`：支付会话与回跳 URL
- `src/lib/llm/`：AI 解读 prompt 与 mock 输出
- `src/lib/report-preferences.ts`：报告语言锁定、旧数据语言推断与偏好回写
- `src/lib/report-view.ts`：统一报告读取与标准化
- `src/lib/temp-report-store.ts`：本地无库兜底的临时报告存储
- `prisma/schema.prisma`：`Customer / Order / Report` 数据模型
- `tests/`：Vitest 测试

## 当前主流程

1. 访问 `/`，自动重定向到 `/${defaultLocale}`，当前默认是 `/en`
2. `src/app/[locale]/page.tsx` 渲染本地化首页 `src/components/home/HomePage.tsx`
3. 首页表单提交到 `src/app/api/report/generate/route.ts` 创建基础 `Report`
4. 用户进入 `/${locale}/chart/[id]` 查看免费命盘
5. `src/app/api/checkout/route.ts` 负责复用已支付报告或发起 Stripe Checkout
6. 支付完成后返回 `/${locale}/success?report_id=...`
7. `src/app/api/webhook/route.ts` 回写原始 `Report`，不再新建重复记录
8. `src/app/api/report/[id]/route.ts` 为成功页轮询和结果页读取提供状态
9. `/${locale}/result/[id]` 只会在支付已完成或 mock 场景下触发高级 AI 解读

## UI/UX 设计规范 (2026-03-12 更新)

- **首页布局**：采用“双屏沉浸式”设计（Two-Viewport Layout）。第一屏为 Hero 展示，第二屏为表单输入。
- **视觉风格**：极简“新中式”美学。统一使用浅色宣纸背景，深墨色/咖啡色文字确保高清晰度。
- **面板质感**：采用玻璃态（Glassmorphism）设计，配合微弱的金色发光阴影，提升层次感。
- **排版准则**：
  - 核心信息高度集中，移除所有冗余营销词汇与不必要的引导按钮。
  - 左右分栏比例统一为 `1fr : 1.4fr`，确保首屏太极图与次屏表单区域在视觉宽度上完美对齐。
  - 标题精简，追求克制而有力的表达（如单行主标题）。
- **可访问性**：确保所有页面的文字对比度，特别是操作按钮（如“解锁高级解读”）和重要提示，背景色需与文字有明确区分。

## 本地无库兜底

- 当 `DATABASE_URL` 缺失、无效或 Prisma 不可用时，部分本地预览链路会退化到 `src/lib/temp-report-store.ts`
- 本地临时数据写入 `.local/temp-reports.json`
- Vercel 运行时自动改用系统临时目录，避免把 `.next/cache` 构建缓存打进 Serverless Functions
- 该兜底主要服务于本地预览和联调，不替代真实数据库、支付或 webhook 持久化

## 关键文件

- `src/components/home/HomePage.tsx`：首页落地页与表单（双屏架构）
- `src/app/chart/[id]/ChartDisplay.tsx`：命盘页主实现，集成了支付跳转与 Mock 逻辑兜底
- `src/app/result/[id]/ReportContent.tsx`：结果页主实现
- `src/components/LanguageSwitcher.tsx`：适配浅色主题的本地化切换器
- `src/lib/i18n/dictionaries.ts`：精简后的艺术化双语文案字典
- `src/lib/llm/index.ts`：中英文报告 prompt、摘要提取、输出稳定性校验与重试
- `tests/llm.test.ts`：LLM 输出合同与摘要提取的最小回归测试
- `tests/report-preferences.test.ts`：报告语言锁定与旧数据回退逻辑测试

## 开发与验证

在仓库根目录执行：

- `pnpm install`
- `pnpm dev`
- `pnpm exec tsc --noEmit`
- `pnpm test -- --run`
- `pnpm build`

## 文档约定

- `README.md`：产品与开发总览
- `PROJECT_INDEX.md`：结构索引与关键路径映射
- `AGENTS.md`：代理协作规范与仓库快照

## 当前注意事项

- **样式一致性**：修改任何页面背景或字体时，必须确保全站色调高度统一，避免出现突兀的色块断层。
- **布局对齐**：首页的响应式网格必须保持上下两屏的 `max-width` 和 `grid-cols` 比例完全同步。
- **支付逻辑**：`src/app/chart/[id]/ChartDisplay.tsx` 中的 `handleGetReading` 已包含 Mock 兜底逻辑，未配置密钥时会自动进入 AI 生成流程。
- **报告语言契约**：`src/lib/llm/index.ts` 要求英文输出必须以 `Core Identity:` 开头、中文输出必须以 `核心身份：` 开头，并使用固定的 6 个章节标题；改 prompt 时必须同步检查摘要提取与结果页展示。
- **报告语言锁定**：首次提交时的页面语言会写入报告偏好；之后 chart / success / result 页面与 AI 生成接口都必须以报告自带 locale 为准，不允许通过切换器或手改 URL 改语言。
- **年龄与地域中性**：报告必须按人生阶段调整重点；儿童/青少年不得强写成人议题，高龄用户要优先健康与守成。所有表达必须全球通用，禁止出现高考、SAT、编制、A-Level、GCSE 等地域制度词。
- 改支付链路时请同时检查：`src/app/api/checkout/route.ts`、`src/app/api/webhook/route.ts`、`src/lib/stripe/index.ts`
- 改命盘逻辑时请同时检查：`src/lib/solar-time/index.ts`、`src/lib/ziwei/wrapper.ts`、`tests/astrolabe.test.ts`
