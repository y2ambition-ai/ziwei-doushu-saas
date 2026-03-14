/**
 * Wrapper for the iztro chart engine.
 */

import { astro } from 'iztro';
import { calculateTrueSolarTime } from '../solar-time';
import {
  RawDates,
  extractSiZhu,
  formatLunarDate,
  localizeChineseZodiac,
  localizeEarthlyBranch,
  localizeGender,
  localizePalaceName,
  normalizeEarthlyBranch,
} from '../i18n/chart';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AstrolabeInput {
  birthDate: string;  // YYYY-MM-DD
  birthTime: number;  // 0-23
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
  isBodyPalace?: boolean;
  isOriginalPalace?: boolean;
}

export interface ParsedAstrolabe {
  // Core info
  mingGong: PalaceData;
  shenGong: PalaceData;
  wuXingJu: string;
  siZhu: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };

  // Chart traits
  chineseZodiac: string;
  zodiac: string;

  // Twelve palaces
  palaces: PalaceData[];

  // True solar time
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
  const dateTimeStr = `${input.birthDate}T${String(input.birthTime).padStart(2, '0')}:${String(input.birthMinute).padStart(2, '0')}:00`;
  const localTime = new Date(dateTimeStr);

  const solarResult = calculateTrueSolarTime(localTime, input.longitude);

  // bySolar(date, hour, gender, isLeapMonth, language)
  const astrolabe = astro.bySolar(
    input.birthDate,
    solarResult.shichen,
    input.gender,
    true,
    'en-US'
  );

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
  const rawDates = data?.rawDates as RawDates | undefined;

  const chineseZodiac = String(data?.chineseZodiac || data?.zodiac || '');
  const zodiac = String(data?.sign || data?.zodiac || '');
  const fiveElementsClass = String(data?.fiveElementsClass || data?.fiveElementClass || '');
  const earthlyBranchOfSoulPalace = String(data?.earthlyBranchOfSoulPalace || '');
  const earthlyBranchOfBodyPalace = String(data?.earthlyBranchOfBodyPalace || '');

  const siZhu = extractSiZhu(rawDates, String(data?.chineseDate || ''));

  const rawPalaces = (data?.palaces || []) as unknown[];
  const palaces: PalaceData[] = rawPalaces.map((p: unknown) => parsePalace(p as Record<string, unknown>));

  const mingGong = resolveLifePalace(palaces, earthlyBranchOfSoulPalace);
  const shenGong = resolveBodyPalace(palaces, earthlyBranchOfBodyPalace);

  return {
    mingGong,
    shenGong,
    wuXingJu: fiveElementsClass,
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
  const isBodyPalace = Boolean(raw?.isBodyPalace);
  const isOriginalPalace = Boolean(raw?.isOriginalPalace);

  const majorStars: string[] = [];
  const rawMajorStars = raw?.majorStars as unknown[];
  if (Array.isArray(rawMajorStars)) {
    rawMajorStars.forEach((star: unknown) => {
      const starData = star as Record<string, unknown>;
      const starName = String(starData?.name || '');
      const normalized = starName.toLowerCase();
      if (starName && starName !== '\u7a7a' && normalized !== 'void' && normalized !== 'empty') {
        majorStars.push(starName);
      }
    });
  }

  const minorStars: string[] = [];
  const rawMinorStars = raw?.minorStars as unknown[];
  if (Array.isArray(rawMinorStars)) {
    rawMinorStars.forEach((star: unknown) => {
      const starData = star as Record<string, unknown>;
      const starName = String(starData?.name || '');
      const normalized = starName.toLowerCase();
      if (starName && starName !== '\u7a7a' && normalized !== 'void' && normalized !== 'empty') {
        minorStars.push(starName);
      }
    });
  }

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
    isBodyPalace,
    isOriginalPalace,
  };
}

function normalizePalaceName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/[\u4e00-\u9fff]/.test(trimmed)) {
    return trimmed.replace(/\u5bab$/, '');
  }

  return trimmed.toLowerCase().replace(/palace/g, '').trim();
}

function resolveLifePalace(palaces: PalaceData[], branchHint?: string): PalaceData {
  const direct = palaces.find((palace) => palace.isOriginalPalace);
  if (direct) {
    return direct;
  }

  const byName = palaces.find((palace) => {
    const normalized = normalizePalaceName(palace.name);
    return normalized === 'soul' || normalized === 'life' || normalized === '\u547d';
  });
  if (byName) {
    return byName;
  }

  if (branchHint) {
    const target = normalizeEarthlyBranch(branchHint);
    const byBranch = palaces.find((palace) => normalizeEarthlyBranch(palace.earthlyBranch) === target);
    if (byBranch) {
      return byBranch;
    }
  }

  return createEmptyPalace('soul');
}

