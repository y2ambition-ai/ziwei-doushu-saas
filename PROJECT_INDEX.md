# 项目索引 - 紫微斗数在线排盘 SaaS

> 最后更新: 2026-02-23

## 快速导航

| 文件 | 用途 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | 项目规则 & 当前状态 |
| [feature_list.json](./feature_list.json) | 功能清单 (28/28 完成) |
| [package.json](./package.json) | 依赖配置 |
| [init.sh](./init.sh) | 开发环境启动脚本 |

## 目录结构

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 落地页（表单）
│   │   ├── layout.tsx          # 全局布局
│   │   ├── globals.css         # 全局样式
│   │   ├── chart/[id]/         # 命盘展示页
│   │   ├── result/[id]/        # AI 报告页
│   │   └── api/                # API 路由
│   │       ├── checkout/       # Stripe 支付
│   │       ├── webhook/        # Stripe 回调
│   │       └── report/         # 报告生成
│   │
│   ├── components/             # React 组件
│   │   ├── AstrolabeForm.tsx   # 表单组件
│   │   ├── BaguaBackground.tsx # 八卦背景
│   │   └── MiniChart.tsx       # 迷你命盘
│   │
│   └── lib/                    # 核心库
│       ├── db.ts               # Prisma 客户端
│       ├── llm/                # 豆包 AI 集成
│       ├── ziwei/              # 紫微排盘引擎
│       ├── solar-time/         # 真太阳时
│       ├── stripe/             # 支付集成
│       ├── location/           # 地理位置
│       └── monitoring/         # 错误监控 (Sentry)
│
├── prisma/
│   └── schema.prisma           # 数据库模型
│
├── tests/
│   └── astrolabe.test.ts       # 排盘测试
│
└── 配置文件
    ├── next.config.ts          # Next.js 配置
    ├── tsconfig.json           # TypeScript 配置
    ├── vercel.json             # 部署配置
    └── vitest.config.ts        # 测试配置
```

## 核心依赖

| 包名 | 用途 |
|------|------|
| `next` | 框架 (v16 App Router) |
| `react` | UI 库 (v19) |
| `iztro` | 紫微斗数排盘引擎 |
| `@prisma/client` | 数据库 ORM |
| `openai` | 豆包 API (兼容模式) |
| `stripe` | 支付处理 |
| `resend` | 邮件服务 |
| `tailwindcss` | 样式框架 |

## 环境变量

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 连接 |
| `DOUBAO_API_KEY` | ✅ | 豆包 API 密钥 |
| `DOUBAO_MODEL` | ✅ | 模型名称 |
| `STRIPE_SECRET_KEY` | ✅ | Stripe 密钥 |
| `RESEND_API_KEY` | ✅ | 邮件 API |
| `EMAIL_FROM` | ✅ | 发件人地址 |

## 常用命令

```bash
# 开发
pnpm dev

# 数据库
pnpm prisma generate
pnpm prisma db push

# 测试
pnpm test

# 构建
pnpm build

# 部署
vercel --prod
```

## 生产地址

- **网站**: https://ziwei-doushu-saas.vercel.app
- **GitHub**: https://github.com/y2ambition-ai/ziwei-doushu-saas
