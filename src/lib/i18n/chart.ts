import { Locale } from './config';

export interface RawDates {
  lunarDate?: {
    lunarYear?: number;
    lunarMonth?: number;
    lunarDay?: number;
    isLeap?: boolean;
  };
  chineseDate?: {
    yearly?: string[];
    monthly?: string[];
    daily?: string[];
    hourly?: string[];
  };
}

export interface SiZhuParts {
  year: string;
  month: string;
  day: string;
  hour: string;
}

const palaceDisplay: Record<string, string> = {
  life: 'Life Palace',
  siblings: 'Siblings',
  partnership: 'Partnership',
  children: 'Children',
  wealth: 'Wealth',
  health: 'Health',
  travel: 'Travel',
  allies: 'Allies',
  career: 'Career',
  property: 'Property',
  fortune: 'Fortune',
  parents: 'Parents',
  body: 'Body Palace',
};

const palaceAliases: Record<string, string> = {
  '\u547d': 'life',
  '\u547d\u5bab': 'life',
  soul: 'life',
  life: 'life',
  'life palace': 'life',
  '\u5144\u5f1f': 'siblings',
  '\u5144\u5f1f\u5bab': 'siblings',
  siblings: 'siblings',
  '\u592b\u59bb': 'partnership',
  '\u592b\u59bb\u5bab': 'partnership',
  spouse: 'partnership',
  partnership: 'partnership',
  marriage: 'partnership',
  '\u5b50\u5973': 'children',
  '\u5b50\u5973\u5bab': 'children',
  children: 'children',
  '\u8d22\u5e1b': 'wealth',
  '\u8d22\u5e1b\u5bab': 'wealth',
  wealth: 'wealth',
  '\u75be\u5384': 'health',
  '\u75be\u5384\u5bab': 'health',
  health: 'health',
  '\u8fc1\u79fb': 'travel',
  '\u8fc1\u79fb\u5bab': 'travel',
  surface: 'travel',
  travel: 'travel',
  '\u4ec6\u5f79': 'allies',
  '\u4ec6\u5f79\u5bab': 'allies',
  friends: 'allies',
  allies: 'allies',
  '\u5b98\u7984': 'career',
  '\u5b98\u7984\u5bab': 'career',
  career: 'career',
  '\u7530\u5b85': 'property',
  '\u7530\u5b85\u5bab': 'property',
  property: 'property',
  '\u798f\u5fb7': 'fortune',
  '\u798f\u5fb7\u5bab': 'fortune',
  spirit: 'fortune',
  fortune: 'fortune',
  '\u7236\u6bcd': 'parents',
  '\u7236\u6bcd\u5bab': 'parents',
  parents: 'parents',
  '\u8eab': 'body',
  '\u8eab\u5bab': 'body',
  body: 'body',
  'body palace': 'body',
};

const branchAliases: Record<string, string> = {
  '\u5b50': 'zi',
  zi: 'zi',
  '\u4e11': 'chou',
  chou: 'chou',
  '\u5bc5': 'yin',
  yin: 'yin',
  '\u536f': 'mao',
  mao: 'mao',
  '\u8fb0': 'chen',
  chen: 'chen',
  '\u5df3': 'si',
  si: 'si',
  '\u5348': 'wu',
  wu: 'wu',
  woo: 'wu',
  '\u672a': 'wei',
  wei: 'wei',
  '\u7533': 'shen',
  shen: 'shen',
  '\u9149': 'you',
  you: 'you',
  '\u620c': 'xu',
  xu: 'xu',
  '\u4ea5': 'hai',
  hai: 'hai',
};

const branchDisplay: Record<string, string> = {
  zi: 'Rat',
  chou: 'Ox',
  yin: 'Tiger',
  mao: 'Rabbit',
  chen: 'Dragon',
  si: 'Snake',
  wu: 'Horse',
  wei: 'Goat',
  shen: 'Monkey',
  you: 'Rooster',
  xu: 'Dog',
  hai: 'Pig',
};

const zodiacDisplay: Record<string, string> = {
  '\u9f20': 'Rat',
  rat: 'Rat',
  '\u725b': 'Ox',
  ox: 'Ox',
  '\u864e': 'Tiger',
  tiger: 'Tiger',
  '\u5154': 'Rabbit',
  rabbit: 'Rabbit',
  '\u9f99': 'Dragon',
  dragon: 'Dragon',
  '\u86c7': 'Snake',
  snake: 'Snake',
  '\u9a6c': 'Horse',
  horse: 'Horse',
  '\u7f8a': 'Goat',
  goat: 'Goat',
  '\u7334': 'Monkey',
  monkey: 'Monkey',
  '\u9e21': 'Rooster',
  rooster: 'Rooster',
  '\u72d7': 'Dog',
  dog: 'Dog',
  '\u732a': 'Pig',
  pig: 'Pig',
};

