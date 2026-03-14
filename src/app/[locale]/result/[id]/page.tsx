import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import ReportContent from '@/app/result/[id]/ReportContent';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocalizedPath } from '@/lib/i18n/routes';
import { getReportViewData } from '@/lib/report-view';

interface LocalizedResultPageProps {
  params: Promise<{ locale: string; id: string }>;
}

function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock');
}

export async function generateMetadata({ params }: LocalizedResultPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: 'Tianming Secrets | Zi Wei Dou Shu Reading',
    description: dictionary.meta.description,
  };
}

export default async function LocalizedResultPage({ params }: LocalizedResultPageProps) {
  const { locale, id } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const report = await getReportViewData(id);

  if (!report) {
    notFound();
  }

  if (report.locale !== locale) {
    redirect(getLocalizedPath(report.locale, `/result/${id}`));
  }

  return (
    <ReportContent
      locale={locale}
      report={{
        ...report,
        paymentEnabled: isStripeConfigured(),
      }}
    />
  );
}

export async function generateStaticParams() {
  return [];
}
