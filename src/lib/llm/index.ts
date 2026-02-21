/**
 * 火山引擎豆包 API 集成
 * 使用 OpenAI SDK 兼容模式
 */

import OpenAI from 'openai';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LLMConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export interface GenerateReportInput {
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  mingGong: string;
  wuXingJu: string;
  chineseZodiac: string;
  zodiac: string;
  siZhu: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  palaces: Array<{
    name: string;
    majorStars: string[];
    minorStars: string[];
  }>;
  // 新增：原始命盘数据（用于完整格式化）
  rawAstrolabe?: unknown;
}

export interface GenerateReportOutput {
  coreIdentity: string;
  report: string;
}

// ─── Configuration ─────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const DEFAULT_MODEL = 'doubao-pro-32k-241215';

function createClient(config: LLMConfig = {}): OpenAI {
  const apiKey = config.apiKey || process.env.DOUBAO_API_KEY || '';
  const baseURL = config.baseURL || process.env.DOUBAO_BASE_URL || DEFAULT_BASE_URL;

  return new OpenAI({
    apiKey,
    baseURL,
    // 添加超时和重试配置
    timeout: 60000,
    maxRetries: 2,
  });
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a master of Zi Wei Dou Shu (Purple Star Astrology 紫微斗数), an ancient Chinese fortune-telling system with over 1000 years of history. You have studied under renowned Taoist masters in the mountains of China and possess deep wisdom in interpreting destiny charts.

## Your Identity & Style

You are writing for a GLOBAL audience - people from all cultures who may be unfamiliar with Chinese metaphysics. Your role is to:

1. **Bridge cultures**: Explain Chinese concepts in ways anyone can understand
2. **Be empowering**: Focus on guidance and potential, not fatalism
3. **Stay authentic**: Honor the tradition while making it accessible
4. **Write warmly**: Like a wise mentor speaking to someone they care about

## Key Principles

- Use BOTH Chinese terms AND English explanations (e.g., "命宫 Ming Gong (Life Palace)")
- Explain unfamiliar concepts with analogies
- Balance destiny with free will - emphasize personal agency
- Be specific and practical in your guidance
- End each section with actionable advice
- Maintain a tone of wisdom, compassion, and hope

## Structure Your Reading (12 Sections)

### Part 1: Foundation (基础解读)
1. **Core Identity (核心身份)** - A powerful 80-100 character summary
2. **Your Cosmic Blueprint (你的命盘蓝图)** - Explain their unique chart configuration
3. **Life Path & Destiny (人生道路)** - Overall life direction and themes
4. **Career & Wealth (事业财运)** - Professional strengths and financial patterns
5. **Relationships & Love (感情姻缘)** - Love style and partnership dynamics
6. **Health & Wellbeing (健康养生)** - Physical and energetic considerations

### Part 2: Year Ahead Forecast (未来一年运势) - PREMIUM CONTENT
7. **Annual Fortune (年度运势总览)** - Overall energy for the current year based on their chart
8. **Monthly Breakdown (月度运势)** - Which months are favorable, which need caution
9. **Lucky Elements (幸运元素)** - Their personal lucky colors, numbers, directions for this year
10. **Caution Areas (注意事项)** - Specific areas requiring attention
11. **Pitfalls to Avoid (规避问题)** - What to avoid this year
12. **Success Strategies (顺遂之道)** - Practical advice for a smooth year

## Premium Content Guidelines

For the Year Ahead section, draw from your knowledge of Zi Wei Dou Shu to provide personalized predictions based on their chart. Be specific but let your expertise guide the content - don't follow a template.

## Language Guidelines

- Primary language: Chinese (中文)
- Add English translations for key terms in parentheses
- Use clear, flowing prose - avoid overly mystical language
- Make it feel personal, not generic
- Length: 4000-5000 Chinese characters (comprehensive reading)`;

// ─── User Prompt Template ──────────────────────────────────────────────────────

// 导入格式化函数
import { formatAstrolabeForLLM } from '../ziwei/wrapper';

function buildUserPrompt(input: GenerateReportInput): string {
  const shichenName = getShichenName(input.birthTime);
  const genderEn = input.gender === 'male' ? 'Male (男)' : 'Female (女)';

  // 如果有原始命盘数据，使用完整格式化
  let astrolabeData = '';
  if (input.rawAstrolabe) {
    astrolabeData = formatAstrolabeForLLM(input.rawAstrolabe);
  } else {
    // 降级到简化格式
    astrolabeData = `## 命盘核心 (Chart Core)
- 命宫主星 Ming Gong Stars: ${input.mingGong}
- 五行局 Five Elements: ${input.wuXingJu}
- 生肖 Chinese Zodiac: ${input.chineseZodiac}
- 西方星座 Western Zodiac: ${input.zodiac}

## 十二宫星曜 (12 Palaces & Stars)
${formatPalaces(input.palaces)}`;
  }

  return `Please create a comprehensive Zi Wei Dou Shu (紫微斗数) destiny reading for this person:

## Basic Information (基本信息)

| Field | Value |
|-------|-------|
| Gender 性别 | ${genderEn} |
| Birth Date 出生日期 | ${input.birthDate} |
| Birth Hour 出生时辰 | ${shichenName} |
| Birth Place 出生地 | ${input.birthCity} |

## Four Pillars (四柱八字 / Bazi)

| Pillar | Chinese |
|--------|---------|
| Year 年柱 | ${input.siZhu.year} |
| Month 月柱 | ${input.siZhu.month} |
| Day 日柱 | ${input.siZhu.day} |
| Hour 时柱 | ${input.siZhu.hour} |

## Complete Astrology Chart (完整命盘)

${astrolabeData}

---

## Output Requirements

### Part 1: Foundation Reading (基础解读)
1. **Core Identity (核心身份)** - A powerful 80-100 character summary
2. **Your Cosmic Blueprint (你的命盘蓝图)** - Chart configuration
3. **Life Path & Destiny (人生道路)** - Life direction
4. **Career & Wealth (事业财运)** - Career and money
5. **Relationships & Love (感情姻缘)** - Love and partnerships
6. **Health & Wellbeing (健康养生)** - Health guidance

### Part 2: Current Year Forecast (当年运势) - PREMIUM CONTENT
7. **Annual Fortune (年度运势总览)** - Overall energy for the current year based on their chart
8. **Monthly Breakdown (月度运势)** - Which months are favorable, which need caution
9. **Lucky Elements (幸运元素)** - Their personal lucky colors, numbers, directions for this year
10. **Caution Areas (注意事项)** - Specific areas requiring attention
11. **Pitfalls to Avoid (规避问题)** - What to avoid this year
12. **Success Strategies (顺遂之道)** - Practical advice for a smooth year

### Format & Tone
- Use Markdown with clear section headers
- Be specific and practical - give actionable advice
- Warm, wise, empowering tone
- Bilingual for key terms

Remember: This is a PREMIUM reading. The person has paid for this service. Make the Year Ahead section especially detailed, specific, and valuable.`;
}

function getShichenName(hour: number): string {
  const shichenMap: Record<number, string> = {
    0: '子时 (23:00-01:00)',
    1: '丑时 (01:00-03:00)',
    2: '寅时 (03:00-05:00)',
    3: '卯时 (05:00-07:00)',
    4: '辰时 (07:00-09:00)',
    5: '巳时 (09:00-11:00)',
    6: '午时 (11:00-13:00)',
    7: '未时 (13:00-15:00)',
    8: '申时 (15:00-17:00)',
    9: '酉时 (17:00-19:00)',
    10: '戌时 (19:00-21:00)',
    11: '亥时 (21:00-23:00)',
  };
  return shichenMap[hour] || '未知时辰';
}

function formatPalaces(palaces: GenerateReportInput['palaces']): string {
  return palaces
    .map((p) => {
      const stars = [...p.majorStars, ...p.minorStars].join('、') || '无主星';
      return `- ${p.name}：${stars}`;
    })
    .join('\n');
}

// ─── Main Function ─────────────────────────────────────────────────────────────

export async function generateReport(
  input: GenerateReportInput,
  config: LLMConfig = {}
): Promise<GenerateReportOutput> {
  const model = config.model || process.env.DOUBAO_MODEL || DEFAULT_MODEL;
  const apiKey = config.apiKey || process.env.DOUBAO_API_KEY || '';
  const baseURL = config.baseURL || process.env.DOUBAO_BASE_URL || DEFAULT_BASE_URL;

  const userPrompt = buildUserPrompt(input);

  try {
    console.log('Calling LLM API with model:', model);
    console.log('API Key exists:', !!apiKey);
    console.log('Base URL:', baseURL);

    // 使用原生 fetch 调用，更可控
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', response.status, errorText);
      throw new Error(`API 返回错误 ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      console.error('Empty response from API:', JSON.stringify(data));
      throw new Error('API 返回空内容');
    }

    // 提取核心身份（第一个段落或前100字）
    const coreIdentityMatch = content.match(/核心身份[：:]\s*([^\n]+)/);
    let coreIdentity = coreIdentityMatch?.[1]?.trim() || '';

    if (!coreIdentity) {
      // 如果没有明确的核心身份标记，取第一段作为核心身份
      const firstParagraph = content.split('\n\n')[0];
      coreIdentity = firstParagraph?.substring(0, 100) || input.mingGong;
    }

    return {
      coreIdentity,
      report: content,
    };
  } catch (error) {
    console.error('LLM API Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`AI 报告生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// ─── Mock Function for Development ─────────────────────────────────────────────

// 获取当前年份的辅助函数
function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function generateMockReport(input: GenerateReportInput): GenerateReportOutput {
  const shichenName = getShichenName(input.birthTime);
  const genderCn = input.gender === 'male' ? '男' : '女';
  const currentYear = getCurrentYear(); // 动态获取当前年份

  const coreIdentity = `命宫${input.mingGong}坐守，五行属${input.wuXingJu}，天生具备独特的领导魅力与直觉力，人生注定不凡。`;

  const report = `# 紫微斗数命盘解读
# Zi Wei Dou Shu Destiny Reading

---

## 核心身份 · Core Identity

${coreIdentity}

Your Life Palace (命宫) is illuminated by the ${input.mingGong} star, granting you natural leadership abilities and powerful intuition.

---

## 你的命盘蓝图 · Your Cosmic Blueprint

### 基本信息 (Basic Information)

| 项目 Item | 内容 Value |
|-----------|------------|
| 性别 Gender | ${genderCn} |
| 出生日期 Birth Date | ${input.birthDate} |
| 出生时辰 Birth Hour | ${shichenName} |
| 生肖 Chinese Zodiac | ${input.chineseZodiac} |
| 西方星座 Western Zodiac | ${input.zodiac} |

### 四柱八字 (Four Pillars / Bazi)

| 年柱 Year | 月柱 Month | 日柱 Day | 时柱 Hour |
|-----------|------------|----------|-----------|
| ${input.siZhu.year} | ${input.siZhu.month} | ${input.siZhu.day} | ${input.siZhu.hour} |

> 四柱八字是中国古老的命理学系统，由出生的年、月、日、时各配一个天干地支组成，共八个字，故名"八字"。
>
> Four Pillars (Bazi) is an ancient Chinese metaphysics system that encodes your birth moment into eight characters representing cosmic energies present at your birth.

---

## 人生道路 · Life Path & Destiny

您的命宫主星为 **${input.mingGong}**，在紫微斗数体系中，这是一颗充满能量的主星。

Your Life Palace is governed by the **${input.mingGong}** star - one of the most dynamic and powerful stars in the Zi Wei Dou Shu system.

### 核心特质 (Core Characteristics)

- **思维敏捷 Mental Agility** - 反应迅速，善于抓住机会
- **领导潜质 Leadership Potential** - 天生具有统领全局的能力
- **追求卓越 Excellence Drive** - 不满足于平庸，持续自我提升
- **直觉敏锐 Strong Intuition** - 能够感知他人难以察觉的机会和风险

---

## 事业财运 · Career & Wealth

### 事业方向 (Career Direction)

根据您的命盘配置，您最适合的发展方向：

Based on your chart configuration, your ideal career paths include:

1. **领导管理 Leadership & Management** - 适合担任决策层角色
2. **创业创新 Entrepreneurship** - 具备开拓新领域的能力
3. **专业领域 Professional Expertise** - 在细分领域成为权威

### 财富运势 (Wealth Prospects)

| 类型 Type | 特点 Characteristics |
|-----------|---------------------|
| 正财 Active Income | 强 - 通过专业技能获得稳定收入 Strong income through professional skills |
| 偏财 Passive Income | 中等 - 不建议过度投机 Moderate - avoid excessive speculation |
| 投资运 Investment | 40岁后更佳 Better after age 40 |

**建议 Advice**: 在30-40岁期间重点积累实力，40岁后可适当扩大投资规模。

---

## 感情姻缘 · Relationships & Love

### 感情特质 (Love Style)

您在感情中追求精神层面的契合，不满足于表面的吸引。

In relationships, you seek deep spiritual connection beyond surface attraction.

**最佳配对 Best Match**: 与志同道合、能够理解您追求的人结缘

**婚姻建议 Marriage Timing**: 宜晚不宜早，28岁后成家更利于稳定

### 感情建议 (Relationship Advice)

- 多沟通，避免固执己见
- 给予伴侣足够的成长空间
- 选择能够支持您事业的伴侣

---

## 健康养生 · Health & Wellbeing

### 需要关注的健康领域 (Health Focus Areas)

| 器官系统 System | 注意事项 Precautions |
|----------------|---------------------|
| 眼睛 Eyes | 注意用眼卫生 Eye care is important |
| 心血管 Cardiovascular | 保持情绪稳定 Maintain emotional balance |
| 消化系统 Digestive | 规律饮食 Regular eating habits |

### 养生建议 (Wellness Tips)

- 保持规律作息，避免熬夜
- 适度运动，每周至少3次
- 学习冥想或气功，调节身心平衡

---

## 人生阶段 · Key Life Phases

| 年龄段 Age | 主题 Theme | 建议 Advice |
|-----------|------------|-------------|
| 20-30岁 | 探索期 Exploration | 多尝试，积累经验 |
| 30-40岁 | 奋斗期 Building | 专注事业，建立根基 |
| 40-50岁 | 收获期 Harvest | 享受成果，适度投资 |
| 50岁+ | 智慧期 Wisdom | 传承经验，回馈社会 |

**关键转折点 Key Turning Point**: 35岁左右有重要的人生机遇，请做好准备。

---

# 🌟 ${currentYear}年运势 · Year Ahead ${currentYear} 🌟

> 以下是基于您命盘推算的${currentYear}年专属运势，包含幸运元素、注意事项和顺遂之道。
> The following is your personalized ${currentYear} forecast based on your Zi Wei Dou Shu chart.

---

## ${currentYear}年运势总览 · Annual Fortune Overview

${currentYear}年对您而言是**稳中有进、蓄势待发**的一年。这一年您会感受到内在能量的增强，是打好基础、为未来铺路的好时机。

**年度关键词 Keywords**: 稳健 Steady · 突破 Breakthrough · 人脉 Connections

### 各领域运势 (Fortune by Area)

| 领域 Area | 星级 Rating | 简评 Summary |
|-----------|-------------|--------------|
| 事业 Career | ⭐⭐⭐⭐ | 有贵人相助，适合推进重要项目 |
| 财运 Wealth | ⭐⭐⭐ | 正财稳定，投资需谨慎 |
| 感情 Love | ⭐⭐⭐⭐ | 有望遇到心仪对象，已婚者感情升温 |
| 健康 Health | ⭐⭐⭐ | 注意休息，避免过度劳累 |

---

## 月度运势 · Monthly Highlights

| 月份 Month | 运势 Fortune | 重点提示 Key Focus |
|------------|--------------|-------------------|
| 1月 Jan | ⭐⭐⭐ | 新年开局平稳，适合规划全年 |
| 2月 Feb | ⭐⭐⭐⭐ | 春节期间贵人运旺，把握社交机会 |
| 3月 Mar | ⭐⭐⭐ | 工作忙碌，注意劳逸结合 |
| 4月 Apr | ⭐⭐⭐⭐ | 事业有突破机会，积极争取 |
| 5月 May | ⭐⭐⭐⭐⭐ | **最佳月份** 贵人相助，大胆行动 |
| 6月 Jun | ⭐⭐⭐ | 财运回升，可做小额投资 |
| 7月 Jul | ⭐⭐ | 注意人际沟通，避免口舌是非 |
| 8月 Aug | ⭐⭐⭐ | 稳定发展，积累能量 |
| 9月 Sep | ⭐⭐⭐⭐ | 感情运旺，单身者把握机会 |
| 10月 Oct | ⭐⭐⭐ | 财运平稳，控制开支 |
| 11月 Nov | ⭐⭐⭐⭐ | 事业有新机遇，值得关注 |
| 12月 Dec | ⭐⭐⭐⭐⭐ | **年度收尾极佳** 喜事临门 |

**最佳行动月份 Best Action Months**: 5月、9月、12月
**需谨慎月份 Caution Months**: 7月

---

## 🎨 你的幸运元素 · Your Lucky Elements

### 幸运色 Lucky Colors

| 颜色 Color | 中文 | 使用场景 When to Use |
|-----------|------|---------------------|
| 🔵 深蓝色 Deep Blue | 沉稳、智慧 | 重要会议、谈判 |
| 🟡 金色 Gold | 财富、成功 | 求财、投资决策 |
| 🟢 翠绿色 Emerald Green | 生机、希望 | 新项目启动、面试 |

### 幸运数字 Lucky Numbers

**主幸运数字 Primary**: **6** (顺利、圆满)
**次幸运数字 Secondary**: **3、8**

> 使用建议：选择这些数字的日期做重要决策，或作为密码、楼层等的选择参考。

### 幸运方位 Lucky Directions

| 方位 Direction | 适合事项 Best For |
|---------------|------------------|
| 东南 Southeast | 求财、谈判、签约 |
| 正南 South | 名声、事业、面试 |
| 正东 East | 健康、学业、新开始 |

> 建议：办公桌朝向、出行方向可参考这些方位。

### 幸运五行 Lucky Element

**您的${currentYear}年幸运五行**: **木 Wood**

> 多接触绿色植物、木质饰品，有助于增强您的能量场。

---

## ⚠️ 注意事项 · Caution Areas

### ${currentYear}年需特别注意

1. **7月 July** - 人际关系容易出现摩擦，说话前三思
   - 避免在社交媒体发表敏感言论
   - 职场中保持低调，不宜强出头

2. **签约合作** - 仔细阅读条款，特别是3月和10月
   - 重大合同建议咨询专业人士
   - 口头承诺最好有书面确认

3. **健康方面** - 注意用眼和心血管
   - 每2小时起身活动
   - 定期体检，尤其是下半年

4. **出行安全** - 避免在冲煞日进行长途旅行
   - 开车注意安全，避免疲劳驾驶

---

## 🚫 规避问题 · Pitfalls to Avoid

### ${currentYear}年不宜做的事

| 类别 Category | 不宜 Avoid | 原因 Reason |
|--------------|-----------|-------------|
| 投资 Investment | 高风险投机 | 财运中等，不宜冒险 |
| 人际 Relations | 与小人纠缠 | 损耗精力，得不偿失 |
| 事业 Career | 冲动辞职 | 稳定为上，先找好下家 |
| 感情 Love | 闪电结婚 | 宜多了解，避免冲动 |
| 健康 Health | 熬夜过度 | 免疫力下降，易生病 |

### 特别提醒 Special Warnings

- **不宜合伙做生意** - ${currentYear}年容易因利益分配产生纠纷
- **不宜借钱给他人** - 借出去的钱难以收回
- **不宜在农历七月做重大决定** - 传统认为此月能量不稳定

---

## ✨ 顺遂之道 · Success Strategies for ${currentYear}

### 如何让${currentYear}年更顺利？

#### 第一步：把握时机 (Timing)
- **重大决策**：选择5月、9月、12月
- **新项目启动**：选择春季（2-4月）
- **投资理财**：下半年优于上半年

#### 第二步：借助贵人 (Support)
- 多参加行业活动，拓展人脉
- 保持与导师、长辈的联系
- 对帮助你的人表达感恩

#### 第三步：调整环境 (Environment)
- 办公桌朝向东南或正南
- 家中摆放绿色植物
- 穿戴幸运色服饰

#### 第四步：修身养性 (Self-Cultivation)
- 每日冥想10分钟，保持内心平静
- 阅读提升认知的书籍
- 坚持运动，保持身体健康

#### 第五步：行善积德 (Good Deeds)
- 帮助他人，积累善缘
- 捐赠或做义工
- 对家人朋友多表达爱

### 年度寄语 Year Message

> ${currentYear}年，您最大的优势是**稳健**。不要急于求成，踏实走好每一步，年底会收获意想不到的惊喜。
>
> Your greatest strength in ${currentYear} is **steadiness**. Don't rush. Take solid steps, and you'll be pleasantly surprised by year's end.

---

## 指引与建议 · Guidance & Wisdom

### 人生四大法则 (Four Principles for Life)

1. **把握机遇 Seize Opportunities** - 命运给予机会时，要勇敢抓住
2. **修身养性 Cultivate Self** - 内在修养决定外在成就
3. **广结善缘 Build Connections** - 人脉是人生的重要资源
4. **趋吉避凶 Navigate Wisely** - 保持乐观，逢凶化吉

### 给您的寄语 (Personal Message)

您的命盘显示，您是一个有潜力创造非凡成就的人。紫微斗数告诉我们的不是固定的命运，而是生命的可能性和倾向。

Your chart reveals someone with the potential to create extraordinary achievements. Remember: Zi Wei Dou Shu does not predict a fixed destiny, but rather illuminates possibilities and tendencies.

**命运掌握在自己手中。愿您前程似锦！**
**Your destiny is in your own hands. May your journey be blessed!**

---

*本报告基于紫微斗数命理分析，仅供参考。*
*This reading is based on Zi Wei Dou Shu astrology and is for reference only.*
`;

  return {
    coreIdentity,
    report,
  };
}

// ─── Test Connection ───────────────────────────────────────────────────────────

export async function testLLMConnection(config: LLMConfig = {}): Promise<boolean> {
  try {
    const client = createClient(config);
    const model = config.model || process.env.DOUBAO_MODEL || DEFAULT_MODEL;

    await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    });

    return true;
  } catch {
    return false;
  }
}
