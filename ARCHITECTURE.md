# 架构落地执行计划 (Step-by-Step Implementation Plan)

## 项目概述

将现有 Vite + React 静态前端升级为 **Next.js 16 全栈 SaaS**，实现紫微斗数排盘 + AI 解读服务。

---

## Phase 1: 基础设施搭建 (Infrastructure)

### Step 1.1: 创建 Next.js 16 项目

```bash
# 在当前目录的父级创建新项目
cd "D:\claude app\独立站-算命"
npx create-next-app@latest ziwei-saas --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 或者在当前目录重构
# 需要先备份现有代码
```

**关键配置**:
- App Router (必须)
- TypeScript
- Tailwind CSS
- ESLint

**迁移清单**:
- [ ] 复制 `src/app/components/` 中的组件
- [ ] 复制 `src/styles/` 中的样式
- [ ] 迁移 `tailwind.config.js`
- [ ] 迁移 `postcss.config.mjs`
- [ ] 更新 import 路径

### Step 1.2: 配置 Prisma + PostgreSQL

**Schema 设计**:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  orders    Order[]
}

model Order {
  id           String   @id @default(cuid())
  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id])
  stripeSessionId String @unique
  status       OrderStatus @default(pending)
  amount       Float
  createdAt    DateTime @default(now())
  paidAt       DateTime?
  report       Report?
}

model Report {
  id           String   @id @default(cuid())
  orderId      String   @unique
  order        Order    @relation(fields: [orderId], references: [id])

  // 用户输入
  email        String
  gender       String   // "male" | "female"
  birthDate    String   // YYYY-MM-DD
  birthTime    Int      // 0-11 对应十二时辰
  birthCity    String
  longitude    Float    // 经度
  latitude     Float    // 纬度
  trueSolarTime String? // 真太阳时计算结果

  // 排盘数据
  rawAstrolabe Json?    // iztro 原始输出
  parsedData   Json?    // 解析后的核心数据

  // AI 生成
  aiReport     String?  // Markdown 格式的 AI 解读
  coreIdentity String?  // 核心身份卡片，如 "命宫主星：紫微·七杀"

  createdAt    DateTime @default(now())
  completedAt  DateTime?
}

enum OrderStatus {
  pending
  paid
  failed
  refunded
}
```

### Step 1.3: 创建开发环境脚本

已创建 `init.sh`，确保：
- Node.js 18+ 检查
- pnpm 安装
- 依赖安装
- 环境变量检查
- Prisma 迁移
- 开发服务器启动

---

## Phase 2: 核心引擎开发 (Core Engine)

### Step 2.1: 真太阳时换算模块

**技术方案**:

```typescript
// src/lib/solar-time/index.ts

interface SolarTimeResult {
  trueSolarTime: Date;
  shichen: number; // 0-11 对应子-亥
  shichenName: string;
  adjustment: number; // 分钟数的调整
}

/**
 * 计算真太阳时
 * @param localTime 本地时间 (Date)
 * @param longitude 经度 (东经为正)
 */
export function calculateTrueSolarTime(
  localTime: Date,
  longitude: number
): SolarTimeResult {
  // 1. 计算平太阳时 (根据经度调整)
  // 北京时间 = UTC+8 = 东经120°
  // 每度经度差 = 4分钟
  const longitudeOffset = (longitude - 120) * 4; // 分钟

  // 2. 计算均时差 (Equation of Time)
  const eot = calculateEquationOfTime(localTime);

  // 3. 真太阳时 = 平太阳时 + 均时差
  const totalOffset = longitudeOffset + eot;

  // 4. 计算真太阳时对应的 Date
  const trueSolarTime = new Date(localTime.getTime() + totalOffset * 60 * 1000);

  // 5. 确定时辰
  const hour = trueSolarTime.getHours();
  const shichen = Math.floor((hour + 1) / 2) % 12;

  return {
    trueSolarTime,
    shichen,
    shichenName: SHICHEN_NAMES[shichen],
    adjustment: totalOffset
  };
}

/**
 * 均时差计算 (基于 NOAA 算法)
 * 返回分钟数
 */
function calculateEquationOfTime(date: Date): number {
  const dayOfYear = getDayOfYear(date);
  const b = 2 * Math.PI * (dayOfYear - 81) / 365;

  // 均时差公式 (分钟)
  const eot = 9.87 * Math.sin(2 * b)
            - 7.53 * Math.cos(b)
            - 1.5 * Math.sin(b);

  return eot;
}
```

### Step 2.2: 城市经纬度数据库

**数据结构**:

```typescript
// src/lib/location/cities.ts

