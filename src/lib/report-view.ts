import type { RawAstrolabe } from '@/components/chart-shared';

import { prisma } from '@/lib/db';
import type { Locale } from '@/lib/i18n/config';
import { resolveStoredReportLocale } from '@/lib/report-preferences';
import { getTempReport } from '@/lib/temp-report-store';

export interface ReportViewData {
  id: string;
  locale: Locale;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  longitude: number;
  coreIdentity: string;
  aiReport: string;
  rawAstrolabe: RawAstrolabe | null;
  createdAt: string;
  hasAIReport: boolean;
  isPaid: boolean;
  completedAt: string | null;
  paidAt: string | null;
}

interface ReportRecordLike {
  id: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  longitude: number;
  parsedData: string | null;
  coreIdentity: string | null;
  aiReport: string | null;
  rawAstrolabe: string | null;
  createdAt: Date;
  completedAt: Date | null;
  paidAt: Date | null;
}

function pad2(value: string): string {
  return value.padStart(2, '0');
}

function normalizeSolarDate(value?: string): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${pad2(isoMatch[2])}-${pad2(isoMatch[3])}`;
  }

  const digitMatch = trimmed.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (digitMatch) {
    return `${digitMatch[1]}-${pad2(digitMatch[2])}-${pad2(digitMatch[3])}`;
  }

  return '';
}

function parseRawAstrolabe(rawAstrolabe: string | null): RawAstrolabe | null {
  try {
    if (!rawAstrolabe) {
      return null;
    }

    const parsed = JSON.parse(rawAstrolabe) as RawAstrolabe | null;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    parsed.solarDate = normalizeSolarDate(parsed.solarDate);

    return parsed;
  } catch (error) {
    console.error('Failed to parse astrolabe data:', error);
    return null;
  }
}

function toReportViewData(report: ReportRecordLike): ReportViewData {
  return {
    id: report.id,
    locale: resolveStoredReportLocale(report),
    email: report.email,
    gender: report.gender,
    birthDate: report.birthDate,
    birthTime: report.birthTime,
    birthCity: report.birthCity,
    longitude: report.longitude,
    coreIdentity: report.coreIdentity || '',
    aiReport: report.aiReport || '',
    rawAstrolabe: parseRawAstrolabe(report.rawAstrolabe),
    createdAt: report.createdAt.toISOString(),
    hasAIReport: Boolean(report.aiReport && report.aiReport.length > 100),
    isPaid: Boolean(report.paidAt),
    completedAt: report.completedAt ? report.completedAt.toISOString() : null,
    paidAt: report.paidAt ? report.paidAt.toISOString() : null,
  };
}

export async function getReportViewData(id: string): Promise<ReportViewData | null> {
  const tempReport = getTempReport(id);

  if (tempReport) {
    return toReportViewData(tempReport);
  }

  let report: ReportRecordLike | null = null;

  try {
    report = await prisma.report.findUnique({
      where: { id },
    });
  } catch (error) {
    console.warn(`Database lookup failed for report ${id}:`, error);
    return null;
  }

  if (!report) {
    return null;
  }

  return toReportViewData(report);
}
