import type { Metadata } from "next";
import { Noto_Serif_SC, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "天命玄机 · 紫微斗数命盘解读",
  description: "承载千年道家智慧，融汇紫微斗数之精髓，为您揭示命运的内在规律",
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
