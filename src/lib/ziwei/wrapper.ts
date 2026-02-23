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

  // 提取四柱 - 从 chineseDate 字段获取（格式："庚午 壬午 辛亥 甲午"）
  const chineseDate = String(data?.chineseDate || '');
  const dateParts = chineseDate.split(' ');
  const siZhu = {
    year: dateParts[0] || '',
    month: dateParts[1] || '',
    day: dateParts[2] || '',
    hour: dateParts[3] || '',
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

// ─── Detailed Palace Data Types ────────────────────────────────────────────────

export interface DetailedPalaceData {
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: { name: string; brightness: string }[];
  minorStars: { name: string; brightness: string }[];
  adjectiveStars: string[];
  changsheng12: string;
  boshi12: string;
  jiangqian12: string;
  suiqian12: string;
  decadalRange: [number, number];
  yearlyAges: number[];
  isEmpty: boolean;
}

export interface DetailedAstrolabe {
  gender: string;
  solarDate: string;
  lunarDate: string;
  zodiac: string;
  fiveElementsClass: string;
  palaces: DetailedPalaceData[];
}

// ─── Extract Full Data ─────────────────────────────────────────────────────────

/**
 * 提取完整的命盘数据（用于 LLM 输入）
 */
export function extractDetailedAstrolabe(raw: unknown): DetailedAstrolabe {
  const data = raw as Record<string, unknown>;
  const rawPalaces = (data?.palaces || []) as unknown[];

  return {
    gender: String(data?.gender || ''),
    solarDate: String(data?.solarDate || ''),
    lunarDate: String(data?.lunarDate || ''),
    zodiac: String(data?.zodiac || ''),
    fiveElementsClass: String(data?.fiveElementsClass || ''),
    palaces: rawPalaces.map((p: unknown) => extractDetailedPalace(p as Record<string, unknown>)),
  };
}

/**
 * 提取单个宫位的完整数据
 */
function extractDetailedPalace(palace: Record<string, unknown>): DetailedPalaceData {
  const majorStars = (palace?.majorStars || []) as unknown[];
  const minorStars = (palace?.minorStars || []) as unknown[];
  const adjectiveStars = (palace?.adjectiveStars || []) as unknown[];
  const decadal = palace?.decadal as Record<string, unknown>;
  const ages = palace?.ages as number[];

  return {
    name: String(palace?.name || ''),
    heavenlyStem: String(palace?.heavenlyStem || ''),
    earthlyBranch: String(palace?.earthlyBranch || ''),
    majorStars: majorStars.map((s: unknown) => ({
      name: String((s as Record<string, unknown>)?.name || ''),
      brightness: String((s as Record<string, unknown>)?.brightness || ''),
    })),
    minorStars: minorStars.map((s: unknown) => ({
      name: String((s as Record<string, unknown>)?.name || ''),
      brightness: String((s as Record<string, unknown>)?.brightness || ''),
    })),
    adjectiveStars: adjectiveStars.map((s: unknown) => String((s as Record<string, unknown>)?.name || '')),
    changsheng12: String(palace?.changsheng12 || ''),
    boshi12: String(palace?.boshi12 || ''),
    jiangqian12: String(palace?.jiangqian12 || ''),
    suiqian12: String(palace?.suiqian12 || ''),
    decadalRange: decadal?.range as [number, number] || [0, 0],
    yearlyAges: ages || [],
    isEmpty: majorStars.length === 0,
  };
}

// ─── LLM Prompt Formatter ───────────────────────────────────────────────────────

/**
 * 格式化命盘数据为 LLM 可读的文本格式
 * 这个函数需要原始的 astrolabe 对象（包含方法）
 */
export function formatAstrolabeForLLM(astrolabe: unknown): string {
  const data = astrolabe as Record<string, unknown>;
  const palaces = (data?.palaces || []) as unknown[];
  const lines: string[] = [];

  // 基本信息
  lines.push(`命主: ${data?.gender === '男' ? '男命' : '女命'}`);
  lines.push(`阳历: ${data?.solarDate || ''}`);
  lines.push(`农历: ${data?.lunarDate || ''}`);
  lines.push(`生肖: ${data?.zodiac || ''}`);
  lines.push(`五行局: ${data?.fiveElementsClass || ''}`);
  lines.push('');

  // 十二宫详细
  palaces.forEach((palace: unknown) => {
    lines.push(formatPalaceDetailForLLM(palace as Record<string, unknown>, astrolabe));
  });

  return lines.join('\n');
}

/**
 * 格式化单个宫位详情
 */
function formatPalaceDetailForLLM(palace: Record<string, unknown>, astrolabe: unknown): string {
  const lines: string[] = [];
  const astrolabeData = astrolabe as Record<string, unknown>;

  // 宫位名称
  const name = String(palace?.name || '');
  const displayName = name.endsWith('宫') ? name : name + '宫';
  lines.push(`${displayName} | 天干：${palace?.heavenlyStem || ''} | 地支：${palace?.earthlyBranch || ''}`);

  // 主星
  const majorStars = formatStarsWithBrightnessLLM(palace?.majorStars);
  lines.push(`主星：${majorStars || '无'}`);

  // 辅星
  const minorStars = formatStarsWithBrightnessLLM(palace?.minorStars);
  lines.push(`辅星：${minorStars || '无'}`);

  // 杂耀
  const adjStars = formatAdjectiveStarsLLM(palace?.adjectiveStars);
  lines.push(`杂耀：${adjStars || '无'}`);

  // 12神
  lines.push(`长生12神：${palace?.changsheng12 || ''}`);
  lines.push(`博士12神：${palace?.boshi12 || ''}`);
  lines.push(`将前12神：${palace?.jiangqian12 || ''}`);
  lines.push(`岁前12神：${palace?.suiqian12 || ''}`);

  // 大限
  const decadal = palace?.decadal as Record<string, unknown>;
  if (decadal?.range) {
    const range = decadal.range as number[];
    lines.push(`大限：${range[0]} - ${range[1]}`);
  }

  // 小限
  const ages = palace?.ages as number[];
  if (ages) {
    lines.push(`小限年龄：${ages.join(', ')}`);
  }

  // 三方四正
  const sanfang = getSanFangSiZhengLLM(name, astrolabeData);
  lines.push(`三方四正：${sanfang}`);

  lines.push('');
  return lines.join(' | ');
}

/**
 * 格式化星曜带亮度
 */
function formatStarsWithBrightnessLLM(stars: unknown): string {
  if (!Array.isArray(stars) || stars.length === 0) return '';
  return stars
    .map((star: unknown) => {
      const s = star as Record<string, unknown>;
      const name = String(s?.name || '');
      const brightness = s?.brightness ? `·${s.brightness}` : '';
      return name ? `${name}${brightness}` : '';
    })
    .filter(Boolean)
    .join('、');
}

/**
 * 格式化杂耀星
 */
function formatAdjectiveStarsLLM(stars: unknown): string {
  if (!Array.isArray(stars) || stars.length === 0) return '';
  return stars
    .map((star: unknown) => String((star as Record<string, unknown>)?.name || ''))
    .filter(Boolean)
    .join('、');
}

/**
 * 获取三方四正描述
 */
function getSanFangSiZhengLLM(palaceName: string, astrolabe: Record<string, unknown>): string {
  try {
    // 调用 iztro 的 surroundedPalaces 方法
    const surroundedPalaces = astrolabe.surroundedPalaces as (name: string) => Record<string, unknown>;
    if (typeof surroundedPalaces !== 'function') {
      return '无法获取';
    }

    const sanfang = surroundedPalaces.call(astrolabe, palaceName);
    const parts: string[] = [];

    // 辅助函数
    const getDisplayName = (palace: Record<string, unknown>): string => {
      const name = String(palace?.name || '');
      return name.endsWith('宫') ? name : name + '宫';
    };

    const formatPalaceStars = (palace: Record<string, unknown>): string => {
      const stars = formatStarsWithBrightnessLLM(palace?.majorStars) || '无';
      return `${getDisplayName(palace)}（主星：${stars}）`;
    };

    // 本宫
    if (sanfang?.target) {
      parts.push(formatPalaceStars(sanfang.target as Record<string, unknown>));
    }

    // 对宫
    if (sanfang?.opposite) {
      parts.push(formatPalaceStars(sanfang.opposite as Record<string, unknown>));
    }

    // 财帛方向
    if (sanfang?.wealth) {
      parts.push(formatPalaceStars(sanfang.wealth as Record<string, unknown>));
    }

    // 官禄方向
    if (sanfang?.career) {
      parts.push(formatPalaceStars(sanfang.career as Record<string, unknown>));
    }

    return parts.join('，');
  } catch {
    return '无法获取';
  }
}