const stemsMap: Record<string, string> = {
  '\u7532': 'Yang Wood',
  '\u4e59': 'Yin Wood',
  '\u4e19': 'Yang Fire',
  '\u4e01': 'Yin Fire',
  '\u620a': 'Yang Earth',
  '\u5df1': 'Yin Earth',
  '\u5e9a': 'Yang Metal',
  '\u8f9b': 'Yin Metal',
  '\u58ec': 'Yang Water',
  '\u7678': 'Yin Water',
};

const branchesMap: Record<string, string> = {
  '\u5b50': 'Rat',
  '\u4e11': 'Ox',
  '\u5bc5': 'Tiger',
  '\u536f': 'Rabbit',
  '\u8fb0': 'Dragon',
  '\u5df3': 'Snake',
  '\u5348': 'Horse',
  '\u672a': 'Goat',
  '\u7533': 'Monkey',
  '\u9149': 'Rooster',
  '\u620c': 'Dog',
  '\u4ea5': 'Pig',
};

const romanizedStemMap: Record<string, string> = {
  jia: 'Yang Wood',
  yi: 'Yin Wood',
  bing: 'Yang Fire',
  ding: 'Yin Fire',
  wu: 'Yang Earth',
  ji: 'Yin Earth',
  geng: 'Yang Metal',
  xin: 'Yin Metal',
  ren: 'Yang Water',
  gui: 'Yin Water',
};

const romanizedBranchMap: Record<string, string> = {
  zi: 'Rat',
  chou: 'Ox',
  yin: 'Tiger',
  mao: 'Rabbit',
  chen: 'Dragon',
  si: 'Snake',
  wu: 'Horse',
  wei: 'Goat',
  shen: 'Monkey',
  you: 'Rooster',
  xu: 'Dog',
  hai: 'Pig',
};

const westernZodiacRanges = [
  { name: 'Capricorn', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', start: [2, 19], end: [3, 20] },
  { name: 'Aries', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', start: [5, 21], end: [6, 21] },
  { name: 'Cancer', start: [6, 22], end: [7, 22] },
  { name: 'Leo', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', start: [8, 23], end: [9, 22] },
  { name: 'Libra', start: [9, 23], end: [10, 23] },
  { name: 'Scorpio', start: [10, 24], end: [11, 22] },
  { name: 'Sagittarius', start: [11, 23], end: [12, 21] },
];

const shichenMap = [
  '11 PM-1 AM',
  '1 AM-3 AM',
  '3 AM-5 AM',
  '5 AM-7 AM',
  '7 AM-9 AM',
  '9 AM-11 AM',
  '11 AM-1 PM',
  '1 PM-3 PM',
  '3 PM-5 PM',
  '5 PM-7 PM',
  '7 PM-9 PM',
  '9 PM-11 PM',
];

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
    .join(' ')
    .trim();
}

function containsChinese(value: string): boolean {
  return /[\u4e00-\u9fff]/.test(value);
}

function normalizePalaceKey(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }

  const candidates: string[] = [];
  candidates.push(trimmed);
  candidates.push(trimmed.replace(/\u5bab$/, ''));

  const lower = trimmed.toLowerCase();
  candidates.push(lower);
  candidates.push(lower.replace(/palace/g, '').trim());

  for (const candidate of candidates) {
    const alias = palaceAliases[candidate];
    if (alias) {
      return alias;
    }
  }

  return trimmed;
}

export function normalizeEarthlyBranch(branch?: string): string {
  if (!branch) {
    return '';
  }

  const trimmed = branch.trim();
  const lower = trimmed.toLowerCase();
  return branchAliases[lower] || branchAliases[trimmed] || lower;
}

export function localizePalaceName(_: Locale, name?: string): string {
  if (!name) {
    return '';
  }

  const key = normalizePalaceKey(name);
  if (palaceDisplay[key]) {
    return palaceDisplay[key];
  }

  return containsChinese(key) ? 'Unknown Palace' : toTitleCase(key);
}

export function localizeEarthlyBranch(_: Locale, branch?: string): string {
  if (!branch) {
    return '';
  }

  const normalized = normalizeEarthlyBranch(branch);
  if (branchDisplay[normalized]) {
    return branchDisplay[normalized];
  }

  return containsChinese(branch) ? 'Unknown' : toTitleCase(branch);
}

export function localizeGender(_: Locale, gender?: string): string {
  if (!gender) {
    return 'Unknown';
  }

  const normalized = gender.toLowerCase();
  if (normalized === 'male' || gender === '\u7537') {
    return 'Male';
  }

  if (normalized === 'female' || gender === '\u5973') {
    return 'Female';
  }

  return gender;
}

export function localizeChineseZodiac(_: Locale, value?: string): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  const display = zodiacDisplay[trimmed] || zodiacDisplay[lower];
  if (display) {
    return display;
  }

  return containsChinese(trimmed) ? 'Unknown' : toTitleCase(trimmed);
}

