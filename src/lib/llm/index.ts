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
  });
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `你是一位精通紫微斗数的命理大师，拥有30年以上的命盘解读经验。你的特点是：

1. 专业严谨：准确解读星盘，不随意发挥
2. 通俗易懂：用现代语言解释古老的命理概念
3. 温和正面：即使指出问题也给出建设性建议
4. 真诚实在：不故弄玄虚，不夸大其词

你的解读风格：
- 开篇点明命主的核心特质（命宫主星）
- 分维度展开：事业、财运、感情、健康
- 指出人生关键阶段和转折点
- 给出实用的趋吉避凶建议

请用温暖的语气，像一位智慧的长者在与晚辈谈心。`;

// ─── User Prompt Template ──────────────────────────────────────────────────────

// 导入格式化函数
import { formatAstrolabeForLLM } from '../ziwei/wrapper';

function buildUserPrompt(input: GenerateReportInput): string {
  const shichenName = getShichenName(input.birthTime);

  // 如果有原始命盘数据，使用完整格式化
  let astrolabeData = '';
  if (input.rawAstrolabe) {
    astrolabeData = formatAstrolabeForLLM(input.rawAstrolabe);
  } else {
    // 降级到简化格式
    astrolabeData = `## 命盘核心
- 命宫主星：${input.mingGong}
- 五行局：${input.wuXingJu}
- 生肖：${input.chineseZodiac} / ${input.zodiac}

## 十二宫星曜
${formatPalaces(input.palaces)}`;
  }

  return `请为以下命主进行紫微斗数命盘解读：

## 基本信息
- 性别：${input.gender === 'male' ? '男' : '女'}
- 出生时间：${input.birthDate} ${shichenName}
- 出生地：${input.birthCity}

## 四柱八字
- 年柱：${input.siZhu.year}
- 月柱：${input.siZhu.month}
- 日柱：${input.siZhu.day}
- 时柱：${input.siZhu.hour}

${astrolabeData}

请生成一份详细的命盘解读报告，要求：
1. 首先给出一个100字以内的"核心身份"总结（用于卡片展示）
2. 然后展开详细解读，3000字左右
3. 使用 Markdown 格式，有清晰的章节标题
4. 语言温暖，有同理心，让读者感到被理解`;
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
  const client = createClient(config);
  const model = config.model || process.env.DOUBAO_MODEL || DEFAULT_MODEL;

  const userPrompt = buildUserPrompt(input);

  try {
    console.log('Calling LLM API with model:', model);
    console.log('API Key exists:', !!process.env.DOUBAO_API_KEY);

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';

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

  const coreIdentity = `您的命宫主星为${input.mingGong}，五行属${input.wuXingJu}，天生具有独特的领导魅力与直觉力。`;

  const report = `# 紫微斗数命盘解读

## 核心身份

${coreIdentity}

## 基本信息

- **性别**：${input.gender === 'male' ? '男' : '女'}
- **出生时间**：${input.birthDate} ${shichenName}
- **出生地**：${input.birthCity}
- **生肖**：${input.chineseZodiac}

## 四柱八字

| 年柱 | 月柱 | 日柱 | 时柱 |
|------|------|------|------|
| ${input.siZhu.year} | ${input.siZhu.month} | ${input.siZhu.day} | ${input.siZhu.hour} |

## 命宫解析

您的命宫主星为 **${input.mingGong}**，这是一颗充满能量的主星。

命宫在紫微斗数中代表一个人的核心特质、外在形象和人生追求。${input.mingGong}坐命的人通常具有以下特点：

- 思维敏捷，反应迅速
- 有较强的领导欲望
- 注重自我提升和成长
- 在事业上追求卓越

## 事业运势

根据您的命盘配置，您在事业上具有独特优势：

1. **领导力**：天生具有统领全局的能力
2. **决策力**：在关键时刻能够做出正确判断
3. **执行力**：想法能够落地实施

建议您在30-40岁期间重点发展事业，这是您的事业黄金期。

## 财运分析

您的财运呈现稳中有升的态势：

- 正财运较强，适合通过专业技能获得收入
- 偏财运一般，不建议过度投机
- 40岁后财运更佳，可适当扩大投资

## 感情婚姻

在感情方面，您追求精神层面的契合：

- 适合与志同道合的人结缘
- 婚姻宜晚不宜早，28岁后成家更佳
- 家庭生活中宜多沟通，避免固执

## 健康提醒

需要注意以下健康问题：

- 注意用眼卫生，预防近视加深
- 保持规律作息，避免熬夜
- 适度运动，增强体质

## 人生建议

1. **把握机遇**：35岁左右有重要的人生转折点
2. **修身养性**：多读书，提升内在修养
3. **广结善缘**：人脉是您的重要资源
4. **趋吉避凶**：逢凶化吉，保持乐观心态

---

*本报告基于紫微斗数命理分析，仅供参考。命运掌握在自己手中，愿您前程似锦！*
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
