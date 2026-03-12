import { redirect } from 'next/navigation';

import { defaultLocale } from '@/lib/i18n/config';

interface LegacyChartPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyChartPage({ params }: LegacyChartPageProps) {
  const { id } = await params;
  redirect(`/${defaultLocale}/chart/${id}`);
}

export async function generateStaticParams() {
  return [];
}