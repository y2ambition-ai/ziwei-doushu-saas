/**
 * 简化版命盘组件
 * 用于报告页面显示，方便打印
 */

import React from 'react';
import { motion } from 'motion/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PalaceData {
  name?: string;
  heavenlyStem?: string;
  earthlyBranch?: string;
  majorStars?: { name: string; brightness?: string }[];
  minorStars?: { name: string; brightness?: string }[];
  adjectiveStars?: { name: string }[];
  changsheng12?: string;
  boshi12?: string;
  decadal?: { range?: [number, number] };
  ages?: number[];
}

interface MiniChartProps {
  palaces?: PalaceData[];
  chineseDate?: string;
  fiveElementsClass?: string;
  chineseZodiac?: string;
  // 额外信息用于中间显示
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
}

// ─── 12宫布局 ────────────────────────────────────────────────────────────────

const PALACE_LAYOUT = [
  ['巳', '午', '未', '申'],
  ['辰', null, null, '酉'],
  ['卯', null, null, '戌'],
  ['寅', '丑', '子', '亥'],
];

const BRANCH_TO_INDEX: Record<string, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
};

// ─── Helper Functions ───────────────────────────────────────────────────────

function getPalaceByBranch(palaces: PalaceData[], branch: string): PalaceData | undefined {
  const index = BRANCH_TO_INDEX[branch];
  return palaces?.[index];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MiniChart({
  palaces = [],
  chineseDate,
  fiveElementsClass,
  chineseZodiac,
  gender,
  birthDate,
  birthTime,
  birthCity,
}: MiniChartProps) {
  // 解析四柱
  const siZhuParts = (chineseDate || '').split(' ');
  const siZhu = siZhuParts.length === 4
    ? { year: siZhuParts[0], month: siZhuParts[1], day: siZhuParts[2], hour: siZhuParts[3] }
    : null;

  return (
    <div className="bg-gradient-to-br from-[#F7F3EC] via-[#FDF8F0] to-[#F7F3EC] border-2 border-[#B8925A]/40 p-6 print:break-inside-avoid shadow-lg shadow-[#B8925A]/10">
      {/* 顶部标题 */}
      <div className="text-center mb-5 pb-4 border-b border-[#B8925A]/20">
        <motion.p
          className="text-[#B8925A] text-sm tracking-[0.3em] font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          紫微斗數命盤
        </motion.p>
      </div>

      {/* 12宫格 */}
      <div className="grid grid-cols-4 gap-1 text-sm">
        {PALACE_LAYOUT.map((row, rowIndex) =>
          row.map((branch, colIndex) => {
            if (branch === null) {
              // 中心区域 - 显示核心信息
              if (rowIndex === 1 && colIndex === 1) {
                return (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className="row-span-2 col-span-2 border-2 border-[#B8925A]/30 bg-gradient-to-br from-[#FDF8F0] via-[#F5EDE0] to-[#FDF8F0] p-4 flex flex-col items-center justify-center min-h-[140px]"
                    style={{ gridColumn: 'span 2', gridRow: 'span 2' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {/* 太极图标动画 */}
                    <motion.div
                      className="text-[#B8925A] text-2xl mb-3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      ☯
                    </motion.div>

                    {/* 核心信息 */}
                    <motion.div
                      className="text-center space-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {gender && birthDate && (
                        <p className="text-[#1A0F05] text-sm font-medium">
                          {gender === 'male' ? '男命' : '女命'} · {birthDate}
                        </p>
                      )}
                      {birthTime && (
                        <p className="text-[#8B4513] text-xs">
                          {birthTime}
                        </p>
                      )}
                      {birthCity && (
                        <p className="text-[#1A0F05]/50 text-xs">
                          {birthCity}
                        </p>
                      )}
                    </motion.div>

                    {/* 四柱 */}
                    {siZhu && (
                      <motion.div
                        className="mt-2 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <p className="text-[#1A0F05]/70 text-[10px] tracking-wider">
                          {siZhu.year} {siZhu.month} {siZhu.day} {siZhu.hour}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                );
              }
              return null;
            }

            const palace = getPalaceByBranch(palaces, branch);
            const majorStars = palace?.majorStars?.map(s => s.name).join(' ') || '';
            const minorStars = palace?.minorStars?.map(s => s.name).join(' ') || '';

            return (
              <motion.div
                key={branch}
                className="border border-[#B8925A]/25 p-2 min-h-[70px] bg-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + (rowIndex * 4 + colIndex) * 0.02 }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[#B8925A] font-medium text-sm">{palace?.name || branch}</span>
                  {palace?.decadal?.range && (
                    <span className="text-[#8B0000] text-[10px]">
                      {palace.decadal.range[0]}-{palace.decadal.range[1]}
                    </span>
                  )}
                </div>
                {majorStars && (
                  <div className="text-[#8B0000] font-medium text-xs leading-tight mt-1">
                    {majorStars}
                  </div>
                )}
                {minorStars && (
                  <div className="text-[#1A0F05]/70 text-[10px] leading-tight mt-0.5">
                    {minorStars}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* 底部信息 */}
      <div className="mt-4 pt-4 border-t border-[#B8925A]/20">
        <div className="grid grid-cols-3 gap-4 text-xs text-center">
          {fiveElementsClass && (
            <div>
              <span className="text-[#1A0F05]/50">五行局：</span>
              <span className="text-[#1A0F05] font-medium">{fiveElementsClass}</span>
            </div>
          )}
          {chineseZodiac && (
            <div>
              <span className="text-[#1A0F05]/50">生肖：</span>
              <span className="text-[#1A0F05] font-medium">{chineseZodiac}</span>
            </div>
          )}
          {siZhu && (
            <div>
              <span className="text-[#1A0F05]/50">四柱：</span>
              <span className="text-[#1A0F05] font-medium">{siZhu.year} {siZhu.month}</span>
            </div>
          )}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex justify-center gap-6 mt-3 text-[10px] text-[#1A0F05]/40">
        <span><span className="text-[#8B0000]">红色</span> = 主星</span>
        <span><span className="text-[#1A0F05]/70">黑色</span> = 辅星</span>
      </div>
    </div>
  );
}
