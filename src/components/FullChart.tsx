/**
 * Full chart component for the report view.
 */

import React from 'react';
import { motion } from 'motion/react';

import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { extractSiZhu, formatLunarDate, localizeChineseZodiac, localizeGender } from '@/lib/i18n/chart';
import {
  PalaceData,
  RawAstrolabe,
  PALACE_LAYOUT,
  TaiChiSymbol,
  BaguaRing,
  CloudPattern,
  getShichenName,
  getWesternZodiac,
  getBodyPalace,
  getLifePalace,
  getPalaceByBranch,
  PalaceCell,
} from './chart-shared';

// ─── Props ────────────────────────────────────────────────────────────────────

interface FullChartProps {
  rawAstrolabe: RawAstrolabe | null;
  gender?: string;
  birthDate?: string;
  birthTime?: number;
  birthCity?: string;
  locale?: Locale;
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FullChart({ rawAstrolabe, gender, birthDate, birthTime, locale = 'en' }: FullChartProps) {
  const palaces = rawAstrolabe?.palaces || [];
  const dictionary = getDictionary(locale).chart;
  const lifePalace = getLifePalace(palaces);
  const bodyPalace = getBodyPalace(palaces);
  const siZhu = extractSiZhu(rawAstrolabe?.rawDates, rawAstrolabe?.chineseDate);

  const renderGrid = () => {
    const cells: React.ReactNode[] = [];

    PALACE_LAYOUT.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 'CENTER') {
          if (rowIndex === 1 && colIndex === 1) {
            cells.push(
              <PalaceCell key="center" palace={null} isCenter astrolabe={rawAstrolabe} locale={locale} />
            );
          }
        } else if (cell === 'EMPTY') {
          return;
        } else {
          const palace = getPalaceByBranch(palaces, cell);
          cells.push(
            <PalaceCell key={`${rowIndex}-${colIndex}`} palace={palace} isCenter={false} astrolabe={rawAstrolabe} locale={locale} />
          );
        }
      });
    });

    return cells;
  };

  const displayGender = localizeGender(locale, rawAstrolabe?.gender || gender);
  const shichenName = birthTime !== undefined ? getShichenName(birthTime, locale) : '';

  return (
    <div className="w-full">
      {/* Summary card */}
      <motion.div
        className="mb-6 bg-white/70 backdrop-blur-sm border border-[#B8925A]/10 shadow-sm overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Row 1: profile */}
        <div className="grid grid-cols-3 md:grid-cols-6 border-b border-[#B8925A]/10">
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.gender}</p>
            <p className="text-[#1A0F05] font-medium text-sm">{displayGender}</p>
          </div>
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.zodiac}</p>
            <p className="text-[#1A0F05] font-medium text-sm">{localizeChineseZodiac(locale, rawAstrolabe?.chineseZodiac || rawAstrolabe?.zodiac || '-') || '-'}</p>
          </div>
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.western}</p>
            <p className="text-[#1A0F05] font-medium text-sm">{birthDate ? getWesternZodiac(birthDate, locale) : '-'}</p>
          </div>
          <div className="p-3 text-center border-r border-t md:border-t-0 border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.elements}</p>
            <p className="text-[#1A0F05] font-medium text-sm">{rawAstrolabe?.fiveElementsClass || '-'}</p>
          </div>
          <div className="p-3 text-center border-r border-t md:border-t-0 border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.solarDate}</p>
            <p className="text-[#1A0F05] font-medium text-xs">{rawAstrolabe?.solarDate || birthDate}</p>
          </div>
          <div className="p-3 text-center border-t md:border-t-0 border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.lunarDate}</p>
            <p className="text-[#1A0F05] font-medium text-xs">{formatLunarDate(rawAstrolabe?.rawDates, rawAstrolabe?.lunarDate)}</p>
          </div>
        </div>

        {/* Row 2: chart highlights */}
        <div className="grid grid-cols-4 bg-[#F7F3EC]/30">
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.lifePalace}</p>
            <p className="text-[#8B0000] font-medium text-sm">{
              lifePalace?.majorStars?.map((s) => s.name).join('·') || 'No major stars'
            }</p>
          </div>
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.bodyPalace}</p>
            <p className="text-[#1A0F05] font-medium text-sm">{
              bodyPalace?.majorStars?.map((s) => s.name).join('·') || 'No major stars'
            }</p>
          </div>
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.shichen}</p>
            <p className="text-[#1A0F05] font-medium text-sm">{shichenName || '-'}</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.pillars}</p>
            <p className="text-[#1A0F05] font-medium text-sm font-serif">
              {siZhu.year} {siZhu.month} {siZhu.day} {siZhu.hour}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 12-palace chart */}
      <motion.div
        className="relative border-2 border-[#B8925A]/30 bg-white shadow-xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Chart header */}
        <div className="bg-gradient-to-r from-[#1A0F05] via-[#2D1F15] to-[#1A0F05] py-3 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <CloudPattern className="w-full h-full text-[#B8925A]" />
          </div>
          <div className="relative flex items-center justify-center gap-3">
            <TaiChiSymbol className="w-5 h-5 text-[#B8925A]" />
            <p className="text-[#B8925A] tracking-[0.3em] text-sm">{dictionary.chartTitle}</p>
            <TaiChiSymbol className="w-5 h-5 text-[#B8925A]" />
          </div>
        </div>

        {/* 12-palace grid */}
        <div className="grid grid-cols-4">
          {renderGrid()}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="mt-4 p-3 bg-[#1A0F05]/5 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs text-[#1A0F05]/50">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-gradient-to-br from-[#8B0000]/10 to-[#8B0000]/5 text-[#8B0000] text-[10px] rounded">{dictionary.legendMain}</span>
            <span>Red</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#1A0F05]/70 text-[10px]">{dictionary.legendMinor}</span>
            <span>Black</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#1A0F05]/50 text-[9px]">{dictionary.legendAdj}</span>
            <span>Muted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#8B0000] text-[9px] font-medium">{dictionary.legendDecadal}</span>
            <span>Top-right red numbers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#B8925A] text-[8px]">{dictionary.legendSpirits}</span>
            <span>Lower symbolic markers</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
