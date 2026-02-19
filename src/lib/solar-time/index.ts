/**
 * 真太阳时计算模块
 * True Solar Time Calculator
 */

const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export interface SolarTimeResult {
  /** 真太阳时对应的本地时间 */
  trueSolarTime: Date;
  /** 时辰索引 (0-11 对应子时到亥时) */
  shichen: number;
  /** 时辰名称 */
  shichenName: string;
  /** 时间调整量（分钟） */
  adjustment: number;
  /** 经度调整（分钟） */
  longitudeAdjustment: number;
  /** 均时差（分钟） */
  equationOfTime: number;
}

/**
 * 计算真太阳时
 * @param localTime 本地时间
 * @param longitude 经度（东经为正，西经为负）
 * @returns 真太阳时计算结果
 */
export function calculateTrueSolarTime(
  localTime: Date,
  longitude: number
): SolarTimeResult {
  // 1. 计算经度调整
  // 北京时间 = UTC+8 = 东经120°
  // 每度经度差 = 4分钟
  const longitudeOffset = (longitude - 120) * 4; // 分钟

  // 2. 计算均时差 (Equation of Time)
  const eot = calculateEquationOfTime(localTime);

  // 3. 真太阳时调整 = 经度调整 + 均时差
  const totalAdjustment = longitudeOffset + eot;

  // 4. 计算真太阳时对应的 Date
  const trueSolarTime = new Date(localTime.getTime() + totalAdjustment * 60 * 1000);

  // 5. 确定时辰
  // 时辰划分：
  // 子时: 23:00-01:00 (跨日)
  // 丑时: 01:00-03:00
  // ...
  // 亥时: 21:00-23:00
  const hour = trueSolarTime.getHours();
  const shichen = getShichenFromHour(hour);

  return {
    trueSolarTime,
    shichen,
    shichenName: SHICHEN_NAMES[shichen],
    adjustment: totalAdjustment,
    longitudeAdjustment: longitudeOffset,
    equationOfTime: eot,
  };
}

/**
 * 从小时数获取时辰索引
 */
function getShichenFromHour(hour: number): number {
  // 时辰对应关系：
  // 23:00-00:59 -> 子时 (0)
  // 01:00-02:59 -> 丑时 (1)
  // ...
  // 21:00-22:59 -> 亥时 (11)
  if (hour === 23) return 0; // 子时开始
  return Math.floor((hour + 1) / 2) % 12;
}

/**
 * 计算均时差 (Equation of Time)
 * 使用简化算法，基于 NOAA 公式
 * @param date 日期
 * @returns 均时差（分钟）
 */
function calculateEquationOfTime(date: Date): number {
  // 计算年积日 (Day of Year)
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // 计算太阳平近点角
  const gamma = (2 * Math.PI * (dayOfYear - 1)) / 365;

  // 均时差公式 (分钟)
  // 来源：NOAA Solar Calculator
  const eot = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  return eot;
}

/**
 * 获取时辰名称
 */
export function getShichenName(index: number): string {
  return SHICHEN_NAMES[index] || '未知';
}

/**
 * 获取时辰完整信息
 */
export function getShichenInfo(index: number): {
  name: string;
  timeRange: string;
  animal: string;
} {
  const info = [
    { name: '子', timeRange: '23:00-01:00', animal: '鼠' },
    { name: '丑', timeRange: '01:00-03:00', animal: '牛' },
    { name: '寅', timeRange: '03:00-05:00', animal: '虎' },
    { name: '卯', timeRange: '05:00-07:00', animal: '兔' },
    { name: '辰', timeRange: '07:00-09:00', animal: '龙' },
    { name: '巳', timeRange: '09:00-11:00', animal: '蛇' },
    { name: '午', timeRange: '11:00-13:00', animal: '马' },
    { name: '未', timeRange: '13:00-15:00', animal: '羊' },
    { name: '申', timeRange: '15:00-17:00', animal: '猴' },
    { name: '酉', timeRange: '17:00-19:00', animal: '鸡' },
    { name: '戌', timeRange: '19:00-21:00', animal: '狗' },
    { name: '亥', timeRange: '21:00-23:00', animal: '猪' },
  ];
  return info[index] || { name: '未知', timeRange: '', animal: '' };
}
