/**
 * Report generation API (POST /api/report/generate).
 * Uses the user's current local time to approximate longitude for true-solar time.
 * Reuses cached reports within 24 hours.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAstrolabe } from '@/lib/ziwei/wrapper';
import {
  generateReport,
  generateMockReport,
  GenerateReportInput,
} from '@/lib/llm';
import { prisma } from '@/lib/db';
import { Locale, normalizeLocale } from '@/lib/i18n/config';
import { resolveStoredReportLocale, setStoredReportLocale } from '@/lib/report-preferences';
import { createTempReport } from '@/lib/temp-report-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const BEIJING_LONGITUDE = 120; // Reference for UTC+8.
const CACHE_HOURS = 24; // Cache window in hours.

// ─── Request Schema ────────────────────────────────────────────────────────────

interface GenerateRequest {
  email: string;
  gender: 'male' | 'female';
  locale?: string;
  country?: string; // ISO country code: CN, US, SG, MY, etc.
  birthDate: string; // YYYY-MM-DD
  birthTime: number; // 0-23
  birthMinute: number; // 0-59
  // User's current local time at birthplace (for longitude approximation)
  currentHour: number; // 0-23
  currentMinute: number; // 0-59
}

// ─── Helper: Calculate Longitude from Time Difference ───────────────────────────

/**
 * Approximate longitude from the user's local time difference.
 * Logic: user time vs reference time → time delta → longitude offset.
 */
function calculateLongitudeFromTimeDiff(
  userHour: number,
  userMinute: number
): number {
  const now = new Date();
  const beijingHour = now.getHours();
  const beijingMinute = now.getMinutes();

  const userTotalMinutes = userHour * 60 + userMinute;
  const beijingTotalMinutes = beijingHour * 60 + beijingMinute;

  let timeDiffMinutes = userTotalMinutes - beijingTotalMinutes;

  if (timeDiffMinutes > 12 * 60) {
    timeDiffMinutes -= 24 * 60;
  } else if (timeDiffMinutes < -12 * 60) {
    timeDiffMinutes += 24 * 60;
  }

  const longitudeOffset = timeDiffMinutes / 4;
  const longitude = BEIJING_LONGITUDE + longitudeOffset;

  return Math.max(-180, Math.min(180, longitude));
}

// ─── Helper: Check Cache ───────────────────────────────────────────────────────

/**
 * Check cached reports within the 24-hour window.
 */
