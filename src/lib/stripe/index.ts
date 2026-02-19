/**
 * Stripe 集成模块
 * Payment processing for ZiWei SaaS
 */

import Stripe from 'stripe';

// ─── Configuration ─────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckoutSessionInput {
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthMinute: number;
  birthCity: string;
}

export interface CheckoutSessionOutput {
  sessionId: string;
  url: string | null;
}

// ─── Price Configuration ───────────────────────────────────────────────────────

const PRICE_AMOUNT = 199; // $1.99 in cents
const PRICE_CURRENCY = 'usd';
const PRODUCT_NAME = '紫微斗数命盘解读报告';
const PRODUCT_DESCRIPTION = 'AI 驱动的紫微斗数命盘分析与人生指引';

// ─── Main Functions ────────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
  input: CheckoutSessionInput
): Promise<CheckoutSessionOutput> {
  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  // Create a customer or find existing one
  const customers = await stripe.customers.list({
    email: input.email,
    limit: 1,
  });

  let customerId: string | undefined;
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  }

  // Build metadata for webhook processing
  const metadata: Record<string, string> = {
    email: input.email,
    gender: input.gender,
    birthDate: input.birthDate,
    birthTime: String(input.birthTime),
    birthMinute: String(input.birthMinute),
    birthCity: input.birthCity,
  };

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_creation: customerId ? undefined : 'always',
    customer_email: customerId ? undefined : input.email,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: PRICE_CURRENCY,
          product_data: {
            name: PRODUCT_NAME,
            description: PRODUCT_DESCRIPTION,
          },
          unit_amount: PRICE_AMOUNT,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/?canceled=true`,
    metadata,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Get checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret?: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = secret || process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string) {
  const stripe = getStripe();
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });
  return customers.data[0] || null;
}

/**
 * Mock checkout for development (no real payment)
 */
export function createMockCheckoutSession(
  input: CheckoutSessionInput
): CheckoutSessionOutput {
  const mockSessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    sessionId: mockSessionId,
    url: null, // Frontend should handle mock flow
  };
}
