'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Locale } from '@/lib/i18n/config';
import { AppDictionary } from '@/lib/i18n/dictionaries';
import { getLocalizedPath } from '@/lib/i18n/routes';

const BaguaBackground = dynamic(
  () => import('@/components/BaguaBackground').then((mod) => mod.BaguaBackground),
  {
    ssr: false,
    loading: () => null,
  }
);

const shichenBlocks = [
  { value: 'zi', hour: 0, en: 'Zi hour · 23:00–01:00', zh: '子时 · 23:00–01:00' },
  { value: 'chou', hour: 2, en: 'Chou hour · 01:00–03:00', zh: '丑时 · 01:00–03:00' },
  { value: 'yin', hour: 4, en: 'Yin hour · 03:00–05:00', zh: '寅时 · 03:00–05:00' },
  { value: 'mao', hour: 6, en: 'Mao hour · 05:00–07:00', zh: '卯时 · 05:00–07:00' },
  { value: 'chen', hour: 8, en: 'Chen hour · 07:00–09:00', zh: '辰时 · 07:00–09:00' },
  { value: 'si', hour: 10, en: 'Si hour · 09:00–11:00', zh: '巳时 · 09:00–11:00' },
  { value: 'wu', hour: 12, en: 'Wu hour · 11:00–13:00', zh: '午时 · 11:00–13:00' },
  { value: 'wei', hour: 14, en: 'Wei hour · 13:00–15:00', zh: '未时 · 13:00–15:00' },
  { value: 'shen', hour: 16, en: 'Shen hour · 15:00–17:00', zh: '申时 · 15:00–17:00' },
  { value: 'you', hour: 18, en: 'You hour · 17:00–19:00', zh: '酉时 · 17:00–19:00' },
  { value: 'xu', hour: 20, en: 'Xu hour · 19:00–21:00', zh: '戌时 · 19:00–21:00' },
  { value: 'hai', hour: 22, en: 'Hai hour · 21:00–23:00', zh: '亥时 · 21:00–23:00' },
] as const;

interface HomePageProps {
  locale: Locale;
  dictionary: AppDictionary;
}

interface FormState {
  email: string;
  gender: string;
  birthDate: string;
  shichen: string;
  currentHour: string;
  currentMinute: string;
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4">
      <div className="soft-divider flex-1" />
      <span className="text-[#b8925a] text-xs">✦</span>
      <div className="soft-divider flex-1" />
    </div>
  );
}

function HeroSigilStage({
}: {
  locale: Locale;
}) {
  return (
    <div className="mx-auto w-full max-w-[360px] md:max-w-[400px]">
      <div className="paper-panel relative aspect-square w-full overflow-hidden rounded-[28px] p-6 md:p-7">
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.26, 0.42, 0.26], scale: [0.96, 1.03, 0.96] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle,_rgba(211,169,109,0.28),_rgba(211,169,109,0.02)_58%,_transparent_72%)] blur-3xl"
        />

        <motion.div
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 72, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[10%]"
        >
          <BaguaBackground className="h-full w-full opacity-80" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={{ rotate: -360 }}
          transition={{ duration: 52, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[22%] rounded-full border border-[#b8925a]/14"
        >
          <div className="absolute inset-3 rounded-full border border-[#b8925a]/10" />
          <div className="absolute inset-8 rounded-full border border-[#1a0f05]/6" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_transparent_58%,_rgba(184,146,90,0.08)_100%)]" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={{ y: [0, -10, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[35%] rounded-full border border-[#b8925a]/18 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(247,243,236,0.82)_45%,_rgba(211,169,109,0.16)_100%)] shadow-[0_24px_70px_rgba(184,146,90,0.16)]"
        />
      </div>
    </div>
  );
}

