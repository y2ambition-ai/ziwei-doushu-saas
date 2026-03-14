import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HomePage from '@/components/home/HomePage';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface LocaleHomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleHomePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    openGraph: {
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      locale: 'en_US',
    },
    twitter: {
      title: dictionary.meta.title,
      description: dictionary.meta.description,
    },
  };
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <HomePage locale={locale} dictionary={getDictionary(locale)} />;
}
