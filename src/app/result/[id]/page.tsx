/**
 * 报告结果页面
 * /result/[id]
 */

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ReportContent from './ReportContent';

// ─── Page Props ────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Server Component ──────────────────────────────────────────────────────────

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
  });

  if (!report) {
    notFound();
  }

  return (
    <ReportContent
      report={{
        id: report.id,
        email: report.email,
        gender: report.gender,
        birthDate: report.birthDate,
        birthTime: report.birthTime,
        birthCity: report.birthCity,
        coreIdentity: report.coreIdentity || '',
        aiReport: report.aiReport || '',
        createdAt: report.createdAt.toISOString(),
      }}
    />
  );
}

// ─── Generate Static Params ────────────────────────────────────────────────────

export async function generateStaticParams() {
  // Don't pre-render any pages - all dynamic
  return [];
}
