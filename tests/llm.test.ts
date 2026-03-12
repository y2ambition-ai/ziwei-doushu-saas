import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  extractCoreIdentity,
  generateMockReport,
  generateReport,
  validateReportOutput,
} from '../src/lib/llm';
import type { GenerateReportInput } from '../src/lib/llm';

const baseInput: GenerateReportInput = {
  email: 'test@example.com',
  gender: 'female',
  birthDate: '1994-11-03',
  birthTime: 4,
  birthCity: 'Toronto',
  mingGong: '天相',
  wuXingJu: '土五局',
  chineseZodiac: '狗',
  zodiac: 'Scorpio',
  siZhu: {
    year: '甲戌',
    month: '乙亥',
    day: '丙子',
    hour: '丁丑',
  },
  palaces: [
    { name: '命宫', majorStars: ['天相'], minorStars: ['文昌'] },
    { name: '官禄宫', majorStars: ['太阴'], minorStars: ['左辅'] },
  ],
};

function buildEnglishReport() {
  return `Core Identity: Calm, strategic, and best when long-range structure guides near-term action.

## Core Chart Identity
- The life palace shows a measured but effective decision style.

## Main Life Directions
- Career: best in roles with judgment and responsibility.
- Wealth: steady accumulation beats impulsive risk.
- Relationships: clarity and pacing matter most.

## Current Major Cycle
- This decade favors repositioning and stronger standards.

## Annual Timing
- 2026-04-18 to 2026-04-30 supports proposals and negotiations.
- 2026-08-12 to 2026-08-28 supports financial concentration.

## Family, Partnership, and Health
- Family and partnership improve when expectations are clear.

## Lucky Elements and Practical Guidance
- Lucky colors: deep green, gold.
- Lucky numbers: 1, 6.
- Lucky directions: south, southeast.`;
}

function buildChineseReport() {
  return `核心身份：命宫天相坐守，土五局成势，适合以稳定判断和长期规划推动人生主轴。

## 命格总论
- 命宫天相 → 判断稳，擅长在复杂局面里拿捏分寸。

## 人生主要方向
- 事业：适合承担统筹与决策角色。
- 财运：重视累积，不宜冲动冒进。
- 感情：需要清晰边界与稳定节奏。

## 当前大限
- 当前十年适合重整资源与身份定位。

## 流年运势
- 2026年4月18日到4月30日适合争取资源。
- 2026年8月12日到8月28日适合推进合作。

## 六亲与健康
- 家庭沟通宜直接，健康需留意睡眠与恢复。

## 幸运元素
- 幸运色：深绿、金色。
- 幸运数字：1、6。
- 幸运方位：正南、东南。`;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LLM 报告结构稳定性', () => {
  it('应该提取英文核心身份并通过格式校验', () => {
    const report = buildEnglishReport();

    expect(extractCoreIdentity(report, 'en')).toBe(
      'Calm, strategic, and best when long-range structure guides near-term action.'
    );
    expect(validateReportOutput(report, 'en')).toEqual([]);
  });

  it('应该提取中文核心身份并通过格式校验', () => {
    const report = buildChineseReport();

    expect(extractCoreIdentity(report, 'zh')).toBe(
      '命宫天相坐守，土五局成势，适合以稳定判断和长期规划推动人生主轴。'
    );
    expect(validateReportOutput(report, 'zh')).toEqual([]);
  });

  it('应该在首轮输出不稳定时重试一次并返回英文结果', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: '1) Core chart identity\n\nThis opening is invalid because it has no summary label.',
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: buildEnglishReport(),
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await generateReport({ ...baseInput, locale: 'en' }, {
      apiKey: 'test-key',
      baseURL: 'http://example.com/v1',
      model: 'gpt-5',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.coreIdentity).toBe(
      'Calm, strategic, and best when long-range structure guides near-term action.'
    );
    expect(result.report).toContain('## Main Life Directions');

    const firstRequest = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const secondRequest = JSON.parse(fetchMock.mock.calls[1][1].body as string);

    expect(firstRequest.model).toBe('gpt-5');
    expect(secondRequest.messages[1].content).toContain('Rewrite the entire report from scratch');
  });

  it('mock 报告也应该遵守中英文结构合同', () => {
    const englishMock = generateMockReport({ ...baseInput, locale: 'en' });
    const chineseMock = generateMockReport({ ...baseInput, locale: 'zh' });

    expect(validateReportOutput(englishMock.report, 'en')).toEqual([]);
    expect(validateReportOutput(chineseMock.report, 'zh')).toEqual([]);
  });

  it('儿童阶段 mock 报告不应该强行写成人地域化议题', () => {
    const childMock = generateMockReport({
      ...baseInput,
      locale: 'zh',
      birthDate: '2022-05-01',
    });

    expect(childMock.report).toContain('成长重点');
    expect(childMock.report).not.toContain('高考');
    expect(childMock.report).not.toContain('事业：');
  });

  it('地域化制度词应该被格式校验拦截', () => {
    const report = `Core Identity: Stable and thoughtful.

## Core Chart Identity
- Strong reflective pattern.

## Main Life Directions
- Study: this chart may perform well in the SAT system.

## Current Major Cycle
- A decade of slow consolidation.

## Annual Timing
- 2026-04-18 to 2026-04-30 supports focus.

## Family, Partnership, and Health
- Family steadiness helps.

## Lucky Elements and Practical Guidance
- Lucky colors: green.
- Lucky numbers: 1.
- Lucky directions: south.`;

    expect(validateReportOutput(report, 'en')).toContain('contains region-specific references');
  });
});
