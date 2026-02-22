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

**进度**: 27 / 28 功能完成 (96%)
**当前分支**: main
**生产地址**: https://ziwei-doushu-saas.vercel.app
**GitHub**: https://github.com/y2ambition-ai/ziwei-doushu-saas
**最后会话**: 2026-02-22 23:40 - ✅ 报告页命盘数据修复 + 打印格式优化 + 豆包提示词优化
**里程碑**: 最小可行产品已验证，生产环境正常运行

### MVP 功能验证 ✅
- [x] 用户填写表单（邮箱、性别、生日、时辰、出生地时间）
- [x] 系统计算经度并生成命盘
- [x] 豆包 API 生成 AI 命理解读
- [x] 展示完整报告页面
- [x] 24小时缓存机制
- [x] 进度显示（排盘→AI解读）
- [x] **命盘展示页面** - 传统12宫格布局，温暖金色系配色
- [x] **7天免费复用** - 同一邮箱+相同参数，7天内免费查看AI解读
- [x] **A4打印格式** - 命盘页面支持单页A4打印
- [x] **年份范围** - 1950-2026
- [x] **报告页命盘修复** - 修复 rawAstrolabe JSON 解析问题
- [x] **打印格式优化** - 命盘单独一页，AI报告分页优化
- [x] **豆包提示词优化** - "智者大师"风格，专业+通俗

**下一步**:
1. 倒计时改回5分钟（已记录待处理）
2. 完善 Stripe 支付流程
3. 移动端适配优化

### 本会话新增 (2026-02-22 晚)

1. **报告页命盘数据修复**: `result/[id]/page.tsx`
   - 问题：rawAstrolabe 是字符串，但直接类型断言为对象
   - 修复：添加 `JSON.parse(report.rawAstrolabe)` 解析
   - 与 `chart/[id]/page.tsx` 保持一致

2. **删除冗余按钮**: 报告页面删除"查看完整命盘"按钮
   - 理由：报告页已显示命盘，无需跳转

3. **打印格式优化** (`globals.css`):
   - 命盘单独一页：`.print-chart-container` + `page-break-after: always`
   - AI报告分页：`.print-section` 避免章节中间断开
   - A4优化：15mm页边距，11px字体
   - 表格/列表优化：`page-break-inside: avoid`

4. **豆包提示词优化** (`lib/llm/index.ts`):
   - 风格：从"技术分析师"改为"智者大师"
   - 结构：12部分精简为8核心部分
   - 平衡：专业术语 + "→ 这意味着..."通俗解释
   - 具体：避免"事业有发展"，改为"2026年8月后有升职机会"
   - 字数：3500-4500字

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

- ✅ Phase 6: 生产部署 (F020-F023)
  - 环境变量模板 (.env.example)
  - Vercel CLI 部署成功
  - vercel.json 配置
  - 端到端测试通过

### 待完成功能

- ⏳ F024: 性能优化
- ⏳ F025: 错误监控与日志
- ⏳ F026: 项目文档完善

### 本会话新增 (2026-02-21 晚)

1. **四柱数据修复**: 从 `chineseDate` 字段正确获取四柱
   - iztro 返回格式: `"庚午 壬午 辛亥 甲午"`
   - 修复 `RawAstrolabe` 类型定义
   - 添加 `chineseDate` 字段支持

2. **八卦符号改进**: 绘制真正的八卦三爻符号
   - 阳爻（实线）+ 阴爻（断线）
   - 后天八卦顺序排列

3. **配色方案优化**: 从深黑色改为温暖金色系
   - 中心方块: `#FDF8F0` 米金色渐变
   - 强调色: `#8B4513` 深褐色
   - 按钮: 深褐色 `#8B4513`
   - CTA 区域: 米金色背景 + 金色边框

4. **文案优化**:
   - 命盘页面 CTA: 强调"30余位道教大师"知识库
   - 首页时间字段: "出生地现在几点？" + 红色特别提醒
   - 免责声明: 单行显示

### 上次会话 (2026-02-21 下午)

1. **命盘展示页面 `/chart/[id]`**: 新增独立排盘展示页面
   - 传统12宫格布局（巳午未申、辰酉、卯戌、寅丑子亥）
   - SVG 装饰元素：太极图、八卦环、云纹
   - 中心旋转太极动画（8秒一圈）

2. **宫位信息增强**: 每个宫位显示详细数据
   - 主星（红色）+ 辅星（黑色）+ 杂耀（浅色）
   - 大限年龄范围（右上角红色）
   - 长生12神、博士12神、将前12神、岁前12神
   - 小限年龄列表

3. **AI 报告按需生成**: `/api/report/ai-generate`
   - 表单提交后先跳转到命盘页面
   - 用户可选择是否获取 AI 解读
   - AI 报告自动发送到邮箱（Resend）

4. **Bug 修复**:
   - 修复出生时辰转换（0-23 转 0-11 时辰索引）
   - 修复生肖/星座显示（iztro 字段映射）
   - 新增西方星座计算函数 `getWesternZodiac()`

5. **UI 优化**:
   - 删除四柱八字框式显示，改为简洁文本
   - 新增星座字段
   - 基本信息卡片布局优化（6列+4列）

### 关键文件变更

| 文件 | 变更 |
|------|------|
| `src/app/chart/[id]/page.tsx` | 新增：命盘页面服务端组件 |
| `src/app/chart/[id]/ChartDisplay.tsx` | 新增：命盘展示客户端组件 |
| `src/app/api/report/ai-generate/route.ts` | 新增：AI 报告按需生成 API |
| `src/app/page.tsx` | 修改：表单提交后跳转到命盘页面 |
| `src/app/api/report/generate/route.ts` | 修改：跳过豆包 API，只生成排盘 |
| `src/app/result/[id]/ReportContent.tsx` | 修改：增加邮件发送状态显示 |

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
