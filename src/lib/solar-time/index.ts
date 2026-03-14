/**
 * True solar time calculator.
 */

const SHICHEN_NAMES = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];

export interface SolarTimeResult {
  /** True solar time as a local Date */
  trueSolarTime: Date;
  /** Shichen index (0-11) */
  shichen: number;
  /** Shichen label */
  shichenName: string;
  /** Time adjustment (minutes) */
  adjustment: number;
  /** Longitude adjustment (minutes) */
  longitudeAdjustment: number;
  /** Equation of time (minutes) */
  equationOfTime: number;
}

/**
 * Calculate true solar time.
 * @param localTime Local time
 * @param longitude Longitude (east positive, west negative)
 */
export function calculateTrueSolarTime(
  localTime: Date,
  longitude: number
): SolarTimeResult {
  // 1. Longitude adjustment
  // Standard reference: UTC+8 = 120°E
  // 1 degree longitude = 4 minutes
  const longitudeOffset = (longitude - 120) * 4;

  // 2. Equation of time
  const eot = calculateEquationOfTime(localTime);

  // 3. Total adjustment
  const totalAdjustment = longitudeOffset + eot;

  // 4. True solar time
  const trueSolarTime = new Date(localTime.getTime() + totalAdjustment * 60 * 1000);

  // 5. Shichen index
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
 * Map hour to shichen index.
 */
function getShichenFromHour(hour: number): number {
  // 23:00-00:59 -> Zi (0)
  // 01:00-02:59 -> Chou (1)
  // ...
  // 21:00-22:59 -> Hai (11)
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

/**
 * Calculate equation of time (NOAA approximation).
 */
function calculateEquationOfTime(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const gamma = (2 * Math.PI * (dayOfYear - 1)) / 365;

  return 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );
}

/**
 * Get shichen label.
 */
export function getShichenName(index: number): string {
  return SHICHEN_NAMES[index] || 'Unknown';
}

/**
 * Get shichen info.
 */
export function getShichenInfo(index: number): {
  name: string;
  timeRange: string;
  animal: string;
} {
  const info = [
    { name: 'Zi', timeRange: '23:00-01:00', animal: 'Rat' },
    { name: 'Chou', timeRange: '01:00-03:00', animal: 'Ox' },
    { name: 'Yin', timeRange: '03:00-05:00', animal: 'Tiger' },
    { name: 'Mao', timeRange: '05:00-07:00', animal: 'Rabbit' },
    { name: 'Chen', timeRange: '07:00-09:00', animal: 'Dragon' },
    { name: 'Si', timeRange: '09:00-11:00', animal: 'Snake' },
    { name: 'Wu', timeRange: '11:00-13:00', animal: 'Horse' },
    { name: 'Wei', timeRange: '13:00-15:00', animal: 'Goat' },
    { name: 'Shen', timeRange: '15:00-17:00', animal: 'Monkey' },
    { name: 'You', timeRange: '17:00-19:00', animal: 'Rooster' },
    { name: 'Xu', timeRange: '19:00-21:00', animal: 'Dog' },
    { name: 'Hai', timeRange: '21:00-23:00', animal: 'Pig' },
  ];
  return info[index] || { name: 'Unknown', timeRange: '', animal: '' };
}
