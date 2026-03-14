import { defaultLocale, Locale, locales, normalizeLocale } from './config';

export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '/';
}

export function getLocalizedPath(locale: Locale, pathname: string = '/'): string {
  const cleanPath = stripLocaleFromPathname(pathname);

  if (cleanPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${cleanPath}`;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const [firstSegment] = pathname.split('/').filter(Boolean);
  return normalizeLocale(firstSegment || defaultLocale);
}