export default function HomePage({ locale, dictionary }: HomePageProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    email: '',
    gender: '',
    birthDate: '',
    shichen: '',
    currentHour: '',
    currentMinute: '0',
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'chart' | 'reading' | 'success'>('chart');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const home = dictionary.home;
  const heroTitleLines =
    locale === 'zh'
      ? ['这不只是一张命盘，', '更是一份看清人生转机的东方指引。']
      : ['More than a chart,', 'an Eastern reading for life turning points.'];
  const heroHighlights =
    locale === 'zh'
      ? ['30+ 道家传承脉络', '完整十二宫命盘', '7 天内可重复查看']
      : ['30+ lineage source notes', 'full twelve-palace chart', 'return within 7 days'];
  const hours = Array.from({ length: 24 }, (_, index) => index);
  const minutes = Array.from({ length: 60 }, (_, index) => index);

  const shichenOptions = useMemo(
    () =>
      shichenBlocks.map((item) => ({
        ...item,
        label: locale === 'zh' ? item.zh : item.en,
      })),
    [locale]
  );

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.email) {
      nextErrors.email = home.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = home.errors.emailInvalid;
    }

    if (!form.gender) {
      nextErrors.gender = home.errors.genderRequired;
    }

    if (!form.birthDate) {
      nextErrors.birthDate = home.errors.birthDateIncomplete;
    }

    if (!form.shichen) {
      nextErrors.shichen = home.errors.shichenRequired;
    }

    if (!form.currentHour) {
      nextErrors.currentHour = home.errors.currentHourRequired;
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const shichen = shichenOptions.find((item) => item.value === form.shichen);

    setLoading(true);
    setLoadingStep('chart');
    setError(null);

    const stepTimer = window.setTimeout(() => {
      setLoadingStep('reading');
    }, 900);

    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          gender: form.gender,
          birthDate: form.birthDate,
          birthTime: shichen?.hour ?? 12,
          birthMinute: 0,
          currentHour: parseInt(form.currentHour, 10),
          currentMinute: parseInt(form.currentMinute || '0', 10),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.reportId) {
        throw new Error(data.error || home.errors.submitFailed);
      }

      setLoadingStep('success');
      router.push(getLocalizedPath(locale, `/chart/${data.reportId}`));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : home.errors.submitFailed);
    } finally {
      window.clearTimeout(stepTimer);
      setLoading(false);
    }
  };

  return (
    <div className="site-shell min-h-screen">
      <header className="fixed top-0 z-50 w-full border-b border-[#b8925a]/10 bg-[#f7f0e7]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-10">    
          <button
            type="button"
            onClick={() => router.push(getLocalizedPath(locale))}
            className="flex items-center gap-3 text-left"
          >
            <span className="text-[#b8925a] text-xl">☯</span>
            <div>
              <p className="font-display text-lg tracking-[0.18em] text-[#1a0f05]">{dictionary.brand.name}</p>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#6d5437]/70">{dictionary.brand.mark}</p>
            </div>
          </button>
          <LanguageSwitcher locale={locale} />
        </div>
      </header>

      <main className="pt-20">
        {/* Viewport 1: Hero */}
        <section className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 md:px-10 overflow-hidden">
          <div className="relative z-10 w-full max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
            <div className="flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-display text-[#1a0f05] leading-snug ${
                  locale === 'zh' ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
                }`}
              >
                <span className="block mb-3 text-[#1a0f05]">{heroTitleLines[0]}</span>
                <span className="block text-[#b8925a]">{heroTitleLines[1]}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 text-base leading-relaxed text-[#4d3923]/90 md:text-lg max-w-md"
              >
                {home.heroDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-12 flex flex-col gap-5 text-[12px] uppercase tracking-[0.15em] text-[#6d5437]"
              >
                {heroHighlights.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="text-[#b8925a]">✦</span>
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="hidden md:flex justify-center items-center">
              <HeroSigilStage locale={locale} />
            </div>
          </div>
        </section>
        {/* Viewport 2: Form */}
        <section id="reading" className="relative flex min-h-screen flex-col justify-center px-6 py-20 md:px-10">
          <div className="mx-auto grid w-full max-w-[1200px] gap-12 lg:grid-cols-[1fr_1.2fr] items-center">

            {/* Left Info Panel */}
            <div className="text-[#1a0f05] max-w-md">
              <p className="text-[11px] uppercase tracking-[0.4em] text-[#b8925a] mb-4">{home.formEyebrow}</p>
              <h2 className="font-display text-4xl leading-tight md:text-5xl">{home.formTitle}</h2> 
              <p className="mt-6 text-base leading-relaxed text-[#5c5246]">{home.formDescription}</p>       

              <div className="mt-12 space-y-6">
                <div className="border-l-2 border-[#b8925a]/40 pl-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#b8925a] mb-2">{dictionary.chart.ctaEyebrow}</p>
                  <p className="font-display text-2xl leading-tight mb-3 text-[#1a0f05]">{dictionary.chart.ctaTitle}</p>
                  <p className="text-sm leading-relaxed text-[#6d5437]">{dictionary.chart.ctaBody}</p> 
                </div>
                <div className="rounded-xl bg-white/40 backdrop-blur-sm p-6 border border-[#b8925a]/10">
                  <p className="text-sm leading-relaxed text-[#1a0f05]/90">{dictionary.chart.paymentSecurity}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#b8925a]">{dictionary.chart.ctaNote}</p>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <form onSubmit={handleSubmit} className="w-full rounded-[32px] bg-white/60 backdrop-blur-xl p-8 md:p-12 shadow-[0_20px_60px_rgba(184,146,90,0.08)] border border-[#b8925a]/10">
              <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#8c6c45] font-bold">{home.fields.email}</label>
                    <input
                      type="email"
                      value={form.email}
                      placeholder={home.fields.emailPlaceholder}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="w-full rounded-xl border border-[#b8925a]/20 bg-white px-4 py-3 text-[#1a0f05] outline-none transition focus:border-[#b8925a] focus:ring-1 focus:ring-[#b8925a]"
                    />
                    {validationErrors.email ? <p className="text-[11px] text-red-600">{validationErrors.email}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#8c6c45] font-bold">{home.fields.gender}</label>
                    <select
                      value={form.gender}
                      onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                      className="w-full rounded-xl border border-[#b8925a]/20 bg-white px-4 py-3 text-[#1a0f05] outline-none transition focus:border-[#b8925a] focus:ring-1 focus:ring-[#b8925a] appearance-none"
                    >
                      <option value="">--</option>
                      <option value="male">{home.fields.male}</option>
                      <option value="female">{home.fields.female}</option>
                    </select>
                    {validationErrors.gender ? <p className="text-[11px] text-red-600">{validationErrors.gender}</p> : null}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#8c6c45] font-bold">{home.fields.birthDate}</label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))}
                      className="w-full rounded-xl border border-[#b8925a]/20 bg-white px-4 py-3 text-[#1a0f05] outline-none transition focus:border-[#b8925a] focus:ring-1 focus:ring-[#b8925a]"
                    />
                    {validationErrors.birthDate ? <p className="text-[11px] text-red-600">{validationErrors.birthDate}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#8c6c45] font-bold">{home.fields.birthHour}</label>
                    <select
                      value={form.shichen}
                      onChange={(event) => setForm((current) => ({ ...current, shichen: event.target.value }))}
                      className="w-full rounded-xl border border-[#b8925a]/20 bg-white px-4 py-3 text-[#1a0f05] outline-none transition focus:border-[#b8925a] focus:ring-1 focus:ring-[#b8925a] appearance-none"
                    >
                      <option value="">--</option>
                      {shichenOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {validationErrors.shichen ? <p className="text-[11px] text-red-600">{validationErrors.shichen}</p> : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#b8925a]/20 bg-[#fdfaf6] p-6 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#b8925a]">📍</span>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#1a0f05] font-bold">{home.fields.birthplaceTime}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-[#6d5437] mb-4">{home.fields.birthplaceTimeHint}</p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-[0.1em] text-[#8c6c45]">{home.fields.hour}</label>
                      <select
                        value={form.currentHour}
                        onChange={(event) => setForm((current) => ({ ...current, currentHour: event.target.value }))}
                        className="w-full rounded-lg border border-[#b8925a]/20 bg-white px-3 py-2 text-sm text-[#1a0f05] outline-none transition focus:border-[#b8925a]"
                      >
                        <option value="">--</option>
                        {hours.map((value) => (
                          <option key={value} value={String(value)}>
                            {String(value).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      {validationErrors.currentHour ? <p className="text-[10px] text-red-600">{validationErrors.currentHour}</p> : null}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-[0.1em] text-[#8c6c45]">{home.fields.minute}</label>
                      <select
                        value={form.currentMinute}
                        onChange={(event) => setForm((current) => ({ ...current, currentMinute: event.target.value }))}
                        className="w-full rounded-lg border border-[#b8925a]/20 bg-white px-3 py-2 text-sm text-[#1a0f05] outline-none transition focus:border-[#b8925a]"
                      >
                        {minutes.map((value) => (
                          <option key={value} value={String(value)}>
                            {String(value).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {error ? <p className="mt-4 text-[13px] text-red-600 p-3 bg-red-50 rounded-lg">{error}</p> : null}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#1a0f05] py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#f7f3ec] transition-all hover:bg-[#b8925a] disabled:opacity-50"
                >
                  {loading
                    ? loadingStep === 'chart'
                      ? home.loading.chart
                      : loadingStep === 'reading'
                        ? home.loading.reading
                        : home.loading.success
                    : home.fields.submit}
                </button>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="rounded-full border border-[#b8925a]/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[#8c6c45]">
                    {home.fields.submitBadge}
                  </span>
                  <p className="text-[10px] tracking-wide text-[#6d5437]">{home.fields.privacy}</p>
                </div>
              </div>
            </form>
          </div>
        </section>

      </main>

      <footer className="border-t border-[#b8925a]/10 bg-[#1a0f05] px-6 py-12 md:px-10 text-[#f8f2e8]">        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl tracking-[0.14em] text-[#1a0f05]">{dictionary.brand.name}</p>
            <p className="mt-2 text-sm leading-7 text-[#5f472b]">{home.footer.line}</p>
          </div>
          <div className="max-w-xl text-sm leading-7 text-[#6d5437]">{home.footer.disclaimer}</div>
        </div>
      </footer>
    </div>
  );
}