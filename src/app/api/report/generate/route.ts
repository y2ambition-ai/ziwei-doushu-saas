/**
 * 报告生成 API
 * POST /api/report/generate
 *
 * 用户输入当前位置时间，系统根据与北京时间的差异计算经度
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
  // 如果用户时间比北京时间大很多（比如用户填了23点但北京时间是1点）
  // 可能是跨日的情况，需要处理
  let timeDiffMinutes = userTotalMinutes - beijingTotalMinutes;

  // 处理跨日情况：如果差值超过12小时，说明可能是跨日
  if (timeDiffMinutes > 12 * 60) {
    timeDiffMinutes -= 24 * 60; // 用户时间其实是前一天
  } else if (timeDiffMinutes < -12 * 60) {
    timeDiffMinutes += 24 * 60; // 用户时间其实是后一天
  }

  // 将时间差转换为经度偏移
  // 每4分钟 = 1度经度
  const longitudeOffset = timeDiffMinutes / 4;

  // 计算实际经度
  const longitude = BEIJING_LONGITUDE + longitudeOffset;

  // 限制在合理范围内 (-180 到 180)
  return Math.max(-180, Math.min(180, longitude));
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

    // 2. 根据用户当前时间计算经度
    const longitude = calculateLongitudeFromTimeDiff(
      body.currentHour,
      body.currentMinute
    );

    // 3. 生成命盘
    const astrolabe = generateAstrolabe({
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthMinute: body.birthMinute,
      gender: body.gender,
      longitude,
      latitude: 0, // 纬度对时辰计算影响较小
      birthCity: `经度${longitude.toFixed(1)}°`,
    });

    // 4. 准备 LLM 输入
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
    };

    // 5. 生成报告 (检查是否有 API Key)
    const hasApiKey = process.env.DOUBAO_API_KEY && process.env.DOUBAO_API_KEY.length > 0;
    const reportResult = hasApiKey
      ? await generateReport(llmInput)
      : generateMockReport(llmInput);

    // 6. 存储到数据库
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

    // 7. 返回结果
    return NextResponse.json({
      success: true,
      reportId: report.id,
      coreIdentity: reportResult.coreIdentity,
      report: reportResult.report,
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
