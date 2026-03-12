import type { Metadata } from 'next';
import { Noto_Serif_SC, Cormorant_Garamond } from 'next/font/google';

import './globals.css';

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Tianming Secrets | Zi Wei Dou Shu Reading',
    template: '%s | Tianming Secrets',
  },
  description: 'Ancient Zi Wei Dou Shu charts and bilingual readings shaped for modern life.',
  keywords: ['Zi Wei Dou Shu', 'destiny chart', 'Chinese astrology', 'metaphysics', 'fortune reading'],
  authors: [{ name: 'Tianming Secrets' }],
  openGraph: {
    title: 'Tianming Secrets | Zi Wei Dou Shu Reading',
    description: 'Ancient Zi Wei Dou Shu charts and bilingual readings shaped for modern life.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Tianming Secrets',
  },
  twitter: {
    card: 'summary',
    title: 'Tianming Secrets | Zi Wei Dou Shu Reading',
    description: 'Ancient Zi Wei Dou Shu charts and bilingual readings shaped for modern life.',
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
    <html lang="en" suppressHydrationWarning className={`${notoSerif.variable} ${cormorant.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