export function getLocalizedShichenName(hour: number, _locale: Locale): string {
  const shichenIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  return shichenMap[shichenIndex] || 'Unknown birth-time block';
}

export function getWesternZodiac(birthDate: string, _locale: Locale): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const match = westernZodiacRanges.find((range) => {
    const [startMonth, startDay] = range.start;
    const [endMonth, endDay] = range.end;

    if (startMonth > endMonth) {
      return (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      );
    }

    return (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay) ||
      (month > startMonth && month < endMonth)
    );
  });

  return match?.name || westernZodiacRanges[0].name;
}

export function formatLunarDate(rawDates?: RawDates, fallback?: string): string {
  const lunar = rawDates?.lunarDate;
  if (lunar?.lunarYear && lunar?.lunarMonth && lunar?.lunarDay) {
    const month = String(lunar.lunarMonth).padStart(2, '0');
    const day = String(lunar.lunarDay).padStart(2, '0');
    const leapSuffix = lunar.isLeap ? ' (Leap)' : '';
    return `Lunar ${lunar.lunarYear}-${month}-${day}${leapSuffix}`;
  }

  if (fallback && !containsChinese(fallback)) {
    return fallback;
  }

  return '-';
}

function formatPillarFromParts(parts?: string[]): string {
  if (!parts || parts.length < 2) {
    return '';
  }

  const [stem, branch] = parts;
  const stemLabel = stemsMap[stem] || stem;
  const branchLabel = branchesMap[branch] || branch;
  return `${stemLabel} ${branchLabel}`.trim();
}

function formatPillarFromChinese(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return containsChinese(trimmed) ? '' : toTitleCase(trimmed);
  }

  const stem = trimmed[0];
  const branch = trimmed[1];
  if (stemsMap[stem] || branchesMap[branch]) {
    return `${stemsMap[stem] || stem} ${branchesMap[branch] || branch}`.trim();
  }

  return containsChinese(trimmed) ? '' : toTitleCase(trimmed);
}

function formatPillarFromRomanized(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const [stem, branch] = normalized.toLowerCase().split(' ');

  if (stem && branch && romanizedStemMap[stem] && romanizedBranchMap[branch]) {
    return `${romanizedStemMap[stem]} ${romanizedBranchMap[branch]}`;
  }

  return toTitleCase(normalized);
}

export function extractSiZhu(rawDates?: RawDates, chineseDate?: string): SiZhuParts {
  const fromRawDates = rawDates?.chineseDate;
  if (fromRawDates) {
    const year = formatPillarFromParts(fromRawDates.yearly);
    const month = formatPillarFromParts(fromRawDates.monthly);
    const day = formatPillarFromParts(fromRawDates.daily);
    const hour = formatPillarFromParts(fromRawDates.hourly);

    if (year || month || day || hour) {
      return { year, month, day, hour };
    }
  }

  if (chineseDate) {
    if (chineseDate.includes(' - ')) {
      const parts = chineseDate
        .split(' - ')
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length === 4) {
        return {
          year: formatPillarFromRomanized(parts[0]),
          month: formatPillarFromRomanized(parts[1]),
          day: formatPillarFromRomanized(parts[2]),
          hour: formatPillarFromRomanized(parts[3]),
        };
      }
    }

    const spaced = chineseDate
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (spaced.length === 4) {
      return {
        year: containsChinese(spaced[0]) ? formatPillarFromChinese(spaced[0]) : formatPillarFromRomanized(spaced[0]),
        month: containsChinese(spaced[1]) ? formatPillarFromChinese(spaced[1]) : formatPillarFromRomanized(spaced[1]),
        day: containsChinese(spaced[2]) ? formatPillarFromChinese(spaced[2]) : formatPillarFromRomanized(spaced[2]),
        hour: containsChinese(spaced[3]) ? formatPillarFromChinese(spaced[3]) : formatPillarFromRomanized(spaced[3]),
      };
    }
  }

  return { year: '', month: '', day: '', hour: '' };
}
