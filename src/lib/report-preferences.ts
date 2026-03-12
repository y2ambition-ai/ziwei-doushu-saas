import { Locale, normalizeLocale } from './i18n/config';

interface StoredReportLocaleSource {
  parsedData?: string | null;
  aiReport?: string | null;
  coreIdentity?: string | null;
}

type ParsedReportPreferences = Record<string, unknown> & {
  locale?: string;
};

function parseReportPreferences(parsedData?: string | null): ParsedReportPreferences {
  if (!parsedData) {
    return {};
  }

  try {
    const parsed = JSON.parse(parsedData) as unknown;

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ParsedReportPreferences;
    }
  } catch (error) {
    console.warn('解析报告偏好失败，已回退为默认语言。', error);
  }

  return {};
}

export function resolveStoredReportLocale(
  source: StoredReportLocaleSource,
  fallbackLocale?: string
): Locale {
  const preferences = parseReportPreferences(source.parsedData);

  if (preferences.locale) {
    return normalizeLocale(preferences.locale);
  }

  const content = [source.aiReport, source.coreIdentity].filter(Boolean).join('\n');

  if (/^核心身份[:：]/m.test(content) || content.includes('## 命格总论')) {
    return 'zh';
  }

  if (/^Core Identity:/im.test(content) || content.includes('## Core Chart Identity')) {
    return 'en';
  }

  return normalizeLocale(fallbackLocale);
}

export function setStoredReportLocale(parsedData: string | null | undefined, locale: Locale): string {
  const preferences = parseReportPreferences(parsedData);

  return JSON.stringify({
    ...preferences,
    locale,
  });
}
