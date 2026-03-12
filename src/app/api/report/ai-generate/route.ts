/**
 * AI 报告生成 API
 * POST /api/report/ai-generate
 *
 * 防止重复调用API的逻辑：
 * 1. 如果已有完整AI报告，直接返回
 * 2. 如果API已调用但报告未生成：
 *    - 10分钟内：返回"generating"状态，不重新调用
 *    - 超过10分钟且重试<3次：允许重试
 *    - 重试>=3次：返回错误
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReport, generateMockReport } from '@/lib/llm';
import { prisma } from '@/lib/db';
import { normalizeLocale } from '@/lib/i18n/config';
import { generateAstrolabe } from '@/lib/ziwei/wrapper';
import { captureAIGenerationError, captureApiError } from '@/lib/monitoring';
import { getTempReport, updateTempReport } from '@/lib/temp-report-store';

// ─── Constants ────────────────────────────────────────────────────────────────

const RETRY_WINDOW_MS = 10 * 60 * 1000; // 10分钟重试窗口
const MAX_RETRIES = 3; // 最大重试次数

interface StoredReport {
  id: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  longitude: number;
  latitude: number;
  coreIdentity: string | null;
  aiReport: string | null;
  apiCalledAt: Date | null;
  apiRetryCount: number | null;
  paidAt: Date | null;
}

interface StoredReportUpdate {
  apiCalledAt?: Date;
  apiRetryCount?: number;
  aiReport?: string;
  coreIdentity?: string;
  completedAt?: Date;
  paidAt?: Date;
}

async function getStoredReport(reportId: string): Promise<{
  report: StoredReport | null;
  useTempStore: boolean;
}> {
  const tempReport = getTempReport(reportId);

  if (tempReport) {
    return {
      report: tempReport,
      useTempStore: true,
    };
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    return {
      report,
      useTempStore: false,
    };
  } catch (error) {
    console.warn(`Database lookup failed for AI report ${reportId}:`, error);
    return {
      report: null,
      useTempStore: false,
    };
  }
}

async function updateStoredReport(
  reportId: string,
  data: StoredReportUpdate,
  useTempStore: boolean
) {
  if (useTempStore) {
    const updated = updateTempReport(reportId, data);

    if (!updated) {
      throw new Error(`Temporary report ${reportId} no longer exists`);
    }

    return updated;
  }

  return prisma.report.update({
    where: { id: reportId },
    data,
  });
}

// ─── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, locale: requestedLocale } = body;
    const locale = normalizeLocale(requestedLocale);

    if (!reportId) {
      return NextResponse.json(
        { error: '缺少报告ID' },
        { status: 400 }
      );
    }

    // 1. 获取报告数据
    const { report, useTempStore } = await getStoredReport(reportId);

    if (!report) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      );
    }

    const paymentConfigured = Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock'
    );

    if (paymentConfigured && !report.paidAt) {
      return NextResponse.json(
        {
          success: false,
          status: 'payment_required',
          error: 'Payment confirmation is still pending',
        },
        { status: 403 }
      );
    }

    // 2. 如果已有AI报告，直接返回（已完成状态）
    if (report.aiReport && report.aiReport.length > 100) {
      return NextResponse.json({
        success: true,
        status: 'completed',
        cached: true,
        coreIdentity: report.coreIdentity,
        report: report.aiReport,
      });
    }

    // 3. 检查是否已调用过API（防止重复调用）
    if (report.apiCalledAt) {
      const timeSinceCall = Date.now() - report.apiCalledAt.getTime();
      const retryCount = report.apiRetryCount || 0;

      // 10分钟内，返回"正在生成"状态，不重新调用
      if (timeSinceCall < RETRY_WINDOW_MS) {
        const remainingSeconds = Math.ceil((RETRY_WINDOW_MS - timeSinceCall) / 1000);
        return NextResponse.json({
          success: false,
          status: 'generating',
          message: '报告正在生成中，请稍后再试',
          retryAfter: remainingSeconds,
        });
      }

      // 超过10分钟，检查重试次数
      if (retryCount >= MAX_RETRIES) {
        return NextResponse.json({
          success: false,
          status: 'failed',
          error: '报告生成失败次数过多，请联系客服',
        }, { status: 500 });
      }

      // 允许重试，增加重试计数
      console.log(`Retrying API call (attempt ${retryCount + 1}/${MAX_RETRIES}) for report: ${reportId}`);
    }

    // 4. 标记API调用开始（防止并发调用）
    await updateStoredReport(reportId, {
      apiCalledAt: new Date(),
      apiRetryCount: (report.apiRetryCount || 0) + 1,
    }, useTempStore);

    // 5. 生成命盘数据
    const astrolabe = generateAstrolabe({
      birthDate: report.birthDate,
      birthTime: report.birthTime,
      birthMinute: 0,
      gender: report.gender as 'male' | 'female',
      longitude: report.longitude || 120,
      latitude: report.latitude || 0,
      birthCity: report.birthCity || '',
    });

    // 6. 准备LLM输入
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
      locale,
    };

    // 7. 调用API生成报告
    const hasApiKey = process.env.DOUBAO_API_KEY && process.env.DOUBAO_API_KEY.length > 0;

    let reportResult;
    try {
      if (hasApiKey) {
        console.log('Calling Doubao API for AI report...');
        reportResult = await generateReport(llmInput);
      } else {
        console.log('No API key, using mock report');
        reportResult = generateMockReport(llmInput);
      }
    } catch (aiError) {
      captureAIGenerationError(aiError, {
        reportId,
        email: report.email,
      });
      throw aiError;
    }

    // 8. 更新数据库
    const updateData: {
      aiReport: string;
      coreIdentity: string;
      completedAt: Date;
      paidAt?: Date;
    } = {
      aiReport: reportResult.report,
      coreIdentity: reportResult.coreIdentity,
      completedAt: new Date(),
    };

    if (!paymentConfigured && !report.paidAt) {
      updateData.paidAt = new Date();
    }

    await updateStoredReport(reportId, updateData, useTempStore);

    // 9. 返回结果
    return NextResponse.json({
      success: true,
      status: 'completed',
      cached: false,
      coreIdentity: reportResult.coreIdentity,
      report: reportResult.report,
    });
  } catch (error) {
    console.error('AI report generation error:', error);
    captureApiError(error, {
      endpoint: '/api/report/ai-generate',
      method: 'POST',
    });
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: `AI报告生成失败: ${errorMessage}`, status: 'error' },
      { status: 500 }
    );
  }
}
