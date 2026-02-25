/**
 * 完整版命盘组件
 * 用于报告页面显示
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  PalaceData,
  RawAstrolabe,
  PALACE_LAYOUT,
  TaiChiSymbol,
  BaguaRing,
  CloudPattern,
  getShichenName,
  getWesternZodiac,
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
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FullChart({ rawAstrolabe, gender, birthDate, birthTime }: FullChartProps) {
  const palaces = rawAstrolabe?.palaces || [];

  const renderGrid = () => {
    const cells: React.ReactNode[] = [];

    PALACE_LAYOUT.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 'CENTER') {
          if (rowIndex === 1 && colIndex === 1) {
            cells.push(
              <PalaceCell key="center" palace={null} isCenter astrolabe={rawAstrolabe} />
            );
          }
        } else if (cell === 'EMPTY') {
          return;
        } else {
          const palace = getPalaceByBranch(palaces, cell);
          cells.push(
            <PalaceCell key={`${rowIndex}-${colIndex}`} palace={palace} isCenter={false} astrolabe={rawAstrolabe} />
          );
        }
      });
    });

    return cells;
  };

  // 解析四柱
  const chineseDate = rawAstrolabe?.chineseDate || '';
  const siZhuParts = chineseDate.split(' ');
  const siZhu = siZhuParts.length === 4
    ? { year: siZhuParts[0], month: siZhuParts[1], day: siZhuParts[2], hour: siZhuParts[3] }
    : { year: '', month: '', day: '', hour: '' };

  const displayGender = rawAstrolabe?.gender || (gender === 'male' ? '男' : '女');
  const shichenName = birthTime !== undefined ? getShichenName(birthTime) : '';

  return (
    <div className="w-full">
      {/* 基本信息卡片 */}
      <motion.div
        className="mb-6 bg-white/70 backdrop-blur-sm border border-[#B8925A]/10 shadow-sm overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 第一行：基本信息 */}
        <div className="grid grid-cols-3 md:grid-cols-6 border-b border-[#B8925A]/10">
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">性别</p>
            <p className="text-[#1A0F05] font-medium text-sm">{displayGender}</p>
          </div>
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">生肖</p>
            <p className="text-[#1A0F05] font-medium text-sm">{rawAstrolabe?.chineseZodiac || rawAstrolabe?.zodiac || '-'}</p>
          </div>
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">星座</p>
            <p className="text-[#1A0F05] font-medium text-sm">{birthDate ? getWesternZodiac(birthDate) : '-'}</p>
          </div>
          <div className="p-3 text-center border-r border-t md:border-t-0 border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">五行局</p>
            <p className="text-[#1A0F05] font-medium text-sm">{rawAstrolabe?.fiveElementsClass || '-'}</p>
          </div>
          <div className="p-3 text-center border-r border-t md:border-t-0 border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">阳历</p>
            <p className="text-[#1A0F05] font-medium text-xs">{rawAstrolabe?.solarDate || birthDate}</p>
          </div>
          <div className="p-3 text-center border-t md:border-t-0 border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">农历</p>
            <p className="text-[#1A0F05] font-medium text-xs">{rawAstrolabe?.lunarDate || '-'}</p>
          </div>
        </div>

        {/* 第二行：命盘核心信息 */}
        <div className="grid grid-cols-4 bg-[#F7F3EC]/30">
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">命宫主星</p>
            <p className="text-[#8B0000] font-medium text-sm">{
              palaces.find(p => p.name === '命宫')?.majorStars?.map(s => s.name).join('·') || '空宫'
            }</p>
          </div>
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">身宫主星</p>
            <p className="text-[#1A0F05] font-medium text-sm">{
              palaces.find(p => p.name === '身宫')?.majorStars?.map(s => s.name).join('·') || '空宫'
            }</p>
          </div>
          <div className="p-3 text-center border-r border-[#B8925A]/10">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">出生时辰</p>
            <p className="text-[#1A0F05] font-medium text-sm">{shichenName || '-'}</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">四柱</p>
            <p className="text-[#1A0F05] font-medium text-sm font-serif">
              {siZhu.year} {siZhu.month} {siZhu.day} {siZhu.hour}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 12宫命盘 */}
      <motion.div
        className="relative border-2 border-[#B8925A]/30 bg-white shadow-xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* 命盘标题 */}
        <div className="bg-gradient-to-r from-[#1A0F05] via-[#2D1F15] to-[#1A0F05] py-3 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <CloudPattern className="w-full h-full text-[#B8925A]" />
          </div>
          <div className="relative flex items-center justify-center gap-3">
            <TaiChiSymbol className="w-5 h-5 text-[#B8925A]" />
            <p className="text-[#B8925A] tracking-[0.3em] text-sm">紫微斗數排盤</p>
            <TaiChiSymbol className="w-5 h-5 text-[#B8925A]" />
          </div>
        </div>

        {/* 12宫格 */}
        <div className="grid grid-cols-4">
          {renderGrid()}
        </div>
      </motion.div>

      {/* 图例说明 */}
      <motion.div
        className="mt-4 p-3 bg-[#1A0F05]/5 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs text-[#1A0F05]/50">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-gradient-to-br from-[#8B0000]/10 to-[#8B0000]/5 text-[#8B0000] text-[10px] rounded">主星</span>
            <span>红色</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#1A0F05]/70 text-[10px]">辅星</span>
            <span>黑色</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#1A0F05]/50 text-[9px]">杂耀</span>
            <span>浅色</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#8B0000] text-[9px] font-medium">大限</span>
            <span>右上角红色数字</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#B8925A] text-[8px]">长生/博士</span>
            <span>底部12神</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
