import type { Metadata } from "next";
import { Noto_Serif_SC, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap", // 避免字体加载阻塞渲染
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "天命玄机 · 紫微斗数命盘解读",
  description: "承载千年道家智慧，融汇紫微斗数之精髓，为您揭示命运的内在规律",
  keywords: ['紫微斗数', '命盘', '命理', '道家', '算命', '八字', '星盘', '命理解读'],
  authors: [{ name: '天命玄机' }],
  openGraph: {
    title: '天命玄机 · 紫微斗数命盘解读',
    description: '承载千年道家智慧，融汇紫微斗数之精髓，为您揭示命运的内在规律',
    type: 'website',
    locale: 'zh_CN',
    siteName: '天命玄机',
  },
  twitter: {
    card: 'summary',
    title: '天命玄机 · 紫微斗数命盘解读',
    description: '承载千年道家智慧，融汇紫微斗数之精髓，为您揭示命运的内在规律',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable} ${cormorant.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
