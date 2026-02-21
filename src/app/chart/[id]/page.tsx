/**
 * 紫微斗数排盘展示页面
 * /chart/[id]
 *
 * 展示传统12宫格命盘，精美禅意设计
 */

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ChartDisplay from './ChartDisplay';

// ─── Page Props ────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Server Component ──────────────────────────────────────────────────────────

export default async function ChartPage({ params }: PageProps) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
  });

  if (!report) {
    notFound();
  }

  // 解析原始命盘数据
  let astrolabeData = null;
  try {
    astrolabeData = report.rawAstrolabe ? JSON.parse(report.rawAstrolabe) : null;
  } catch (e) {
    console.error('Failed to parse astrolabe data:', e);
  }

  return (
    <ChartDisplay
      report={{
        id: report.id,
        email: report.email,
        gender: report.gender,
        birthDate: report.birthDate,
        birthTime: report.birthTime,
        birthCity: report.birthCity,
        rawAstrolabe: astrolabeData,
        createdAt: report.createdAt.toISOString(),
      }}
    />
  );
}

// ─── Generate Static Params ────────────────────────────────────────────────────

export async function generateStaticParams() {
  return [];
}
