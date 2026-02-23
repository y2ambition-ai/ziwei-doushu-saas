/**
 * 完整版命盘组件
 * 用于报告页面显示
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
  jiangqian12?: string;
  suiqian12?: string;
  decadal?: { range?: [number, number] };
  ages?: number[];
}

interface RawAstrolabe {
  palaces?: PalaceData[];
  gender?: string;
  solarDate?: string;
  lunarDate?: string;
  zodiac?: string;
  fiveElementsClass?: string;
  chineseZodiac?: string;
  chineseDate?: string;
}

interface FullChartProps {
  rawAstrolabe: RawAstrolabe | null;
  gender?: string;
  birthDate?: string;
  birthTime?: number;
  birthCity?: string;
}

// ─── 12宫布局 ────────────────────────────────────────────────────────────────

const PALACE_LAYOUT = [
  ['巳', '午', '未', '申'],
  ['辰', 'CENTER', 'EMPTY', '酉'],
  ['卯', 'EMPTY', 'EMPTY', '戌'],
  ['寅', '丑', '子', '亥'],
];

// ─── SVG Decorations ───────────────────────────────────────────────────────────

function TaiChiSymbol({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2" fill="currentColor" />
      <circle cx="50" cy="26" r="6" fill="currentColor" opacity="0" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="74" r="6" fill="currentColor" />
    </svg>
  );
}

function BaguaRing({ className = '' }: { className?: string }) {
  const bagua = [
    [false, true, false],
    [true, false, false],
    [false, false, true],
    [true, true, false],
    [true, false, true],
    [false, false, false],
    [false, true, true],
    [true, true, true],
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

function CloudPattern({ className = '' }: { className?: string }) {
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

// ─── Helper Functions ───────────────────────────────────────────────────────────

function getShichenName(hour: number): string {
  const shichenMap: Record<number, string> = {
    0: '子时', 1: '丑时', 2: '寅时', 3: '卯时',
    4: '辰时', 5: '巳时', 6: '午时', 7: '未时',
    8: '申时', 9: '酉时', 10: '戌时', 11: '亥时',
  };
  const shichenIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  return shichenMap[shichenIndex] || '未知';
}

function getWesternZodiac(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '白羊座';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '金牛座';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return '双子座';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return '巨蟹座';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '狮子座';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '处女座';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return '天秤座';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return '天蝎座';
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return '射手座';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '摩羯座';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '水瓶座';
  return '双鱼座';
}

function getPalaceByBranch(palaces: PalaceData[], branch: string): PalaceData | null {
  return palaces?.find(p => p.earthlyBranch === branch) || null;
}

// ─── Star Badge Component ───────────────────────────────────────────────────────

function StarBadge({ name, brightness, isMain }: {
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
      {brightness && brightness !== '庙' && (
        <span className="ml-0.5 text-[#B8925A] text-[10px]">{brightness}</span>
      )}
    </span>
  );
}

// ─── 宫格组件 ─────────────────────────────────────────────────────────────────

function PalaceCell({ palace, isCenter, astrolabe }: {
  palace: PalaceData | null;
  isCenter: boolean;
  astrolabe: RawAstrolabe | null;
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
          <p className="text-[#8B4513] text-[10px] tracking-[0.3em] mb-2 font-medium">紫微斗數</p>
          <p className="text-base md:text-lg mb-1 font-medium">{astrolabe?.gender === '男' ? '男命' : '女命'}</p>
          <p className="text-xs text-[#1A0F05]/60">{astrolabe?.lunarDate || ''}</p>
          <div className="mt-3 pt-3 border-t border-[#8B4513]/20">
            <p className="text-[#8B4513] text-[10px] tracking-wider">五行局</p>
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
                    flex flex-col min-h-[140px] md:min-h-[180px]`}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-[#B8925A] font-medium text-xs md:text-sm">{palace.name}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-0.5 bg-[#1A0F05]/5 px-1.5 py-0.5 rounded">
            <span className="text-[#1A0F05] text-[10px] font-medium">{palace.heavenlyStem}</span>
            <span className="text-[#B8925A] text-[10px]">{palace.earthlyBranch}</span>
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
          <span className="text-[#1A0F05]/20 text-[10px] italic">空宫</span>
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
            <span className="text-[#B8925A] text-[8px]">长生:</span>
            <span className="text-[#1A0F05]/60 text-[8px]">{palace.changsheng12}</span>
          </div>
        )}
        {palace.boshi12 && (
          <div className="flex items-center gap-1">
            <span className="text-[#B8925A] text-[8px]">博士:</span>
            <span className="text-[#1A0F05]/60 text-[8px]">{palace.boshi12}</span>
          </div>
        )}
        {palace.jiangqian12 && (
          <div className="flex items-center gap-1">
            <span className="text-[#B8925A] text-[8px]">将前:</span>
            <span className="text-[#1A0F05]/60 text-[8px]">{palace.jiangqian12}</span>
          </div>
        )}
        {palace.suiqian12 && (
          <div className="flex items-center gap-1">
            <span className="text-[#B8925A] text-[8px]">岁前:</span>
            <span className="text-[#1A0F05]/60 text-[8px]">{palace.suiqian12}</span>
          </div>
        )}
        {palace.ages && palace.ages.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[#8B0000] text-[8px]">小限:</span>
            <span className="text-[#1A0F05]/50 text-[7px]">{palace.ages.slice(0, 8).join(', ')}...</span>
          </div>
        )}
      </div>
    </div>
  );
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
