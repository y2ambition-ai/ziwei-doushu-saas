/**
 * 错误监控工具
 * 统一封装 Sentry 错误上报
 */
import * as Sentry from '@sentry/nextjs';

/**
 * 捕获 API 错误并上报到 Sentry
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
  // 构建错误上下文
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

  // 同时输出到控制台（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error] ${context.method} ${context.endpoint}:`, error);
  }
}

/**
 * 捕获支付错误
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
 * 捕获 AI 生成错误
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
 * 记录性能指标
 * 使用 Sentry 的 span 记录性能数据
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

    // 记录性能指标作为额外信息
    scope.setExtra('duration_ms', durationMs);

    // 发送性能指标消息
    Sentry.captureMessage(`Performance: ${name} - ${durationMs}ms`, 'info');
  });
}
