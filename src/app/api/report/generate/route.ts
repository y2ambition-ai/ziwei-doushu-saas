/**
 * 报告生成 API
 * POST /api/report/generate
 *
 * 用户输入当前位置时间，系统根据与北京时间的差异计算经度
 * 支持缓存：相同信息 24 小时内免费复用
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAstrolabe } from '@/lib/ziwei/wrapper';
import {
  generateReport,
  generateMockReport,
  GenerateReportInput,
} from '@/lib/llm';
import { prisma } from '@/lib/db';

// ─── Constants ────────────────────────────────────────────────────────────────

const BEIJING_LONGITUDE = 120; // 东经120度 = 北京时间基准
const HOURS_TO_DEGREES = 15; // 每1小时 = 15度经度
const CACHE_HOURS = 24; // 缓存有效期（小时）

// ─── Request Schema ────────────────────────────────────────────────────────────

interface GenerateRequest {
  email: string;
  gender: 'male' | 'female';
  birthDate: string; // YYYY-MM-DD
  birthTime: number; // 0-23
  birthMinute: number; // 0-59
  // 新增：用户当前位置时间（用于计算时区偏移）
  currentHour: number; // 0-23
  currentMinute: number; // 0-59
}

// ─── Helper: Calculate Longitude from Time Difference ───────────────────────────

/**
 * 根据用户提供的当前时间计算经度
 * 逻辑：用户时间 vs 北京时间 → 时差 → 经度偏移
 */
function calculateLongitudeFromTimeDiff(
  userHour: number,
  userMinute: number
): number {
  // 获取当前北京时间
  const now = new Date();
  const beijingHour = now.getHours();
  const beijingMinute = now.getMinutes();

  // 转换为分钟便于计算
  const userTotalMinutes = userHour * 60 + userMinute;
  const beijingTotalMinutes = beijingHour * 60 + beijingMinute;

  // 计算时间差（分钟）
  let timeDiffMinutes = userTotalMinutes - beijingTotalMinutes;

  // 处理跨日情况
  if (timeDiffMinutes > 12 * 60) {
    timeDiffMinutes -= 24 * 60;
  } else if (timeDiffMinutes < -12 * 60) {
    timeDiffMinutes += 24 * 60;
  }

  const longitudeOffset = timeDiffMinutes / 4;
  const longitude = BEIJING_LONGITUDE + longitudeOffset;

  return Math.max(-180, Math.min(180, longitude));
}

// ─── Helper: Check Cache ───────────────────────────────────────────────────────

/**
 * 检查是否有缓存的报告（24小时内相同信息）
 */
async function getCachedReport(body: GenerateRequest): Promise<{
  found: boolean;
  report?: {
    id: string;
    coreIdentity: string;
    aiReport: string;
    rawAstrolabe: string;
  };
}> {
  try {
    const cacheTime = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000);

    const cached = await prisma.report.findFirst({
      where: {
        email: body.email,
        birthDate: body.birthDate,
        birthTime: body.birthTime,
        gender: body.gender,
        createdAt: {
          gte: cacheTime,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (cached) {
      return {
        found: true,
        report: {
          id: cached.id,
          coreIdentity: cached.coreIdentity || '',
          aiReport: cached.aiReport,
          rawAstrolabe: cached.rawAstrolabe,
        },
      };
    }
  } catch (error) {
    console.log('Cache check failed, continuing with fresh generation');
  }

  return { found: false };
}

// ─── POST Handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    // 1. 验证输入
    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // 2. 检查缓存（24小时内相同信息免费复用）
    const cached = await getCachedReport(body);
    if (cached.found && cached.report) {
      console.log('Returning cached report for:', body.email);
      const rawAstrolabe = JSON.parse(cached.report.rawAstrolabe);
      return NextResponse.json({
        success: true,
        reportId: cached.report.id,
        coreIdentity: cached.report.coreIdentity,
        report: cached.report.aiReport,
        cached: true,
        message: '您在24小时内已测算过相同信息，本次免费查看',
        astrolabe: {
          mingGong: rawAstrolabe.palaces?.find((p: { name: string }) => p.name === '命宫') || {},
          chineseZodiac: rawAstrolabe.zodiac,
        },
      });
    }

    // 3. 根据用户当前时间计算经度
    const longitude = calculateLongitudeFromTimeDiff(
      body.currentHour,
      body.currentMinute
    );

    // 4. 生成命盘
    const astrolabe = generateAstrolabe({
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthMinute: body.birthMinute,
      gender: body.gender,
      longitude,
      latitude: 0,
      birthCity: `经度${longitude.toFixed(1)}°`,
    });

    // 5. 准备 LLM 输入
    const llmInput: GenerateReportInput = {
      email: body.email,
      gender: body.gender,
      birthDate: body.birthDate,
      birthTime: astrolabe.parsed.solarTime.shichen,
      birthCity: `东经${longitude.toFixed(1)}°`,
      mingGong: astrolabe.parsed.mingGong.majorStars.join('·') || '空宫',
      wuXingJu: astrolabe.parsed.wuXingJu,
      chineseZodiac: astrolabe.parsed.chineseZodiac,
      zodiac: astrolabe.parsed.zodiac,
      siZhu: astrolabe.parsed.siZhu,
      palaces: astrolabe.parsed.palaces,
      rawAstrolabe: astrolabe.raw,
    };

    // 6. 生成报告
    const hasApiKey = process.env.DOUBAO_API_KEY && process.env.DOUBAO_API_KEY.length > 0;
    const reportResult = hasApiKey
      ? await generateReport(llmInput)
      : generateMockReport(llmInput);

    // 7. 存储到数据库
    let reportId = `test-${Date.now()}`;
    try {
      const report = await prisma.report.create({
        data: {
          email: body.email,
          gender: body.gender,
          birthDate: body.birthDate,
          birthTime: body.birthTime,
          birthCity: `经度${longitude.toFixed(1)}°`,
          longitude,
          rawAstrolabe: JSON.stringify(astrolabe.raw),
          aiReport: reportResult.report,
          coreIdentity: reportResult.coreIdentity,
        },
      });
      reportId = report.id;
    } catch (dbError) {
      console.log('Database not available, using temporary ID');
    }

    // 8. 返回结果
    return NextResponse.json({
      success: true,
      reportId,
      coreIdentity: reportResult.coreIdentity,
      report: reportResult.report,
      cached: false,
      calculatedLongitude: longitude,
      astrolabe: {
        mingGong: astrolabe.parsed.mingGong,
        wuXingJu: astrolabe.parsed.wuXingJu,
        chineseZodiac: astrolabe.parsed.chineseZodiac,
        siZhu: astrolabe.parsed.siZhu,
        solarTime: astrolabe.parsed.solarTime,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: `报告生成失败: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// ─── Validation ────────────────────────────────────────────────────────────────

function validateInput(body: GenerateRequest): string | null {
  if (!body.email || !isValidEmail(body.email)) {
    return '请输入有效的邮箱地址';
  }

  if (!body.gender || !['male', 'female'].includes(body.gender)) {
    return '请选择性别';
  }

  if (!body.birthDate || !isValidDate(body.birthDate)) {
    return '请输入有效的出生日期';
  }

  if (typeof body.birthTime !== 'number' || body.birthTime < 0 || body.birthTime > 23) {
    return '请选择有效的出生时辰';
  }

  if (typeof body.currentHour !== 'number' || body.currentHour < 0 || body.currentHour > 23) {
    return '请输入当前小时';
  }

  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
}