export interface City {
  name: string;
  province: string;
  longitude: number;
  latitude: number;
}

// 数据来源：中国主要城市经纬度
export const CITIES: City[] = [
  { name: "北京", province: "北京", longitude: 116.4074, latitude: 39.9042 },
  { name: "上海", province: "上海", longitude: 121.4737, latitude: 31.2304 },
  { name: "广州", province: "广东", longitude: 113.2644, latitude: 23.1291 },
  // ... 约 300 个城市
];

export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase();
  return CITIES.filter(city =>
    city.name.includes(query) ||
    city.province.includes(query)
  );
}
```

### Step 2.3: iztro 排盘引擎封装

**Wrapper Service**:

```typescript
// src/lib/iztro/wrapper.ts

import { astro } from 'iztro';
import { calculateTrueSolarTime } from '../solar-time';

export interface AstrolabeInput {
  birthDate: string;  // YYYY-MM-DD
  birthTime: number;  // 0-23 小时
  birthMinute: number; // 0-59
  gender: 'male' | 'female';
  longitude: number;
}

export interface ParsedAstrolabe {
  // 核心信息
  mingGong: PalaceData;  // 命宫
  shenGong: PalaceData;  // 身宫
  wuXingJu: string;      // 五行局
  siZhu: SiZhuData;      // 四柱

  // 十二宫数据
  palaces: PalaceData[];

  // 格局判断
  patterns: string[];
}

export interface PalaceData {
  name: string;          // 宫位名称
  earthlyBranch: string; // 地支
  majorStars: string[];  // 主星
  minorStars: string[];  // 辅星
  mutagen: string[];     // 四化
  isEmpty: boolean;      // 是否空宫
}

export function generateAstrolabe(input: AstrolabeInput) {
  // 1. 计算真太阳时
  const localTime = new Date(`${input.birthDate}T${input.birthTime}:${input.birthMinute}:00`);
  const solarResult = calculateTrueSolarTime(localTime, input.longitude);

  // 2. 调用 iztro
  const gender = input.gender === 'male' ? '男' : '女';
  const astrolabe = astro.bySolar(
    input.birthDate,
    solarResult.shichen,
    gender,
    true,
    'zh-CN'
  );

  // 3. 解析并返回
  return {
    raw: astrolabe,
    parsed: parseAstrolabe(astrolabe),
    solarTime: solarResult
  };
}

function parseAstrolabe(raw: any): ParsedAstrolabe {
  // 提取核心数据，简化结构
  // ...
}
```

### Step 2.4: 测试验证

**测试用例**:

```typescript
// tests/astrolabe.test.ts

import { generateAstrolabe } from '../src/lib/iztro/wrapper';

describe('iztro 排盘验证', () => {
  // 毛泽东：1893-12-26 辰时，男，湖南韶山 (112.5260, 27.9150)
  test('毛泽东命盘', () => {
    const result = generateAstrolabe({
      birthDate: '1893-12-26',
      birthTime: 8,
      birthMinute: 0,
      gender: 'male',
      longitude: 112.5260
    });

    expect(result.parsed.mingGong.majorStars).toContain('紫微');
    expect(result.parsed.mingGong.majorStars).toContain('贪狼');
  });

  // 马云：1964-09-10 卯时，男，杭州 (120.1551, 30.2741)
  test('马云命盘', () => {
    const result = generateAstrolabe({
      birthDate: '1964-09-10',
      birthTime: 6,
      birthMinute: 0,
      gender: 'male',
      longitude: 120.1551
    });

    expect(result.parsed.mingGong.majorStars).toContain('天机');
    expect(result.parsed.mingGong.majorStars).toContain('太阴');
  });
});
```

---

## Phase 3: LLM 集成

### Step 3.1: 火山引擎豆包 API 集成

```typescript
// src/lib/llm/doubao.ts

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

export async function generateReport(
  parsedAstrolabe: ParsedAstrolabe,
  customerName: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(parsedAstrolabe, customerName);

  const response = await client.chat.completions.create({
    model: process.env.DOUBAO_MODEL_ID || 'doubao-pro-32k',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    stream: false,
  });

  return response.choices[0].message.content || '';
}

