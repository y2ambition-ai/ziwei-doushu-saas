/**
 * Stripe Webhook Handler
 * POST /api/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe';
import { generateAstrolabe } from '@/lib/ziwei/wrapper';
import { generateReport, generateMockReport, GenerateReportInput } from '@/lib/llm';
import { prisma } from '@/lib/db';
import { getCityByName } from '@/lib/location/cities';
import { capturePaymentError, captureApiError } from '@/lib/monitoring';

// ─── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        // Payment was successful
        console.log('PaymentIntent succeeded:', event.data.object);
        break;
      }

      case 'payment_intent.payment_failed': {
        // Payment failed - 上报到 Sentry
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', paymentIntent);
        capturePaymentError(
          new Error('Payment failed'),
          {
            paymentIntentId: paymentIntent.id,
            customerId: paymentIntent.customer as string | undefined,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          }
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    captureApiError(error, {
      endpoint: '/api/webhook',
      method: 'POST',
    });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ─── Event Handlers ────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  const customerDetails = session.customer_details;
  const customerEmail = customerDetails?.email;
  const paymentIntentId = session.payment_intent as string | undefined;

  if (!metadata) {
    console.error('No metadata in checkout session');
    return;
  }

  const email = (metadata.email || customerEmail || '') as string;
  const gender = (metadata.gender || 'male') as string;
  const birthDate = (metadata.birthDate || '') as string;
  const birthTime = parseInt((metadata.birthTime as string) || '12', 10);
  const birthMinute = parseInt((metadata.birthMinute as string) || '0', 10);
  const birthCity = (metadata.birthCity || '北京') as string;

  // Get city coordinates
  const city = getCityByName(birthCity);
  if (!city) {
    console.error(`City not found: ${birthCity}`);
    return;
  }

  // Generate astrolabe
  const astrolabe = generateAstrolabe({
    birthDate,
    birthTime,
    birthMinute,
    gender: gender as 'male' | 'female',
    longitude: city.longitude,
    latitude: city.latitude,
    birthCity,
  });

  // Prepare LLM input
  const llmInput: GenerateReportInput = {
    email: email || '',
    gender: gender || 'male',
    birthDate: birthDate || '',
    birthTime: astrolabe.parsed.solarTime.shichen,
    birthCity: birthCity || '',
    mingGong: astrolabe.parsed.mingGong.majorStars.join('·') || '空宫',
    wuXingJu: astrolabe.parsed.wuXingJu,
    chineseZodiac: astrolabe.parsed.chineseZodiac,
    zodiac: astrolabe.parsed.zodiac,
    siZhu: astrolabe.parsed.siZhu,
    palaces: astrolabe.parsed.palaces,
  };

  // Generate report
  const hasApiKey = process.env.DOUBAO_API_KEY && process.env.DOUBAO_API_KEY.length > 0;
  const reportResult = hasApiKey
    ? await generateReport(llmInput)
    : generateMockReport(llmInput);

  // Store in database
  await prisma.report.create({
    data: {
      email: email || '',
      gender: gender || 'male',
      birthDate: birthDate || '',
      birthTime: birthTime || 12,
      birthMinute: birthMinute || 0,
      birthCity: birthCity || '',
      longitude: city.longitude,
      latitude: city.latitude,
      rawAstrolabe: JSON.stringify(astrolabe.raw),
      aiReport: reportResult.report,
      coreIdentity: reportResult.coreIdentity,
    },
  });

  console.log(`Report generated for ${email}, payment: ${paymentIntentId}`);
}
