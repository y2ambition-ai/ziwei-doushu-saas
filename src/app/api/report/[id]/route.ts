/**
 * 获取报告 API
 * GET /api/report/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        email: report.email,
        gender: report.gender,
        birthDate: report.birthDate,
        birthTime: report.birthTime,
        birthCity: report.birthCity,
        coreIdentity: report.coreIdentity,
        aiReport: report.aiReport,
        createdAt: report.createdAt,
      },
    }, {
      headers: {
        // 缓存 1 小时，报告数据不会变化
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: '获取报告失败' },
      { status: 500 }
    );
  }
}
