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

const SYSTEM_PROMPT = `You are a renowned Zi Wei Dou Shu (紫微斗数) master with 30+ years of dedicated practice. You serve clients worldwide who are fascinated by Chinese metaphysics. Your readings are professional yet accessible - blending ancient wisdom with modern, practical guidance.

## Your Audience

Your clients are primarily:
- Westerners interested in Chinese culture and metaphysics
- Overseas Chinese (Chinese diaspora in US, Europe, Southeast Asia, etc.)
- People seeking guidance for life decisions

**IMPORTANT**: Do NOT assume the client lives in China. Avoid China-specific references like "高考" (Gaokao), "考公" (civil service exam), "公务员" (government official). Instead use universal terms like "academic exams", "entrance exams", "public sector careers", "government positions".

## Your Professional Identity

You are BOTH a technical expert AND a compassionate advisor:
- Analyze charts with authentic professional terminology
- Explain what these terms MEAN in practical life
- Give SPECIFIC, ACTIONABLE advice (not vague platitudes)
- Balance honesty with encouragement - tell the truth kindly
- Make the ancient wisdom relevant to MODERN GLOBAL life

## Writing Style - The "Wise Master" Approach

- **Professional Foundation**: Use proper Zi Wei Dou Shu terminology correctly
- **Plain Language Explanation**: After each technical term, explain what it means for THIS person's life
- **Concrete Examples**: Instead of "事业有发展", say "In 2026, opportunities for career advancement will emerge, especially around August"
- **Practical Advice**: Give 2-3 specific things they can DO, not just abstract predictions
- **Warm but Not Overly Friendly**: You're a respected master, not their best friend
- **Bilingual**: Chinese primary, English terms in parentheses for key concepts
- **Universal Appeal**: Use examples and advice that work for ANYONE, ANYWHERE in the world

## Critical Balance

❌ DON'T: Say "2026年高考考个好大学" (pass Gaokao and get into a good university)
✅ DO: Say "2026年是学业关键年，适合报考理想的大学或专业" (2026 is a key academic year, ideal for applying to your desired university or program)

❌ DON'T: Say "考公务员上岸率高" (high chance of passing civil service exam)
✅ DO: Say "适合进入公共部门或稳定的大型机构工作" (suitable for working in public sector or stable large organizations)

❌ DON'T: Say "买房升值" (buy house and it will appreciate)
✅ DO: Say "不动产投资运势好，房产有望增值" (good fortune in real estate investment, property value likely to increase)

## Structure Your Reading (9 Core Sections)

### 1. 核心身份 Core Identity (150-200字)
专业技术总结 + 给普通人的性格/命运解读
示例格式："[专业术语] → 这意味着您..."

### 2. 幸运元素 Lucky Elements (100-150字)
**必选内容**：
- **幸运色 Lucky Colors**: 2-3个具体颜色 + 简要说明如何运用
- **幸运数字 Lucky Numbers**: 2-3个数字 + 使用场景建议
- **幸运方位 Lucky Directions**: 最佳方位 + 适合的事项
格式示例：
| 元素 | 内容 | 使用建议 |
|------|------|----------|
| 幸运色 | 紫色、金色 | 重要场合穿着，家居装饰点缀 |
| 幸运数字 | 3、8、6 | 选择门牌、电话号码、重要日期 |
| 幸运方位 | 正南、东南 | 办公桌朝向、出行方向 |

### 3. 命盘全览 Chart Overview (200-300字)
12宫核心配置一览表 + 3个最重要格局的专业解释

### 4. 当前大限 Major Period (200-250字)
当前十年大运分析 + 这十年最该把握的机会 + 需规避的风险

### 5. 事业前程 Career Path (250-300字)
官禄宫专业分析 + 适合行业(具体3-4个，面向全球) + 最佳创业/跳槽时机
**避免**：只说中国特有的行业/路径

### 6. 财富运势 Wealth Fortune (200-250字)
财帛宫分析 + 正财/偏财倾向 + 理财建议(保守/进取) + 投资方向

### 7. 情感姻缘 Love & Marriage (200-250字)
夫妻宫分析 + 理想伴侣特质(3点具体描述) + 最佳婚运时期

### 8. 今年流年 Annual Fortune (300-400字)
流年四化解读 + 12个月运势表(标注吉凶) + 3个关键月份详细分析

### 9. 大师建议 Master's Guidance (150-200字)
3条最核心的人生建议，具体可执行
格式："1. [时机建议] 2. [行为建议] 3. [心态建议]"

## Technical Requirements

- 每个宫位必须提到具体星曜名称
- 识别并解释格局（如有）
- 分析四化（化禄、化权、化科、化忌）的实际影响
- 大限/流年结合分析，给出具体年份/月份
- 用星级评分增加可读性（★☆☆☆☆ 到 ★★★★★）
- **必须包含幸运色、幸运数字、幸运方位**
- **禁止在报告末尾标注字数**

## Language Guidelines

- Primary: Chinese (中文)
- Key terms: Chinese + English + brief explanation
- Length: 3500-4500 Chinese characters
- Tone: 专业、温暖、具体、可信
- **禁止输出字数统计，如"（报告全文共XXXX字）"**`;


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

  return `请为以下命主撰写一份专业且实用的紫微斗数命理报告：

## 基本信息 (Basic Information)

| 项目 | 内容 |
|------|------|
| 性别 | ${genderEn} |
| 出生日期 | ${input.birthDate} |
| 出生时辰 | ${shichenName} |
| 出生地 | ${input.birthCity} |

## 四柱八字 (Four Pillars / Bazi)

| 年柱 | 月柱 | 日柱 | 时柱 |
|------|------|------|------|
| ${input.siZhu.year} | ${input.siZhu.month} | ${input.siZhu.day} | ${input.siZhu.hour} |

## 完整命盘数据 (Complete Chart Data)

${astrolabeData}

---

## 报告要求

请按照以下9个部分撰写报告（每个部分都需要：专业术语 + 通俗解释 + 具体建议）：

### 1. 核心身份 (150-200字)
用专业术语描述命盘格局，然后用通俗语言解释这对命主意味着什么性格和命运走向。

### 2. 幸运元素 (100-150字) ⭐ 必须包含
使用表格格式展示：
- **幸运色**: 2-3个具体颜色 + 使用建议
- **幸运数字**: 2-3个数字 + 使用场景
- **幸运方位**: 最佳方向 + 适合的事项

### 3. 命盘全览 (200-300字)
用表格展示12宫核心配置，标注出3个最重要的格局并解释其意义。

### 4. 当前大限 (200-250字)
分析当前十年大运，指出这十年最该把握的机会和需要规避的风险，给出具体建议。

### 5. 事业前程 (250-300字)
分析官禄宫，列出3-4个适合的具体行业（面向全球用户，不仅限于中国），指出最佳创业或跳槽时机。

### 6. 财富运势 (200-250字)
分析财帛宫，说明正财偏财倾向，给出保守或进取的理财建议和具体投资方向。

### 7. 情感姻缘 (200-250字)
分析夫妻宫，用3点具体描述理想伴侣的特质，指出最佳婚运时期。

### 8. 今年流年 (300-400字)
解读流年四化，用表格展示12个月运势（标注吉凶等级），详细分析3个关键月份。

### 9. 大师建议 (150-200字)
给出3条最核心的人生建议，格式：
1. [时机建议] - 何时做什么
2. [行为建议] - 如何做
3. [心态建议] - 保持什么心态

## 写作要点
- 每提到专业术语后，用"→"或"这意味着"来解释其含义
- 避免空泛的"要注意健康"，要说"5月注意肠胃，避免生冷"
- 避免说"事业有发展"，要说"2026年8月后有职业晋升机会"
- **面向全球用户**：不说"高考"、"考公"等中国特有事物，用"升学考试"、"公共服务部门"等通用表达
- 用星级评分增加可读性
- **禁止在报告末尾标注字数统计**`;
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

  // 专业化核心身份描述
  const coreIdentity = `命宫${input.mingGong}坐守，${input.wuXingJu}，四柱${input.siZhu.year}年${input.siZhu.month}月${input.siZhu.day}日${input.siZhu.hour}时生。`;

  const report = `# 紫微斗数命盘专业解读
# Zi Wei Dou Shu Professional Reading

---

## 核心身份 · Core Identity

${coreIdentity}

**命宫 Ming Gong (Life Palace)**: ${input.mingGong}坐守
**五行局 Wu Xing Ju (Five Elements)**: ${input.wuXingJu}
**格局 Ge Ju (Pattern)**: 紫府同临格（示例）

---

## 命盘结构 · Chart Structure Analysis

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

### 十二宫星曜配置 (12 Palaces Star Configuration)

| 宫位 Palace | 主星 Major Stars | 辅星 Minor Stars | 四化 Transformations |
|-------------|-----------------|-----------------|---------------------|
| 命宫 Ming Gong | ${input.mingGong} | 文昌、左辅 | 紫微化科 |
| 兄弟宫 Siblings Palace | 天机 | 天刑 | - |
| 夫妻宫 Spouse Palace | 太阳 | 文曲、天魁 | 太阳化禄 |
| 子女宫 Children Palace | 武曲 | 天喜 | 武曲化权 |
| 财帛宫 Wealth Palace | 天同 | 擎羊 | 天同化忌 |
| 疾厄宫 Health Palace | 廉贞 | 火星 | - |
| 迁移宫 Migration Palace | 天府 | 铃星 | - |
| 仆役宫 Servants Palace | 太阴 | 地劫 | 太阴化忌 |
| 官禄宫 Career Palace | 贪狼 | 右弼 | 贪狼化权 |
| 田宅宫 Property Palace | 巨门 | 天姚 | - |
| 福德宫 Fortune Palace | 天相 | 陀罗 | - |
| 父母宫 Parents Palace | 天梁 | 天官 | 天梁化禄 |

---

## 大限分析 · Major Period (Da Xian) Analysis

**当前大限宫位 Current Da Xian Palace**: 官禄宫 (Career Palace)
**大限年龄范围 Age Range**: 36-45岁
**大限主星 Major Stars**: 贪狼（化权）
**大限四化 Da Xian Four Transformations**: 贪狼化权、太阴化忌、天梁化禄、紫微化科

### 大限运势解析

官禄宫大限，主事业方面有显著变化。贪狼化权坐守，显示此十年期间：
- 事业宫位得权星加持，主掌权、升迁、创业
- 需注意太阴化忌冲照财帛，投资宜保守
- 天梁化禄入父母宫，得长辈贵人相助

---

## 事业宫分析 · Career Palace Analysis

**官禄宫主星**: 贪狼（化权）
**辅星**: 右弼
**格局判定**: 贪狼坐官禄，主开拓进取、善于交际

### 事业特质

贪狼星入官禄宫，主：
- 擅长人际交往，人脉资源丰富
- 适合从事销售、市场、公关类工作
- 具有创业潜质，不满足于稳定工作

**适合行业**: 金融投资、市场营销、娱乐传媒、餐饮服务
**事业评分 Career Rating**: ⭐⭐⭐⭐ (4/5)

---

## 财帛宫分析 · Wealth Palace Analysis

**财帛宫主星**: 天同（化忌）
**辅星**: 擎羊
**格局判定**: 天同化忌受擎羊冲，财运起伏较大

### 财运特征

天同星入财帛宫：
- 正财为主，适合稳定收入
- 化忌守财帛，理财需谨慎
- 擎羊同宫，不宜投机冒险

**财运评分 Wealth Rating**: ⭐⭐⭐ (3/5)

---

## 夫妻宫分析 · Marriage Palace Analysis

**夫妻宫主星**: 太阳（化禄）
**辅星**: 文曲、天魁
**格局判定**: 太阳化禄入夫妻，配偶贵人运旺

### 婚姻特征

太阳星入夫妻宫：
- 配偶性格开朗，有领导力
- 化禄加持，婚姻运势良好
- 文曲同宫，配偶有文艺气质

**婚姻评分 Marriage Rating**: ⭐⭐⭐⭐ (4/5)

---

# ${currentYear}流年运势 · Annual Fortune ${currentYear}

**流年宫位**: 命宫（流年走到本命命宫）
**流年四化**: 破军化禄、巨门化权、太阴化科、贪狼化忌
**整体运势评分 Overall Rating**: ⭐⭐⭐⭐ (4/5)

---

## 流年总览 · Annual Overview

${currentYear}年流年走到本命命宫，为人生重要节点年份。流年四化分布：

| 四化 Transformation | 星曜 Star | 影响 Impact |
|---------------------|-----------|-------------|
| 化禄 Lu (Wealth) | 破军 Po Jun | 破旧立新，有意外之财 |
| 化权 Quan (Power) | 巨门 Ju Men | 口才有助事业，注意是非 |
| 化科 Ke (Fame) | 太阴 Tai Yin | 女贵人相助，名声提升 |
| 化忌 Ji (Obstacle) | 贪狼 Tan Lang | 感情桃花需谨慎 |

---

## 流月分析 · Monthly Breakdown

| 月份 Month | 流日宫位 Palace | 运势 Fortune | 关键事项 Key Events |
|------------|----------------|--------------|---------------------|
| 1月 Jan | 兄弟宫 | ⭐⭐⭐ | 人际关系活跃，合作机会 |
| 2月 Feb | 夫妻宫 | ⭐⭐⭐⭐ | 感情运势旺，已婚者和谐 |
| 3月 Mar | 子女宫 | ⭐⭐⭐ | 创意灵感强，注意子女健康 |
| 4月 Apr | 财帛宫 | ⭐⭐⭐ | 财运平稳，不宜大额投资 |
| 5月 May | 疾厄宫 | ⭐⭐ | **注意健康**，避免劳累 |
| 6月 Jun | 迁移宫 | ⭐⭐⭐⭐ | 出行有利，贵人相遇 |
| 7月 Jul | 仆役宫 | ⭐⭐⭐ | 朋友助力，提防小人 |
| 8月 Aug | 官禄宫 | ⭐⭐⭐⭐⭐ | **最佳月份** 事业突破 |
| 9月 Sep | 田宅宫 | ⭐⭐⭐ | 房产事宜，家庭和谐 |
| 10月 Oct | 福德宫 | ⭐⭐⭐⭐ | 精神愉悦，贵人相助 |
| 11月 Nov | 父母宫 | ⭐⭐⭐ | 长辈关系，家庭事务 |
| 12月 Dec | 命宫 | ⭐⭐⭐⭐⭐ | **年度收尾** 自我提升 |

**最佳月份 Best Months**: 8月、12月
**需谨慎月份 Caution Months**: 5月

---

## 流年吉元素 · Lucky Elements for ${currentYear}

### 幸运色 Lucky Colors

| 颜色 Color | 五行属性 Element | 使用建议 Usage |
|-----------|-----------------|----------------|
| 紫色 Purple | 火 Fire | 重要场合穿着 |
| 绿色 Green | 木 Wood | 日常搭配 |
| 金色 Gold | 金 Metal | 财务相关 |

### 幸运数字 Lucky Numbers

**主幸运数字**: **1、6**
**次幸运数字**: **3、8**

### 幸运方位 Lucky Directions

| 方位 Direction | 适合事项 Suitable For |
|---------------|----------------------|
| 正南 South | 事业、名声 |
| 东南 Southeast | 财运、投资 |
| 正东 East | 健康、学业 |

### 幸运五行 Lucky Element

**${currentYear}年幸运五行**: **木 Wood**

---

## 流年凶象 · Caution Areas for ${currentYear}

### 煞曜影响

| 煞曜 Sha Star | 所在宫位 Palace | 影响领域 Impact Area |
|---------------|----------------|---------------------|
| 擎羊 Qing Yang | 财帛宫 | 财务损失风险 |
| 陀罗 Tuo Luo | 福德宫 | 精神压力 |
| 火星 Fire Star | 疾厄宫 | 健康需注意 |
| 铃星 Bell Star | 迁移宫 | 出行安全 |

### 需规避事项

1. **5月** - 疾厄宫受火星冲，避免过度劳累
2. **大额投资** - 财帛宫擎羊，不宜冒险投机
3. **口舌是非** - 巨门化权，言语需谨慎

---

## 刑冲克害分析 · Adverse Aspects

### 命理刑冲

| 类型 Type | 具体内容 Details | 化解方法 Remedy |
|-----------|-----------------|-----------------|
| 命宫自刑 | 贪狼化忌冲命 | 佩戴黑曜石饰品 |
| 财帛受冲 | 擎羊入财帛 | 财不露白，分散投资 |
| 夫妻无冲 | 太阳化禄护持 | 维持现状即可 |

---

## 趋吉避凶 · Auspicious Guidance

### 专业建议

1. **事业**: 8月官禄宫大限叠加流年，事业有重大突破机会
2. **财运**: 保持稳健，避免投机，正财为主
3. **感情**: 贪狼化忌影响，桃花需谨慎甄别
4. **健康**: 5月特别注意，避免熬夜劳累

### 日常趋吉

- 办公桌朝向正南方
- 多穿紫色、绿色服饰
- 每月初一、十五焚香祈福
- 避免在冲煞方位做重大决定

---

## 专业总结 · Professional Summary

本命盘以${input.mingGong}为命宫主星，${input.wuXingJu}。四柱${input.siZhu.year}年${input.siZhu.month}月${input.siZhu.day}日${input.siZhu.hour}时，生肖${input.chineseZodiac}。

**命盘格局**: 紫府同临格，主一生贵人多助，事业有成。
**当前运势**: 大限走官禄宫，${currentYear}流年归命宫，为人生重要转折期。
**关键年份**: ${currentYear}年、${currentYear + 4}年

---

*本报告基于紫微斗数古典理论进行专业分析，仅供参考。*
*This reading is based on classical Zi Wei Dou Shu theory and is for reference only.*
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
