/**
 * AI 报告生成 API
 * POST /api/report/ai-generate
 *
 * 从已有报告数据生成AI解读，并发送邮件
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReport, generateMockReport } from '@/lib/llm';
import { prisma } from '@/lib/db';
import { generateAstrolabe } from '@/lib/ziwei/wrapper';
import { sendReportEmail } from '@/lib/email';

// ─── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: '缺少报告ID' },
        { status: 400 }
      );
    }

    // 1. 获取报告数据
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      );
    }

    // 2. 如果已有AI报告，直接返回
    if (report.aiReport && report.aiReport.length > 100) {
      return NextResponse.json({
        success: true,
        cached: true,
        coreIdentity: report.coreIdentity,
        report: report.aiReport,
      });
    }

    // 3. 重新生成命盘数据
    const astrolabe = generateAstrolabe({
      birthDate: report.birthDate,
      birthTime: report.birthTime,
      birthMinute: 0,
      gender: report.gender as 'male' | 'female',
      longitude: report.longitude || 120,
      latitude: 0,
      birthCity: report.birthCity || '',
    });

    // 4. 准备LLM输入
    const llmInput = {
      email: report.email,
      gender: report.gender,
      birthDate: report.birthDate,
      birthTime: astrolabe.parsed.solarTime.shichen,
      birthCity: report.birthCity || '',
      mingGong: astrolabe.parsed.mingGong.majorStars.join('·') || '空宫',
      wuXingJu: astrolabe.parsed.wuXingJu,
      chineseZodiac: astrolabe.parsed.chineseZodiac,
      zodiac: astrolabe.parsed.zodiac,
      siZhu: astrolabe.parsed.siZhu,
      palaces: astrolabe.parsed.palaces,
      rawAstrolabe: astrolabe.raw,
    };

    // 5. 调用豆包生成报告
    const hasApiKey = process.env.DOUBAO_API_KEY && process.env.DOUBAO_API_KEY.length > 0;

    let reportResult;
    if (hasApiKey) {
      console.log('Calling Doubao API for AI report...');
      reportResult = await generateReport(llmInput);
    } else {
      console.log('No API key, using mock report');
      reportResult = generateMockReport(llmInput);
    }

    // 6. 更新数据库
    await prisma.report.update({
      where: { id: reportId },
      data: {
        aiReport: reportResult.report,
        coreIdentity: reportResult.coreIdentity,
      },
    });

    // 7. 发送邮件（异步执行，不阻塞响应）
    sendReportEmail({
      to: report.email,
      reportId: reportId,
      coreIdentity: reportResult.coreIdentity,
    }).then((result) => {
      if (result.success) {
        console.log('Report email sent successfully to:', report.email);
      } else {
        console.error('Failed to send report email:', result.error);
      }
    });

    return NextResponse.json({
      success: true,
      cached: false,
      coreIdentity: reportResult.coreIdentity,
      report: reportResult.report,
      emailSent: true,
    });
  } catch (error) {
    console.error('AI report generation error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: `AI报告生成失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}
