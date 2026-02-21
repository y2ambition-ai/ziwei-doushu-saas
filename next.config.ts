import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // 图片格式优化
    formats: ['image/avif', 'image/webp'],
  },
  // 安全 Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // 静态资源长期缓存
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|svg|gif|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// Sentry 配置（仅在配置了 DSN 时启用）
const sentryConfig = withSentryConfig(nextConfig, {
  // 静默警告
  silent: true,
  // 组织和项目
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // 自动上传 source maps（需要 SENTRY_AUTH_TOKEN）
  widenClientFileUpload: true,
  // Source maps 配置
  sourcemaps: {
    disable: false,
  },
});

// 导出：如果有 Sentry DSN 则使用 Sentry 配置，否则使用原始配置
export default process.env.NEXT_PUBLIC_SENTRY_DSN ? sentryConfig : nextConfig;
