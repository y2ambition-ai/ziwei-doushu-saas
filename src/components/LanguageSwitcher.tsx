'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Locale, locales } from '@/lib/i18n/config';
import { getLocalizedPath } from '@/lib/i18n/routes';

interface LanguageSwitcherProps {
  locale: Locale;
  label?: string;
  className?: string;
  locked?: boolean;
}

export function LanguageSwitcher({
  locale,
  label,
  className = '',
  locked = false,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPath = pathname || '/';

  const items = useMemo(
    () =>
      locales.map((item) => ({
        locale: item,
        href: getLocalizedPath(item, currentPath),
      })),
    [currentPath]
  );

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {label ? <span className="text-[10px] uppercase tracking-[0.28em] text-[#6D5437]/60">{label}</span> : null}
      <div className="inline-flex rounded-full border border-[#B8925A]/30 bg-white/70 p-1 shadow-sm backdrop-blur">
        {items.map((item) => {
          const active = item.locale === locale;

          return (
            <button
              key={item.locale}
              type="button"
              onClick={() => {
                if (!locked || active) {
                  router.push(item.href);
                }
              }}
              disabled={locked && !active}
              aria-disabled={locked && !active}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] transition-colors ${
                active
                  ? 'bg-[#1A0F05] text-[#F7F3EC]'
                  : locked
                    ? 'cursor-not-allowed text-[#6D5437]/35'
                    : 'text-[#6D5437] hover:bg-[#B8925A]/10'
              }`}
            >
              {item.locale === 'en' ? 'EN' : '中文'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
