/**
 * Shared chart module.
 * Includes SVG decorations, helpers, and types.
 */

import React from 'react';
import { motion } from 'motion/react';

import { Locale } from '@/lib/i18n/config';
import {
  RawDates,
  formatLunarDate,
  getLocalizedShichenName,
  getWesternZodiac as getLocalizedWesternZodiac,
  localizeEarthlyBranch,
  localizeGender,
  localizePalaceName,
  normalizeEarthlyBranch,
} from '@/lib/i18n/chart';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PalaceData {
  name?: string;
  heavenlyStem?: string;
  earthlyBranch?: string;
  majorStars?: { name: string; brightness?: string }[];
  minorStars?: { name: string; brightness?: string }[];
  adjectiveStars?: { name: string }[];
  changsheng12?: string;
  boshi12?: string;
  jiangqian12?: string;
  suiqian12?: string;
  decadal?: { range?: [number, number] };
  ages?: number[];
  isBodyPalace?: boolean;
  isOriginalPalace?: boolean;
}

export interface RawAstrolabe {
  palaces?: PalaceData[];
  gender?: string;
  solarDate?: string;
  lunarDate?: string;
  rawDates?: RawDates;
  zodiac?: string;
  sign?: string;
  fiveElementsClass?: string;
  chineseZodiac?: string;
  chineseDate?: string;
  year?: { categorical?: string };
  month?: { categorical?: string };
  day?: { categorical?: string };
  hour?: { categorical?: string };
}

// ─── 12-Palace Layout (Traditional Zi Wei Dou Shu arrangement) ───────────────

export const PALACE_LAYOUT = [
  ['si', 'wu', 'wei', 'shen'],
  ['chen', 'CENTER', 'EMPTY', 'you'],
  ['mao', 'EMPTY', 'EMPTY', 'xu'],
  ['yin', 'chou', 'zi', 'hai'],
];

// ─── SVG Decorations ───────────────────────────────────────────────────────────

export function TaiChiSymbol({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2" fill="currentColor" />
      <circle cx="50" cy="26" r="6" fill="currentColor" opacity="0" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="74" r="6" fill="currentColor" />
    </svg>
  );
}

