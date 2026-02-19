/**
 * Stripe Checkout Session API
 * POST /api/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createCheckoutSession,
  createMockCheckoutSession,
} from '@/lib/stripe';

// ─── Request Schema ────────────────────────────────────────────────────────────

interface CheckoutRequest {
  email: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: number;
  birthMinute: number;
  birthCity: string;
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

    // Check if we have Stripe key (production mode)
    const hasStripeKey = process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY !== 'sk_test_mock';

    // Create checkout session
    const result = hasStripeKey
      ? await createCheckoutSession(body)
      : createMockCheckoutSession(body);

    return NextResponse.json({
      success: true,
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
