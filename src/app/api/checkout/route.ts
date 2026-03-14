/**
 * Stripe Checkout Session API (POST /api/checkout).
 * Reuse paid reports within 7 days for the same inputs.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createCheckoutSession,
  createMockCheckoutSession,
} from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { Locale, normalizeLocale } from '@/lib/i18n/config';
import { resolveStoredReportLocale, setStoredReportLocale } from '@/lib/report-preferences';
import { getTempReport, updateTempReport } from '@/lib/temp-report-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_REUSE_DAYS = 7; // Free reuse window in days.

// ─── Request Schema ────────────────────────────────────────────────────────────

interface CheckoutRequest {
  email: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: number;
  birthMinute: number;
  birthCity: string;
  reportId: string; // Current report ID
  locale?: string;
}

// ─── Helper: Check 7-day free reuse ───────────────────────────────────────────

/**
 * Check for a paid report within the 7-day reuse window.
 */
async function getValidPaidReport(body: CheckoutRequest, locale: Locale): Promise<{
  found: boolean;
  reportId?: string;
  aiReport?: string;
  coreIdentity?: string;
  daysRemaining?: number;
}> {
  try {
    const validTime = new Date(Date.now() - FREE_REUSE_DAYS * 24 * 60 * 60 * 1000);

    const paidReports = await prisma.report.findMany({
      where: {
        email: body.email,
        birthDate: body.birthDate,
        birthTime: body.birthTime,
        gender: body.gender,
        paidAt: {
          gte: validTime,
        },
        aiReport: {
          not: null, // Ensure report exists
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
      take: 10,
    });

    const paidReport = paidReports.find(
      (report) =>
        Boolean(report.paidAt && report.aiReport) &&
        resolveStoredReportLocale(report, locale) === locale
    );

    if (paidReport && paidReport.paidAt && paidReport.aiReport) {
      const daysRemaining = Math.ceil(
        (FREE_REUSE_DAYS * 24 * 60 * 60 * 1000 - (Date.now() - paidReport.paidAt.getTime())) /
        (24 * 60 * 60 * 1000)
      );
      return {
        found: true,
        reportId: paidReport.id,
        aiReport: paidReport.aiReport,
        coreIdentity: paidReport.coreIdentity || '',
        daysRemaining: Math.max(0, daysRemaining),
      };
    }
  } catch (error) {
    console.log('Free reuse check failed, continuing with payment');
  }

  return { found: false };
}

// ─── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const requestedLocale = normalizeLocale(body.locale);

    // Validate input
    if (!body.email || !body.gender || !body.birthDate || !body.birthCity) {
      return NextResponse.json(
        { error: 'Please complete all required fields.' },
        { status: 400 }
      );
    }

    const tempReport = getTempReport(body.reportId);
    const currentReport = tempReport || await prisma.report.findUnique({
      where: { id: body.reportId },
    });

    if (!currentReport) {
      return NextResponse.json(
        { error: 'Report not found.' },
        { status: 404 }
      );
    }

    const locale = resolveStoredReportLocale(currentReport, requestedLocale);
    const parsedData = setStoredReportLocale(currentReport.parsedData, locale);

    if (tempReport) {
      updateTempReport(body.reportId, { parsedData });
    } else if (currentReport.parsedData !== parsedData) {
      await prisma.report.update({
        where: { id: body.reportId },
        data: { parsedData },
      });
    }

    // 1. Check free reuse window (no email, no re-generation)
    const validPaid = await getValidPaidReport(body, locale);
    if (validPaid.found && validPaid.reportId) {
      console.log('Found valid paid report for:', body.email, 'days remaining:', validPaid.daysRemaining);
      return NextResponse.json({
        success: true,
        freeReuse: true,
        locale,
        reportId: validPaid.reportId,
        aiReport: validPaid.aiReport,
        coreIdentity: validPaid.coreIdentity,
        daysRemaining: validPaid.daysRemaining,
        message: `A matching paid report exists. ${validPaid.daysRemaining} days remaining in the reuse window.`,
      });
    }

    // 2. No valid paid report, proceed to checkout
    // Check if we have Stripe key (production mode)
    const hasStripeKey = process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY !== 'sk_test_mock';

    // Create checkout session
    const checkoutInput = {
      ...body,
      locale,
    };

    const result = hasStripeKey
      ? await createCheckoutSession(checkoutInput)
      : createMockCheckoutSession(checkoutInput);

    return NextResponse.json({
      success: true,
      locale,
      requiresPayment: true,
      sessionId: result.sessionId,
      url: result.url,
      isMock: !hasStripeKey,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
