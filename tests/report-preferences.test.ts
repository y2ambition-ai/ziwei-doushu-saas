import { describe, expect, it } from 'vitest';

import { resolveStoredReportLocale, setStoredReportLocale } from '../src/lib/report-preferences';

describe('报告语言锁定偏好', () => {
  it('应该优先读取已存储的 locale', () => {
    const locale = resolveStoredReportLocale({
      parsedData: JSON.stringify({ locale: 'zh' }),
      aiReport: 'Core Identity: This should be ignored.',
    }, 'en');

    expect(locale).toBe('zh');
  });

  it('在旧数据缺少 parsedData 时应该从报告正文推断中文', () => {
    const locale = resolveStoredReportLocale({
      aiReport: `核心身份：整体底盘不差，当前只是阶段性调整。\n\n## 命格总论\n- 先稳节奏，再谈突破。`,
      coreIdentity: '命宫主星：天相',
    }, 'en');

    expect(locale).toBe('zh');
  });

  it('在没有显式线索时应该回退到请求语言', () => {
    const locale = resolveStoredReportLocale({
      coreIdentity: '命宫主星：天相，五行属土五局',
    }, 'zh');

    expect(locale).toBe('zh');
  });

  it('写回 locale 时应该保留既有偏好字段', () => {
    const parsed = setStoredReportLocale(
      JSON.stringify({ locale: 'en', tone: 'steady', version: 2 }),
      'zh'
    );

    expect(JSON.parse(parsed)).toEqual({
      locale: 'zh',
      tone: 'steady',
      version: 2,
    });
  });
});
