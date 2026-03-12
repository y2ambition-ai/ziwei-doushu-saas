import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { prisma } from '@/lib/db';
import { normalizeLocale } from '@/lib/i18n/config';
import { generateReport, generateMockReport, GenerateReportInput } from '@/lib/llm';
import { captureApiError, capturePaymentError } from '@/lib/monitoring';
import { verifyWebhookSignature } from '@/lib/stripe';
import { generateAstrolabe } from '@/lib/ziwei/wrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        capturePaymentError(new Error('Payment failed'), {
          paymentIntentId: paymentIntent.id,
          customerId: paymentIntent.customer as string | undefined,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    captureApiError(error, {
      endpoint: '/api/webhook',
      method: 'POST',
    });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  const reportId = metadata?.reportId;
  const locale = normalizeLocale(metadata?.locale);

  if (!reportId) {
    console.error('No reportId in checkout session metadata');
    return;
  }

  const existingReport = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!existingReport) {
    console.error(`Report not found for checkout session: ${reportId}`);
    return;
  }

  const paidAt = existingReport.paidAt || new Date();

  if (existingReport.aiReport && existingReport.aiReport.length > 100) {
    await prisma.report.update({
      where: { id: reportId },
      data: {
        paidAt,
        completedAt: existingReport.completedAt || new Date(),
      },
    });
    return;
  }

  const astrolabe = generateAstrolabe({
    birthDate: existingReport.birthDate,
    birthTime: existingReport.birthTime,
    birthMinute: existingReport.birthMinute,
    gender: existingReport.gender as 'male' | 'female',
    longitude: existingReport.longitude || 120,
    latitude: existingReport.latitude || 0,
    birthCity: existingReport.birthCity || '',
  });

  await prisma.report.update({
    where: { id: reportId },
    data: {
      paidAt,
      rawAstrolabe: existingReport.rawAstrolabe || JSON.stringify(astrolabe.raw),
    },
  });

  const llmInput: GenerateReportInput = {
    email: existingReport.email,
    gender: existingReport.gender,
    birthDate: existingReport.birthDate,
    birthTime: astrolabe.parsed.solarTime.shichen,
    birthCity: existingReport.birthCity || '',
    mingGong: astrolabe.parsed.mingGong.majorStars.join('·') || '空宫',
    wuXingJu: astrolabe.parsed.wuXingJu,
    chineseZodiac: astrolabe.parsed.chineseZodiac,
    zodiac: astrolabe.parsed.zodiac,
    siZhu: astrolabe.parsed.siZhu,
    palaces: astrolabe.parsed.palaces,
    rawAstrolabe: astrolabe.raw,
    locale,
  };

  const hasApiKey = Boolean(process.env.DOUBAO_API_KEY && process.env.DOUBAO_API_KEY.length > 0);
  const reportResult = hasApiKey ? await generateReport(llmInput) : generateMockReport(llmInput);

  await prisma.report.update({
    where: { id: reportId },
    data: {
      coreIdentity: reportResult.coreIdentity,
      aiReport: reportResult.report,
      paidAt,
      completedAt: new Date(),
      rawAstrolabe: existingReport.rawAstrolabe || JSON.stringify(astrolabe.raw),
    },
  });
}
