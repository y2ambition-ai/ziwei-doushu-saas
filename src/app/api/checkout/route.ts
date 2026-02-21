/**
 * Stripe Checkout Session API
 * POST /api/checkout
 *
 * 支持7天内免费复用：同一邮箱+相同参数，7天内不需要重复付费
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createCheckoutSession,
  createMockCheckoutSession,
} from '@/lib/stripe';
import { prisma } from '@/lib/db';

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_REUSE_DAYS = 7; // 7天内免费复用

// ─── Request Schema ────────────────────────────────────────────────────────────

interface CheckoutRequest {
  email: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: number;
  birthMinute: number;
  birthCity: string;
  reportId: string; // 当前报告ID
}

// ─── Helper: Check 7-day free reuse ───────────────────────────────────────────

/**
 * 检查是否有7天内已付费的相同参数报告
 */
async function getValidPaidReport(body: CheckoutRequest): Promise<{
  found: boolean;
  reportId?: string;
  daysRemaining?: number;
}> {
  try {
    const validTime = new Date(Date.now() - FREE_REUSE_DAYS * 24 * 60 * 60 * 1000);

    const paidReport = await prisma.report.findFirst({
      where: {
        email: body.email,
        birthDate: body.birthDate,
        birthTime: body.birthTime,
        gender: body.gender,
        paidAt: {
          gte: validTime,
        },
        aiReport: {
          not: null, // 确保有AI报告
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    if (paidReport && paidReport.paidAt) {
      const daysRemaining = Math.ceil(
        (FREE_REUSE_DAYS * 24 * 60 * 60 * 1000 - (Date.now() - paidReport.paidAt.getTime())) /
        (24 * 60 * 60 * 1000)
      );
      return {
        found: true,
        reportId: paidReport.id,
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

    // Validate input
    if (!body.email || !body.gender || !body.birthDate || !body.birthCity) {
      return NextResponse.json(
        { error: '请填写完整的表单信息' },
        { status: 400 }
      );
    }

    // 1. 检查7天内是否有相同参数的已付费报告
    const validPaid = await getValidPaidReport(body);
    if (validPaid.found && validPaid.reportId) {
      console.log('Found valid paid report for:', body.email, 'days remaining:', validPaid.daysRemaining);
      return NextResponse.json({
        success: true,
        freeReuse: true,
        reportId: validPaid.reportId,
        daysRemaining: validPaid.daysRemaining,
        message: `您在${validPaid.daysRemaining}天内已购买过相同参数的解读，本次免费查看`,
      });
    }

    // 2. 没有有效报告，需要付费
    // Check if we have Stripe key (production mode)
    const hasStripeKey = process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY !== 'sk_test_mock';

    // Create checkout session
    const result = hasStripeKey
      ? await createCheckoutSession(body)
      : createMockCheckoutSession(body);

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      sessionId: result.sessionId,
      url: result.url,
      isMock: !hasStripeKey,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : '支付创建失败';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
