'use client';

import { useEffect } from 'react';

import { Locale } from '@/lib/i18n/config';

interface LocaleHtmlUpdaterProps {
  locale: Locale;
}

export function LocaleHtmlUpdater({ locale }: LocaleHtmlUpdaterProps) {
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  return null;
}
