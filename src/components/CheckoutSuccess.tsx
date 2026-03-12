'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Locale } from '@/lib/i18n/config';
import { AppDictionary } from '@/lib/i18n/dictionaries';
import { getLocalizedPath } from '@/lib/i18n/routes';

interface CheckoutSuccessProps {
  locale: Locale;
  dictionary: AppDictionary;
  reportId?: string;
}

export default function CheckoutSuccess({ locale, dictionary, reportId }: CheckoutSuccessProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'error'>('checking');

  const resultHref = useMemo(
    () => (reportId ? getLocalizedPath(locale, `/result/${reportId}`) : getLocalizedPath(locale)),
    [locale, reportId]
  );

  useEffect(() => {
    if (!reportId) {
      setStatus('error');
      return;
    }

    let active = true;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const response = await fetch(`/api/report/${reportId}`, { cache: 'no-store' });
        const data = await response.json();

        if (!active) {
          return;
        }

        if (response.ok && data.report?.locale && data.report.locale !== locale) {
          router.replace(getLocalizedPath(data.report.locale, `/result/${reportId}`));
          return;
        }

        if (response.ok && (data.report?.paidAt || data.report?.aiReport)) {
          router.replace(resultHref);
          return;
        }

        timer = window.setTimeout(poll, 1800);
      } catch {
        if (!active) {
          return;
        }

        setStatus('error');
      }
    };

    poll();

    return () => {
      active = false;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [reportId, resultHref, router]);

  return (
    <main className="site-shell min-h-screen px-6 py-20 md:px-10">
      <div className="mx-auto max-w-3xl rounded-[32px] ink-panel px-8 py-12 text-[#f8f2e8] md:px-12">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#d3a96d]">{dictionary.success.eyebrow}</p>
        <h1 className="font-display mt-4 text-4xl leading-tight md:text-5xl">{dictionary.success.title}</h1>
        <p className="mt-5 text-base leading-8 text-[#f8f2e8]/80">{dictionary.success.body}</p>

        <div className="mt-8 rounded-2xl border border-[#d3a96d]/14 bg-white/4 px-5 py-5">
          <p className="text-sm uppercase tracking-[0.24em] text-[#d3a96d]">{dictionary.success.checking}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#d3a96d]" />
          </div>
          {status === 'error' ? (
            <p className="mt-4 text-sm leading-7 text-[#ffd8c7]">
              {locale === 'zh'
                ? '状态检查失败，你可以稍后手动打开报告。'
                : 'Status polling failed. You can open the report manually in a moment.'}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href={resultHref}
            className="inline-flex items-center justify-center rounded-full bg-[#f8f2e8] px-6 py-3 text-sm uppercase tracking-[0.24em] text-[#1a0f05]"
          >
            {dictionary.success.manual}
          </Link>
          <Link
            href={getLocalizedPath(locale)}
            className="inline-flex items-center justify-center rounded-full border border-[#d3a96d]/30 px-6 py-3 text-sm uppercase tracking-[0.24em] text-[#f8f2e8]"
          >
            {dictionary.success.backHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
