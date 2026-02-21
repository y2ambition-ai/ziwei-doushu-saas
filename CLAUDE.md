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

**进度**: 22 / 25 功能完成 (88%)
**当前分支**: main
**生产地址**: https://ziwei-doushu-saas.vercel.app
**GitHub**: https://github.com/y2ambition-ai/ziwei-doushu-saas
**最后会话**: 2026-02-21 - 🎉 MVP 跑通！用户可填写表单并生成 AI 命理报告
**里程碑**: 最小可行产品已验证，核心流程跑通

### MVP 功能验证 ✅
- [x] 用户填写表单（邮箱、性别、生日、时辰、当前时间）
- [x] 系统计算经度并生成命盘
- [x] 豆包 API 生成 AI 命理解读
- [x] 展示完整报告页面
- [x] 24小时缓存机制
- [x] 进度显示（排盘→AI解读）

**下一步**:
1. 配置 Stripe 支付
2. 创建 Vercel Postgres 数据库
3. 优化报告页面设计

### 已完成功能

- ✅ Phase 1: 基础设施 (F001-F003)
  - Next.js 16 项目迁移
  - Prisma + SQLite 数据库
  - 开发环境脚本

- ✅ Phase 2: 核心引擎 (F004-F008)
  - 真太阳时计算
  - 城市经纬度数据库（改为时间输入法）
  - iztro 排盘引擎封装
  - 测试验证通过

- ✅ Phase 3: LLM 集成 (F009-F011)
  - 火山引擎豆包 API 集成
  - Prompt Engineering
  - 报告生成 API（完整命盘格式化）

- ✅ Phase 4: 前端 (F012-F013)
  - 落地页表单组件
  - 东方禅意 UI 迁移
  - 字段级验证 + 红色提示

- ✅ Phase 5: 支付 & 邮件 (F014-F019)
  - Stripe Checkout 集成
  - Stripe Webhook 处理
  - 报告结果页面
  - Resend 邮件服务

- ✅ Phase 6: 生产部署 (F020-F021)
  - 环境变量模板 (.env.example)
  - Vercel CLI 部署成功
  - vercel.json 配置

### 待完成功能

- ⏳ F022: 端到端测试
- ⏳ F023: 性能优化
- ⏳ F024: 错误监控与日志
- ⏳ F025: 项目文档完善

### 本会话新增

1. **iztro 库验证**: 确认数据完整，包含十二宫、长生12神、博士12神、三方四正等
2. **命盘格式化函数**: `formatAstrolabeForLLM()` 生成完整命盘文本发送给 LLM
3. **时间输入法**: 用"当前时间"替代"出生城市"计算经度，保护隐私
4. **表单验证优化**: 字段级红色提示 + 自动滚动定位
5. **Vercel 部署**: CLI 方式成功部署到生产环境

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
