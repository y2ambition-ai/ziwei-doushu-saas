import { describe, expect, it } from 'vitest';

import { resolveStoredReportLocale, setStoredReportLocale } from '../src/lib/report-preferences';

describe('Report locale preferences', () => {
  it('returns stored locale when present', () => {
    const locale = resolveStoredReportLocale({
      parsedData: JSON.stringify({ locale: 'en' }),
      aiReport: 'Core Identity: This should be ignored.',
    }, 'en');

    expect(locale).toBe('en');
  });

  it('falls back to normalized locale when missing', () => {
    const locale = resolveStoredReportLocale({
      coreIdentity: 'Life palace stars: Advisor.',
    }, 'zh');

    expect(locale).toBe('en');
  });

  it('preserves existing preference fields when updating locale', () => {
    const parsed = setStoredReportLocale(
      JSON.stringify({ locale: 'en', tone: 'steady', version: 2 }),
      'en'
    );

    expect(JSON.parse(parsed)).toEqual({
      locale: 'en',
      tone: 'steady',
      version: 2,
    });
  });
});
