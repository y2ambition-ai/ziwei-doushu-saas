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
    console.warn('Failed to parse report preferences. Falling back to default locale.', error);
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

  return normalizeLocale(fallbackLocale);
}

export function setStoredReportLocale(parsedData: string | null | undefined, locale: Locale): string {
  const preferences = parseReportPreferences(parsedData);

  return JSON.stringify({
    ...preferences,
    locale,
  });
}