export function BaguaRing({ className = '' }: { className?: string }) {
  // Trigram line data: [top, middle, bottom] - true=yang (solid), false=yin (broken).
  // Later Heaven sequence, clockwise from North.
  const bagua = [
    [false, true, false], // Kan ☵ (North, 0°)
    [true, false, false], // Gen ☶ (Northeast, 45°)
    [false, false, true], // Zhen ☳ (East, 90°)
    [true, true, false],  // Xun ☴ (Southeast, 135°)
    [true, false, true],  // Li ☲ (South, 180°)
    [false, false, false],// Kun ☷ (Southwest, 225°)
    [false, true, true],  // Dui ☱ (West, 270°)
    [true, true, true],   // Qian ☰ (Northwest, 315°)
  ];

  const renderTrigram = (lines: boolean[], index: number) => {
    const angle = index * 45;
    const radius = 92;
    const centerX = 100 + radius * Math.sin(angle * Math.PI / 180);
    const centerY = 100 - radius * Math.cos(angle * Math.PI / 180);

    return (
      <g key={index} transform={`translate(${centerX - 8}, ${centerY - 6})`}>
        {[0, 1, 2].map((lineIndex) => {
          const isYang = lines[lineIndex];
          const y = lineIndex * 5;
          return isYang ? (
            <rect key={lineIndex} x="0" y={y} width="16" height="2" fill="currentColor" />
          ) : (
            <g key={lineIndex}>
              <rect x="0" y={y} width="6" height="2" fill="currentColor" />
              <rect x="10" y={y} width="6" height="2" fill="currentColor" />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <svg viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.3" />
      {bagua.map((trigram, i) => renderTrigram(trigram, i))}
    </svg>
  );
}

export function CloudPattern({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" className={className}>
      <path
        d="M10 30 Q15 20 25 25 Q30 15 40 20 Q50 10 60 20 Q70 15 75 25 Q85 20 90 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-4 w-full max-w-md mx-auto my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8925A] to-transparent opacity-30" />
      <TaiChiSymbol className="w-6 h-6 text-[#B8925A] opacity-50" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8925A] to-transparent opacity-30" />
    </div>
  );
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

export function getShichenName(hour: number, locale: Locale = 'en'): string {
  return getLocalizedShichenName(hour, locale);
}

export function getWesternZodiac(birthDate: string, locale: Locale = 'en'): string {
  return getLocalizedWesternZodiac(birthDate, locale);
}

export function getPalaceByBranch(palaces: PalaceData[], branch: string): PalaceData | null {
  const target = normalizeEarthlyBranch(branch);
  return palaces?.find((p) => normalizeEarthlyBranch(p.earthlyBranch) === target) || null;
}

function normalizePalaceName(value?: string): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/[\u4e00-\u9fff]/.test(trimmed)) {
    return trimmed.replace(/\u5bab$/, '');
  }

  return trimmed.toLowerCase().replace(/palace/g, '').trim();
}

export function getLifePalace(palaces: PalaceData[]): PalaceData | null {
  const direct = palaces?.find((palace) => palace.isOriginalPalace);
  if (direct) {
    return direct;
  }

  return palaces?.find((palace) => {
    const normalized = normalizePalaceName(palace.name);
    return normalized === 'soul' || normalized === 'life' || normalized === '\u547d';
  }) || null;
}

export function getBodyPalace(palaces: PalaceData[]): PalaceData | null {
  const direct = palaces?.find((palace) => palace.isBodyPalace);
  if (direct) {
    return direct;
  }

  return palaces?.find((palace) => {
    const normalized = normalizePalaceName(palace.name);
    return normalized === 'body' || normalized === '\u8eab';
  }) || null;
}

// ─── Star Badge Component ───────────────────────────────────────────────────────

export function StarBadge({ name, brightness, isMain }: {
  name: string;
  brightness?: string;
  isMain: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded
                  ${isMain
                    ? 'bg-gradient-to-br from-[#8B0000]/10 to-[#8B0000]/5 text-[#8B0000] font-medium'
                    : 'text-[#1A0F05]/70'
                  }`}
    >
      {name}
      {brightness && (
        <span className="ml-0.5 text-[#B8925A] text-[10px]">{brightness}</span>
      )}
    </span>
  );
}

// ─── Palace Cell Component ──────────────────────────────────────────────────────

export function PalaceCell({ palace, isCenter, astrolabe, minHeight = 'md:min-h-[180px]', locale = 'en' }: {
  palace: PalaceData | null;
  isCenter: boolean;
  astrolabe: RawAstrolabe | null;
  minHeight?: string;
  locale?: Locale;
}) {
  if (isCenter) {
    return (
      <div className="col-span-2 row-span-2 relative overflow-hidden
                      bg-gradient-to-br from-[#FDF8F0] via-[#F5EDE0] to-[#EDE4D5]
                      flex flex-col items-center justify-center text-[#1A0F05] p-4 md:p-6
                      border border-[#B8925A]/20">
        <div className="absolute inset-0 opacity-[0.08]">
          <BaguaRing className="w-full h-full text-[#8B4513]" />
        </div>
        <div className="absolute top-2 right-2 opacity-15">
          <CloudPattern className="w-16 h-8 text-[#B8925A]" />
        </div>
        <div className="absolute bottom-2 left-2 opacity-15 rotate-180">
          <CloudPattern className="w-16 h-8 text-[#B8925A]" />
        </div>

      <div className="relative z-10 text-center">
          <motion.div
            className="mb-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <TaiChiSymbol className="w-12 h-12 md:w-16 md:h-16 mx-auto text-[#8B4513]" />
          </motion.div>
          <p className="text-[#8B4513] text-[10px] tracking-[0.3em] mb-2 font-medium">ZI WEI DOU SHU</p>
          <p className="text-base md:text-lg mb-1 font-medium">{localizeGender(locale, astrolabe?.gender)}</p>
          <p className="text-xs text-[#1A0F05]/60">{formatLunarDate(astrolabe?.rawDates, astrolabe?.lunarDate)}</p>
          <div className="mt-3 pt-3 border-t border-[#8B4513]/20">
            <p className="text-[#8B4513] text-[10px] tracking-wider">Five-element pattern</p>
            <p className="text-lg md:text-xl font-medium mt-0.5">{astrolabe?.fiveElementsClass || '-'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!palace) {
    return <div className="bg-[#F7F3EC]/30" />;
  }

  const majorStars = palace.majorStars || [];
  const minorStars = palace.minorStars || [];
  const adjectiveStars = palace.adjectiveStars || [];
  const hasStars = majorStars.length > 0;

  return (
    <div className={`relative p-1.5 md:p-2 border border-[#B8925A]/15
                    ${hasStars ? 'bg-gradient-to-br from-[#FFFDF8] to-[#F7F3EC]' : 'bg-[#F7F3EC]/50'}
                    flex flex-col min-h-[140px] ${minHeight}`}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-[#B8925A] font-medium text-xs md:text-sm">{localizePalaceName(locale, palace.name)}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-0.5 bg-[#1A0F05]/5 px-1.5 py-0.5 rounded">
            <span className="text-[#1A0F05] text-[10px] font-medium">{palace.heavenlyStem}</span>
            <span className="text-[#B8925A] text-[10px]">{localizeEarthlyBranch(locale, palace.earthlyBranch)}</span>
          </div>
          {palace.decadal?.range && (
            <span className="text-[#8B0000] text-[8px] md:text-[9px] font-medium">
              {palace.decadal.range[0]}-{palace.decadal.range[1]}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1">
        {majorStars.length > 0 ? (
          <div className="flex flex-wrap gap-0.5 mb-1">
            {majorStars.map((star, i) => (
              <StarBadge key={i} name={star.name} brightness={star.brightness} isMain />
            ))}
          </div>
        ) : (
          <span className="text-[#1A0F05]/20 text-[10px] italic">No major stars</span>
        )}

        {minorStars.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mb-1">
            {minorStars.map((star, i) => (
              <StarBadge key={i} name={star.name} brightness={star.brightness} isMain={false} />
            ))}
          </div>
        )}

        {adjectiveStars.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mb-1">
            {adjectiveStars.slice(0, 6).map((star, i) => (
              <span key={i} className="text-[#1A0F05]/50 text-[9px]">{star.name}</span>
            ))}
            {adjectiveStars.length > 6 && (
              <span className="text-[#1A0F05]/30 text-[8px]">+{adjectiveStars.length - 6}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto pt-1 border-t border-[#B8925A]/10 space-y-0.5">
        {palace.changsheng12 && (
          <div className="flex items-center gap-1">
            <span className="text-[#B8925A] text-[8px]">Changsheng:</span>
            <span className="text-[#1A0F05]/60 text-[8px]">{palace.changsheng12}</span>
          </div>
        )}
        {palace.boshi12 && (
          <div className="flex items-center gap-1">
            <span className="text-[#B8925A] text-[8px]">Boshi:</span>
            <span className="text-[#1A0F05]/60 text-[8px]">{palace.boshi12}</span>
          </div>
        )}
        {palace.jiangqian12 && (
          <div className="flex items-center gap-1">
            <span className="text-[#B8925A] text-[8px]">Jiangqian:</span>
            <span className="text-[#1A0F05]/60 text-[8px]">{palace.jiangqian12}</span>
          </div>
        )}
        {palace.suiqian12 && (
          <div className="flex items-center gap-1">
            <span className="text-[#B8925A] text-[8px]">Suiqian:</span>
            <span className="text-[#1A0F05]/60 text-[8px]">{palace.suiqian12}</span>
          </div>
        )}
        {palace.ages && palace.ages.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[#8B0000] text-[8px]">Ages:</span>
            <span className="text-[#1A0F05]/50 text-[7px]">{palace.ages.slice(0, 8).join(', ')}...</span>
          </div>
        )}
      </div>
    </div>
  );
}
