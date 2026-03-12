'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  PalaceData,
  RawAstrolabe,
  PALACE_LAYOUT,
  TaiChiSymbol,
  BaguaRing,
  CloudPattern,
  Divider,
  getShichenName,
  getWesternZodiac,
  getPalaceByBranch,
  PalaceCell,
} from '@/components/chart-shared';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocalizedPath } from '@/lib/i18n/routes';
import { localizeChineseZodiac, localizeGender } from '@/lib/i18n/chart';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  id: string;
  locale: Locale;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  rawAstrolabe: RawAstrolabe | null;
  createdAt: string;
  hasAIReport?: boolean;
  isPaid?: boolean;
}

interface ChartDisplayProps {
  locale: Locale;
  report: ReportData;
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ChartDisplay({ locale, report }: ChartDisplayProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [freeReuseMessage, setFreeReuseMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const astrolabe = report.rawAstrolabe;
  const palaces = astrolabe?.palaces || [];
  const dictionary = getDictionary(locale).chart;

  // 获取大师解读
  const handleGetReading = async () => {
    setLoading(true);
    setFreeReuseMessage(null);
    setActionError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: report.email,
          gender: report.gender,
          birthDate: report.birthDate,
          birthTime: report.birthTime,
          birthMinute: 0,
          birthCity: report.birthCity,
          reportId: report.id,
          locale: report.locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || dictionary.paymentError);
      }

      console.log('Checkout response:', data);

      if (data.freeReuse && data.reportId) {
        setFreeReuseMessage(`${dictionary.freeReusePrefix}${data.daysRemaining}${dictionary.freeReuseSuffix}`);
        setTimeout(() => {
          router.push(getLocalizedPath(report.locale, `/result/${data.reportId}`));
        }, 1500);
      } else if (data.url) {
        window.location.href = data.url;
      } else if (data.isMock || data.success) {
        // Failsafe for mock flow or any direct success
        router.push(getLocalizedPath(report.locale, `/result/${report.id}`));
      } else {
        throw new Error(dictionary.paymentError);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setActionError(error instanceof Error ? error.message : dictionary.paymentError);
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = () => {
    const cells: React.ReactNode[] = [];

    PALACE_LAYOUT.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 'CENTER') {
          if (rowIndex === 1 && colIndex === 1) {
            cells.push(
              <PalaceCell key="center" palace={null} isCenter astrolabe={astrolabe} minHeight="md:min-h-[200px]" locale={locale} />
            );
          }
        } else if (cell === 'EMPTY') {
          return;
        } else {
          const palace = getPalaceByBranch(palaces, cell);
            cells.push(
            <PalaceCell key={`${rowIndex}-${colIndex}`} palace={palace} isCenter={false} astrolabe={astrolabe} minHeight="md:min-h-[200px]" locale={locale} />
          );
        }
      });
    });

    return cells;
  };

  // 解析四柱数据：优先使用 chineseDate 字段，回退到原来的方式
  const chineseDate = astrolabe?.chineseDate || '';
  const siZhuParts = chineseDate.split(' ');
  const siZhu = siZhuParts.length === 4
    ? { year: siZhuParts[0], month: siZhuParts[1], day: siZhuParts[2], hour: siZhuParts[3] }
    : {
        year: astrolabe?.year?.categorical || '',
        month: astrolabe?.month?.categorical || '',
        day: astrolabe?.day?.categorical || '',
        hour: astrolabe?.hour?.categorical || '',
      };

  return (
    <div className="min-h-screen bg-[#F7F3EC] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 opacity-[0.03]">
          <BaguaRing className="w-64 h-64 text-[#B8925A]" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-[0.03]">
          <BaguaRing className="w-48 h-48 text-[#B8925A]" />
        </div>
      </div>

      {/* Header */}
      <header className="relative border-b border-[#B8925A]/15 py-6 px-8 bg-[#F7F3EC]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={getLocalizedPath(locale)} className="flex items-center gap-3 hover:opacity-70 transition-opacity group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <TaiChiSymbol className="w-6 h-6 text-[#B8925A]" />
            </motion.div>
            <span className="text-[#1A0F05] tracking-[0.2em] text-sm font-serif">
              {locale === 'zh' ? '天命玄机' : 'Tianming Secrets'}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} locked />
            <span className="text-[#1A0F05]/40 text-xs">
              {dictionary.generatedAt}: {new Date(report.createdAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="print-chart relative max-w-6xl mx-auto py-12 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <TaiChiSymbol className="w-12 h-12 text-[#B8925A] opacity-60" />
            </motion.div>
            <p className="text-[#B8925A] tracking-[0.4em] text-xs mb-4">{dictionary.chartTitle}</p>
            <h1 className="text-[#1A0F05] text-2xl md:text-3xl font-light tracking-wide mb-3">
              {report.email}
            </h1>
            <p className="text-[#1A0F05]/50 text-sm">
              {report.birthDate} · {getShichenName(report.birthTime, locale)}
            </p>
            <Divider />
          </div>

          {/* 基本信息卡片 */}
          <motion.div
            className="mb-8 bg-white/70 backdrop-blur-sm border border-[#B8925A]/10 shadow-sm overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* 第一行：基本信息 */}
            <div className="grid grid-cols-3 md:grid-cols-6 border-b border-[#B8925A]/10">
              <div className="p-3 text-center border-r border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.gender}</p>
                <p className="text-[#1A0F05] font-medium text-sm">{localizeGender(locale, astrolabe?.gender || report.gender)}</p>
              </div>
              <div className="p-3 text-center border-r border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.zodiac}</p>
                <p className="text-[#1A0F05] font-medium text-sm">{localizeChineseZodiac(locale, astrolabe?.chineseZodiac || astrolabe?.zodiac || '-') || '-'}</p>
              </div>
              <div className="p-3 text-center border-r border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.western}</p>
                <p className="text-[#1A0F05] font-medium text-sm">{getWesternZodiac(report.birthDate, locale)}</p>
              </div>
              <div className="p-3 text-center border-r border-t md:border-t-0 border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.elements}</p>
                <p className="text-[#1A0F05] font-medium text-sm">{astrolabe?.fiveElementsClass || astrolabe?.fiveElementsClass || '-'}</p>
              </div>
              <div className="p-3 text-center border-r border-t md:border-t-0 border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.solarDate}</p>
                <p className="text-[#1A0F05] font-medium text-xs">{astrolabe?.solarDate || report.birthDate}</p>
              </div>
              <div className="p-3 text-center border-t md:border-t-0 border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.lunarDate}</p>
                <p className="text-[#1A0F05] font-medium text-xs">{astrolabe?.lunarDate || '-'}</p>
              </div>
            </div>

            {/* 第二行：命盘核心信息 */}
            <div className="grid grid-cols-4 border-b border-[#B8925A]/10 bg-[#F7F3EC]/30">
              <div className="p-3 text-center border-r border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.lifePalace}</p>
                <p className="text-[#8B0000] font-medium text-sm">{
                  palaces.find((p) => p.name === '命宫')?.majorStars?.map((s) => s.name).join('·') || (locale === 'zh' ? '空宫' : 'No major stars')
                }</p>
              </div>
              <div className="p-3 text-center border-r border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.bodyPalace}</p>
                <p className="text-[#1A0F05] font-medium text-sm">{
                  palaces.find((p) => p.name === '身宫')?.majorStars?.map((s) => s.name).join('·') || (locale === 'zh' ? '空宫' : 'No major stars')
                }</p>
              </div>
              <div className="p-3 text-center border-r border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.shichen}</p>
                <p className="text-[#1A0F05] font-medium text-sm">{getShichenName(report.birthTime, locale)}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">{dictionary.pillars}</p>
                <p className="text-[#1A0F05] font-medium text-sm font-serif">{siZhu.year} {siZhu.month} {siZhu.day} {siZhu.hour}</p>
              </div>
            </div>
          </motion.div>

          {/* 12宫命盘 */}
          <motion.div
            className="relative border-2 border-[#B8925A]/30 bg-white shadow-xl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* 命盘标题 */}
            <div className="bg-gradient-to-r from-[#1A0F05] via-[#2D1F15] to-[#1A0F05] py-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <CloudPattern className="w-full h-full text-[#B8925A]" />
              </div>
              <div className="relative flex items-center justify-center gap-3">
                <TaiChiSymbol className="w-5 h-5 text-[#B8925A]" />
                <p className="text-[#B8925A] tracking-[0.3em] text-sm">{dictionary.chartTitle}</p>
                <TaiChiSymbol className="w-5 h-5 text-[#B8925A]" />
              </div>
            </div>

            {/* 12宫格 */}
            <div className="grid grid-cols-4">
              {renderGrid()}
            </div>
          </motion.div>

          {/* 图例说明 - 打印时隐藏 */}
          <motion.div
            className="no-print mt-6 p-4 bg-[#1A0F05]/5 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs text-[#1A0F05]/50">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gradient-to-br from-[#8B0000]/10 to-[#8B0000]/5 text-[#8B0000] text-[10px] rounded">{dictionary.legendMain}</span>
                <span>{locale === 'zh' ? '红色' : 'Red'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1A0F05]/70 text-[10px]">{dictionary.legendMinor}</span>
                <span>{locale === 'zh' ? '黑色' : 'Black'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1A0F05]/50 text-[9px]">{dictionary.legendAdj}</span>
                <span>{locale === 'zh' ? '浅色' : 'Muted'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8B0000] text-[9px] font-medium">{dictionary.legendDecadal}</span>
                <span>{locale === 'zh' ? '右上角红色数字' : 'Top-right red numbers'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#B8925A] text-[8px]">{dictionary.legendSpirits}</span>
                <span>{locale === 'zh' ? '底部神煞提示' : 'Lower symbolic markers'}</span>
              </div>
            </div>
          </motion.div>

          {/* 获取命理解读 - 温暖金色系 - 打印时隐藏 */}
          <motion.div
            className="no-print mt-10 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="inline-block p-6 bg-gradient-to-br from-[#FDF8F0] via-[#F9F3E8] to-[#F5EDE0] border-2 border-[#B8925A]/30 text-[#1A0F05] relative overflow-hidden shadow-lg">
              {/* 装饰 */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B8925A]/50 to-transparent" />

              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <TaiChiSymbol className="w-4 h-4 text-[#8B4513]" />
                  <p className="text-[#8B4513] text-xs tracking-[0.25em] font-medium">{dictionary.ctaEyebrow}</p>
                  <TaiChiSymbol className="w-4 h-4 text-[#8B4513]" />
                </div>
                <p className="text-sm mb-3 text-[#1A0F05]/80 max-w-md mx-auto leading-relaxed">
                  {dictionary.ctaBody}
                </p>
                <p className="text-[10px] mb-4 text-[#8B4513]/70 max-w-md mx-auto">
                  {dictionary.ctaNote}
                </p>
                {freeReuseMessage && (
                  <p className="text-xs mb-4 text-[#8B4513] max-w-md mx-auto animate-pulse">
                    {freeReuseMessage}
                  </p>
                )}
                {actionError && (
                  <p className="text-xs mb-4 text-red-700 max-w-md mx-auto">{actionError}</p>
                )}
                <button
                  onClick={report.hasAIReport ? () => router.push(getLocalizedPath(locale, `/result/${report.id}`)) : handleGetReading}
                  disabled={loading}
                  className="inline-flex items-center gap-2 text-xs tracking-[0.15em] px-8 py-3
                            bg-[#8B4513] text-[#F7F3EC] font-medium
                            hover:bg-[#A0522D] transition-all duration-300
                            shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="inline-block"
                      >
                        ☯
                      </motion.span>
                      <span>{dictionary.processing}</span>
                    </>
                  ) : report.hasAIReport ? (
                    <>
                      <span>{dictionary.openReading}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>{dictionary.getReading}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Actions - 打印时隐藏 */}
          <div className="no-print mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href={getLocalizedPath(locale)}
              className="text-xs tracking-[0.15em] px-6 py-3 border border-[#B8925A] text-[#B8925A]
                         hover:bg-[#B8925A] hover:text-[#F7F3EC] transition-all duration-300"
            >
              {dictionary.backHome}
            </Link>
            <button
              onClick={() => window.print()}
              className="text-xs tracking-[0.15em] px-6 py-3 border border-[#B8925A]/40 text-[#1A0F05]/50
                         hover:border-[#B8925A] hover:text-[#B8925A] transition-all duration-300"
            >
              {dictionary.print}
            </button>
          </div>

          {/* Disclaimer - 打印时隐藏 */}
          <div className="no-print mt-10 pt-6 border-t border-[#B8925A]/10">
            <p className="text-center text-[#1A0F05]/25 text-xs tracking-wide leading-relaxed">
              {dictionary.disclaimer}
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[#B8925A]/15 py-6 px-8 bg-[#F0EBE1]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <TaiChiSymbol className="w-4 h-4 text-[#B8925A] opacity-50" />
            <span className="text-[#1A0F05]/30 text-xs tracking-[0.2em]">{locale === 'zh' ? '天命玄机' : 'Tianming Secrets'}</span>
          </div>
          <p className="text-[#1A0F05]/20 text-xs tracking-wider">
            © 2025 {locale === 'zh' ? '天命玄机' : 'Tianming Secrets'} · Taoist Metaphysics
          </p>
        </div>
      </footer>
    </div>
  );
}
