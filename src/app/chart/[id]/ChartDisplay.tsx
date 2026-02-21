'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PalaceData {
  name: string;
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
  chineseDate?: string; // 四柱数据，格式: "庚午 壬午 辛亥 甲午"
  year?: { categorical?: string };
  month?: { categorical?: string };
  day?: { categorical?: string };
  hour?: { categorical?: string };
}

interface ReportData {
  id: string;
  email: string;
  gender: string;
  birthDate: string;
  birthTime: number;
  birthCity: string;
  rawAstrolabe: RawAstrolabe | null;
  createdAt: string;
}

interface ChartDisplayProps {
  report: ReportData;
}

// ─── 12宫布局（传统紫微斗数排列）────────────────────────────────────────────────

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
  // 八卦三爻数据: [上爻, 中爻, 下爻] - true=阳(实线), false=阴(断线)
  // 后天八卦顺序（从北开始顺时针）: 坎、艮、震、巽、离、坤、兑、乾
  const bagua = [
    [false, true, false], // 坎 ☵ (北, 0°)
    [true, false, false], // 艮 ☶ (东北, 45°)
    [false, false, true], // 震 ☳ (东, 90°)
    [true, true, false],  // 巽 ☴ (东南, 135°)
    [true, false, true],  // 离 ☲ (南, 180°)
    [false, false, false],// 坤 ☷ (西南, 225°)
    [false, true, true],  // 兑 ☱ (西, 270°)
    [true, true, true],   // 乾 ☰ (西北, 315°)
  ];

  // 绘制单个卦象（三爻）
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
            // 阳爻：实线
            <rect key={lineIndex} x="0" y={y} width="16" height="2" fill="currentColor" />
          ) : (
            // 阴爻：中间断开的两段
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
      {/* 外圈 */}
      <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.3" />
      {/* 八卦符号 */}
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

function Divider() {
  return (
    <div className="flex items-center gap-4 w-full max-w-md mx-auto my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8925A] to-transparent opacity-30" />
      <TaiChiSymbol className="w-6 h-6 text-[#B8925A] opacity-50" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8925A] to-transparent opacity-30" />
    </div>
  );
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

function getShichenName(hour: number): string {
  // hour 是 0-23，需要转换为 0-11 的时辰索引
  // 子时(23:00-01:00) -> 0, 丑时(01:00-03:00) -> 1, ...
  const shichenMap: Record<number, string> = {
    0: '子时', 1: '丑时', 2: '寅时', 3: '卯时',
    4: '辰时', 5: '巳时', 6: '午时', 7: '未时',
    8: '申时', 9: '酉时', 10: '戌时', 11: '亥时',
  };
  // 23点归为子时(0)，其他 hour/2 向下取整
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
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-[0.08]">
          <BaguaRing className="w-full h-full text-[#8B4513]" />
        </div>
        <div className="absolute top-2 right-2 opacity-15">
          <CloudPattern className="w-16 h-8 text-[#B8925A]" />
        </div>
        <div className="absolute bottom-2 left-2 opacity-15 rotate-180">
          <CloudPattern className="w-16 h-8 text-[#B8925A]" />
        </div>

        {/* 中心内容 */}
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
                    flex flex-col min-h-[140px] md:min-h-[200px]`}>
      {/* 宫名 + 天干地支 + 大限 */}
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

      {/* 主星 */}
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

        {/* 辅星 */}
        {minorStars.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mb-1">
            {minorStars.map((star, i) => (
              <StarBadge key={i} name={star.name} brightness={star.brightness} isMain={false} />
            ))}
          </div>
        )}

        {/* 杂耀 */}
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

      {/* 底部信息：长生12神 + 博士12神 + 小限 */}
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

export default function ChartDisplay({ report }: ChartDisplayProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [freeReuseMessage, setFreeReuseMessage] = useState<string | null>(null);
  const astrolabe = report.rawAstrolabe;
  const palaces = astrolabe?.palaces || [];

  // 获取大师解读
  const handleGetReading = async () => {
    setLoading(true);
    setFreeReuseMessage(null);
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
        }),
      });

      const data = await response.json();

      if (data.freeReuse && data.reportId) {
        // 7天内免费复用，显示提示后跳转
        setFreeReuseMessage(`您在${data.daysRemaining}天内已生成过相同参数的解读，正在为您跳转...`);
        setTimeout(() => {
          router.push(`/result/${data.reportId}`);
        }, 1500);
      } else if (data.url) {
        // 需要付费，跳转到 Stripe
        window.location.href = data.url;
      } else if (data.isMock) {
        // Mock 模式，直接跳转到结果页
        router.push(`/result/${report.id}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // 出错时也跳转到结果页
      router.push(`/result/${report.id}`);
    }
  };

  const renderGrid = () => {
    const cells: React.ReactNode[] = [];

    PALACE_LAYOUT.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 'CENTER') {
          if (rowIndex === 1 && colIndex === 1) {
            cells.push(
              <PalaceCell key="center" palace={null} isCenter astrolabe={astrolabe} />
            );
          }
        } else if (cell === 'EMPTY') {
          return;
        } else {
          const palace = getPalaceByBranch(palaces, cell);
          cells.push(
            <PalaceCell key={`${rowIndex}-${colIndex}`} palace={palace} isCenter={false} astrolabe={astrolabe} />
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
          <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <TaiChiSymbol className="w-6 h-6 text-[#B8925A]" />
            </motion.div>
            <span className="text-[#1A0F05] tracking-[0.2em] text-sm font-serif">
              天命玄机
            </span>
          </Link>
          <span className="text-[#1A0F05]/40 text-xs">
            排盘时间: {new Date(report.createdAt).toLocaleString('zh-CN')}
          </span>
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
            <p className="text-[#B8925A] tracking-[0.4em] text-xs mb-4">紫微斗數命盤</p>
            <h1 className="text-[#1A0F05] text-2xl md:text-3xl font-light tracking-wide mb-3">
              {report.email}
            </h1>
            <p className="text-[#1A0F05]/50 text-sm">
              {report.birthDate} · {getShichenName(report.birthTime)}
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
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">性别</p>
                <p className="text-[#1A0F05] font-medium text-sm">{astrolabe?.gender || (report.gender === 'male' ? '男' : '女')}</p>
              </div>
              <div className="p-3 text-center border-r border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">生肖</p>
                <p className="text-[#1A0F05] font-medium text-sm">{astrolabe?.chineseZodiac || astrolabe?.zodiac || '-'}</p>
              </div>
              <div className="p-3 text-center border-r border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">星座</p>
                <p className="text-[#1A0F05] font-medium text-sm">{getWesternZodiac(report.birthDate)}</p>
              </div>
              <div className="p-3 text-center border-r border-t md:border-t-0 border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">五行局</p>
                <p className="text-[#1A0F05] font-medium text-sm">{astrolabe?.fiveElementsClass || astrolabe?.fiveElementsClass || '-'}</p>
              </div>
              <div className="p-3 text-center border-r border-t md:border-t-0 border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">阳历</p>
                <p className="text-[#1A0F05] font-medium text-xs">{astrolabe?.solarDate || report.birthDate}</p>
              </div>
              <div className="p-3 text-center border-t md:border-t-0 border-[#B8925A]/10">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">农历</p>
                <p className="text-[#1A0F05] font-medium text-xs">{astrolabe?.lunarDate || '-'}</p>
              </div>
            </div>

            {/* 第二行：命盘核心信息 */}
            <div className="grid grid-cols-4 border-b border-[#B8925A]/10 bg-[#F7F3EC]/30">
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
                <p className="text-[#1A0F05] font-medium text-sm">{getShichenName(report.birthTime)}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[#B8925A] text-[10px] tracking-wider mb-1">四柱</p>
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
                <p className="text-[#B8925A] tracking-[0.3em] text-sm">紫微斗數排盤</p>
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
                  <p className="text-[#8B4513] text-xs tracking-[0.25em] font-medium">命理精解</p>
                  <TaiChiSymbol className="w-4 h-4 text-[#8B4513]" />
                </div>
                <p className="text-sm mb-3 text-[#1A0F05]/80 max-w-md mx-auto leading-relaxed">
                  我们搭建了<span className="text-[#8B4513] font-medium">专属命理知识库</span>，汇聚<span className="text-[#8B4513] font-medium">30余位道教大师</span>毕生智慧
                </p>
                {/* 7天免费复用 + 数据保留说明 */}
                <p className="text-[10px] mb-4 text-[#8B4513]/70 max-w-md mx-auto">
                  同一邮箱、相同参数 7 天内免费复用 · 数据仅保留 7 天后自动删除
                </p>
                {/* 免费复用提示消息 */}
                {freeReuseMessage && (
                  <p className="text-xs mb-4 text-[#8B4513] max-w-md mx-auto animate-pulse">
                    {freeReuseMessage}
                  </p>
                )}
                <button
                  onClick={handleGetReading}
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
                      <span>正在处理...</span>
                    </>
                  ) : (
                    <>
                      <span>获取大师解读</span>
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
              href="/"
              className="text-xs tracking-[0.15em] px-6 py-3 border border-[#B8925A] text-[#B8925A]
                         hover:bg-[#B8925A] hover:text-[#F7F3EC] transition-all duration-300"
            >
              重新排盤
            </Link>
            <button
              onClick={() => window.print()}
              className="text-xs tracking-[0.15em] px-6 py-3 border border-[#B8925A]/40 text-[#1A0F05]/50
                         hover:border-[#B8925A] hover:text-[#B8925A] transition-all duration-300"
            >
              打印命盤
            </button>
          </div>

          {/* Disclaimer - 打印时隐藏 */}
          <div className="no-print mt-10 pt-6 border-t border-[#B8925A]/10">
            <p className="text-center text-[#1A0F05]/25 text-xs tracking-wide leading-relaxed">
              本命盘基于紫微斗数排盘算法生成，仅供参考。本网站不保留任何个人信息，数据仅储存7天后自动删除。
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[#B8925A]/15 py-6 px-8 bg-[#F0EBE1]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <TaiChiSymbol className="w-4 h-4 text-[#B8925A] opacity-50" />
            <span className="text-[#1A0F05]/30 text-xs tracking-[0.2em]">天命玄机</span>
          </div>
          <p className="text-[#1A0F05]/20 text-xs tracking-wider">
            © 2025 天命玄机 · Taoist Metaphysics
          </p>
        </div>
      </footer>
    </div>
  );
}
