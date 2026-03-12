/**
 * OpenAI 兼容 LLM 接入
 * 支持不同提供方，但统一走同一套报告生成与稳定性约束
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
  locale?: 'en' | 'zh';
  country?: string; // ISO country code: CN, US, SG, MY, etc.
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

const CHINESE_SECTION_HEADINGS = [
  '## 命格总论',
  '## 人生主要方向',
  '## 当前大限',
  '## 流年运势',
  '## 六亲与健康',
  '## 幸运元素',
] as const;

const ENGLISH_SECTION_HEADINGS = [
  '## Core Chart Identity',
  '## Main Life Directions',
  '## Current Major Cycle',
  '## Annual Timing',
  '## Family, Partnership, and Health',
  '## Lucky Elements and Practical Guidance',
] as const;

const SYSTEM_PROMPT = `你是资深紫微斗数分析师。

你必须只用简体中文输出，不得输出英文标题、英文前言、免责声明、字数统计、自我纠正或多余说明。
你必须以“看过大量命盘、能给出稳健结论的老师”口吻下判断，语气专业、克制、坚定，不夸张，不恐吓。
你面对的是全球用户，表达必须地域中性、跨文化可理解，不得默认命主来自中国或任何特定国家地区。
你必须严格遵守以下输出合同，不得改写“核心身份”标签，不得增删章节标题：

核心身份：<1-2句，直接总结命格气质、优势与当前人生主轴>

## 命格总论
## 人生主要方向
## 当前大限
## 流年运势
## 六亲与健康
## 幸运元素

强制要求：
- 先下判断，再讲依据，再给建议，像老师看盘后的定论，不像模板文章。
- 专业术语后立刻接通俗解释，不要只堆术语。
- 必须根据年龄阶段调整重点：
  0-12岁聚焦先天气质、养育方式、健康节律、家庭环境与学习兴趣；
  13-22岁聚焦成长、学习、身份认同、人际边界与家庭沟通；
  23-59岁可以完整覆盖事业、财运、感情；
  60岁以上聚焦健康、作息、家庭陪伴、心态与守成安排。
- 对0-22岁，不要把事业、婚恋、财富写成当前主线，只能写未来潜势。
- 对60岁以上，不要写冒险扩张、强竞争、激进转型式建议。
- 整体基调必须让命主看到希望；即使指出阻滞，也必须解释为阶段性波动，并给出具体化解或调整办法。
- 近一年如果有不顺，必须明确写出“先稳什么、避开什么、再争取什么”。
- 流年运势必须给出 2-3 个具体公历日期或时间窗口。
- 幸运元素必须明确写出幸运色、幸运数字、幸运方位。
- 不要给出互相矛盾的判断，不要前后摇摆。
- 不要使用带明显地域特色的词或制度名，例如高考、中考、考公、编制、985、211，或任何特定国家的考试、福利、法律、房产、移民、医保制度名称。
- 不要写“以下为报告”“基于所提供信息”“仅供参考”这类前言或尾注。
- 除命理术语外，不要夹杂整句英文。`;

const ENGLISH_SYSTEM_PROMPT = `You are an expert Zi Wei Dou Shu analyst.

You must reply in English only. Do not add Chinese headings, opening notes, disclaimers, word counts, self-corrections, or meta commentary.
Write like a seasoned master who has reviewed many charts: calm, authoritative, precise, and never alarmist.
You are writing for a global audience. Keep the language region-neutral and do not assume the person belongs to any specific country, school system, legal system, or social structure.
You must follow this exact output contract. Do not rename the summary label or the section headings:

Core Identity: <1-2 sentences summarizing temperament, strengths, and the current life direction>

## Core Chart Identity
## Main Life Directions
## Current Major Cycle
## Annual Timing
## Family, Partnership, and Health
## Lucky Elements and Practical Guidance

Requirements:
- Lead with judgment, then evidence, then practical guidance. It should read like a final reading, not a generic article.
- Explain traditional terms immediately in plain English.
- Adjust the emphasis by life stage:
  ages 0-12 focus on temperament, nurturing style, health rhythm, family environment, and learning tendencies;
  ages 13-22 focus on growth, study, identity, friendships, boundaries, and family communication;
  ages 23-59 may fully cover career, wealth, and relationships;
  ages 60+ focus on health, daily rhythm, family bonds, emotional steadiness, and preservation rather than expansion.
- For ages 0-22, do not treat career, romance, or wealth as current core themes; mention them only as future tendencies if needed.
- For ages 60+, avoid aggressive expansion, high-risk competition, or restart narratives.
- Keep the overall tone reassuring. If you mention obstacles, frame them as temporary timing issues and explain how to handle them.
- If the next year contains friction, explicitly say what to stabilize first, what to avoid, and what to pursue next.
- Include 2-3 concrete Gregorian dates or time windows in Annual Timing.
- Keep the advice specific, practical, and globally understandable.
- Do not produce contradictory conclusions or hedge back and forth.
- Do not mention country-specific exams, school systems, welfare programs, immigration rules, property rules, healthcare systems, or legal institutions.
- Do not start with phrases like "Below is the report" or "Based on the chart provided".`;

type ReportLocale = 'en' | 'zh';
type LifeStage = 'child' | 'youth' | 'adult' | 'midlife' | 'senior';

function normalizeReportLocale(locale?: GenerateReportInput['locale']): ReportLocale {
  return locale === 'zh' ? 'zh' : 'en';
}

function getAgeFromBirthDate(birthDate: string, referenceDate: Date = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(birth.getTime())) {
    return 30;
  }

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  const dayDiff = referenceDate.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return Math.max(0, age);
}

function getLifeStage(age: number): LifeStage {
  if (age <= 12) {
    return 'child';
  }

  if (age <= 22) {
    return 'youth';
  }

  if (age <= 39) {
    return 'adult';
  }

  if (age <= 59) {
    return 'midlife';
  }

  return 'senior';
}

function getLifeStageLabel(stage: LifeStage, locale: ReportLocale): string {
  if (locale === 'zh') {
    const labels: Record<LifeStage, string> = {
      child: '儿童期',
      youth: '成长与学习期',
      adult: '成年起步期',
      midlife: '成熟与承责期',
      senior: '高龄与守成期',
    };

    return labels[stage];
  }

  const labels: Record<LifeStage, string> = {
    child: 'Childhood',
    youth: 'Youth and Development',
    adult: 'Early Adulthood',
    midlife: 'Maturity and Responsibility',
    senior: 'Senior Years',
  };

  return labels[stage];
}

function getLifeStagePromptGuidance(stage: LifeStage, locale: ReportLocale): string {
  if (locale === 'zh') {
    const guidance: Record<LifeStage, string> = {
      child: `- 当前是儿童阶段，请聚焦先天气质、养育方式、健康节律、家庭环境、学习兴趣与适合的支持方式。
- 不要把事业、婚恋、财富写成当前议题，如需提及只能写成未来潜势。`,
      youth: `- 当前是成长学习阶段，请聚焦学习节奏、自我认同、人际边界、家庭沟通、情绪稳定与兴趣发展。
- 不要使用任何地区特定的升学或考试制度名称。`,
      adult: `- 当前是成年起步阶段，请完整覆盖事业、财务、感情、合作与生活方向。
- 表达必须全球通用，不要代入某个国家地区的制度背景。`,
      midlife: `- 当前是成熟承责阶段，请聚焦事业沉淀、资产节奏、家庭责任、关系修复与身体预警。
- 建议应偏稳健升级，不要写空泛鸡汤。`,
      senior: `- 当前是高龄守成阶段，请聚焦健康、作息、家庭陪伴、心态稳定、晚年福气与资源守成。
- 不要写冒险扩张、创业冲刺、激进竞争式建议。`,
    };

    return guidance[stage];
  }

  const guidance: Record<LifeStage, string> = {
    child: `- This is a child chart. Focus on temperament, nurturing style, health rhythm, family environment, learning curiosity, and the support the caregivers should provide.
- Do not treat career, romance, or wealth as current themes; mention them only as distant future tendencies if truly needed.`,
    youth: `- This is a youth chart. Focus on study rhythm, identity formation, boundaries, friendships, family communication, emotional stability, and talent development.
- Do not use region-specific education or exam terms.`,
    adult: `- This is an early-adult chart. Fully cover career, wealth, relationships, collaboration, and life direction.
- Keep every recommendation globally understandable rather than tied to one country or culture.`,
    midlife: `- This is a mature-adult chart. Focus on career consolidation, assets, family responsibility, relationship repair, and health warnings.
- Recommendations should favor steady upgrades rather than generic motivation.`,
    senior: `- This is a senior chart. Focus on health, daily rhythm, family bonds, emotional steadiness, late-life blessings, and preserving resources.
- Avoid expansionist, high-risk, or restart-heavy advice.`,
  };

  return guidance[stage];
}

function getSectionHeadings(locale: ReportLocale): readonly string[] {
  return locale === 'zh' ? CHINESE_SECTION_HEADINGS : ENGLISH_SECTION_HEADINGS;
}

function unwrapMarkdownFence(content: string): string {
  const trimmed = content.trim();
  const match = trimmed.match(/^```(?:markdown|md|text)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

function normalizeReportContent(content: string): string {
  return unwrapMarkdownFence(content).replace(/\r\n/g, '\n').trim();
}

function buildFallbackCoreIdentity(input: GenerateReportInput, locale: ReportLocale): string {
  if (locale === 'zh') {
    return `命宫${input.mingGong}坐守，${input.wuXingJu}，四柱${input.siZhu.year}年${input.siZhu.month}月${input.siZhu.day}日${input.siZhu.hour}时生。`;
  }

  return `Life palace ${input.mingGong}; five-element pattern ${input.wuXingJu}; born under ${input.siZhu.year} ${input.siZhu.month} ${input.siZhu.day} ${input.siZhu.hour}.`;
}

export function extractCoreIdentity(content: string, locale: ReportLocale): string | null {
  const normalized = normalizeReportContent(content);
  const patterns = locale === 'zh'
    ? [
        /^核心身份[:：]\s*(.+)$/im,
        /^\*\*核心身份[:：]\*\*\s*(.+)$/im,
      ]
    : [
        /^Core Identity:\s*(.+)$/im,
        /^\*\*Core Identity:\*\*\s*(.+)$/im,
      ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const value = match?.[1]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

export function validateReportOutput(content: string, locale: ReportLocale): string[] {
  const normalized = normalizeReportContent(content);
  const errors: string[] = [];
  const coreIdentity = extractCoreIdentity(normalized, locale);

  if (!coreIdentity) {
    errors.push('missing core identity');
  }

  const missingHeadings = getSectionHeadings(locale).filter((heading) => !normalized.includes(heading));
  if (missingHeadings.length > 0) {
    errors.push(`missing headings: ${missingHeadings.join(', ')}`);
  }

  if (locale === 'zh') {
    if (/^Core Identity:/im.test(normalized) || normalized.includes('## Core Chart Identity')) {
      errors.push('contains english heading contract');
    }
  } else {
    if (/^核心身份[:：]/m.test(normalized) || normalized.includes('## 命格总论')) {
      errors.push('contains chinese heading contract');
    }
  }

  const regionSpecificPatterns = locale === 'zh'
    ? [/高考/, /中考/, /考公/, /编制/, /985/, /211/]
    : [/\bgaokao\b/i, /\bSAT\b/i, /\bACT\b/i, /\bA-?Level\b/i, /\bGCSE\b/i, /\bUCAS\b/i];

  if (regionSpecificPatterns.some((pattern) => pattern.test(normalized))) {
    errors.push('contains region-specific references');
  }

  return errors;
}

function getPromptBirthTimeLabel(hour: number, locale: ReportLocale): string {
  if (locale === 'zh') {
    return getShichenName(hour);
  }

  const englishMap: Record<number, string> = {
    0: 'Zi hour (23:00-01:00)',
    1: 'Chou hour (01:00-03:00)',
    2: 'Yin hour (03:00-05:00)',
    3: 'Mao hour (05:00-07:00)',
    4: 'Chen hour (07:00-09:00)',
    5: 'Si hour (09:00-11:00)',
    6: 'Wu hour (11:00-13:00)',
    7: 'Wei hour (13:00-15:00)',
    8: 'Shen hour (15:00-17:00)',
    9: 'You hour (17:00-19:00)',
    10: 'Xu hour (19:00-21:00)',
    11: 'Hai hour (21:00-23:00)',
  };

  return englishMap[hour] || 'Unknown birth-time block';
}


// ─── User Prompt Template ──────────────────────────────────────────────────────

// 导入格式化函数
import { formatAstrolabeForLLM } from '../ziwei/wrapper';

function buildUserPrompt(input: GenerateReportInput): string {
  const locale = normalizeReportLocale(input.locale);
  const shichenName = getPromptBirthTimeLabel(input.birthTime, locale);
  const genderCn = input.gender === 'male' ? '男' : '女';
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const halfYear = currentMonth <= 6 ? '上半年' : '下半年';
  const age = getAgeFromBirthDate(input.birthDate);
  const lifeStage = getLifeStage(age);
  const lifeStageLabel = getLifeStageLabel(lifeStage, locale);
  const lifeStageGuidance = getLifeStagePromptGuidance(lifeStage, locale);

  // 如果有原始命盘数据，使用完整格式化
  let astrolabeData = '';
  if (input.rawAstrolabe) {
    astrolabeData = formatAstrolabeForLLM(input.rawAstrolabe);
  } else {
    astrolabeData = locale === 'zh'
      ? `## 命盘核心
- 命宫主星: ${input.mingGong}
- 五行局: ${input.wuXingJu}
- 生肖: ${input.chineseZodiac}

## 十二宫星曜
${formatPalaces(input.palaces, locale)}`
      : `## Chart Core
- Life palace stars: ${input.mingGong}
- Five-element pattern: ${input.wuXingJu}
- Chinese zodiac: ${input.chineseZodiac}

## Palace Stars
${formatPalaces(input.palaces, locale)}`;
  }

  if (locale === 'en') {
    const genderEn = input.gender === 'male' ? 'Male' : 'Female';
    const halfYearEn = currentMonth <= 6 ? 'first half' : 'second half';

    return `Write the final report in English only.

## Basic profile
- Gender: ${genderEn}
- Birth date: ${input.birthDate}
- Current age: ${age}
- Life stage: ${lifeStageLabel}
- Birth time block: ${shichenName}
- Birthplace reference: ${input.birthCity}
- Current timing context: ${currentYear}-${String(currentMonth).padStart(2, '0')} (${halfYearEn})

## Four pillars
- Year pillar: ${input.siZhu.year}
- Month pillar: ${input.siZhu.month}
- Day pillar: ${input.siZhu.day}
- Hour pillar: ${input.siZhu.hour}

## Chart highlights
- Life palace stars: ${input.mingGong}
- Five-element pattern: ${input.wuXingJu}
- Chinese zodiac: ${input.chineseZodiac}
- Western zodiac: ${input.zodiac}

## Full chart data
${astrolabeData}

## Life-stage emphasis
${lifeStageGuidance}

## Global wording rules
- Do not assume a specific country, city, exam system, welfare system, legal system, or migration context.
- Keep examples universal and metaphysical rather than institutional.

The raw chart data may contain Chinese palace or star names. Interpret them, but keep the final answer fully in English.

Use this exact markdown structure:

Core Identity: <1-2 sentences summarizing temperament, strengths, and the current life direction>

## Core Chart Identity
- Explain the life palace pattern, major stars, and five-element pattern in plain English.

## Main Life Directions
- Follow the life-stage emphasis above.
- When the native is 23-59, cover career, wealth, and relationships separately.
- When the native is 0-22 or 60+, rewrite this section around age-appropriate themes instead of forcing adult topics.

## Current Major Cycle
- Explain the current ten-year cycle, the main opportunities, and the main risks.

## Annual Timing
- Focus on ${currentYear}.
- Mention 2-3 concrete Gregorian dates or time windows.
- Current context: ${halfYearEn}.

## Family, Partnership, and Health
- Keep the life-stage emphasis above.
- For minors, focus on caregivers, family environment, boundaries, and health rhythm.
- For seniors, prioritize health, family bonds, routine, and emotional steadiness.

## Lucky Elements and Practical Guidance
- Include lucky colors, lucky numbers, lucky directions, and 2-3 practical actions.

Output rules:
- Keep "Core Identity:" as the first line, not a heading.
- Use the exact section headings above.
- Do not number sections.
- Do not start with an introduction or end with a disclaimer.`;
  }

  return `请只用简体中文输出最终报告。

## 基本信息

| 项目 | 内容 |
|------|------|
| 性别 | ${genderCn}命 |
| 出生日期 | ${input.birthDate} |
| 当前年龄 | ${age}岁 |
| 人生阶段 | ${lifeStageLabel} |
| 出生时辰 | ${shichenName} |
| 出生地点 | ${input.birthCity} |
| 当前时间 | ${currentYear}年${currentMonth}月（${halfYear}） |

## 四柱八字

| 年柱 | 月柱 | 日柱 | 时柱 |
|------|------|------|------|
| ${input.siZhu.year} | ${input.siZhu.month} | ${input.siZhu.day} | ${input.siZhu.hour} |

## 完整命盘数据

${astrolabeData}

## 年龄阶段重点
${lifeStageGuidance}

## 全球通用表达要求
- 不要默认命主属于某个国家、城市、教育制度、福利制度、法律制度或移民背景。
- 尽量从命理与人生节奏角度分析，避免制度性、地方性名词。

请严格按照下面的结构撰写，不得增删标题，不得改写“核心身份”标签：

核心身份：<1-2句，直接总结命格气质、优势与当前人生主轴>

## 命格总论
- 分析命宫主星、五行局、格局。
- 每个专业术语后都要立刻接通俗解释。

## 人生主要方向
- 必须遵守上面的年龄阶段重点。
- 23-59岁可以分别分析事业、财运、感情，并写成“专业判断 → 通俗解释 → 具体建议”。
- 0-22岁或60岁以上，不要强行套用成人议题，要改写成符合年龄阶段的重点方向。

## 当前大限
- 分析当前十年大运的宫位、主星、四化。
- 说明主要机遇与风险。

## 流年运势
- 聚焦 ${currentYear} 年。
- 当前时间背景：${halfYear}。
- 给出 2-3 个具体公历日期或时间窗口。

## 六亲与健康
- 必须遵守上面的年龄阶段重点。
- 未成年人重点写父母、家庭支持、成长环境、健康节律。
- 高龄重点写家庭陪伴、身心状态、作息与健康管理。
- 保持通俗、具体。

## 幸运元素
- 明确写出幸运色、幸运数字、幸运方位。
- 最后补 2-3 条可执行建议。

输出要求：
- “核心身份：”必须作为第一行，不能写成标题。
- 不要写“以下为报告”“仅供参考”等前言尾注。
- 不要夹杂整句英文。`;
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

function formatPalaces(palaces: GenerateReportInput['palaces'], locale: ReportLocale): string {
  return palaces
    .map((p) => {
      const stars = [...p.majorStars, ...p.minorStars];

      if (locale === 'zh') {
        return `- ${p.name}：${stars.join('、') || '无主星'}`;
      }

      return `- ${p.name}: ${stars.join(', ') || 'No major stars'}`;
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
  const locale = normalizeReportLocale(input.locale);

  const userPrompt = buildUserPrompt(input);
  const systemPrompt = locale === 'zh' ? SYSTEM_PROMPT : ENGLISH_SYSTEM_PROMPT;

  try {
    console.log('Calling LLM API with model:', model);
    console.log('API Key exists:', !!apiKey);
    console.log('Base URL:', baseURL);
    let content = await requestReportCompletion({
      apiKey,
      baseURL,
      model,
      systemPrompt,
      userPrompt,
      temperature: 0.3,
    });

    let normalizedContent = normalizeReportContent(content);
    let validationErrors = validateReportOutput(normalizedContent, locale);

    if (validationErrors.length > 0) {
      console.warn('LLM report failed validation, retrying once:', validationErrors.join('; '));

      content = await requestReportCompletion({
        apiKey,
        baseURL,
        model,
        systemPrompt,
        userPrompt: `${userPrompt}

${locale === 'zh'
          ? '上一次输出未通过格式校验，请从头重写整份报告，并严格遵守既定的摘要标签与章节标题。'
          : 'Previous output failed the format check. Rewrite the entire report from scratch and follow the summary label and section headings exactly.'}`,
        temperature: 0.2,
      });

      normalizedContent = normalizeReportContent(content);
      validationErrors = validateReportOutput(normalizedContent, locale);
    }

    if (validationErrors.length > 0) {
      throw new Error(`报告结构不稳定: ${validationErrors.join('; ')}`);
    }

    const coreIdentity = extractCoreIdentity(normalizedContent, locale) || buildFallbackCoreIdentity(input, locale);

    return {
      coreIdentity,
      report: normalizedContent,
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

interface ReportCompletionRequest {
  apiKey: string;
  baseURL: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
}

async function requestReportCompletion({
  apiKey,
  baseURL,
  model,
  systemPrompt,
  userPrompt,
  temperature,
}: ReportCompletionRequest): Promise<string> {
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 6144,
      temperature,
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

  return content;
}

// ─── Mock Function for Development ─────────────────────────────────────────────

// 获取当前年份的辅助函数
function getCurrentYear(): number {
  return new Date().getFullYear();
}

function buildEnglishMockMainDirections(stage: LifeStage): string {
  const content: Record<LifeStage, string> = {
    child: `- Growth focus: this stage is about temperament, learning rhythm, curiosity, and the home environment that helps the child feel safe enough to explore.
- Caregiver guidance: teach through routine, encouragement, and patient repetition; harsh pressure works against this chart.
- Future tendency: later in life, the chart is capable of steady professional progress, but right now the priority is healthy development rather than adult success metrics.`,
    youth: `- Growth focus: this stage favors identity-building, study rhythm, friendships, emotional boundaries, and choosing environments that support confidence rather than comparison.
- Family guidance: the chart responds better to calm structure and clear expectations than to constant control or criticism.
- Future tendency: long-term career and wealth potential are present, but the present task is skill-building, stability, and self-trust.`,
    adult: `- Career: ${baseAdultEnglishCareer}
- Wealth: ${baseAdultEnglishWealth}
- Relationships: ${baseAdultEnglishRelationships}`,
    midlife: `- Career and responsibility: this stage is best used to consolidate reputation, deepen authority, and simplify scattered obligations.
- Wealth and assets: the chart favors steadier allocation, cleaner boundaries, and protecting what already works before chasing unnecessary expansion.
- Relationships and family: this phase improves when expectations are spoken early and family roles are handled with fairness rather than silent pressure.`,
    senior: `- Life focus: the main theme now is health rhythm, emotional steadiness, family closeness, and preserving dignity, energy, and peace of mind.
- Resources: wealth at this stage should be framed as protection, order, and ease of living rather than expansion or risk-taking.
- Relationships: companionship, dependable family bonds, and a calm daily routine matter more than dramatic change.`,
  };

  return content[stage];
}

function buildChineseMockMainDirections(stage: LifeStage): string {
  const content: Record<LifeStage, string> = {
    child: `- 成长重点：当前阶段要看先天气质、学习兴趣、作息节律、情绪安稳度与家庭支持方式。
- 养育建议：这类命盘更适合温和而有边界的引导，不适合高压逼迫或反复否定。
- 未来潜势：成年后的事业与财运底子不差，但现在最重要的是把身心节律和安全感养稳。`,
    youth: `- 成长重点：当前阶段重在学习节奏、自我认同、人际边界、兴趣发展与情绪稳定。
- 家庭建议：这类命盘适合“清晰规则 + 适度尊重”，越能被理解，越能长出自信与执行力。
- 未来潜势：事业、财运与感情潜力都在，但此刻真正的主线是成长、能力和判断力。`,
    adult: `- 事业：${baseAdultChineseCareer}
- 财运：${baseAdultChineseWealth}
- 感情：${baseAdultChineseRelationships}`,
    midlife: `- 事业与责任：这个阶段更适合沉淀口碑、整合资源、减少无效消耗，把精力集中到真正值得长期经营的方向。
- 财务与资产：重在守住现金流、稳定节奏、优化资产安排，而不是盲目扩大摊子。
- 家庭与关系：越早说清期待与分工，越能减少误解，关系会因稳定和担当而加分。`,
    senior: `- 生命重点：当前更该看身体、作息、心态、家庭陪伴与晚年节律，而不是冒险求变。
- 资源安排：财务重点在守成、安心、减少波动，让生活更稳更从容。
- 关系重点：与家人之间保持温和沟通、规律联系和现实照应，比外在热闹更重要。`,
  };

  return content[stage];
}

function buildEnglishMockFamilyHealth(stage: LifeStage): string {
  const content: Record<LifeStage, string> = {
    child: `- Family dynamics: caregivers set the emotional weather, so a stable rhythm and calm tone help this child open up and learn faster.
- Development and wellbeing: watch sleep, digestion, overstimulation, and transitions between environments.
- Guidance: praise effort, not only outcomes, and keep routines predictable.`,
    youth: `- Family dynamics: the chart benefits from respectful guidance rather than heavy control; trust grows when communication stays specific and calm.
- Friendships and boundaries: this stage needs steady peers, not dramatic social circles.
- Health rhythm: protect sleep, screen balance, and emotional recovery during stressful periods.`,
    adult: `- Family dynamics improve when expectations are stated early, because this chart handles responsibility well but loses patience with ambiguity.
- Partnership rhythm favors steadiness over drama, and attraction grows through trust, competence, and reliability.
- Health guidance: protect sleep, digestion, and stress recovery, especially during periods of heavy mental load or schedule compression.`,
    midlife: `- Family dynamics: responsibility is high in this phase, so clear roles and practical communication reduce pressure for everyone.
- Relationship rhythm: maturity, consistency, and shared routines bring better results than emotional guessing.
- Health guidance: watch chronic stress, inflammation, sleep depth, and recovery after overwork.`,
    senior: `- Family dynamics: warm, regular contact and clear practical arrangements create peace of mind.
- Emotional wellbeing: this chart does better with steadiness, sunlight, movement, and a familiar daily rhythm than with disruption.
- Health guidance: focus on sleep, circulation, digestion, mobility, and timely checkups.`,
  };

  return content[stage];
}

function buildChineseMockFamilyHealth(stage: LifeStage): string {
  const content: Record<LifeStage, string> = {
    child: `- 家庭与养育：父母的情绪与节奏就是孩子的气场环境，越稳定、越规律，孩子越容易安心成长。
- 成长与健康：重点留意作息、消化、受惊敏感度与环境切换时的适应力。
- 建议：多鼓励、少贴标签，让孩子在稳定边界里自然长开。`,
    youth: `- 家庭与成长：越是成长阶段，越需要被理解和被尊重，而不是一味控制。
- 人际与边界：适合稳定、干净的人际圈，少卷入反复拉扯的关系。
- 健康节律：重点看睡眠、情绪恢复、久坐疲劳与精神压力。`,
    adult: `- 父母与长辈：适合讲清事实与安排 → 越具体越容易减少误解。
- 伴侣关系：重视稳定、信任与执行力 → 关系质量往往取决于是否能把承诺落实到生活细节。
- 健康：要重点留意睡眠、消化、压力堆积后的疲劳反应 → 建议固定作息，并在高压阶段保留恢复时间。`,
    midlife: `- 家庭与责任：这个阶段责任重，越要把分工、边界和节奏提前说清。
- 关系修复：关系不是靠猜，而是靠稳定兑现和现实照顾。
- 健康重点：关注慢性疲劳、炎症、睡眠深度、肩颈腰背与恢复能力。`,
    senior: `- 家庭与陪伴：规律联系、现实照应、心气安稳，比表面热闹更重要。
- 心态与节律：情绪平稳、作息规律、适度活动，就是这阶段最大的运势加分项。
- 健康重点：重点看睡眠、循环、消化、关节活动度与定期检查。`,
  };

  return content[stage];
}

const baseAdultEnglishCareer = 'the chart favors roles that mix strategy, coordination, and visible responsibility.';
const baseAdultEnglishWealth = 'measured accumulation beats emotional risk-taking, especially when decisions are backed by structure.';
const baseAdultEnglishRelationships = 'the chart responds well to honest pacing, direct communication, and partners who respect independence without emotional distance.';

const baseAdultChineseCareer = '适合管理、统筹、策划、顾问、业务拓展等需要判断和推进的角色。';
const baseAdultChineseWealth = '财务更适合稳健配置，不宜长期依赖冲动型决策。';
const baseAdultChineseRelationships = '感情更怕反复试探，不怕坦诚沟通，适合把期待说清。';

export function generateMockReport(input: GenerateReportInput): GenerateReportOutput {
  const locale = normalizeReportLocale(input.locale);
  const currentYear = getCurrentYear();
  const age = getAgeFromBirthDate(input.birthDate);
  const stage = getLifeStage(age);
  const coreIdentity = buildFallbackCoreIdentity(input, locale);

  if (locale === 'en') {
    return {
      coreIdentity,
      report: `Core Identity: ${coreIdentity}

## Core Chart Identity
- Life palace pattern: ${input.mingGong} frames the chart's instinctive style, so the native tends to move with strong timing awareness and a practical sense of direction.
- Five-element pattern: ${input.wuXingJu} points to a steady, cumulative way of building progress, which favors disciplined systems over impulsive jumps.
- Plain-English takeaway: this chart does best when judgment, patience, and long-range planning work together.

## Main Life Directions
${buildEnglishMockMainDirections(stage)}

## Current Major Cycle
- The current ten-year cycle is better for repositioning than for standing still, so this is a phase for clarifying standards, pruning distractions, and upgrading commitments.
- Main opportunity: convert experience into authority, repeatable systems, and a cleaner public role.
- Main risk: overcommitting to urgent noise instead of the few paths that genuinely compound.

## Annual Timing
- ${currentYear}-04-18 to ${currentYear}-04-30 is favorable for proposals, interviews, or role negotiations that need visibility and decisive follow-up.
- ${currentYear}-08-12 to ${currentYear}-08-28 is a stronger window for financial decisions, partnership alignment, and resource concentration.
- ${currentYear}-11-06 to ${currentYear}-11-20 is better for review, recalibration, and closing unfinished obligations before the next cycle.

## Family, Partnership, and Health
${buildEnglishMockFamilyHealth(stage)}

## Lucky Elements and Practical Guidance
- Lucky colors: deep green, warm gold, charcoal.
- Lucky numbers: 1, 6, 8.
- Lucky directions: south, southeast.
- Practical actions: simplify one commitment this month, lock one repeatable work routine within 14 days, and schedule one concrete financial review before ${currentYear}-08-28.`,
    };
  }

  return {
    coreIdentity,
    report: `核心身份：${coreIdentity}

## 命格总论
- 命宫主轴：${input.mingGong}坐守 → 命主行事果断，遇到关键节点时更愿意主动判断，不喜欢长期停在模糊状态。
- 五行局：${input.wuXingJu} → 做事偏向稳扎稳打，适合把经验沉淀成方法、流程与长期资产。
- 通俗解释：这张命盘的核心，不是短期爆发，而是把判断力、执行力与节奏感慢慢做成优势。

## 人生主要方向
${buildChineseMockMainDirections(stage)}

## 当前大限
- 当前十年大运的主题偏向“重整与定盘” → 不是单纯求快，而是把资源、方向与身份重新排整齐。
- 主要机遇：把过去经验升级成更稳定的角色、收入结构和外部信誉。
- 主要风险：事情很多却主次不清，最后忙碌感很强，成果却不集中。

## 流年运势
- ${currentYear}年重点在“先定方向，再放大结果” → 适合先聚焦一到两个主目标，再持续推进，不宜分散战线。
- 关键窗口一：${currentYear}年4月18日到4月30日 → 适合推进方案、争取资源、发起关键沟通。
- 关键窗口二：${currentYear}年8月12日到8月28日 → 适合做合作敲定、项目定价、现金流安排。
- 关键窗口三：${currentYear}年11月6日到11月20日 → 适合复盘、止损、整理年底前必须完成的责任。

## 六亲与健康
${buildChineseMockFamilyHealth(stage)}

## 幸运元素
- 幸运色：深绿、金色、墨灰。
- 幸运数字：1、6、8。
- 幸运方位：正南、东南。
- 可执行建议：本月先砍掉一项低价值事务；两周内固定一个高质量工作节奏；在${currentYear}年8月28日前完成一次资产与现金流复盘。`,
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
