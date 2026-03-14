import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { prisma } from '@/lib/db';
import { normalizeLocale } from '@/lib/i18n/config';
import { captureApiError, capturePaymentError } from '@/lib/monitoring';
import { resolveStoredReportLocale, setStoredReportLocale } from '@/lib/report-preferences';
import { verifyWebhookSignature } from '@/lib/stripe';
import { getTempReport, updateTempReport } from '@/lib/temp-report-store';
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
  const fallbackLocale = normalizeLocale(metadata?.locale);

  if (!reportId) {
    console.error('No reportId in checkout session metadata');
    return;
  }

  type ReportLike = {
    id: string;
    email: string;
    gender: string;
    birthDate: string;
    birthTime: number;
    birthMinute?: number;
    birthCity: string;
    longitude: number;
    latitude?: number;
    parsedData: string | null;
    rawAstrolabe: string | null;
    aiReport: string | null;
    coreIdentity: string | null;
    paidAt: Date | null;
    completedAt: Date | null;
  };

  let report: ReportLike | null = null;
  let isTempReport = false;

  try {
    report = await prisma.report.findUnique({
      where: { id: reportId },
    }) as ReportLike | null;
  } catch (error) {
    console.warn(`Database lookup failed for report ${reportId}:`, error);
  }

  if (!report) {
    const tempReport = getTempReport(reportId);
    if (tempReport) {
      report = tempReport as ReportLike;
      isTempReport = true;
    }
  }

  if (!report) {
    console.error(`Report not found for checkout session: ${reportId}`);
    return;
  }

  const paidAt = report.paidAt || new Date();
  const locale = resolveStoredReportLocale(report, fallbackLocale);
  const parsedData = setStoredReportLocale(report.parsedData, locale);

  const persistReport = async (data: Partial<ReportLike>) => {
    if (isTempReport) {
      updateTempReport(reportId, data);
      return;
    }

    await prisma.report.update({
      where: { id: reportId },
      data,
    });
  };

  if (report.aiReport && report.aiReport.length > 100) {
    await persistReport({
      parsedData,
      paidAt,
      completedAt: report.completedAt || new Date(),
    });
    return;
  }

  const astrolabe = generateAstrolabe({
    birthDate: report.birthDate,
    birthTime: report.birthTime,
    birthMinute: report.birthMinute ?? 0,
    gender: report.gender as 'male' | 'female',
    longitude: report.longitude || 120,
    latitude: report.latitude || 0,
    birthCity: report.birthCity || '',
  });

  await persistReport({
    parsedData,
    paidAt,
    rawAstrolabe: report.rawAstrolabe || JSON.stringify(astrolabe.raw),
  });
}
