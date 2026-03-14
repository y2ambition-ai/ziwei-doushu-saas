import { describe, it, expect } from 'vitest';
import { generateAstrolabe, getMingGongDescription } from '../src/lib/ziwei/wrapper';
import { getCityByName, searchCities } from '../src/lib/location/cities';

describe('iztro chart engine', () => {
  it('calculates true solar time', () => {
    const result = generateAstrolabe({
      birthDate: '1990-06-15',
      birthTime: 12,
      birthMinute: 0,
      gender: 'male',
      longitude: 116.4074,
      birthCity: 'Beijing',
    });

    expect(result.parsed.solarTime).toBeDefined();
    expect(result.parsed.solarTime.shichen).toBeGreaterThanOrEqual(0);
    expect(result.parsed.solarTime.shichen).toBeLessThanOrEqual(11);
  });

  it('builds life palace data', () => {
    const result = generateAstrolabe({
      birthDate: '1990-01-01',
      birthTime: 6,
      birthMinute: 0,
      gender: 'male',
      longitude: 116.4074,
      birthCity: 'Beijing',
    });

    expect(result.parsed.mingGong).toBeDefined();
    expect(result.parsed.mingGong.name).toBeTruthy();
  });

  it('builds twelve palaces', () => {
    const result = generateAstrolabe({
      birthDate: '1985-05-20',
      birthTime: 8,
      birthMinute: 30,
      gender: 'female',
      longitude: 121.4737,
      birthCity: 'Shanghai',
    });

    expect(result.parsed.palaces).toHaveLength(12);
  });

  it('extracts life palace stars description', () => {
    const result = generateAstrolabe({
      birthDate: '1990-06-15',
      birthTime: 12,
      birthMinute: 0,
      gender: 'male',
      longitude: 116.4074,
      birthCity: 'Beijing',
    });

    const description = getMingGongDescription(result.parsed.mingGong);
    expect(description).toContain('Life palace stars');
  });

  it('handles longitude adjustments across regions', () => {
    const shanghaiResult = generateAstrolabe({
      birthDate: '1990-06-15',
      birthTime: 5,
      birthMinute: 30,
      gender: 'male',
      longitude: 121.4737,
      birthCity: 'Shanghai',
    });

    const chengduResult = generateAstrolabe({
      birthDate: '1990-06-15',
      birthTime: 5,
      birthMinute: 30,
      gender: 'male',
      longitude: 104.0657,
      birthCity: 'Chengdu',
    });

    const timeDiff = Math.abs(
      shanghaiResult.parsed.solarTime.adjustment - chengduResult.parsed.solarTime.adjustment
    );
    expect(timeDiff).toBeGreaterThan(60);
  });
});

describe('city coordinate lookup', () => {
  it('finds a city by name or pinyin', () => {
    const beijing = getCityByName('beijing');
    expect(beijing).toBeDefined();
    expect(beijing?.longitude).toBeCloseTo(116.4074, 2);
    expect(beijing?.latitude).toBeCloseTo(39.9042, 2);
  });

  it('searches cities by keyword', () => {
    const results = searchCities('guang');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((c) => Math.abs(c.longitude - 113.2644) < 0.01)).toBe(true);
  });
});
