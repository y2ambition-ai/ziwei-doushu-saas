import { redirect } from 'next/navigation';

import { defaultLocale } from '@/lib/i18n/config';

interface LegacyResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyResultPage({ params }: LegacyResultPageProps) {
  const { id } = await params;
  redirect(`/${defaultLocale}/result/${id}`);
}

export async function generateStaticParams() {
  return [];
}