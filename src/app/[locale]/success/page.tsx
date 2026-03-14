import { notFound, redirect } from 'next/navigation';

import CheckoutSuccess from '@/components/CheckoutSuccess';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocalizedPath } from '@/lib/i18n/routes';
import { getReportViewData } from '@/lib/report-view';

interface LocalizedSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readSearchValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function LocalizedSuccessPage({ params, searchParams }: LocalizedSuccessPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const query = await searchParams;
  const reportId = readSearchValue(query.report_id);

  if (reportId) {
    const report = await getReportViewData(reportId);

    if (report && report.locale !== locale) {
      redirect(getLocalizedPath(report.locale, `/success?report_id=${reportId}`));
    }
  }

  return <CheckoutSuccess locale={locale} dictionary={getDictionary(locale)} reportId={reportId} />;
}
