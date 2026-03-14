/**
 * AI report generation API (POST /api/report/ai-generate).
 *
 * Duplicate-call prevention:
 * 1. If a full report exists, return it.
 * 2. If an API call is in flight:
 *    - Within 10 minutes: return \"generating\" without re-calling.
 *    - After 10 minutes with retries < 3: allow retry.
 *    - Retries >= 3: return error.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReport, generateMockReport, hasLLMConfig } from '@/lib/llm';
import { prisma } from '@/lib/db';
import { normalizeLocale } from '@/lib/i18n/config';
import { generateAstrolabe } from '@/lib/ziwei/wrapper';
import { captureAIGenerationError, captureApiError } from '@/lib/monitoring';
import { resolveStoredReportLocale, setStoredReportLocale } from '@/lib/report-preferences';
import { getTempReport, updateTempReport } from '@/lib/temp-report-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const RETRY_WINDOW_MS = 10 * 60 * 1000; // 10-minute retry window.
const MAX_RETRIES = 3; // Max retry attempts.

interface StoredReport {
  id: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  longitude: number;
  latitude: number;
  parsedData: string | null;
  coreIdentity: string | null;
  aiReport: string | null;
  apiCalledAt: Date | null;
  apiRetryCount: number | null;
  paidAt: Date | null;
}

interface StoredReportUpdate {
  apiCalledAt?: Date;
  apiRetryCount?: number;
  parsedData?: string;
  aiReport?: string;
  coreIdentity?: string;
  completedAt?: Date;
  paidAt?: Date;
}

async function getStoredReport(reportId: string): Promise<{
  report: StoredReport | null;
  useTempStore: boolean;
}> {
  const tempReport = getTempReport(reportId);

  if (tempReport) {
    return {
      report: tempReport,
      useTempStore: true,
    };
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    return {
      report,
      useTempStore: false,
    };
  } catch (error) {
    console.warn(`Database lookup failed for AI report ${reportId}:`, error);
    return {
      report: null,
      useTempStore: false,
    };
  }
}

async function updateStoredReport(
  reportId: string,
  data: StoredReportUpdate,
  useTempStore: boolean
) {
  if (useTempStore) {
    const updated = updateTempReport(reportId, data);

    if (!updated) {
      throw new Error(`Temporary report ${reportId} no longer exists`);
    }

    return updated;
  }

  return prisma.report.update({
    where: { id: reportId },
    data,
  });
}

// ─── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, locale: requestedLocale } = body;
    const fallbackLocale = normalizeLocale(requestedLocale);

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing report ID.' },
        { status: 400 }
      );
    }

    // 1. Fetch report data
    const { report, useTempStore } = await getStoredReport(reportId);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found.' },
        { status: 404 }
      );
    }

    const locale = resolveStoredReportLocale(report, fallbackLocale);
    const parsedData = setStoredReportLocale(report.parsedData, locale);

    if (report.parsedData !== parsedData) {
      await updateStoredReport(reportId, { parsedData }, useTempStore);
    }

    const paymentConfigured = Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock'
    );

    if (paymentConfigured && !report.paidAt) {
      return NextResponse.json(
        {
          success: false,
          status: 'payment_required',
          error: 'Payment confirmation is still pending',
        },
        { status: 403 }
      );
    }

    // 2. Return cached report if already complete
    if (report.aiReport && report.aiReport.length > 100) {
      return NextResponse.json({
        success: true,
        status: 'completed',
        cached: true,
        locale,
        coreIdentity: report.coreIdentity,
        report: report.aiReport,
      });
    }

    // 3. Avoid duplicate API calls
    if (report.apiCalledAt) {
      const timeSinceCall = Date.now() - report.apiCalledAt.getTime();
      const retryCount = report.apiRetryCount || 0;

      // Within retry window, return generating state
      if (timeSinceCall < RETRY_WINDOW_MS) {
        const remainingSeconds = Math.ceil((RETRY_WINDOW_MS - timeSinceCall) / 1000);
        return NextResponse.json({
          success: false,
          status: 'generating',
          message: 'The report is still being generated. Please try again shortly.',
          retryAfter: remainingSeconds,
        });
      }

      // After retry window, check retry count
      if (retryCount >= MAX_RETRIES) {
        return NextResponse.json({
          success: false,
          status: 'failed',
          error: 'The report failed too many times. Please contact support.',
        }, { status: 500 });
      }

      // Allow retry
      console.log(`Retrying API call (attempt ${retryCount + 1}/${MAX_RETRIES}) for report: ${reportId}`);
    }

    // 4. Mark API call start
    await updateStoredReport(reportId, {
      apiCalledAt: new Date(),
      apiRetryCount: (report.apiRetryCount || 0) + 1,
    }, useTempStore);

    // 5. Generate chart data
    const astrolabe = generateAstrolabe({
      birthDate: report.birthDate,
      birthTime: report.birthTime,
      birthMinute: 0,
      gender: report.gender as 'male' | 'female',
      longitude: report.longitude || 120,
      latitude: report.latitude || 0,
      birthCity: report.birthCity || '',
    });

    // 6. Prepare LLM input
    const llmInput = {
      email: report.email,
      gender: report.gender,
      birthDate: report.birthDate,
      birthTime: astrolabe.parsed.solarTime.shichen,
      birthCity: report.birthCity || '',
      mingGong: astrolabe.parsed.mingGong.majorStars.join('·') || 'No major stars',
      wuXingJu: astrolabe.parsed.wuXingJu,
      chineseZodiac: astrolabe.parsed.chineseZodiac,
      zodiac: astrolabe.parsed.zodiac,
      siZhu: astrolabe.parsed.siZhu,
      palaces: astrolabe.parsed.palaces,
      rawAstrolabe: astrolabe.raw,
      locale,
    };

    // 7. Generate report
    const hasApiKey = hasLLMConfig();

    let reportResult;
    try {
      if (hasApiKey) {
        console.log('Calling configured LLM API for AI report...');
        reportResult = await generateReport(llmInput);
      } else {
        console.log('No LLM API key, using mock report');
        reportResult = generateMockReport(llmInput);
      }
    } catch (aiError) {
      captureAIGenerationError(aiError, {
        reportId,
        email: report.email,
      });
      throw aiError;
    }

    // 8. Persist report
    const updateData: {
      parsedData: string;
      aiReport: string;
      coreIdentity: string;
      completedAt: Date;
      paidAt?: Date;
    } = {
      parsedData,
      aiReport: reportResult.report,
      coreIdentity: reportResult.coreIdentity,
      completedAt: new Date(),
    };

    if (!paymentConfigured && !report.paidAt) {
      updateData.paidAt = new Date();
    }

    await updateStoredReport(reportId, updateData, useTempStore);

    // 9. Response
    return NextResponse.json({
      success: true,
      status: 'completed',
      cached: false,
      locale,
      coreIdentity: reportResult.coreIdentity,
      report: reportResult.report,
    });
  } catch (error) {
    console.error('AI report generation error:', error);
    captureApiError(error, {
      endpoint: '/api/report/ai-generate',
      method: 'POST',
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `AI report generation failed: ${errorMessage}`, status: 'error' },
      { status: 500 }
    );
  }
}
