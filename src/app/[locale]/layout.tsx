import { notFound } from 'next/navigation';

import { LocaleHtmlUpdater } from '@/components/LocaleHtmlUpdater';
import { isLocale, locales } from '@/lib/i18n/config';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <LocaleHtmlUpdater locale={locale} />
      {children}
    </>
  );
}