async function getCachedReport(body: GenerateRequest, locale: Locale): Promise<{
  found: boolean;
  report?: {
    id: string;
    coreIdentity: string;
    aiReport: string;
    rawAstrolabe: string;
  };
}> {
  try {
    const cacheTime = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000);

    const cachedReports = await prisma.report.findMany({
      where: {
        email: body.email,
        birthDate: body.birthDate,
        birthTime: body.birthTime,
        gender: body.gender,
        createdAt: {
          gte: cacheTime,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const cached = cachedReports.find(
      (report) => resolveStoredReportLocale(report, locale) === locale
    );

    if (cached) {
      return {
        found: true,
        report: {
          id: cached.id,
          coreIdentity: cached.coreIdentity || '',
          aiReport: cached.aiReport || '',
          rawAstrolabe: cached.rawAstrolabe || '{}',
        },
      };
    }
  } catch (error) {
    console.log('Cache check failed, continuing with fresh generation');
  }

  return { found: false };
}

function findLifePalace(rawPalaces: Array<{ name?: string; isOriginalPalace?: boolean }>): Record<string, unknown> | null {
  const direct = rawPalaces.find((palace) => palace?.isOriginalPalace);
  if (direct) {
    return direct as Record<string, unknown>;
  }

  const fallback = rawPalaces.find((palace) => {
    const name = String(palace?.name || '').trim().toLowerCase();
    return name === 'soul' || name === 'life' || name === '\u547d' || name === '\u547d\u5bab';
  });

  return (fallback as Record<string, unknown>) || null;
}

// ─── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const locale = normalizeLocale(body.locale);

    // 1. Validate input
    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // 2. Reuse cached report within 24 hours
    const cached = await getCachedReport(body, locale);
    if (cached.found && cached.report) {
      console.log('Returning cached report for:', body.email);
      const rawAstrolabe = JSON.parse(cached.report.rawAstrolabe);
      return NextResponse.json({
        success: true,
        reportId: cached.report.id,
        coreIdentity: cached.report.coreIdentity,
        report: cached.report.aiReport,
        cached: true,
        message: 'A matching report was generated within the last 24 hours. Opening the cached result.',
        astrolabe: {
          mingGong: findLifePalace((rawAstrolabe.palaces || []) as Array<{ name?: string; isOriginalPalace?: boolean }>) || {},
          chineseZodiac: rawAstrolabe.zodiac,
        },
      });
    }

    // 3. Approximate longitude
    const longitude = calculateLongitudeFromTimeDiff(
      body.currentHour,
      body.currentMinute
    );

    // 4. Generate chart
    const astrolabe = generateAstrolabe({
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthMinute: body.birthMinute,
      gender: body.gender,
      longitude,
      latitude: 0,
      birthCity: `Longitude ${longitude.toFixed(1)}°`,
    });

    // 5. Prepare LLM input
    const llmInput: GenerateReportInput = {
      email: body.email,
      gender: body.gender,
      birthDate: body.birthDate,
      birthTime: astrolabe.parsed.solarTime.shichen,
      birthCity: `Longitude ${longitude.toFixed(1)}°`,
      mingGong: astrolabe.parsed.mingGong.majorStars.join('·') || 'No major stars',
      wuXingJu: astrolabe.parsed.wuXingJu,
      chineseZodiac: astrolabe.parsed.chineseZodiac,
      zodiac: astrolabe.parsed.zodiac,
      siZhu: astrolabe.parsed.siZhu,
      palaces: astrolabe.parsed.palaces,
      rawAstrolabe: astrolabe.raw,
      locale,
    };

    // 6. Generate report (skip remote LLM for now)
    const reportResult = {
      coreIdentity: `Life palace stars: ${llmInput.mingGong}; five-element pattern: ${llmInput.wuXingJu}.`,
      report: '', // Skip AI report generation for now.
    };

    // 7. Persist report
    let reportId = `test-${Date.now()}`;
    try {
      const report = await prisma.report.create({
        data: {
          email: body.email,
          gender: body.gender,
          country: body.country || 'OTHER',
          birthDate: body.birthDate,
          birthTime: body.birthTime,
          birthCity: `Longitude ${longitude.toFixed(1)}°`,
          longitude,
          parsedData: setStoredReportLocale(null, locale),
          rawAstrolabe: JSON.stringify(astrolabe.raw),
          aiReport: reportResult.report,
          coreIdentity: reportResult.coreIdentity,
        },
      });
      reportId = report.id;
    } catch (dbError) {
      createTempReport({
        id: reportId,
        email: body.email,
        gender: body.gender,
        country: body.country || 'OTHER',
        birthDate: body.birthDate,
        birthTime: body.birthTime,
        birthMinute: body.birthMinute,
        birthCity: `Longitude ${longitude.toFixed(1)}°`,
        longitude,
        latitude: 0,
        parsedData: setStoredReportLocale(null, locale),
        rawAstrolabe: JSON.stringify(astrolabe.raw),
        aiReport: reportResult.report,
        coreIdentity: reportResult.coreIdentity,
      });
      console.log('Database not available, using temporary report store');
    }

    // 8. Response
    return NextResponse.json({
      success: true,
      reportId,
      coreIdentity: reportResult.coreIdentity,
      report: reportResult.report,
      cached: false,
      calculatedLongitude: longitude,
      astrolabe: {
        mingGong: astrolabe.parsed.mingGong,
        wuXingJu: astrolabe.parsed.wuXingJu,
        chineseZodiac: astrolabe.parsed.chineseZodiac,
        siZhu: astrolabe.parsed.siZhu,
        solarTime: astrolabe.parsed.solarTime,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Report generation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// ─── Validation ────────────────────────────────────────────────────────────────

function validateInput(body: GenerateRequest): string | null {
  if (!body.email || !isValidEmail(body.email)) {
    return 'Please enter a valid email address.';
  }

  if (!body.gender || !['male', 'female'].includes(body.gender)) {
    return 'Please select a gender.';
  }

  if (!body.birthDate || !isValidDate(body.birthDate)) {
    return 'Please enter a valid birth date.';
  }

  if (typeof body.birthTime !== 'number' || body.birthTime < 0 || body.birthTime > 23) {
    return 'Please select a valid birth time block.';
  }

  if (typeof body.currentHour !== 'number' || body.currentHour < 0 || body.currentHour > 23) {
    return 'Please enter the local hour at the birthplace.';
  }

  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
}
