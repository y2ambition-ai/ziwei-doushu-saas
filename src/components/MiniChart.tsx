/**
 * 简化版命盘组件
 * 用于报告页面显示，方便打印
 */

import React from 'react';

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

// ─── Helper Functions ────────────────────────────────────────────────────────

function getPalaceByBranch(palaces: PalaceData[], branch: string): PalaceData | undefined {
  const index = BRANCH_TO_INDEX[branch];
  return palaces?.[index];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MiniChart({ palaces = [], chineseDate, fiveElementsClass, chineseZodiac }: MiniChartProps) {
  // 解析四柱
  const siZhuParts = (chineseDate || '').split(' ');
  const siZhu = siZhuParts.length === 4
    ? { year: siZhuParts[0], month: siZhuParts[1], day: siZhuParts[2], hour: siZhuParts[3] }
    : null;

  return (
    <div className="bg-[#F7F3EC] border border-[#B8925A]/30 p-4 print:break-inside-avoid">
      {/* 标题 */}
      <div className="text-center mb-4">
        <p className="text-[#B8925A] text-xs tracking-widest">紫微斗數命盤</p>
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        {siZhu && (
          <div className="flex gap-2">
            <span className="text-[#1A0F05]/50">四柱:</span>
            <span className="text-[#1A0F05] font-medium">
              {siZhu.year} {siZhu.month} {siZhu.day} {siZhu.hour}
            </span>
          </div>
        )}
        {fiveElementsClass && (
          <div className="flex gap-2">
            <span className="text-[#1A0F05]/50">五行:</span>
            <span className="text-[#1A0F05] font-medium">{fiveElementsClass}</span>
          </div>
        )}
        {chineseZodiac && (
          <div className="flex gap-2">
            <span className="text-[#1A0F05]/50">生肖:</span>
            <span className="text-[#1A0F05] font-medium">{chineseZodiac}</span>
          </div>
        )}
      </div>

      {/* 12宫格 - 简化版 */}
      <div className="grid grid-cols-4 gap-0.5 text-[10px]">
        {PALACE_LAYOUT.map((row, rowIndex) =>
          row.map((branch, colIndex) => {
            if (branch === null) {
              // 中心区域 - 留空或放简化信息
              if (rowIndex === 1 && colIndex === 1) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="row-span-2 col-span-2 border border-[#B8925A]/20 bg-[#FDF8F0] p-2 flex items-center justify-center"
                    style={{ gridColumn: 'span 2', gridRow: 'span 2' }}
                  >
                    <span className="text-[#B8925A] text-lg">☯</span>
                  </div>
                );
              }
              return null;
            }

            const palace = getPalaceByBranch(palaces, branch);
            const majorStars = palace?.majorStars?.map(s => s.name).join(' ') || '';
            const minorStars = palace?.minorStars?.map(s => s.name).join(' ') || '';

            return (
              <div
                key={branch}
                className="border border-[#B8925A]/20 p-1 min-h-[60px]"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[#B8925A] font-medium">{palace?.name || branch}</span>
                  {palace?.decadal?.range && (
                    <span className="text-[#8B0000] text-[8px]">
                      {palace.decadal.range[0]}-{palace.decadal.range[1]}
                    </span>
                  )}
                </div>
                {majorStars && (
                  <div className="text-[#8B0000] font-medium leading-tight mt-0.5">
                    {majorStars}
                  </div>
                )}
                {minorStars && (
                  <div className="text-[#1A0F05]/70 leading-tight text-[9px] mt-0.5">
                    {minorStars}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 图例 */}
      <div className="flex justify-center gap-4 mt-3 text-[8px] text-[#1A0F05]/50">
        <span><span className="text-[#8B0000]">红色</span> = 主星</span>
        <span><span className="text-[#1A0F05]/70">黑色</span> = 辅星</span>
      </div>
    </div>
  );
}