function buildSystemPrompt(): string {
  return `你是一位精通紫微斗数、具备心理学背景的现代命理师。
你的解读风格温暖、正向，避免宿命论的恐吓，而是以启发和指引为主。

你的任务是将复杂的星盘数据转化为普通人能理解的人生洞察。

输出要求：
1. 使用 Markdown 格式
2. 分为以下几个部分：
   - 核心身份（一句话概括命宫特质）
   - 天赋与优势
   - 事业与财运
   - 感情与人际
   - 人生建议
3. 语气亲切，像一位智者在和朋友聊天
4. 避免绝对性表述，多用"可能"、"倾向"、"有机会"等
5. 总长度 800-1200 字`;
}

function buildUserPrompt(data: ParsedAstrolabe, name: string): string {
  return `请为 ${name} 解读以下紫微斗数星盘：

## 命宫信息
- 主星：${data.mingGong.majorStars.join('、')}
- 辅星：${data.mingGong.minorStars.join('、') || '无'}
- 四化：${data.mingGong.mutagen.join('、') || '无'}
- 地支：${data.mingGong.earthlyBranch}

## 五行局
${data.wuXingJu}

## 四柱
年柱：${data.siZhu.year}
月柱：${data.siZhu.month}
日柱：${data.siZhu.day}
时柱：${data.siZhu.hour}

## 格局
${data.patterns.length > 0 ? data.patterns.join('、') : '暂无特殊格局'}

请给出完整的人生解读。`;
}
```

---

## Phase 4: 前端开发

### Step 4.1: 落地页表单

```typescript
// src/app/page.tsx

// 继承现有设计，增加：
// - 城市选择器 (带自动补全)
// - 日期选择器
// - 时辰选择器

// 表单提交后直接跳转 Stripe Checkout
```

### Step 4.2: 报告页面

```typescript
// src/app/result/[id]/page.tsx

// 显示：
// 1. 核心身份卡片
// 2. Markdown 渲染的 AI 解读
// 3. 分享按钮
// 4. 重新测算入口
```

---

## Phase 5: 支付与邮件

### Step 5.1: Stripe Checkout

```typescript
// src/app/api/checkout/route.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { email, gender, birthDate, birthTime, birthCity, longitude } = await req.json();

  // 创建 Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: '紫微斗数命盘解读',
          description: '个人专属 AI 命理分析报告',
        },
        unit_amount: 199, // $1.99
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/processing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
    metadata: {
      email,
      gender,
      birthDate,
      birthTime: birthTime.toString(),
      birthCity,
      longitude: longitude.toString(),
    },
  });

  // 创建待支付订单
  // ...

  return Response.json({ url: session.url });
}
```

### Step 5.2: Webhook 处理

```typescript
// src/app/api/webhook/route.ts

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook Error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // 1. 更新订单状态
    // 2. 触发报告生成 (异步)
    // 3. 发送邮件
  }

  return new Response('OK');
}
```

### Step 5.3: Resend 邮件

```typescript
// src/lib/email/resend.ts

import Resend from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReportEmail(
  to: string,
  reportId: string,
  coreIdentity: string
) {
  await resend.emails.send({
    from: '天命玄机 <noreply@tianmingxuanji.com>',
    to,
    subject: '您的紫微斗数命盘解读报告',
    html: `
      <h1>您的专属命盘解读已完成</h1>
      <p>核心身份：${coreIdentity}</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/result/${reportId}">
        查看完整报告
      </a>
    `,
  });
}
```

---

## Phase 6: 生产部署

### 6.1 环境变量清单

```env
# .env.example

# 数据库
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# 火山引擎豆包
DOUBAO_API_KEY="..."
DOUBAO_MODEL_ID="doubao-pro-32k"

# Resend
RESEND_API_KEY="re_..."

# 应用
NEXT_PUBLIC_URL="https://your-domain.com"
```

### 6.2 Vercel 部署配置

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["hkg1"],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

---

## 风险与注意事项

1. **排盘准确性**: 必须使用名人命盘验证，确保 iztro 输出正确
2. **真太阳时**: 经纬度数据必须准确，否则时辰会出错
3. **支付安全**: Webhook 必须验证签名
4. **LLM 输出**: 需要控制输出格式，避免幻觉
5. **成本控制**: 豆包 API 按调用计费，需要监控

---

## 下一步行动

1. **立即**: 执行 Phase 1，迁移至 Next.js
2. **本周**: 完成 Phase 2，核心引擎开发
3. **下周**: 完成 Phase 3-4，LLM 集成和前端
4. **第三周**: 完成 Phase 5-6，支付部署

准备好了吗？我们可以从 **F001: 项目迁移至 Next.js 16** 开始。
