import { Locale } from './config';

const palaceNames: Record<string, { en: string; zh: string }> = {
  命宫: { en: 'Life Palace', zh: '命宫' },
  兄弟: { en: 'Siblings', zh: '兄弟' },
  夫妻: { en: 'Partnership', zh: '夫妻' },
  子女: { en: 'Children', zh: '子女' },
  财帛: { en: 'Wealth', zh: '财帛' },
  疾厄: { en: 'Health', zh: '疾厄' },
  迁移: { en: 'Travel', zh: '迁移' },
  仆役: { en: 'Allies', zh: '仆役' },
  官禄: { en: 'Career', zh: '官禄' },
  田宅: { en: 'Property', zh: '田宅' },
  福德: { en: 'Fortune', zh: '福德' },
  父母: { en: 'Parents', zh: '父母' },
  身宫: { en: 'Body Palace', zh: '身宫' },
};

const earthlyBranches: Record<string, { en: string; zh: string }> = {
  子: { en: 'Zi', zh: '子' },
  丑: { en: 'Chou', zh: '丑' },
  寅: { en: 'Yin', zh: '寅' },
  卯: { en: 'Mao', zh: '卯' },
  辰: { en: 'Chen', zh: '辰' },
  巳: { en: 'Si', zh: '巳' },
  午: { en: 'Wu', zh: '午' },
  未: { en: 'Wei', zh: '未' },
  申: { en: 'Shen', zh: '申' },
  酉: { en: 'You', zh: '酉' },
  戌: { en: 'Xu', zh: '戌' },
  亥: { en: 'Hai', zh: '亥' },
};

const chineseZodiacMap: Record<string, { en: string; zh: string }> = {
  鼠: { en: 'Rat', zh: '鼠' },
  牛: { en: 'Ox', zh: '牛' },
  虎: { en: 'Tiger', zh: '虎' },
  兔: { en: 'Rabbit', zh: '兔' },
  龙: { en: 'Dragon', zh: '龙' },
  蛇: { en: 'Snake', zh: '蛇' },
  马: { en: 'Horse', zh: '马' },
  羊: { en: 'Goat', zh: '羊' },
  猴: { en: 'Monkey', zh: '猴' },
  鸡: { en: 'Rooster', zh: '鸡' },
  狗: { en: 'Dog', zh: '狗' },
  猪: { en: 'Pig', zh: '猪' },
};

const westernZodiacRanges = [
  { name: { en: 'Capricorn', zh: '摩羯座' }, start: [12, 22], end: [1, 19] },
  { name: { en: 'Aquarius', zh: '水瓶座' }, start: [1, 20], end: [2, 18] },
  { name: { en: 'Pisces', zh: '双鱼座' }, start: [2, 19], end: [3, 20] },
  { name: { en: 'Aries', zh: '白羊座' }, start: [3, 21], end: [4, 19] },
  { name: { en: 'Taurus', zh: '金牛座' }, start: [4, 20], end: [5, 20] },
  { name: { en: 'Gemini', zh: '双子座' }, start: [5, 21], end: [6, 21] },
  { name: { en: 'Cancer', zh: '巨蟹座' }, start: [6, 22], end: [7, 22] },
  { name: { en: 'Leo', zh: '狮子座' }, start: [7, 23], end: [8, 22] },
  { name: { en: 'Virgo', zh: '处女座' }, start: [8, 23], end: [9, 22] },
  { name: { en: 'Libra', zh: '天秤座' }, start: [9, 23], end: [10, 23] },
  { name: { en: 'Scorpio', zh: '天蝎座' }, start: [10, 24], end: [11, 22] },
  { name: { en: 'Sagittarius', zh: '射手座' }, start: [11, 23], end: [12, 21] },
];

const shichenMap = [
  { zh: '子时', en: 'Zi hour' },
  { zh: '丑时', en: 'Chou hour' },
  { zh: '寅时', en: 'Yin hour' },
  { zh: '卯时', en: 'Mao hour' },
  { zh: '辰时', en: 'Chen hour' },
  { zh: '巳时', en: 'Si hour' },
  { zh: '午时', en: 'Wu hour' },
  { zh: '未时', en: 'Wei hour' },
  { zh: '申时', en: 'Shen hour' },
  { zh: '酉时', en: 'You hour' },
  { zh: '戌时', en: 'Xu hour' },
  { zh: '亥时', en: 'Hai hour' },
];

export function localizePalaceName(locale: Locale, name?: string): string {
  if (!name) {
    return '';
  }

  return palaceNames[name]?.[locale] || name;
}

export function localizeEarthlyBranch(locale: Locale, branch?: string): string {
  if (!branch) {
    return '';
  }

  return earthlyBranches[branch]?.[locale] || branch;
}

export function localizeGender(locale: Locale, gender?: string): string {
  if (!gender) {
    return locale === 'zh' ? '未知' : 'Unknown';
  }

  if (gender === '男' || gender === 'male') {
    return locale === 'zh' ? '男' : 'Male';
  }

  if (gender === '女' || gender === 'female') {
    return locale === 'zh' ? '女' : 'Female';
  }

  return gender;
}

export function localizeChineseZodiac(locale: Locale, value?: string): string {
  if (!value) {
    return '';
  }

  return chineseZodiacMap[value]?.[locale] || value;
}

export function getLocalizedShichenName(hour: number, locale: Locale): string {
  const shichenIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  return shichenMap[shichenIndex]?.[locale] || (locale === 'zh' ? '未知时辰' : 'Unknown block');
}

export function getWesternZodiac(birthDate: string, locale: Locale): string {
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

  return match?.name[locale] || westernZodiacRanges[0].name[locale];
}
