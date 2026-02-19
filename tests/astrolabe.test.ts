import { describe, it, expect } from 'vitest';
import { generateAstrolabe, getMingGongDescription } from '../src/lib/ziwei/wrapper';
import { getCityByName, searchCities } from '../src/lib/location/cities';

describe('iztro 排盘引擎验证', () => {
  /**
   * 验证命盘生成基本功能
   */

  it('应该正确计算真太阳时', () => {
    const result = generateAstrolabe({
      birthDate: '1990-06-15',
      birthTime: 12,
      birthMinute: 0,
      gender: 'male',
      longitude: 116.4074,
      birthCity: '北京',
    });

    expect(result.parsed.solarTime).toBeDefined();
    expect(result.parsed.solarTime.shichen).toBeGreaterThanOrEqual(0);
    expect(result.parsed.solarTime.shichen).toBeLessThanOrEqual(11);
  });

  it('应该正确生成命宫数据', () => {
    const result = generateAstrolabe({
      birthDate: '1990-01-01',
      birthTime: 6,
      birthMinute: 0,
      gender: 'male',
      longitude: 116.4074,
      birthCity: '北京',
    });

    expect(result.parsed.mingGong).toBeDefined();
    expect(result.parsed.mingGong.name).toBeTruthy();
  });

  it('应该正确生成十二宫', () => {
    const result = generateAstrolabe({
      birthDate: '1985-05-20',
      birthTime: 8,
      birthMinute: 30,
      gender: 'female',
      longitude: 121.4737,
      birthCity: '上海',
    });

    expect(result.parsed.palaces).toHaveLength(12);
  });

  it('应该正确提取命宫主星', () => {
    const result = generateAstrolabe({
      birthDate: '1990-06-15',
      birthTime: 12,
      birthMinute: 0,
      gender: 'male',
      longitude: 116.4074,
      birthCity: '北京',
    });

    const description = getMingGongDescription(result.parsed.mingGong);
    expect(description).toContain('命宫主星');
  });

  it('应该正确处理不同经度的时辰差异', () => {
    // 上海 (121.5°E)
    const shanghaiResult = generateAstrolabe({
      birthDate: '1990-06-15',
      birthTime: 5,
      birthMinute: 30,
      gender: 'male',
      longitude: 121.4737,
      birthCity: '上海',
    });

    // 成都 (104.1°E)
    const chengduResult = generateAstrolabe({
      birthDate: '1990-06-15',
      birthTime: 5,
      birthMinute: 30,
      gender: 'male',
      longitude: 104.0657,
      birthCity: '成都',
    });

    const timeDiff = Math.abs(
      shanghaiResult.parsed.solarTime.adjustment - chengduResult.parsed.solarTime.adjustment
    );
    expect(timeDiff).toBeGreaterThan(60);
  });
});

describe('城市经纬度数据验证', () => {
  it('应该能找到北京', () => {
    const beijing = getCityByName('北京');
    expect(beijing).toBeDefined();
    expect(beijing?.longitude).toBeCloseTo(116.4074, 2);
    expect(beijing?.latitude).toBeCloseTo(39.9042, 2);
  });

  it('应该能搜索城市', () => {
    const results = searchCities('广');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((c) => c.name === '广州')).toBe(true);
  });
});
