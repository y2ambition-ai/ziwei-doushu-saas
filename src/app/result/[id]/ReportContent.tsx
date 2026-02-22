'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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

// ─── Helper Components ─────────────────────────────────────────────────────────

function SectionDivider({ symbol = '☯' }: { symbol?: string }) {
  return (
    <div className="flex items-center gap-4 w-full max-w-xs mx-auto my-8">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8925A]/30 to-[#B8925A]/50" />
      <span className="text-[#B8925A] text-lg opacity-60">{symbol}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#B8925A]/30 to-[#B8925A]/50" />
    </div>
  );
}

function OrnamentalBorder({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#B8925A]/30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#B8925A]/30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#B8925A]/30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#B8925A]/30" />
      {children}
    </div>
  );
}

function LuckyElementsCard({ report }: { report: string }) {
  // 解析幸运元素
  const parseLuckyColors = () => {
    const colorMatch = report.match(/幸运色[^|]*\|([^|]+)\|/);
    if (colorMatch) {
      const colors = colorMatch[1].split(/[、,，]/).map(c => c.trim()).filter(Boolean);
      return colors.slice(0, 3);
    }
    // 备用匹配
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

  const colorMap: Record<string, string> = {
    '紫色': '#8B5CF6', '金色': '#F59E0B', '绿色': '#10B981', '红色': '#EF4444',
    '蓝色': '#3B82F6', '白色': '#F3F4F6', '黑色': '#1F2937', '黄色': '#FBBF24',
    '粉色': '#EC4899', '橙色': '#F97316', '青色': '#06B6D4', '棕色': '#92400E',
    'Purple': '#8B5CF6', 'Gold': '#F59E0B', 'Green': '#10B981', 'Red': '#EF4444',
    'Blue': '#3B82F6', 'White': '#F3F4F6', 'Black': '#1F2937', 'Yellow': '#FBBF24',
  };

  const colors = parseLuckyColors();
  const numbers = parseLuckyNumbers();
  const directions = parseLuckyDirections();

  return (
    <motion.div
      className="bg-gradient-to-br from-[#1A0F05] via-[#2D1F12] to-[#1A0F05] p-6 md:p-8 mb-8 print:mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="text-center mb-6">
        <p className="text-[#B8925A] text-xs tracking-[0.3em] mb-2">✦ LUCKY ELEMENTS ✦</p>
        <p className="text-[#F7F3EC]/80 text-sm">您的专属幸运元素</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 幸运色 */}
        <div className="text-center">
          <p className="text-[#B8925A]/60 text-xs tracking-wider mb-3">幸运色 LUCKY COLORS</p>
          <div className="flex justify-center gap-3 mb-2">
            {colors.map((color, i) => (
              <motion.div
                key={i}
                className="w-12 h-12 rounded-full shadow-lg border-2 border-[#F7F3EC]/20"
                style={{ backgroundColor: colorMap[color] || colorMap['Purple'] }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
              />
            ))}
          </div>
          <p className="text-[#F7F3EC]/70 text-xs">{colors.join(' · ')}</p>
        </div>

        {/* 幸运数字 */}
        <div className="text-center">
          <p className="text-[#B8925A]/60 text-xs tracking-wider mb-3">幸运数字 LUCKY NUMBERS</p>
          <div className="flex justify-center gap-3 mb-2">
            {numbers.map((num, i) => (
              <motion.div
                key={i}
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#B8925A] to-[#8B4513] flex items-center justify-center shadow-lg"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
              >
                <span className="text-[#F7F3EC] text-xl font-bold">{num}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-[#F7F3EC]/70 text-xs">{numbers.join(' · ')}</p>
        </div>

        {/* 幸运方位 */}
        <div className="text-center">
          <p className="text-[#B8925A]/60 text-xs tracking-wider mb-3">幸运方位 LUCKY DIRECTIONS</p>
          <div className="flex justify-center items-center mb-2">
            <motion.div
              className="w-16 h-16 rounded-full border-2 border-[#B8925A]/50 flex items-center justify-center relative"
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <span className="text-[#F7F3EC] text-lg">🧭</span>
              {/* 方位指针 */}
              <div className="absolute -top-1 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-[#B8925A]" />
            </motion.div>
          </div>
          <p className="text-[#F7F3EC]/70 text-xs">{directions}</p>
        </div>
      </div>
    </motion.div>
  );
}

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
        <h1 key={i} className="text-xl font-medium text-[#1A0F05] mt-10 mb-5 pb-2 border-b border-[#B8925A]/20 print:mt-6 print:text-base print-section flex items-center gap-3">
          <span className="text-[#B8925A]/40">◆</span>
          {line.slice(2)}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="text-lg font-medium text-[#1A0F05] mt-8 mb-4 print:mt-4 print:text-sm print-section flex items-center gap-2">
          <span className="text-[#B8925A] text-sm">✦</span>
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={i} className="text-base font-medium text-[#1A0F05] mt-6 mb-3 print:mt-3 print:text-xs flex items-center gap-2">
          <span className="text-[#B8925A]/60">·</span>
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith('- **') && line.includes('**:')) {
      const match = line.match(/- \*\*(.+?)\*\*:\s*(.+)/);
      if (match) {
        return (
          <li key={i} className="ml-4 text-sm leading-relaxed mb-2 print:text-xs flex items-start gap-2">
            <span className="text-[#B8925A] mt-1">•</span>
            <span><strong className="text-[#8B4513]">{match[1]}</strong>: {match[2]}</span>
          </li>
        );
      }
    }
    if (line.startsWith('- ')) {
      return (
        <li key={i} className="ml-4 text-sm leading-relaxed print:text-xs flex items-start gap-2">
          <span className="text-[#B8925A]/60 mt-1">◦</span>
          <span>{line.slice(2)}</span>
        </li>
      );
    }
    if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').filter(Boolean);
      const colCount = cells.length;
      const isHeader = i > 0 && !text.split('\n')[i-1]?.includes('---');
      const gridCols = colCount <= 2 ? 'grid-cols-2' : colCount <= 4 ? 'grid-cols-4' : 'grid-cols-6';
      return (
        <div key={i} className={`${gridCols} gap-2 py-2 px-2 text-sm ${isHeader ? 'bg-[#B8925A]/5 font-medium' : 'border-b border-[#B8925A]/10'} print:text-xs print-section`}>
          {cells.map((cell, j) => (
            <span key={j} className="text-center text-[#1A0F05]/80">{cell.trim()}</span>
          ))}
        </div>
      );
    }
    if (line.includes('---') && !line.startsWith('|')) {
      return <SectionDivider key={i} />;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} className="text-sm font-medium text-[#8B4513] my-3 print:text-xs">
          {line.slice(2, -2)}
        </p>
      );
    }
    if (line.trim()) {
      return (
        <p key={i} className="text-sm leading-relaxed mb-3 text-[#1A0F05]/80 print:text-xs print:mb-2">
          {line}
        </p>
      );
    }
    return null;
  }).filter(Boolean);
}

