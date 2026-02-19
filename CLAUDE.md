# 紫微斗数在线排盘 SaaS - Project Rules

## 项目概述

**产品定位**：在线紫微斗数排盘与 AI 命运解析服务
**商业模式**：单次付费 $1.99 USD
**核心卖点**：用火山引擎豆包大模型将排盘数据转化为通俗、有情绪价值的命运解析长文

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS + Lucide Icons
- **排盘引擎**: `iztro` (npm 包，非 zwds-assist)
- **大模型**: 火山引擎豆包 API (兼容 OpenAI SDK)
- **支付**: Stripe Checkout
- **邮件**: Resend
- **数据库**: Prisma + PostgreSQL (Vercel Postgres / Supabase)

## 目录结构

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 落地页
│   │   ├── result/[id]/        # 报告展示页
│   │   ├── api/
│   │   │   ├── checkout/       # Stripe Checkout
│   │   │   ├── webhook/        # Stripe Webhook
│   │   │   └── report/         # 报告生成 API
│   │   └── layout.tsx
│   ├── components/             # UI 组件
│   ├── lib/
│   │   ├── iztro/              # 排盘引擎封装
│   │   ├── solar-time/         # 真太阳时换算
│   │   ├── llm/                # 大模型调用
│   │   ├── stripe/             # Stripe 集成
│   │   └── email/              # Resend 邮件
│   └── types/                  # TypeScript 类型
├── prisma/
│   └── schema.prisma           # 数据库模型
├── tests/                      # 测试用例
├── CLAUDE.md                   # 本文件
├── feature_list.json           # 功能清单
└── init.sh                     # 开发环境启动脚本
```

## 核心命令

```bash
# 开发
pnpm dev

# 数据库
pnpm prisma generate
pnpm prisma db push
pnpm prisma studio

# 测试
pnpm test

# 构建
pnpm build
```

## Session 协议

每次会话必须遵循以下步骤：

1. **Get Bearings** - 阅读 CLAUDE.md 状态、git log
2. **Regression Test** - 运行 `./init.sh`，验证核心功能
3. **Pick ONE Feature** - 选择 feature_list.json 中最高优先级且 `passes: false` 的功能
4. **Implement + E2E Test** - 实现功能并进行端到端测试
5. **Mark Complete** - 只修改 `passes: false → true`
6. **Clean Exit** - git commit，更新 CLAUDE.md 状态

---

## 当前状态

**进度**: 0 / 25 功能完成
**当前分支**: feature-saas-architecture
**最后会话**: 项目初始化，PRD 分析完成
**下一步**: Phase 1 - 项目迁移至 Next.js

### 关键技术决策

1. **排盘引擎**: 使用 `iztro` 而非 `zwds-assist`
   - API: `astro.bySolar(date, hour, gender, isLeapMonth, locale)`
   - hour: 0-12 对应子时到亥时
   - 返回完整星盘 JSON

2. **真太阳时**: 需要根据出生地经度计算
   - 平太阳时 + 均时差 = 真太阳时
   - 影响时辰判断准确性

3. **LLM 数据清洗**: 不能全量投喂
   - 提取核心宫位数据（命宫、财帛、官禄、夫妻）
   - 提取主星、重要辅星、格局
   - 构建结构化 Prompt

### 测试基准数据（名人盘验证）

| 姓名 | 出生日期 | 命宫主星 | 备注 |
|------|----------|----------|------|
| 毛泽东 | 1893-12-26 辰时 | 紫微·贪狼 | 已验证 |
| 邓小平 | 1904-08-22 申时 | 太阳·巨门 | 已验证 |
| 马云 | 1964-09-10 卯时 | 天机·太阴 | 已验证 |
