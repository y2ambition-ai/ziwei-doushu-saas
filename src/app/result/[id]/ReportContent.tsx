'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import FullChart from '@/components/FullChart';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocalizedPath } from '@/lib/i18n/routes';

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
  isPaid?: boolean;
  paymentEnabled?: boolean;
}

interface ReportContentProps {
  locale: Locale;
  report: ReportData;
}

const pendingInitialGenerations = new Set<string>();

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
  // 移除报告末尾的字数统计
  let cleanedText = text.replace(/（报告全文共\s*\d+\s*字）\s*$/g, '');
  cleanedText = cleanedText.replace(/\(全文共\s*\d+\s*字\)\s*$/g, '');
  cleanedText = cleanedText.replace(/共\s*\d+\s*字\s*$/g, '');

  return cleanedText.split('\n').map((line, i) => {

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

function LoadingAnimation({ locale, title, body, hint }: { locale: Locale; title: string; body: string; hint: string }) {
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
        {title}
      </motion.p>

      <p className="text-[#1A0F05]/40 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
        {body}
      </p>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-[#B8925A]/10 rounded-full mx-auto mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#B8925A] to-[#8B4513] rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[#8B4513] text-sm font-medium mb-8">
        {locale === 'zh' ? '预计剩余时间：' : 'Estimated time remaining:'} {minutes}:{seconds.toString().padStart(2, '0')}
      </p>

      <div className="max-w-sm mx-auto p-5 bg-gradient-to-br from-[#B8925A]/5 to-transparent border border-[#B8925A]/15 rounded-xl">
        <p className="text-[#1A0F05]/60 text-xs leading-relaxed">
          <span className="text-[#B8925A] mr-1">💡</span>
          <strong className="text-[#8B4513]">{locale === 'zh' ? '温馨提示：' : 'Hint:'}</strong>
          {hint}
        </p>
      </div>
    </div>
  );
}

function WaitingAnimation({ locale, retryAfter, title, body, retryLabel }: { locale: Locale; retryAfter: number; title: string; body: string; retryLabel: string }) {
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

      <p className="text-[#B8925A] tracking-[0.3em] text-sm mb-3">{title}</p>
      <p className="text-[#1A0F05]/40 text-xs mb-6">{body}</p>

      <p className="text-[#8B4513] text-sm font-medium mb-8">
        {retryLabel}: {minutes}:{seconds.toString().padStart(2, '0')}
      </p>

      <div className="max-w-sm mx-auto p-5 bg-gradient-to-br from-[#B8925A]/5 to-transparent border border-[#B8925A]/15 rounded-xl">
        <p className="text-[#1A0F05]/60 text-xs leading-relaxed">
          <span className="text-[#B8925A] mr-1">💡</span>
          <strong className="text-[#8B4513]">{locale === 'zh' ? '温馨提示：' : 'Hint:'}</strong>
          {locale === 'zh'
            ? '使用相同邮箱和出生信息再次进入，可在 7 天内继续查看。'
            : 'Use the same email and birth details to revisit within 7 days.'}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportContent({ locale, report }: ReportContentProps) {
  const dictionary = getDictionary(locale).result;
  const chartDictionary = getDictionary(locale).chart;
  const [aiReport, setAiReport] = useState(report.aiReport);

  // 动态计算 coreIdentity（如果存储的是旧错误数据）
  const computeCoreIdentity = () => {
    // 检查存储的 coreIdentity 是否有效
    if (report.coreIdentity && !report.coreIdentity.includes('，，') && !report.coreIdentity.includes('年月日')) {
      return report.coreIdentity;
    }

    // 从 rawAstrolabe 重新计算
    const astrolabe = report.rawAstrolabe;
    if (!astrolabe) return report.coreIdentity;

    const mingGong = astrolabe.palaces?.find(p => p.name === '命宫');
    const majorStars = mingGong?.majorStars?.map(s => s.name).join('·') || '空宫';

    // 解析四柱
    const chineseDate = astrolabe.chineseDate || '';
    const siZhuParts = chineseDate.split(' ');
    const siZhu = siZhuParts.length === 4
      ? `${siZhuParts[0]}年${siZhuParts[1]}月${siZhuParts[2]}日${siZhuParts[3]}时`
      : '';

    if (locale === 'zh') {
      return `命宫${majorStars}坐守，${astrolabe.fiveElementsClass || ''}，四柱${siZhu}生。`;
    }

    return `Life palace stars: ${majorStars}. Five-element pattern: ${astrolabe.fiveElementsClass || ''}. Four pillars: ${siZhu}.`;
  };

  const [coreIdentity, setCoreIdentity] = useState(computeCoreIdentity());
  const canGenerate = !report.paymentEnabled || report.isPaid || Boolean(report.aiReport && report.aiReport.length >= 100);
  const [loading, setLoading] = useState(canGenerate && (!report.aiReport || report.aiReport.length < 100));
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const generationKey = `${locale}:${report.id}`;

  useEffect(() => {
    if (!canGenerate || (report.aiReport && report.aiReport.length >= 100)) {
      pendingInitialGenerations.delete(generationKey);
      return;
    }

    if (pendingInitialGenerations.has(generationKey)) {
      return;
    }

    pendingInitialGenerations.add(generationKey);

    generateAIReport().finally(() => {
      pendingInitialGenerations.delete(generationKey);
    });
  }, [canGenerate, generationKey, report.aiReport, report.id]);

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
        body: JSON.stringify({ reportId: report.id, locale }),
      });

      const data = await response.json();

      if (data.status === 'generating') {
        setGenerating(true);
        setRetryAfter(data.retryAfter || 60);
        setLoading(false);
        return;
      }

      if (data.status === 'failed') {
        setError(data.error || dictionary.retry);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || dictionary.retry);
      }

      setAiReport(data.report);
      setCoreIdentity(data.coreIdentity);
    } catch (err) {
      setError(err instanceof Error ? err.message : dictionary.retry);
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
          <Link href={getLocalizedPath(locale)} className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
            <motion.span
              className="text-[#B8925A] text-xl"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              ☯
            </motion.span>
            <span className="text-[#1A0F05] tracking-[0.2em] text-sm font-serif">
              {locale === 'zh' ? '天命玄机' : 'Tianming Secrets'}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <span className="text-[#1A0F05]/35 text-[10px] tracking-wide">
              {new Date(report.createdAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-10 px-4 md:py-16 md:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...gentleSpring }}
        >
          {/* Chart Display */}
          {report.rawAstrolabe && (
            <motion.div
              className="mb-10 print-chart-container print:mb-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...gentleSpring, delay: 0.1 }}
            >
              <FullChart
                rawAstrolabe={report.rawAstrolabe}
                gender={report.gender}
                birthDate={report.birthDate}
                birthTime={report.birthTime}
                birthCity={report.birthCity}
                locale={locale}
              />
            </motion.div>
          )}

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {!canGenerate ? (
              <motion.div
                key="locked"
                className="border border-[#B8925A]/15 p-8 md:p-12 bg-white/30 backdrop-blur-sm rounded-2xl print:hidden text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-[#B8925A] tracking-[0.3em] text-sm mb-4">{dictionary.paymentRequiredTitle}</p>
                <p className="text-[#1A0F05]/70 text-sm leading-7 max-w-xl mx-auto">{dictionary.paymentRequiredBody}</p>
                <Link
                  href={getLocalizedPath(locale, `/chart/${report.id}`)}
                  className="mt-8 inline-flex items-center justify-center rounded-full border border-[#B8925A]/35 px-6 py-3 text-xs tracking-[0.2em] text-[#8B4513]"
                >
                  {dictionary.backToChart}
                </Link>
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                className="border border-[#B8925A]/15 p-8 md:p-12 bg-white/30 backdrop-blur-sm rounded-2xl print:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {generating ? (
                  <WaitingAnimation
                    locale={locale}
                    retryAfter={retryAfter}
                    title={dictionary.waitingTitle}
                    body={dictionary.waitingBody}
                    retryLabel={dictionary.retryAfter}
                  />
                ) : (
                  <LoadingAnimation
                    locale={locale}
                    title={dictionary.loadingTitle}
                    body={dictionary.loadingBody}
                    hint={dictionary.loadingHint}
                  />
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
                  {dictionary.retry}
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
                      <p className="text-[#B8925A] text-xs tracking-[0.35em] font-medium">{dictionary.coreIdentity.toUpperCase()}</p>
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
                      {locale === 'zh' ? '"命由己造，相由心生。' : '"Read the pattern, then choose the response.'}<br />
                      <span className="text-[#8B4513]/70">{dictionary.quote}"</span>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 print:hidden">
            <Link
              href={getLocalizedPath(locale)}
              className="group flex items-center gap-2 text-xs tracking-widest px-8 py-3.5 border border-[#B8925A]/40 text-[#B8925A]
                         hover:bg-[#B8925A] hover:text-[#F7F3EC] hover:border-[#B8925A] transition-all duration-300 rounded-lg"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>{dictionary.regenerate}</span>
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs tracking-widest px-8 py-3.5 bg-gradient-to-r from-[#8B4513] via-[#A67B3C] to-[#8B4513] text-[#F7F3EC]
                         hover:shadow-lg hover:shadow-[#B8925A]/20 transition-all duration-300 rounded-lg"
            >
              <span>📄</span>
              <span>{dictionary.print}</span>
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 pt-8 border-t border-[#B8925A]/8">
            <p className="text-center text-[#1A0F05]/25 text-[10px] leading-relaxed tracking-wide max-w-lg mx-auto">
              {dictionary.disclaimer}
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#B8925A]/10 py-8 px-8 bg-[#F0EBE1]/80 print:hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-[#B8925A]/50 text-xs">✧</span>
            <span className="text-[#1A0F05]/30 text-xs tracking-[0.2em]">{locale === 'zh' ? '天命玄机' : 'Tianming Secrets'}</span>
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