// ─── Loading Animation ─────────────────────────────────────────────────────────

function LoadingAnimation() {
  const [countdown, setCountdown] = useState(300);  // 5分钟倒计时

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="text-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="inline-block text-4xl text-[#B8925A] mb-6"
      >
        ☯
      </motion.div>
      <p className="text-[#B8925A] tracking-widest text-sm mb-2">AI 命理师正在解读</p>
      <p className="text-[#1A0F05]/40 text-xs mb-4">正在结合您的命盘数据生成专属解读报告...</p>
      <p className="text-[#8B4513] text-sm font-medium mb-6">
        预计剩余时间：{minutes}:{seconds.toString().padStart(2, '0')}
      </p>

      {/* 免费复用提示 */}
      <div className="mt-6 p-4 bg-[#B8925A]/5 border border-[#B8925A]/20 max-w-md mx-auto">
        <p className="text-[#1A0F05]/60 text-xs leading-relaxed">
          💡 <strong>温馨提示：</strong>使用相同邮箱和出生信息再次进入，<span className="text-[#B8925A]">7天内免费查看</span>，不会重复调用AI生成报告。
        </p>
      </div>
    </div>
  );
}

// ─── Waiting Animation (for retry cooldown) ─────────────────────────────────────

function WaitingAnimation({ retryAfter }: { retryAfter: number }) {
  const minutes = Math.floor(retryAfter / 60);
  const seconds = retryAfter % 60;

  return (
    <div className="text-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="inline-block text-4xl text-[#B8925A] mb-6"
      >
        ☯
      </motion.div>
      <p className="text-[#B8925A] tracking-widest text-sm mb-2">报告正在生成中</p>
      <p className="text-[#1A0F05]/40 text-xs mb-4">请耐心等待，系统会自动完成...</p>
      <p className="text-[#8B4513] text-sm font-medium mb-6">
        自动刷新倒计时：{minutes}:{seconds.toString().padStart(2, '0')}
      </p>

      {/* 免费复用提示 */}
      <div className="mt-6 p-4 bg-[#B8925A]/5 border border-[#B8925A]/20 max-w-md mx-auto">
        <p className="text-[#1A0F05]/60 text-xs leading-relaxed">
          💡 <strong>温馨提示：</strong>使用相同邮箱和出生信息再次进入，<span className="text-[#B8925A]">7天内免费查看</span>，不会重复调用AI生成报告。
        </p>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ReportContent({ report }: ReportContentProps) {
  const [aiReport, setAiReport] = useState(report.aiReport);
  const [coreIdentity, setCoreIdentity] = useState(report.coreIdentity);
  const [loading, setLoading] = useState(!report.aiReport || report.aiReport.length < 100);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  // 如果没有AI报告，自动请求生成
  useEffect(() => {
    if (!report.aiReport || report.aiReport.length < 100) {
      generateAIReport();
    }
  }, [report.id]);

  // 倒计时结束后重试
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

      // 处理"正在生成"状态（10分钟内已调用过API）
      if (data.status === 'generating') {
        setGenerating(true);
        setRetryAfter(data.retryAfter || 60);
        setLoading(false);
        return;
      }

      // 处理失败状态
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

  // 判断是否显示加载状态
  const isLoading = loading || generating;

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      {/* Header */}
      <header className="border-b border-[#B8925A]/15 py-6 px-8 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
            <span className="text-[#B8925A] text-lg">☯</span>
            <span className="text-[#1A0F05] tracking-[0.2em] text-sm font-serif">
              天命玄机
            </span>
          </Link>
          <span className="text-[#1A0F05]/40 text-xs">
            报告生成时间: {new Date(report.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 px-4 md:py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title Section with decorative border */}
          <OrnamentalBorder className="mb-8 p-6 md:p-8 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-[#B8925A] tracking-[0.4em] text-xs mb-4 uppercase">
                ✦ 紫微斗数命理报告 ✦
              </p>
              <h1 className="text-[#1A0F05] text-2xl md:text-3xl font-light tracking-wide mb-3">
                {report.gender === 'male' ? '男命' : '女命'} · {report.birthDate}
              </h1>
              <p className="text-[#1A0F05]/60 text-sm">
                {getShichenName(report.birthTime)} · {report.birthCity}
              </p>
            </motion.div>
          </OrnamentalBorder>

          {/* 命盘显示 - 打印时单独一页 */}
          {report.rawAstrolabe && (
            <motion.div
              className="mb-8 print-chart-container print:mb-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
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
          {isLoading ? (
            <motion.div
              className="border border-[#B8925A]/20 p-8 md:p-12 print:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {generating ? (
                <WaitingAnimation retryAfter={retryAfter} />
              ) : (
                <LoadingAnimation />
              )}
            </motion.div>
          ) : error ? (
            <motion.div
              className="border border-red-300 bg-red-50 p-8 text-center print:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={generateAIReport}
                className="text-xs tracking-widest px-6 py-3 border border-[#B8925A] text-[#B8925A]
                           hover:bg-[#B8925A] hover:text-[#F7F3EC] transition-all duration-300"
              >
                重试
              </button>
            </motion.div>
          ) : (
            <>
              {/* Core Identity Card - 精致设计 */}
              <motion.div
                className="mb-8 relative overflow-hidden print-identity-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A0F05] via-[#2D1F12] to-[#1A0F05]" />
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8925A' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                <div className="relative p-6 md:p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-[#B8925A]/40">✦</span>
                    <p className="text-[#B8925A] text-xs tracking-[0.3em]">核心身份 · CORE IDENTITY</p>
                    <span className="text-[#B8925A]/40">✦</span>
                  </div>
                  <p className="text-[#F7F3EC] text-base leading-relaxed">{coreIdentity}</p>
                </div>

                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8925A]/50 to-transparent" />
              </motion.div>

              {/* 幸运元素卡片 */}
              <LuckyElementsCard report={aiReport} />

              {/* Section Divider */}
              <SectionDivider />

              {/* Report Content */}
              <motion.div
                className="border border-[#B8925A]/15 p-6 md:p-10 bg-white/50 shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="prose prose-sm max-w-none print:prose-base">
                  {renderMarkdown(aiReport)}
                </div>
              </motion.div>

              {/* Final Divider */}
              <SectionDivider symbol="☯" />

              {/* Closing Statement */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-[#8B4513] text-sm italic">
                  "命由己造，相由心生。知命者不怨天，知己者不怨人。"
                </p>
              </motion.div>
            </>
          )}

          {/* Actions - 打印时隐藏 */}
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6 print:hidden">
            <Link
              href="/"
              className="text-xs tracking-widest px-8 py-3 border border-[#B8925A] text-[#B8925A]
                         hover:bg-[#B8925A] hover:text-[#F7F3EC] transition-all duration-300"
            >
              重新推算
            </Link>
            <button
              onClick={() => window.print()}
              className="text-xs tracking-widest px-8 py-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-[#F7F3EC]
                         hover:from-[#A0522D] hover:to-[#8B4513] transition-all duration-300 shadow-md"
            >
              📄 打印报告 / 保存PDF
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 pt-8 border-t border-[#B8925A]/10">
            <p className="text-center text-[#1A0F05]/30 text-xs leading-relaxed tracking-wide">
              本报告基于紫微斗数命理分析，仅供参考。本网站不保留任何个人信息，数据仅储存7天后自动删除。
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#B8925A]/15 py-8 px-8 bg-[#F0EBE1] print:hidden">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#1A0F05]/30 text-xs tracking-wider">
            © 2025 天命玄机 · Taoist Metaphysics
          </p>
        </div>
      </footer>
    </div>
  );
}
