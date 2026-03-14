'use client';

import { useEffect } from 'react';

import { Locale } from '@/lib/i18n/config';

interface LocaleHtmlUpdaterProps {
  locale: Locale;
}

export function LocaleHtmlUpdater({ locale }: LocaleHtmlUpdaterProps) {
  useEffect(() => {
    document.documentElement.lang = 'en';
  }, [locale]);

  return null;
}
