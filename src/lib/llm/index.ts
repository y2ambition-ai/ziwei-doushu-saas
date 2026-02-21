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

## Structure Your Reading

1. **Core Identity (核心身份)** - A powerful 80-100 character summary
2. **Your Cosmic Blueprint (你的命盘蓝图)** - Explain their unique chart configuration
3. **Life Path & Destiny (人生道路)** - Overall life direction and themes
4. **Career & Wealth (事业财运)** - Professional strengths and financial patterns
5. **Relationships & Love (感情姻缘)** - Love style and partnership dynamics
6. **Health & Wellbeing (健康养生)** - Physical and energetic considerations
7. **Key Life Phases (人生阶段)** - Important timing and turning points
8. **Guidance & Wisdom (指引与建议)** - Practical advice for thriving

## Language Guidelines

- Primary language: Chinese (中文)
- Add English translations for key terms in parentheses
- Use clear, flowing prose - avoid overly mystical language
- Make it feel personal, not generic
- Length: 2500-3500 Chinese characters`;

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

1. **First**: Provide a "Core Identity" (核心身份) summary in 80-100 Chinese characters - this captures their essence in one powerful statement

2. **Then**: Write a detailed reading following the structure in your system prompt

3. **Format**: Use Markdown with clear headers

4. **Tone**: Warm, wise, empowering - like an elder sharing ancient wisdom with deep care

Remember: This person may be from any culture. Explain concepts clearly and make the reading feel personally meaningful to them.`;
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

export function generateMockReport(input: GenerateReportInput): GenerateReportOutput {
  const shichenName = getShichenName(input.birthTime);
  const genderCn = input.gender === 'male' ? '男' : '女';

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
