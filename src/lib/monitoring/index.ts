/**
 * Error monitoring utilities.
 * Centralizes Sentry reporting.
 */
import * as Sentry from '@sentry/nextjs';

/**
 * Capture API errors and send to Sentry.
 */
export function captureApiError(
  error: unknown,
  context: {
    endpoint: string;
    method: string;
    userId?: string;
    email?: string;
    extra?: Record<string, unknown>;
  }
) {
  // Build context
  Sentry.withScope((scope) => {
    scope.setTag('type', 'api_error');
    scope.setTag('endpoint', context.endpoint);
    scope.setTag('method', context.method);

    if (context.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context.email) {
      scope.setUser({ email: context.email });
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureException(error);
  });

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error] ${context.method} ${context.endpoint}:`, error);
  }
}

/**
 * Capture payment errors.
 */
export function capturePaymentError(
  error: unknown,
  context: {
    paymentIntentId?: string;
    customerId?: string;
    amount?: number;
    currency?: string;
    email?: string;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('type', 'payment_error');
    scope.setLevel('error');

    if (context.paymentIntentId) {
      scope.setExtra('paymentIntentId', context.paymentIntentId);
    }
    if (context.customerId) {
      scope.setExtra('customerId', context.customerId);
    }
    if (context.amount) {
      scope.setExtra('amount', context.amount);
    }
    if (context.currency) {
      scope.setExtra('currency', context.currency);
    }
    if (context.email) {
      scope.setUser({ email: context.email });
    }

    Sentry.captureException(error);
  });

  if (process.env.NODE_ENV === 'development') {
    console.error('[Payment Error]', error, context);
  }
}

/**
 * Capture AI generation errors.
 */
export function captureAIGenerationError(
  error: unknown,
  context: {
    reportId: string;
    email: string;
    promptTokens?: number;
    completionTokens?: number;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag('type', 'ai_generation_error');

    scope.setExtra('reportId', context.reportId);
    scope.setUser({ email: context.email });

    if (context.promptTokens) {
      scope.setExtra('promptTokens', context.promptTokens);
    }
    if (context.completionTokens) {
      scope.setExtra('completionTokens', context.completionTokens);
    }

    Sentry.captureException(error);
  });

  if (process.env.NODE_ENV === 'development') {
    console.error('[AI Generation Error]', error, context);
  }
}

/**
 * Record performance metrics using Sentry spans.
 */
export function recordPerformance(
  name: string,
  durationMs: number,
  context?: Record<string, string | number>
) {
  Sentry.withScope((scope) => {
    scope.setTag('performance_metric', name);
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    // Attach duration as extra
    scope.setExtra('duration_ms', durationMs);

    // Send performance message
    Sentry.captureMessage(`Performance: ${name} - ${durationMs}ms`, 'info');
  });
}
