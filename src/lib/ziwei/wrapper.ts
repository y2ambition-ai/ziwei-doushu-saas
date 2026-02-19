/**
 * iztro 排盘引擎封装
 * Wrapper for iztro astrology library
 */

import { astro } from 'iztro';
import { calculateTrueSolarTime } from '../solar-time';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AstrolabeInput {
  birthDate: string;  // YYYY-MM-DD
  birthTime: number;  // 0-23 小时
  birthMinute: number; // 0-59
  gender: 'male' | 'female';
  longitude: number;
  latitude?: number;
  birthCity?: string;
}

export interface PalaceData {
  name: string;
  earthlyBranch: string;
  majorStars: string[];
  minorStars: string[];
  mutagen: string[];
  isEmpty: boolean;
}

export interface ParsedAstrolabe {
  // 核心信息
  mingGong: PalaceData;
  shenGong: PalaceData;
  wuXingJu: string;
  siZhu: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };

  // 命盘特征
  chineseZodiac: string;
  zodiac: string;

  // 十二宫数据
  palaces: PalaceData[];

  // 真太阳时信息
  solarTime: {
    shichen: number;
    shichenName: string;
    adjustment: number;
  };
}

export interface AstrolabeResult {
  raw: unknown;
  parsed: ParsedAstrolabe;
  input: AstrolabeInput;
}

// ─── Main Function ─────────────────────────────────────────────────────────────

export function generateAstrolabe(input: AstrolabeInput): AstrolabeResult {
  // 1. 解析日期时间
  const dateTimeStr = `${input.birthDate}T${String(input.birthTime).padStart(2, '0')}:${String(input.birthMinute).padStart(2, '0')}:00`;
  const localTime = new Date(dateTimeStr);

  // 2. 计算真太阳时
  const solarResult = calculateTrueSolarTime(localTime, input.longitude);

  // 3. 转换性别格式
  const gender = input.gender === 'male' ? '男' : '女';

  // 4. 调用 iztro 排盘
  // bySolar 参数: (date, hour, gender, isLeapMonth, language)
  // hour: 0-11 对应子时到亥时
  const astrolabe = astro.bySolar(
    input.birthDate,
    solarResult.shichen,
    gender,
    true,
    'zh-CN'
  );

  // 5. 解析结果
  const parsed = parseAstrolabe(astrolabe, solarResult);

  return {
    raw: astrolabe,
    parsed,
    input,
  };
}

// ─── Parser Functions ──────────────────────────────────────────────────────────

function parseAstrolabe(raw: unknown, solarResult: { shichen: number; shichenName: string; adjustment: number }): ParsedAstrolabe {
  const data = raw as Record<string, unknown>;

  // 提取基本信息
  const chineseZodiac = String(data?.chineseZodiac || '');
  const zodiac = String(data?.zodiac || '');
  const fiveElementClass = String(data?.fiveElementClass || '');
  const earthlyBranchOfSoulPalace = String(data?.earthlyBranchOfSoulPalace || '');
  const earthlyBranchOfBodyPalace = String(data?.earthlyBranchOfBodyPalace || '');

  // 提取四柱
  const siZhu = {
    year: String((data?.year as Record<string, string>)?.categorical || ''),
    month: String((data?.month as Record<string, string>)?.categorical || ''),
    day: String((data?.day as Record<string, string>)?.categorical || ''),
    hour: String((data?.hour as Record<string, string>)?.categorical || ''),
  };

  // 提取十二宫
  const rawPalaces = (data?.palaces || []) as unknown[];
  const palaces: PalaceData[] = rawPalaces.map((p: unknown) => parsePalace(p as Record<string, unknown>));

  // 找到命宫和身宫
  const mingGong = palaces.find(p => p.name === '命宫') || createEmptyPalace('命宫');
  const shenGong = palaces.find(p => p.name === '身宫') || createEmptyPalace('身宫');

  return {
    mingGong,
    shenGong,
    wuXingJu: fiveElementClass,
    siZhu,
    chineseZodiac,
    zodiac,
    palaces,
    solarTime: {
      shichen: solarResult.shichen,
      shichenName: solarResult.shichenName,
      adjustment: solarResult.adjustment,
    },
  };
}

function parsePalace(raw: Record<string, unknown>): PalaceData {
  const name = String(raw?.name || '');
  const earthlyBranch = String(raw?.earthlyBranch || '');

  // 提取主星
  const majorStars: string[] = [];
  const rawMajorStars = raw?.majorStars as unknown[];
  if (Array.isArray(rawMajorStars)) {
    rawMajorStars.forEach((star: unknown) => {
      const starData = star as Record<string, unknown>;
      const starName = String(starData?.name || '');
      if (starName && starName !== '空') {
        majorStars.push(starName);
      }
    });
  }

  // 提取辅星
  const minorStars: string[] = [];
  const rawMinorStars = raw?.minorStars as unknown[];
  if (Array.isArray(rawMinorStars)) {
    rawMinorStars.forEach((star: unknown) => {
      const starData = star as Record<string, unknown>;
      const starName = String(starData?.name || '');
      if (starName && starName !== '空') {
        minorStars.push(starName);
      }
    });
  }

  // 提取四化
  const mutagen: string[] = [];
  const rawMutagen = raw?.mutagen as unknown[];
  if (Array.isArray(rawMutagen)) {
    rawMutagen.forEach((m: unknown) => {
      const mutagenData = m as Record<string, unknown>;
      const mutagenName = String(mutagenData?.name || '');
      if (mutagenName) {
        mutagen.push(mutagenName);
      }
    });
  }

  return {
    name,
    earthlyBranch,
    majorStars,
    minorStars,
    mutagen,
    isEmpty: majorStars.length === 0,
  };
}

function createEmptyPalace(name: string): PalaceData {
  return {
    name,
    earthlyBranch: '',
    majorStars: [],
    minorStars: [],
    mutagen: [],
    isEmpty: true,
  };
}

// ─── Utility Functions ──────────────────────────────────────────────────────────

/**
 * 获取命宫主星描述
 */
export function getMingGongDescription(mingGong: PalaceData): string {
  if (mingGong.isEmpty) {
    return '空宫';
  }

  const stars = mingGong.majorStars.join('·');
  return `命宫主星：${stars}`;
}

/**
 * 获取核心身份描述
 */
export function getCoreIdentity(parsed: ParsedAstrolabe): string {
  const stars = parsed.mingGong.majorStars.join('·');
  return `命宫主星：${stars || '空宫'}`;
}
