/**
 * 报告生成 API
 * POST /api/report/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAstrolabe } from '@/lib/ziwei/wrapper';
import {
  generateReport,
  generateMockReport,
  GenerateReportInput,
} from '@/lib/llm';
import { prisma } from '@/lib/db';
import { getCityByName } from '@/lib/location/cities';

// ─── Request Schema ────────────────────────────────────────────────────────────

interface GenerateRequest {
  email: string;
  gender: 'male' | 'female';
  birthDate: string; // YYYY-MM-DD
  birthTime: number; // 0-23
  birthMinute: number; // 0-59
  birthCity: string;
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

    // 2. 获取城市经纬度
    const city = getCityByName(body.birthCity);
    if (!city) {
      return NextResponse.json(
        { error: `未找到城市: ${body.birthCity}` },
        { status: 400 }
      );
    }

    // 3. 生成命盘
    const astrolabe = generateAstrolabe({
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthMinute: body.birthMinute,
      gender: body.gender,
      longitude: city.longitude,
      latitude: city.latitude,
      birthCity: body.birthCity,
    });

    // 4. 准备 LLM 输入
    const llmInput: GenerateReportInput = {
      email: body.email,
      gender: body.gender,
      birthDate: body.birthDate,
      birthTime: astrolabe.parsed.solarTime.shichen,
      birthCity: body.birthCity,
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
        birthCity: body.birthCity,
        longitude: city.longitude,
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
    return NextResponse.json(
      { error: '报告生成失败，请稍后重试' },
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

  if (typeof body.birthMinute !== 'number' || body.birthMinute < 0 || body.birthMinute > 59) {
    return '请输入有效的出生分钟';
  }

  if (!body.birthCity) {
    return '请选择出生城市';
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
