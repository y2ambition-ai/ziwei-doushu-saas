import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 设置采样率（生产环境建议 0.1-0.3）
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 调试模式（仅开发环境）
  debug: process.env.NODE_ENV === 'development',

  // 环境标识
  environment: process.env.NODE_ENV,

  // 忽略特定错误
  ignoreErrors: [
    // 浏览器扩展错误
    'Non-Error promise rejection captured',
    // 网络错误（通常不需要追踪）
    'NetworkError',
    'Network request failed',
    // 取消请求
    'AbortError',
    // ResizeObserver 错误（浏览器兼容性）
    'ResizeObserver loop limit exceeded',
  ],

  // 面包屑配置
  maxBreadcrumbs: 20,

  // 用户隐私：不发送 IP
  sendDefaultPii: false,
});
