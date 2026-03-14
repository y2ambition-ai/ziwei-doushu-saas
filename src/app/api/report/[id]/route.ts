/**
 * Report retrieval API (GET /api/report/[id]).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReportViewData } from '@/lib/report-view';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await getReportViewData(id);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        locale: report.locale,
        email: report.email,
        gender: report.gender,
        birthDate: report.birthDate,
        birthTime: report.birthTime,
        birthCity: report.birthCity,
        coreIdentity: report.coreIdentity,
        aiReport: report.aiReport,
        createdAt: report.createdAt,
        paidAt: report.paidAt,
        completedAt: report.completedAt,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report.' },
      { status: 500 }
    );
  }
}
