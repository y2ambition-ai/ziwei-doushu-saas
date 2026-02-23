# 紫微斗数在线排盘 SaaS

在线紫微斗数排盘与 AI 命理解析服务。用户输入出生信息，系统生成传统命盘，并通过火山引擎豆包大模型生成个性化命理解读报告。

## 功能特性

- **传统命盘排盘**: 基于 `iztro` 引擎的精准紫微斗数排盘
- **真太阳时计算**: 根据经度自动校正出生时辰
- **AI 命理解读**: 豆包大模型生成 3500-4500 字专业报告
- **全球本地化**: 支持 12+ 国家/地区的教育、职业、货币术语
- **支付集成**: Stripe Checkout 安全支付
- **邮件发送**: Resend 自动发送报告链接

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 + React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + Lucide Icons |
| 排盘 | iztro |
| 大模型 | 火山引擎豆包 API |
| 支付 | Stripe |
| 邮件 | Resend |
| 数据库 | Prisma + PostgreSQL |

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local

# 初始化数据库
pnpm prisma generate
pnpm prisma db push

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

## 环境变量

复制 `.env.example` 到 `.env.local` 并填入真实值：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 |
| `STRIPE_SECRET_KEY` | Stripe 密钥 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 密钥 |
| `DOUBAO_API_KEY` | 火山引擎 API Key |
| `RESEND_API_KEY` | Resend 邮件 API Key |

## 项目结构

```
src/
├── app/              # Next.js App Router 页面
├── components/       # React 组件
├── lib/              # 核心库（排盘、LLM、支付）
└── instrumentation.ts # Sentry 初始化
```

## 部署

```bash
# 部署到 Vercel
vercel --prod
```

## 开发进度

- [x] Phase 1: 基础设施
- [x] Phase 2: 排盘引擎
- [x] Phase 3: LLM 集成
- [x] Phase 4: 前端
- [x] Phase 5: 支付 & 邮件
- [x] Phase 6: 生产部署
- [ ] 项目文档完善

## 许可证

私有项目
