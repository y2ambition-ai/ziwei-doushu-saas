import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import ChartDisplay from '@/app/chart/[id]/ChartDisplay';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocalizedPath } from '@/lib/i18n/routes';
import { getReportViewData } from '@/lib/report-view';

interface LocalizedChartPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: LocalizedChartPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: 'Tianming Secrets | Zi Wei Dou Shu Chart',
    description: dictionary.meta.description,
  };
}

export default async function LocalizedChartPage({ params }: LocalizedChartPageProps) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const report = await getReportViewData(id);

  if (!report) {
    notFound();
  }

  if (report.locale !== locale) {
    redirect(getLocalizedPath(report.locale, `/chart/${id}`));
  }

  return <ChartDisplay locale={locale} report={report} />;
}

export async function generateStaticParams() {
  return [];
}
