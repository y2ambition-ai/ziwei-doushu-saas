'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import MiniChart from '@/components/MiniChart';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawAstrolabe {
  palaces?: Array<{
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
  }>;
  chineseDate?: string;
  fiveElementsClass?: string;
  chineseZodiac?: string;
}

interface ReportData {
  id: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  longitude?: number;
  coreIdentity: string;
  aiReport: string;
  rawAstrolabe: RawAstrolabe | null;
  createdAt: string;
}

interface ReportContentProps {
  report: ReportData;
}

// ─── Spring Animation Config ───────────────────────────────────────────────────

const springConfig = { type: 'spring' as const, stiffness: 280, damping: 25 };
const gentleSpring = { type: 'spring' as const, stiffness: 180, damping: 30 };

// ─── Decorative Components ─────────────────────────────────────────────────────

function CloudPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 20c0-5.5 4.5-10 10-10 1.5 0 3 .3 4.3.9C26.5 6.5 31.5 4 37 4c8.3 0 15 6.7 15 15 0 .7-.1 1.4-.2 2h3.2c-.1-.7-.2-1.3-.2-2 0-5.5 4.5-10 10-10 2 0 3.9.6 5.5 1.6C72.5 6.8 77 4 82 4c7.2 0 13 5.8 13 13 0 1-.1 2-.3 3H10z"
        fill="currentColor"
        opacity="0.15"
      />
    </svg>
  );
}

function ElegantDivider({ variant = 'default' }: { variant?: 'default' | 'ornate' | 'minimal' }) {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center w-full my-6">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#B8925A]/40 to-transparent" />
      </div>
    );
  }

  if (variant === 'ornate') {
    return (
      <div className="flex items-center justify-center gap-3 w-full my-10">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8925A]/30 to-[#B8925A]/50" />
        <div className="flex items-center gap-2">
          <span className="text-[#B8925A]/30 text-xs">❋</span>
          <motion.span
            className="text-[#B8925A] text-xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            ☯
          </motion.span>
          <span className="text-[#B8925A]/30 text-xs">❋</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#B8925A]/30 to-[#B8925A]/50" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 w-full max-w-xs mx-auto my-8">
      <motion.div
        className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8925A]/40 to-[#B8925A]/60"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.span
        className="text-[#B8925A] text-lg opacity-70"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...springConfig, delay: 0.3 }}
      >
        ☯
      </motion.span>
      <motion.div
        className="flex-1 h-px bg-gradient-to-l from-transparent via-[#B8925A]/40 to-[#B8925A]/60"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

function CornerDecoration({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positionClasses = {
    tl: 'top-0 left-0 border-t-2 border-l-2',
    tr: 'top-0 right-0 border-t-2 border-r-2',
    bl: 'bottom-0 left-0 border-b-2 border-l-2',
    br: 'bottom-0 right-0 border-b-2 border-r-2',
  };

  return (
    <motion.div
      className={`absolute w-6 h-6 ${positionClasses[position]} border-[#B8925A]/25`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...springConfig, delay: 0.2 }}
    />
  );
}

function OrnamentalFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative p-8 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <CornerDecoration position="tl" />
      <CornerDecoration position="tr" />
      <CornerDecoration position="bl" />
      <CornerDecoration position="br" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Lucky Elements Card (Enhanced) ────────────────────────────────────────────

