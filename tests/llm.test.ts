import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  extractCoreIdentity,
  generateMockReport,
  generateReport,
  hasLLMConfig,
  resolveLLMConfig,
  validateReportOutput,
} from '../src/lib/llm';
import type { GenerateReportInput } from '../src/lib/llm';

const baseInput: GenerateReportInput = {
  email: 'test@example.com',
  gender: 'female',
  birthDate: '1994-11-03',
  birthTime: 4,
  birthCity: 'Toronto',
  mingGong: 'Advisor',
  wuXingJu: 'Water 2nd',
  chineseZodiac: 'Dog',
  zodiac: 'Scorpio',
  siZhu: {
    year: 'Jia Xu',
    month: 'Yi Hai',
    day: 'Bing Zi',
    hour: 'Ding Chou',
  },
  palaces: [
    { name: 'Life Palace', majorStars: ['Advisor'], minorStars: ['Scholar'] },
    { name: 'Career Palace', majorStars: ['Moon'], minorStars: ['Assistant'] },
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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('LLM report contract', () => {
  it('extracts core identity and validates English output', () => {
    const report = buildEnglishReport();

    expect(extractCoreIdentity(report)).toBe(
      'Calm, strategic, and best when long-range structure guides near-term action.'
    );
    expect(validateReportOutput(report)).toEqual([]);
  });

  it('retries once when the first output is invalid', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        {
          ok: true,
          status: 200,
          json: async () => ({
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'output_text',
                    text: '1) Core chart identity\n\nThis opening is invalid because it has no summary label.',
                  },
                ],
              },
            ],
          }),
          text: async () => '',
        }
      )
      .mockResolvedValueOnce(
        {
          ok: true,
          status: 200,
          json: async () => ({
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'output_text',
                    text: buildEnglishReport(),
                  },
                ],
              },
            ],
          }),
          text: async () => '',
        }
      );

    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await generateReport({ ...baseInput, locale: 'en' }, {
      apiKey: 'test-key',
      baseURL: 'http://example.com',
      model: 'gpt-5',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.coreIdentity).toBe(
      'Calm, strategic, and best when long-range structure guides near-term action.'
    );
    expect(result.report).toContain('## Main Life Directions');

    const firstRequest = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const secondRequest = JSON.parse(fetchMock.mock.calls[1][1].body as string);

    expect(fetchMock.mock.calls[0][0]).toBe('http://example.com/v1/responses');
    expect(firstRequest.model).toBe('gpt-5');
    expect(firstRequest.instructions).toContain('You are an expert Zi Wei Dou Shu analyst.');
    expect(secondRequest.input).toContain('Rewrite the entire report from scratch');
  });

  it('mock report follows the English contract', () => {
    const englishMock = generateMockReport({ ...baseInput, locale: 'en' });

    expect(validateReportOutput(englishMock.report)).toEqual([]);
  });

  it('region-specific terms are rejected', () => {
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

    expect(validateReportOutput(report)).toContain('contains region-specific references');
  });

  it('prefers OPENAI runtime config and falls back to legacy variables', () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('OPENAI_BASE_URL', '');
    vi.stubEnv('OPENAI_MODEL', '');
    vi.stubEnv('DOUBAO_API_KEY', 'legacy-key');
    vi.stubEnv('DOUBAO_BASE_URL', 'https://legacy.example');
    vi.stubEnv('DOUBAO_MODEL', 'legacy-model');

    expect(resolveLLMConfig()).toEqual({
      apiKey: 'legacy-key',
      baseURL: 'https://legacy.example/v1',
      model: 'legacy-model',
    });
    expect(hasLLMConfig()).toBe(true);

    vi.stubEnv('OPENAI_API_KEY', 'openai-key');
    vi.stubEnv('OPENAI_BASE_URL', 'https://ai.gs88.shop');
    vi.stubEnv('OPENAI_MODEL', 'gpt-5.2');

    expect(resolveLLMConfig()).toEqual({
      apiKey: 'openai-key',
      baseURL: 'https://ai.gs88.shop/v1',
      model: 'gpt-5.2',
    });
  });
});