function resolveBodyPalace(palaces: PalaceData[], branchHint?: string): PalaceData {
  const direct = palaces.find((palace) => palace.isBodyPalace);
  if (direct) {
    return direct;
  }

  const byName = palaces.find((palace) => {
    const normalized = normalizePalaceName(palace.name);
    return normalized === 'body' || normalized === '\u8eab';
  });
  if (byName) {
    return byName;
  }

  if (branchHint) {
    const target = normalizeEarthlyBranch(branchHint);
    const byBranch = palaces.find((palace) => normalizeEarthlyBranch(palace.earthlyBranch) === target);
    if (byBranch) {
      return byBranch;
    }
  }

  return createEmptyPalace('body');
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

export function getMingGongDescription(mingGong: PalaceData): string {
  if (mingGong.isEmpty) {
    return 'Life palace stars: No major stars';
  }

  const stars = mingGong.majorStars.join('·');
  return `Life palace stars: ${stars}`;
}

export function getCoreIdentity(parsed: ParsedAstrolabe): string {
  const stars = parsed.mingGong.majorStars.join('·');
  return `Life palace stars: ${stars || 'No major stars'}`;
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

// ─── LLM Prompt Formatter ─────────────────────────────────────────────────────

export function formatAstrolabeForLLM(astrolabe: unknown): string {
  const data = astrolabe as Record<string, unknown>;
  const palaces = (data?.palaces || []) as unknown[];
  const lines: string[] = [];

  const gender = localizeGender('en', String(data?.gender || ''));
  const solarDate = String(data?.solarDate || '');
  const lunarDate = formatLunarDate(data?.rawDates as RawDates | undefined, String(data?.lunarDate || ''));
  const chineseZodiac = localizeChineseZodiac('en', String(data?.chineseZodiac || data?.zodiac || ''));
  const fiveElementsClass = String(data?.fiveElementsClass || data?.fiveElementClass || '');

  lines.push(`Gender: ${gender}`);
  lines.push(`Solar date: ${solarDate}`);
  lines.push(`Lunar date: ${lunarDate}`);
  lines.push(`Chinese zodiac: ${chineseZodiac}`);
  lines.push(`Five-element pattern: ${fiveElementsClass}`);
  lines.push('');

  palaces.forEach((palace: unknown) => {
    lines.push(formatPalaceDetailForLLM(palace as Record<string, unknown>, astrolabe));
  });

  return lines.join('\n');
}

function formatPalaceDetailForLLM(palace: Record<string, unknown>, astrolabe: unknown): string {
  const lines: string[] = [];
  const astrolabeData = astrolabe as Record<string, unknown>;

  const name = String(palace?.name || '');
  const displayName = localizePalaceName('en', name) || name;
  const heavenlyStem = String(palace?.heavenlyStem || '');
  const earthlyBranch = localizeEarthlyBranch('en', String(palace?.earthlyBranch || ''));

  lines.push(`${displayName} | Heavenly stem: ${toTitleCase(heavenlyStem)} | Earthly branch: ${earthlyBranch}`);

  const majorStars = formatStarsWithBrightnessLLM(palace?.majorStars);
  lines.push(`Major stars: ${majorStars || 'None'}`);

  const minorStars = formatStarsWithBrightnessLLM(palace?.minorStars);
  lines.push(`Minor stars: ${minorStars || 'None'}`);

  const adjStars = formatAdjectiveStarsLLM(palace?.adjectiveStars);
  lines.push(`Supporting stars: ${adjStars || 'None'}`);

  lines.push(`Changsheng 12: ${palace?.changsheng12 || ''}`);
  lines.push(`Boshi 12: ${palace?.boshi12 || ''}`);
  lines.push(`Jiangqian 12: ${palace?.jiangqian12 || ''}`);
  lines.push(`Suiqian 12: ${palace?.suiqian12 || ''}`);

  const decadal = palace?.decadal as Record<string, unknown>;
  if (decadal?.range) {
    const range = decadal.range as number[];
    lines.push(`Decadal cycle: ${range[0]} - ${range[1]}`);
  }

  const ages = palace?.ages as number[];
  if (ages) {
    lines.push(`Age nodes: ${ages.join(', ')}`);
  }

  const sanfang = getSanFangSiZhengLLM(name, astrolabeData);
  lines.push(`Surrounding palaces: ${sanfang}`);

  lines.push('');
  return lines.join(' | ');
}

function toTitleCase(value: string): string {
  if (!value) {
    return '';
  }

  return value
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
    .join(' ')
    .trim();
}

function formatStarsWithBrightnessLLM(stars: unknown): string {
  if (!Array.isArray(stars) || stars.length === 0) return '';
  return stars
    .map((star: unknown) => {
      const s = star as Record<string, unknown>;
      const name = String(s?.name || '');
      const brightness = s?.brightness ? ` ${s.brightness}` : '';
      return name ? `${name}${brightness}` : '';
    })
    .filter(Boolean)
    .join(', ');
}

function formatAdjectiveStarsLLM(stars: unknown): string {
  if (!Array.isArray(stars) || stars.length === 0) return '';
  return stars
    .map((star: unknown) => String((star as Record<string, unknown>)?.name || ''))
    .filter(Boolean)
    .join(', ');
}

function getSanFangSiZhengLLM(palaceName: string, astrolabe: Record<string, unknown>): string {
  try {
    const surroundedPalaces = astrolabe.surroundedPalaces as (name: string) => Record<string, unknown>;
    if (typeof surroundedPalaces !== 'function') {
      return 'Unavailable';
    }

    const sanfang = surroundedPalaces.call(astrolabe, palaceName);
    const parts: string[] = [];

    const getDisplayName = (palace: Record<string, unknown>): string => {
      const name = String(palace?.name || '');
      return localizePalaceName('en', name) || name;
    };

    const formatPalaceStars = (palace: Record<string, unknown>): string => {
      const stars = formatStarsWithBrightnessLLM(palace?.majorStars) || 'None';
      return `${getDisplayName(palace)} (major stars: ${stars})`;
    };

    if (sanfang?.target) {
      parts.push(formatPalaceStars(sanfang.target as Record<string, unknown>));
    }

    if (sanfang?.opposite) {
      parts.push(formatPalaceStars(sanfang.opposite as Record<string, unknown>));
    }

    if (sanfang?.wealth) {
      parts.push(formatPalaceStars(sanfang.wealth as Record<string, unknown>));
    }

    if (sanfang?.career) {
      parts.push(formatPalaceStars(sanfang.career as Record<string, unknown>));
    }

    return parts.join('; ');
  } catch {
    return 'Unavailable';
  }
}