function LuckyElementsCard({ report }: { report: string }) {
  const parseLuckyColors = () => {
    const colorMatch = report.match(/幸运色[^|]*\|([^|]+)\|/);
    if (colorMatch) {
      const colors = colorMatch[1].split(/[、,，]/).map(c => c.trim()).filter(Boolean);
      return colors.slice(0, 3);
    }
    const altMatch = report.match(/\*\*幸运色[^*]*\*\*[：:]\s*([^\n]+)/);
    if (altMatch) {
      const colors = altMatch[1].split(/[、,，\s]/).map(c => c.trim()).filter(Boolean);
      return colors.slice(0, 3);
    }
    return ['紫色', '金色', '绿色'];
  };

  const parseLuckyNumbers = () => {
    const numMatch = report.match(/幸运数字[^|]*\|([^|]+)\|/);
    if (numMatch) {
      const nums = numMatch[1].match(/\d+/g);
      return nums?.slice(0, 3) || ['3', '8', '6'];
    }
    const altMatch = report.match(/\*\*幸运数字[^*]*\*\*[：:]\s*([^\n]+)/);
    if (altMatch) {
      const nums = altMatch[1].match(/\d+/g);
      return nums?.slice(0, 3) || ['3', '8', '6'];
    }
    return ['3', '8', '6'];
  };

  const parseLuckyDirections = () => {
    const dirMatch = report.match(/幸运方位[^|]*\|([^|]+)\|/);
    if (dirMatch) {
      return dirMatch[1].trim().split(/[、,，]/).slice(0, 2).join('、') || '正南、东南';
    }
    const altMatch = report.match(/\*\*幸运方位[^*]*\*\*[：:]\s*([^\n]+)/);
    if (altMatch) {
      return altMatch[1].trim().split(/[、,，]/).slice(0, 2).join('、') || '正南、东南';
    }
    return '正南、东南';
  };

  const colorMap: Record<string, { hex: string; gradient: string; shadow: string }> = {
    '紫色': { hex: '#8B5CF6', gradient: 'from-violet-400 via-purple-500 to-violet-600', shadow: 'shadow-violet-300/50' },
    '金色': { hex: '#F59E0B', gradient: 'from-amber-300 via-yellow-400 to-amber-500', shadow: 'shadow-amber-300/50' },
    '绿色': { hex: '#10B981', gradient: 'from-emerald-400 via-green-500 to-teal-500', shadow: 'shadow-emerald-300/50' },
    '红色': { hex: '#EF4444', gradient: 'from-rose-400 via-red-500 to-rose-600', shadow: 'shadow-rose-300/50' },
    '蓝色': { hex: '#3B82F6', gradient: 'from-blue-400 via-indigo-500 to-blue-600', shadow: 'shadow-blue-300/50' },
    '白色': { hex: '#F8FAFC', gradient: 'from-slate-100 via-white to-slate-200', shadow: 'shadow-slate-200/50' },
    '黑色': { hex: '#1F2937', gradient: 'from-gray-700 via-slate-800 to-gray-900', shadow: 'shadow-gray-400/30' },
    '黄色': { hex: '#FBBF24', gradient: 'from-yellow-300 via-amber-400 to-orange-400', shadow: 'shadow-yellow-300/50' },
    '粉色': { hex: '#EC4899', gradient: 'from-pink-300 via-rose-400 to-pink-500', shadow: 'shadow-pink-300/50' },
    '橙色': { hex: '#F97316', gradient: 'from-orange-300 via-amber-400 to-orange-500', shadow: 'shadow-orange-300/50' },
    '青色': { hex: '#06B6D4', gradient: 'from-cyan-400 via-teal-500 to-cyan-600', shadow: 'shadow-cyan-300/50' },
    '棕色': { hex: '#92400E', gradient: 'from-amber-600 via-yellow-700 to-amber-800', shadow: 'shadow-amber-400/40' },
    'Purple': { hex: '#8B5CF6', gradient: 'from-violet-400 via-purple-500 to-violet-600', shadow: 'shadow-violet-300/50' },
    'Gold': { hex: '#F59E0B', gradient: 'from-amber-300 via-yellow-400 to-amber-500', shadow: 'shadow-amber-300/50' },
    'Green': { hex: '#10B981', gradient: 'from-emerald-400 via-green-500 to-teal-500', shadow: 'shadow-emerald-300/50' },
    'Red': { hex: '#EF4444', gradient: 'from-rose-400 via-red-500 to-rose-600', shadow: 'shadow-rose-300/50' },
    'Blue': { hex: '#3B82F6', gradient: 'from-blue-400 via-indigo-500 to-blue-600', shadow: 'shadow-blue-300/50' },
  };

  const colors = parseLuckyColors();
  const numbers = parseLuckyNumbers();
  const directions = parseLuckyDirections();

  return (
    <motion.div
      className="mb-10 print:mb-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...gentleSpring, delay: 0.3 }}
    >
      {/* 标题 */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-[#B8925A]/5 via-[#B8925A]/10 to-[#B8925A]/5 rounded-full border border-[#B8925A]/20">
          <span className="text-[#B8925A]/60">✧</span>
          <span className="text-[#8B4513] text-xs tracking-[0.25em] font-medium">LUCKY ELEMENTS</span>
          <span className="text-[#B8925A]/60">✧</span>
        </div>
        <p className="text-[#1A0F05]/50 text-xs mt-2 tracking-wider">专属幸运元素</p>
      </motion.div>

      {/* 三栏卡片 */}
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {/* 幸运色 */}
        <motion.div
          className="group relative bg-gradient-to-br from-white via-[#FFFEF8] to-white rounded-2xl p-5 md:p-6 shadow-lg shadow-[#B8925A]/5 border border-[#B8925A]/10 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.5 }}
          whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(184, 146, 90, 0.15)' }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B8925A]/30 to-transparent" />
          <p className="text-[#8B4513]/60 text-[10px] md:text-xs tracking-[0.2em] mb-4 font-medium">幸运色</p>
          <div className="flex justify-center gap-3 mb-4">
            {colors.map((color, i) => {
              const colorInfo = colorMap[color] || colorMap['紫色'];
              return (
                <motion.div
                  key={i}
                  className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${colorInfo.gradient} ${colorInfo.shadow} shadow-lg`}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...springConfig, delay: 0.6 + i * 0.12 }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  title={color}
                >
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
                </motion.div>
              );
            })}
          </div>
          <p className="text-[#1A0F05]/70 text-[10px] md:text-xs font-medium tracking-wide">{colors.join(' · ')}</p>
        </motion.div>

        {/* 幸运数字 */}
        <motion.div
          className="group relative bg-gradient-to-br from-white via-[#FFFEF8] to-white rounded-2xl p-5 md:p-6 shadow-lg shadow-[#B8925A]/5 border border-[#B8925A]/10 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.6 }}
          whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(184, 146, 90, 0.15)' }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B8925A]/30 to-transparent" />
          <p className="text-[#8B4513]/60 text-[10px] md:text-xs tracking-[0.2em] mb-4 font-medium">幸运数字</p>
          <div className="flex justify-center gap-3 mb-4">
            {numbers.map((num, i) => (
              <motion.div
                key={i}
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#B8925A] via-[#A67B3C] to-[#8B4513] flex items-center justify-center shadow-lg shadow-[#B8925A]/30"
                initial={{ scale: 0, rotate: 15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springConfig, delay: 0.7 + i * 0.12 }}
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <div className="absolute inset-0.5 rounded-[7px] bg-gradient-to-br from-white/20 to-transparent" />
                <span className="relative text-white text-sm md:text-lg font-bold tracking-tight">{num}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-[#1A0F05]/70 text-[10px] md:text-xs font-medium tracking-wide">{numbers.join(' · ')}</p>
        </motion.div>

        {/* 幸运方位 */}
        <motion.div
          className="group relative bg-gradient-to-br from-white via-[#FFFEF8] to-white rounded-2xl p-5 md:p-6 shadow-lg shadow-[#B8925A]/5 border border-[#B8925A]/10 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.7 }}
          whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(184, 146, 90, 0.15)' }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B8925A]/30 to-transparent" />
          <p className="text-[#8B4513]/60 text-[10px] md:text-xs tracking-[0.2em] mb-4 font-medium">幸运方位</p>
          <div className="flex justify-center mb-4">
            <motion.div
              className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#B8925A]/15 via-[#8B4513]/10 to-[#B8925A]/15 flex items-center justify-center border-2 border-[#B8925A]/25 shadow-inner"
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ ...gentleSpring, delay: 0.8 }}
              whileHover={{ rotate: 15 }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
              <svg className="relative w-6 h-6 md:w-7 md:h-7 text-[#8B4513]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </motion.div>
          </div>
          <p className="text-[#1A0F05]/70 text-[10px] md:text-xs font-medium tracking-wide">{directions}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getShichenName(hour: number): string {
  const shichenMap: Record<number, string> = {
    0: '子时 (23:00-01:00)',
    1: '丑时 (01:00-03:00)',
    2: '寅时 (03:00-05:00)',
    3: '卯时 (05:00-07:00)',
    4: '辰时 (07:00-09:00)',
    5: '巳时 (09:00-11:00)',
    6: '午时 (11:00-13:00)',
    7: '未时 (13:00-15:00)',
    8: '申时 (15:00-17:00)',
    9: '酉时 (17:00-19:00)',
    10: '戌时 (19:00-21:00)',
    11: '亥时 (21:00-23:00)',
  };
  const shichenIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  return shichenMap[shichenIndex] || '未知时辰';
}

function renderMarkdown(text: string) {
  // 检测并提取幸运元素部分，单独渲染
  const luckyMatch = text.match(/##?\s*(?:\d\.\s*)?幸运元素[\s\S]*?(?=##?\s*(?:\d\.\s*)?(?:核心身份|命盘全览|当前大限|事业前程|财富运势|情感姻缘|流年|大师建议)|$)/i);

  // 移除报告末尾的字数统计
  let cleanedText = text.replace(/（报告全文共\s*\d+\s*字）\s*$/g, '');
  cleanedText = cleanedText.replace(/\(全文共\s*\d+\s*字\)\s*$/g, '');
  cleanedText = cleanedText.replace(/共\s*\d+\s*字\s*$/g, '');

  return cleanedText.split('\n').map((line, i) => {
    // 跳过幸运元素部分（已单独渲染）
    if (luckyMatch && line.includes('幸运元素')) {
      return null;
    }
    if (luckyMatch && i >= text.indexOf(luckyMatch[0]) && i < text.indexOf(luckyMatch[0]) + luckyMatch[0].length) {
      return null;
    }

    if (line.startsWith('# ')) {
      return (
        <motion.h1
          key={i}
          className="text-xl font-medium text-[#1A0F05] mt-12 mb-6 pb-3 border-b border-[#B8925A]/15 print:mt-6 print:text-base print-section flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.01 }}
        >
          <span className="text-[#B8925A]/50 text-sm">◆</span>
          <span>{line.slice(2)}</span>
        </motion.h1>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <motion.h2
          key={i}
          className="text-lg font-medium text-[#1A0F05] mt-10 mb-5 print:mt-4 print:text-sm print-section flex items-center gap-3"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.01 }}
        >
          <span className="flex items-center justify-center w-6 h-6 rounded bg-[#B8925A]/10 text-[#B8925A] text-xs">✦</span>
          <span>{line.slice(3)}</span>
        </motion.h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <motion.h3
          key={i}
          className="text-base font-medium text-[#1A0F05] mt-8 mb-4 print:mt-3 print:text-xs flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.01 }}
        >
          <span className="text-[#B8925A]/60">—</span>
          <span>{line.slice(4)}</span>
        </motion.h3>
      );
    }
    if (line.startsWith('- **') && line.includes('**:')) {
      const match = line.match(/- \*\*(.+?)\*\*:\s*(.+)/);
      if (match) {
        return (
          <motion.li
            key={i}
            className="ml-2 text-sm leading-[1.9] mb-2.5 print:text-xs flex items-start gap-3"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.01 }}
          >
            <span className="text-[#B8925A] mt-2 text-xs">●</span>
            <span><strong className="text-[#8B4513] font-medium">{match[1]}</strong><span className="text-[#1A0F05]/50">:</span> <span className="text-[#1A0F05]/75">{match[2]}</span></span>
          </motion.li>
        );
      }
    }
    if (line.startsWith('- ')) {
      return (
        <motion.li
          key={i}
          className="ml-2 text-sm leading-[1.9] print:text-xs flex items-start gap-3"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.01 }}
        >
          <span className="text-[#B8925A]/50 mt-2 text-xs">○</span>
          <span className="text-[#1A0F05]/75">{line.slice(2)}</span>
        </motion.li>
      );
    }
    if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').filter(Boolean);
      const colCount = cells.length;
      const isHeader = i > 0 && !text.split('\n')[i-1]?.includes('---');
      const gridCols = colCount <= 2 ? 'grid-cols-2' : colCount <= 4 ? 'grid-cols-4' : 'grid-cols-6';
      return (
        <div key={i} className={`${gridCols} gap-3 py-2.5 px-3 text-sm ${isHeader ? 'bg-[#B8925A]/8 font-medium text-[#8B4513]' : 'border-b border-[#B8925A]/8 text-[#1A0F05]/75'} print:text-xs print-section`}>
          {cells.map((cell, j) => (
            <span key={j} className="text-center">{cell.trim()}</span>
          ))}
        </div>
      );
    }
    if (line.includes('---') && !line.startsWith('|')) {
      return <ElegantDivider key={i} variant="minimal" />;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} className="text-sm font-medium text-[#8B4513] my-4 print:text-xs tracking-wide">
          {line.slice(2, -2)}
        </p>
      );
    }
    if (line.trim()) {
      return (
        <motion.p
          key={i}
          className="text-sm leading-[1.9] mb-4 text-[#1A0F05]/75 print:text-xs print:mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.005 }}
        >
          {line}
        </motion.p>
      );
    }
    return null;
  }).filter(Boolean);
}

// ─── Loading Animation (Enhanced) ─────────────────────────────────────────────

function LoadingAnimation() {
  const [countdown, setCountdown] = useState(300);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
      setProgress((prev) => Math.min(100, prev + 0.33));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="text-center py-20">
      <motion.div
        className="relative inline-flex items-center justify-center mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute w-24 h-24 rounded-full border border-[#B8925A]/20" />
        <div className="absolute w-20 h-20 rounded-full border border-[#B8925A]/30" />
        <div className="absolute w-16 h-16 rounded-full border border-[#B8925A]/40" />
        <span className="relative text-4xl text-[#B8925A]">☯</span>
      </motion.div>

      <motion.p
        className="text-[#B8925A] tracking-[0.3em] text-sm mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        AI 命理师正在解读
      </motion.p>

      <p className="text-[#1A0F05]/40 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
        正在结合您的命盘数据与千年道家智慧，生成专属解读报告...
      </p>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-[#B8925A]/10 rounded-full mx-auto mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#B8925A] to-[#8B4513] rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[#8B4513] text-sm font-medium mb-8">
        预计剩余时间：{minutes}:{seconds.toString().padStart(2, '0')}
      </p>

      <div className="max-w-sm mx-auto p-5 bg-gradient-to-br from-[#B8925A]/5 to-transparent border border-[#B8925A]/15 rounded-xl">
        <p className="text-[#1A0F05]/60 text-xs leading-relaxed">
          <span className="text-[#B8925A] mr-1">💡</span>
          <strong className="text-[#8B4513]">温馨提示：</strong>
          使用相同邮箱和出生信息再次进入，<span className="text-[#B8925A] font-medium">7天内免费查看</span>，不会重复生成报告。
        </p>
      </div>
    </div>
  );
}

function WaitingAnimation({ retryAfter }: { retryAfter: number }) {
  const minutes = Math.floor(retryAfter / 60);
  const seconds = retryAfter % 60;

  return (
    <div className="text-center py-20">
      <motion.div
        className="relative inline-flex items-center justify-center mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute w-20 h-20 rounded-full border border-[#B8925A]/15" />
        <span className="relative text-4xl text-[#B8925A]/80">☯</span>
      </motion.div>

      <p className="text-[#B8925A] tracking-[0.3em] text-sm mb-3">报告正在生成中</p>
      <p className="text-[#1A0F05]/40 text-xs mb-6">请耐心等待，系统会自动完成...</p>

      <p className="text-[#8B4513] text-sm font-medium mb-8">
        自动刷新倒计时：{minutes}:{seconds.toString().padStart(2, '0')}
      </p>

      <div className="max-w-sm mx-auto p-5 bg-gradient-to-br from-[#B8925A]/5 to-transparent border border-[#B8925A]/15 rounded-xl">
        <p className="text-[#1A0F05]/60 text-xs leading-relaxed">
          <span className="text-[#B8925A] mr-1">💡</span>
          <strong className="text-[#8B4513]">温馨提示：</strong>
          使用相同邮箱和出生信息再次进入，<span className="text-[#B8925A] font-medium">7天内免费查看</span>。
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportContent({ report }: ReportContentProps) {
  const [aiReport, setAiReport] = useState(report.aiReport);
  const [coreIdentity, setCoreIdentity] = useState(report.coreIdentity);
  const [loading, setLoading] = useState(!report.aiReport || report.aiReport.length < 100);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (!report.aiReport || report.aiReport.length < 100) {
      generateAIReport();
    }
  }, [report.id]);

  useEffect(() => {
    if (retryAfter > 0) {
      const timer = setTimeout(() => {
        setRetryAfter(retryAfter - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (generating && retryAfter === 0) {
      generateAIReport();
    }
  }, [retryAfter, generating]);

  const generateAIReport = async () => {
    setLoading(true);
    setError(null);
    setGenerating(false);

    try {
      const response = await fetch('/api/report/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id }),
      });

      const data = await response.json();

      if (data.status === 'generating') {
        setGenerating(true);
        setRetryAfter(data.retryAfter || 60);
        setLoading(false);
        return;
      }

      if (data.status === 'failed') {
        setError(data.error || '报告生成失败');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'AI报告生成失败');
      }

      setAiReport(data.report);
      setCoreIdentity(data.coreIdentity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI报告生成失败');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || generating;

  return (
    <div className="min-h-screen bg-[#F7F3EC] relative">
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8925A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#B8925A]/10 py-4 px-8 print:hidden bg-[#F7F3EC]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
            <motion.span
              className="text-[#B8925A] text-xl"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              ☯
            </motion.span>
            <span className="text-[#1A0F05] tracking-[0.2em] text-sm font-serif">
              天命玄机
            </span>
          </Link>
          <span className="text-[#1A0F05]/35 text-[10px] tracking-wide">
            {new Date(report.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-10 px-4 md:py-16 md:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...gentleSpring }}
        >
          {/* Title Section */}
          <OrnamentalFrame className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <CloudPattern className="w-12 h-4 text-[#B8925A]" />
                <span className="text-[#B8925A] text-xs tracking-[0.4em] font-medium">紫微斗数命理报告</span>
                <CloudPattern className="w-12 h-4 text-[#B8925A] transform scale-x-[-1]" />
              </div>
              <h1 className="text-[#1A0F05] text-2xl md:text-3xl font-light tracking-wide mb-3">
                {report.gender === 'male' ? '男命' : '女命'} · {report.birthDate}
              </h1>
              <p className="text-[#1A0F05]/50 text-sm tracking-wide">
                {getShichenName(report.birthTime)} · {report.birthCity}
              </p>
            </motion.div>
          </OrnamentalFrame>

          {/* Chart Display */}
          {report.rawAstrolabe && (
            <motion.div
              className="mb-10 print-chart-container print:mb-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...gentleSpring, delay: 0.1 }}
            >
              <MiniChart
                palaces={report.rawAstrolabe.palaces}
                chineseDate={report.rawAstrolabe.chineseDate}
                fiveElementsClass={report.rawAstrolabe.fiveElementsClass}
                chineseZodiac={report.rawAstrolabe.chineseZodiac}
              />
            </motion.div>
          )}

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                className="border border-[#B8925A]/15 p-8 md:p-12 bg-white/30 backdrop-blur-sm rounded-2xl print:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {generating ? (
                  <WaitingAnimation retryAfter={retryAfter} />
                ) : (
                  <LoadingAnimation />
                )}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                className="border border-red-200 bg-red-50/80 p-8 text-center rounded-2xl print:hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={generateAIReport}
                  className="text-xs tracking-widest px-8 py-3 border border-[#B8925A] text-[#B8925A]
                             hover:bg-[#B8925A] hover:text-[#F7F3EC] transition-all duration-300 rounded-lg"
                >
                  重试
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Core Identity Card */}
                <motion.div
                  className="mb-10 relative overflow-hidden rounded-2xl print-identity-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: 0.2 }}
                >
                  {/* Background layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A0F05] via-[#2D1F12] to-[#1A0F05]" />
                  <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8925A' fill-opacity='0.5'%3E%3Cpath d='M40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm-40 0c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />

                  <div className="relative p-8 md:p-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <motion.span
                        className="text-[#B8925A]/50 text-sm"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ✧
                      </motion.span>
                      <p className="text-[#B8925A] text-xs tracking-[0.35em] font-medium">CORE IDENTITY</p>
                      <motion.span
                        className="text-[#B8925A]/50 text-sm"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        ✧
                      </motion.span>
                    </div>
                    <p className="text-[#F7F3EC]/90 text-base md:text-lg leading-[1.8] tracking-wide max-w-2xl mx-auto">
                      {coreIdentity}
                    </p>
                  </div>

                  {/* Bottom gradient line */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8925A]/60 to-transparent" />
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-[#B8925A]/30 to-transparent" />
                </motion.div>

                {/* Lucky Elements */}
                <LuckyElementsCard report={aiReport} />

                {/* Ornate Divider */}
                <ElegantDivider variant="ornate" />

                {/* Report Content */}
                <motion.div
                  className="border border-[#B8925A]/10 p-8 md:p-12 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-[#B8925A]/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...gentleSpring, delay: 0.5 }}
                >
                  <div className="prose prose-sm max-w-none print:prose-base">
                    {renderMarkdown(aiReport)}
                  </div>
                </motion.div>

                {/* Final Divider */}
                <ElegantDivider variant="ornate" />

                {/* Closing Quote */}
                <motion.div
                  className="text-center mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="inline-block px-8 py-4 bg-gradient-to-br from-[#B8925A]/5 to-transparent rounded-xl border border-[#B8925A]/10">
                    <p className="text-[#8B4513] text-sm tracking-wide leading-relaxed">
                      "命由己造，相由心生。<br />
                      <span className="text-[#8B4513]/70">知命者不怨天，知己者不怨人。"</span>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 print:hidden">
            <Link
              href="/"
              className="group flex items-center gap-2 text-xs tracking-widest px-8 py-3.5 border border-[#B8925A]/40 text-[#B8925A]
                         hover:bg-[#B8925A] hover:text-[#F7F3EC] hover:border-[#B8925A] transition-all duration-300 rounded-lg"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>重新推算</span>
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs tracking-widest px-8 py-3.5 bg-gradient-to-r from-[#8B4513] via-[#A67B3C] to-[#8B4513] text-[#F7F3EC]
                         hover:shadow-lg hover:shadow-[#B8925A]/20 transition-all duration-300 rounded-lg"
            >
              <span>📄</span>
              <span>打印报告 / 保存PDF</span>
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 pt-8 border-t border-[#B8925A]/8">
            <p className="text-center text-[#1A0F05]/25 text-[10px] leading-relaxed tracking-wide max-w-lg mx-auto">
              本报告基于紫微斗数命理分析，仅供参考。本网站不保留任何个人信息，数据仅储存7天后自动删除。
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#B8925A]/10 py-8 px-8 bg-[#F0EBE1]/80 print:hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-[#B8925A]/50 text-xs">✧</span>
            <span className="text-[#1A0F05]/30 text-xs tracking-[0.2em]">天命玄机</span>
            <span className="text-[#B8925A]/50 text-xs">✧</span>
          </div>
          <p className="text-[#1A0F05]/20 text-[10px] tracking-wider">
            © 2025 Taoist Metaphysics
          </p>
        </div>
      </footer>
    </div>
  );
}
