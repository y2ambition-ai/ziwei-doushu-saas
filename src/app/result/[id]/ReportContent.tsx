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

// ─── Helper Functions ───────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-4 w-full max-w-xs mx-auto my-6 opacity-50">
      <div className="flex-1 h-px bg-[#B8925A]" />
      <span className="text-[#B8925A] text-xs">☯</span>
      <div className="flex-1 h-px bg-[#B8925A]" />
    </div>
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
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) {
      return (
        <h1 key={i} className="text-xl font-medium text-[#1A0F05] mt-8 mb-4">
          {line.slice(2)}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="text-lg font-medium text-[#1A0F05] mt-6 mb-3">
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={i} className="text-base font-medium text-[#1A0F05] mt-4 mb-2">
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith('- **') && line.includes('**:')) {
      const match = line.match(/- \*\*(.+?)\*\*:\s*(.+)/);
      if (match) {
        return (
          <li key={i} className="ml-4 text-sm leading-relaxed mb-2">
            <strong className="text-[#B8925A]">{match[1]}</strong>: {match[2]}
          </li>
        );
      }
    }
    if (line.startsWith('- ')) {
      return (
        <li key={i} className="ml-4 text-sm leading-relaxed">
          {line.slice(2)}
        </li>
      );
    }
    if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').filter(Boolean);
      return (
        <div key={i} className="grid grid-cols-4 gap-2 py-2 text-sm border-b border-[#B8925A]/10">
          {cells.map((cell, j) => (
            <span key={j} className="text-center">{cell.trim()}</span>
          ))}
        </div>
      );
    }
    if (line.includes('---')) {
      return <Divider key={i} />;
    }
    if (line.trim()) {
      return (
        <p key={i} className="text-sm leading-relaxed mb-3 text-[#1A0F05]/80">
          {line}
        </p>
      );
    }
    return null;
  });
}

// ─── Loading Animation ─────────────────────────────────────────────────────────

function LoadingAnimation() {
  const [countdown, setCountdown] = useState(120);  // 2分钟倒计时

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
          {/* Title */}
          <div className="text-center mb-8">
            <p className="text-[#B8925A] tracking-[0.3em] text-xs mb-4 uppercase">
              紫微斗数命理报告
            </p>
            <h1 className="text-[#1A0F05] text-2xl md:text-3xl font-light tracking-wide mb-3">
              {report.email}
            </h1>
            <p className="text-[#1A0F05]/60 text-sm">
              {report.birthDate} · {getShichenName(report.birthTime)} · {report.birthCity}
            </p>
            <Divider />
          </div>

          {/* 命盘显示 - 打印时也显示 */}
          {report.rawAstrolabe && (
            <motion.div
              className="mb-8 print:break-before-page"
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
              {/* Core Identity Card */}
              <motion.div
                className="mb-8 p-6 bg-[#1A0F05] text-[#F7F3EC] text-center print:break-inside-avoid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="text-[#B8925A] text-xs tracking-widest mb-2">核心身份</p>
                <p className="text-base leading-relaxed">{coreIdentity}</p>
              </motion.div>

              {/* Report Content */}
              <motion.div
                className="border border-[#B8925A]/20 p-6 md:p-10 print:break-inside-avoid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="prose prose-sm max-w-none">
                  {renderMarkdown(aiReport)}
                </div>
              </motion.div>
            </>
          )}

          {/* Actions - 打印时隐藏 */}
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6 print:hidden">
            <Link
              href={`/chart/${report.id}`}
              className="text-xs tracking-widest px-6 py-3 border border-[#B8925A]/50 text-[#1A0F05]/60
                         hover:border-[#B8925A] hover:text-[#B8925A] transition-all duration-300"
            >
              查看完整命盘
            </Link>
            <Link
              href="/"
              className="text-xs tracking-widest px-6 py-3 border border-[#B8925A] text-[#B8925A]
                         hover:bg-[#B8925A] hover:text-[#F7F3EC] transition-all duration-300"
            >
              重新推算
            </Link>
            <button
              onClick={() => window.print()}
              className="text-xs tracking-widest px-6 py-3 bg-[#8B4513] text-[#F7F3EC]
                         hover:bg-[#A0522D] transition-all duration-300"
            >
              打印报告
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
