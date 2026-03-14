import { Locale } from './config';

const dictionaries = {
  en: {
    meta: {
      title: 'Tianming Secrets | Zi Wei Dou Shu Reading',
      description:
        'A premium Zi Wei Dou Shu reading shaped by Taoist lineage wisdom, designed to reveal your chart, timing, relationships, and life direction in clear English.',
    },
    brand: {
      name: 'Tianming Secrets',
      mark: 'Eastern Metaphysics Studio',
    },
    nav: {
      story: 'Why Trust This',
      form: 'Get My Chart',
      switchLabel: 'Language',
    },
    home: {
      heroEyebrow: 'A premium Zi Wei reading shaped by Taoist lineage wisdom',
      heroTitle: 'More than a chart,',
      heroTitleAccent: 'it is an Eastern reading for life turning points.',
      heroDescription:
        'Distilled from 30+ Taoist lineage teachers and classical source notes, this experience helps you see your full Zi Wei chart, understand the forces shaping your path, and make sense of major choices in love, work, and timing.',
      primaryCta: 'Get my free chart',
      secondaryCta: 'Why people trust this',
      proofTitle: 'Why this reading feels worth trusting',
      proofItems: [
        { value: '30+', label: 'lineage voices', sub: 'distilled from Taoist teachers and classical source notes' },
        { value: '12', label: 'palaces rendered', sub: 'a complete chart, not a vague personality blurb' },
        { value: '7-day', label: 'return window', sub: 'revisit with the same email and inputs' },
        { value: 'EN', label: 'English delivery', sub: 'all charts and readings are delivered in English' },
      ],
      storyEyebrow: 'Why Trust This',
      storyTitle: 'An old lineage, translated into a premium modern experience.',
      storyBody:
        'This is not generic fortune-copy dressed up as mysticism. The reading is shaped around traditional Zi Wei structure, lineage-informed judgment, and a clearer digital flow that helps you see the evidence in the chart before deciding whether to go deeper.',
      methodTitle: 'What you receive',
      methodItems: [
        {
          title: '1. A chart aligned to your birth details',
          body: 'Your birth date, time block, and birthplace time are used to calibrate the chart so the reading is anchored to your real timing, not a generic template.',
        },
        {
          title: '2. A full twelve-palace Zi Wei chart',
          body: 'You see the complete chart structure first, including palace layout and star positions, before any premium step appears.',
        },
        {
          title: '3. A deeper reading when you want it',
          body: 'If the chart resonates, you can unlock a long-form reading on life direction, relationships, timing cycles, and practical guidance in English.',
        },
      ],
      premiumEyebrow: 'In-depth reading',
      premiumTitle: 'The chart is only the beginning. The value is in what it reveals about your life.',
      premiumBody:
        'The premium report goes beyond surface description. It connects palace structure, star relationships, and timing patterns into a longer reading on career direction, relationship dynamics, key turning years, and what to lean into next.',
      premiumItems: [
        'Career, relationships, timing, and major phases interpreted together',
        '7-day revisit for the same email and birth inputs',
        'A complete English report, structured for clarity and action',
      ],
      premiumNote: 'See the chart first. Decide on the deeper reading only if it feels right.',
      formEyebrow: 'Get Your Chart',
      formTitle: 'Enter your details to unlock your Zi Wei chart',
      formDescription:
        'A few details are enough to generate your chart and prepare the reading. The more accurate the birthplace time, the more reliable the timing calibration.',
      fields: {
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        birthDate: 'Date of birth',
        birthYearPlaceholder: 'YYYY',
        birthMonthPlaceholder: 'MM',
        birthDayPlaceholder: 'DD',
        birthHour: 'Birth time block',
        birthplaceTime: 'Current time at birthplace',
        birthplaceTimeHint:
          'Use the current local time in the birthplace, not the time where you are now.',
        hour: 'Hour',
        minute: 'Minute',
        submit: 'Unlock my free chart',
        submitBadge: 'FREE',
        privacy: 'Used only to generate your chart and deliver your reading.',
      },
      errors: {
        emailRequired: 'Please enter your email.',
        emailInvalid: 'Please enter a valid email address.',
        genderRequired: 'Please select a gender.',
        yearRequired: 'Please select a birth year.',
        monthRequired: 'Please select a birth month.',
        dayRequired: 'Please select a birth day.',
        shichenRequired: 'Please select a birth time block.',
        currentHourRequired: 'Please select the birthplace hour.',
        birthDateIncomplete: 'Please complete the birth date.',
        birthDateInvalid: 'Please enter a valid birth date in YYYY-MM-DD format.',
        submitFailed: 'Chart generation failed. Please try again.',
      },
      loading: {
        chart: 'Calculating chart...',
        reading: 'Calibrating true solar time...',
        success: 'Opening your chart...',
      },
      footer: {
        line: 'Taoist metaphysical wisdom, organized into a clearer and more premium reading experience.',
        disclaimer:
          'Readings are for reflection only and are not legal, medical, or financial advice.',
      },
    },
    chart: {
      generatedAt: 'Chart generated',
      chartTitle: 'Zi Wei Dou Shu Chart',
      gender: 'Gender',
      zodiac: 'Zodiac',
      western: 'Western sign',
      elements: 'Five-element pattern',
      solarDate: 'Solar date',
      lunarDate: 'Lunar date',
      lifePalace: 'Life palace stars',
      bodyPalace: 'Body palace stars',
      shichen: 'Birth time block',
      pillars: 'Four pillars',
      legendMain: 'Major stars',
      legendMinor: 'Minor stars',
      legendAdj: 'Supporting stars',
      legendDecadal: 'Decadal cycle',
      legendSpirits: 'Twelve spirits',
      ctaEyebrow: 'In-depth reading',
      ctaTitle: 'Your chart is ready. The next step is understanding what it means for your life.',
      ctaBody:
        'The full report turns chart structure into insight across career direction, relationship patterns, timing cycles, and the choices that matter most right now.',
      ctaNote: 'Return within 7 days with the same email and birth inputs.',
      freeReusePrefix: 'A reusable paid report was found. Redirecting, ',
      freeReuseSuffix: ' days remaining.',
      openReading: 'Open full report',
      getReading: 'Unlock premium reading',
      processing: 'Processing...',
      backHome: 'Start over',
      print: 'Print chart',
      disclaimer: 'The chart is for reflection only. Personal data should not be retained longer than necessary.',
      paymentError: 'Payment could not be started. Please try again in a moment.',
      paymentSecurity: 'Secure checkout unlocks the full report, with a 7-day return window for the same email and inputs.',
    },
    result: {
      generatedAt: 'Generated',
      coreIdentity: 'Core identity',
      loadingTitle: 'Your AI reader is writing',
      loadingBody: 'The system is combining palace structure, star relationships, and timing cycles into a long-form interpretation.',
      loadingHint: 'Open the same chart again with the same email to revisit during the reuse window.',
      waitingTitle: 'The report is still being prepared',
      waitingBody: 'Please wait a moment. This page will try again automatically.',
      retryAfter: 'Auto refresh in',
      retry: 'Retry',
      regenerate: 'Start over',
      print: 'Print / Save PDF',
      disclaimer: 'Metaphysics content is for reflection only and is not legal, medical, or financial advice.',
      quote: 'Read the pattern, then choose your next move.',
      paymentRequiredTitle: 'Payment confirmation is still pending.',
      paymentRequiredBody:
        'Your chart is ready, but the premium report unlocks only after the paid step has completed. Please return to the chart page and continue checkout.',
      backToChart: 'Back to chart',
    },
    success: {
      eyebrow: 'Payment confirmed',
      title: 'Preparing your premium reading.',
      body: 'Your payment went through. We are linking it to the chart and opening the report as soon as it is ready.',
      checking: 'Checking report status...',
      manual: 'Open report now',
      backHome: 'Back home',
    },
  },
} as const;

export type AppDictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): AppDictionary {
  return dictionaries[locale];
}
