import { redirect } from 'next/navigation';

import { defaultLocale } from '@/lib/i18n/config';

interface LegacySuccessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LegacySuccessPage({ searchParams }: LegacySuccessPageProps) {
  const params = await searchParams;
  const serialized = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => serialized.append(key, item));
      return;
    }

    if (typeof value === 'string') {
      serialized.set(key, value);
    }
  });

  redirect(`/${defaultLocale}/success${serialized.toString() ? `?${serialized.toString()}` : ''}`);
}