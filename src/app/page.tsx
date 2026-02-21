"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BaguaBackground } from '@/components/BaguaBackground';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  reportId: string;
  coreIdentity: string;
  report: string;
  astrolabe: {
    mingGong: { name: string; majorStars: string[] };
    wuXingJu: string;
    chineseZodiac: string;
    siZhu: { year: string; month: string; day: string; hour: string };
    solarTime: { shichen: number; shichenName: string };
  };
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SHICHEN = [
  { value: 'zi', label: '子时 · 23:00–01:00', animal: '鼠', hour: 0, shichenIndex: 0 },
  { value: 'chou', label: '丑时 · 01:00–03:00', animal: '牛', hour: 2, shichenIndex: 1 },
  { value: 'yin', label: '寅时 · 03:00–05:00', animal: '虎', hour: 4, shichenIndex: 2 },
  { value: 'mao', label: '卯时 · 05:00–07:00', animal: '兔', hour: 6, shichenIndex: 3 },
  { value: 'chen', label: '辰时 · 07:00–09:00', animal: '龙', hour: 8, shichenIndex: 4 },
  { value: 'si', label: '巳时 · 09:00–11:00', animal: '蛇', hour: 10, shichenIndex: 5 },
  { value: 'wu', label: '午时 · 11:00–13:00', animal: '马', hour: 12, shichenIndex: 6 },
  { value: 'wei', label: '未时 · 13:00–15:00', animal: '羊', hour: 14, shichenIndex: 7 },
  { value: 'shen', label: '申时 · 15:00–17:00', animal: '猴', hour: 16, shichenIndex: 8 },
  { value: 'you', label: '酉时 · 17:00–19:00', animal: '鸡', hour: 18, shichenIndex: 9 },
  { value: 'xu', label: '戌时 · 19:00–21:00', animal: '狗', hour: 20, shichenIndex: 10 },
  { value: 'hai', label: '亥时 · 21:00–23:00', animal: '猪', hour: 22, shichenIndex: 11 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-4 w-full max-w-xs mx-auto my-2 opacity-50">
      <div className="flex-1 h-px bg-[#B8925A]" />
      <span className="text-[#B8925A] text-xs">☯</span>
      <div className="flex-1 h-px bg-[#B8925A]" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [form, setForm] = useState({
    email: '',
    gender: '',
    year: '',
    month: '',
    day: '',
    shichen: '',
    // 当前位置时间（用于计算时区偏移）
    currentHour: '',
    currentMinute: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLElement>(null);

  const years = Array.from({ length: 120 }, (_, i) => 2010 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 字段验证
    const errors: Record<string, string> = {};
    if (!form.email) errors.email = '请填写邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '邮箱格式不正确';
    if (!form.gender) errors.gender = '请选择性别';
    if (!form.year) errors.year = '请选择出生年份';
    if (!form.month) errors.month = '请选择出生月份';
    if (!form.day) errors.day = '请选择出生日期';
    if (!form.shichen) errors.shichen = '请选择出生时辰';
    if (!form.currentHour) errors.currentHour = '请选择当前小时';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // 滚动到第一个错误字段
      const firstError = Object.keys(errors)[0];
      const element = document.getElementById(`field-${firstError}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setError(null);

    // Get shichen index
    const shichenData = SHICHEN.find(s => s.value === form.shichen);

    // Build date string
    const birthDate = `${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`;

    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          gender: form.gender,
          birthDate,
          birthTime: shichenData?.hour ?? 12,
          birthMinute: 0,
          // 当前位置时间（用于计算经度）
          currentHour: parseInt(form.currentHour),
          currentMinute: parseInt(form.currentMinute) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '报告生成失败');
      }

      setReportData(data);
      setSubmitted(true);
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '报告生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ email: '', gender: '', year: '', month: '', day: '', shichen: '', currentHour: '', currentMinute: '' });
  };

  const inputCls =
    'w-full bg-transparent border border-[#B8925A]/30 rounded-none px-4 py-3 text-[#1A0F05] placeholder-[#1A0F05]/30 focus:outline-none focus:border-[#B8925A] transition-colors duration-300 text-sm';

  const selectCls =
    'w-full bg-[#F7F3EC] border border-[#B8925A]/30 rounded-none px-4 py-3 text-[#1A0F05] focus:outline-none focus:border-[#B8925A] transition-colors duration-300 text-sm appearance-none cursor-pointer';

  return (
    <div className="min-h-screen w-full bg-[#F7F3EC]">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-5 bg-[#F7F3EC]/92 backdrop-blur-xl border-b border-[#B8925A]/15">
        <div className="flex items-center gap-3">
          <span className="text-[#B8925A] text-lg">☯</span>
          <span className="text-[#1A0F05] tracking-[0.2em] text-sm font-serif">
            天命玄机
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <button
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[#1A0F05]/60 hover:text-[#B8925A] transition-colors duration-300 tracking-widest text-xs"
          >
            道统渊源
          </button>
          <button
            onClick={scrollToForm}
            className="text-[#1A0F05]/60 hover:text-[#B8925A] transition-colors duration-300 tracking-widest text-xs"
          >
            命理推算
          </button>
        </div>
        <button
          onClick={scrollToForm}
          className="text-xs tracking-widest px-5 py-2 border border-[#B8925A]/50 text-[#B8925A] hover:bg-[#B8925A] hover:text-[#F7F3EC] transition-all duration-300"
        >
          开始推算
        </button>
      </nav>

      {/* ── ABOUT ──────────────────────────────────────────────── */}
      <section id="about-section" className="relative min-h-screen flex items-center overflow-hidden pt-24">
        {/* Rotating Bagua background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-[90vmin] h-[90vmin] max-w-[780px] max-h-[780px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
          >
            <BaguaBackground className="w-full h-full opacity-[0.12]" />
          </motion.div>
        </div>

        {/* Static Bagua (inner, opposite rotation for depth) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-[55vmin] h-[55vmin] max-w-[480px] max-h-[480px]"
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          >
            <BaguaBackground className="w-full h-full opacity-[0.07]" />
          </motion.div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 py-20">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <p className="text-[#B8925A] tracking-[0.3em] text-xs mb-5 uppercase">道统渊源</p>
              <h2 className="text-[#1A0F05] mb-8 leading-snug text-2xl md:text-3xl lg:text-4xl font-light tracking-wide">
                源自中国山林<br />的古老智慧
              </h2>
              <div className="w-8 h-px bg-[#B8925A] mb-8 opacity-50" />
              <div className="space-y-5 text-[#1A0F05]/65 text-sm leading-loose tracking-wide">
                <p>
                  我们历时数年，走访了中国深山之中<strong className="text-[#1A0F05]/85 font-normal">三十余位隐居道士</strong>——
                  他们或居于武当山深处，或隐于青城山云雾之间，或守护着鲜为人知的古观密典。
                </p>
                <p>
                  这些道士数十年如一日地修习命理之术，将毕生所学慷慨传授。
                  我们系统整理了这些珍贵的口传心授，结合现代历法与天文数据，
                  构建出一套前所未有的精密推演体系。
                </p>
                <p>
                  这不是市面上流通的简化版命理。这是道家原典智慧的当代传承——
                  <strong className="text-[#1A0F05]/85 font-normal">严谨、深邃、真实</strong>。
                </p>
              </div>
            </motion.div>

            {/* Right side: decorative stats */}
            <motion.div
              className="grid grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {[
                { num: '30+', label: '隐居道士', sub: '数十年修行经验' },
                { num: '千年', label: '道统传承', sub: '不间断的命理脉络' },
                { num: '六大', label: '推算体系', sub: '多维交叉验证' },
                { num: '万人', label: '验证案例', sub: '真实反馈积累' },
              ].map(({ num, label, sub }) => (
                <div
                  key={label}
                  className="p-6 border border-[#B8925A]/20 hover:border-[#B8925A]/50 transition-colors duration-500"
                >
                  <div className="text-[#B8925A] text-3xl mb-1 font-light font-[family-name:var(--font-display)]">
                    {num}
                  </div>
                  <div className="text-[#1A0F05] text-sm tracking-widest mb-1">{label}</div>
                  <div className="text-[#1A0F05]/40 text-xs">{sub}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FORM ───────────────────────────────────────────────── */}
      <section
        ref={formRef}
        className="py-28 px-8 md:px-16 bg-[#F0EBE1]"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <p className="text-[#B8925A] tracking-[0.3em] text-xs mb-4 uppercase">命理推算</p>
            <h2 className="text-[#1A0F05] mb-4 text-2xl md:text-3xl font-light tracking-wide">
              输入您的命理信息
            </h2>
            <p className="text-[#1A0F05]/45 text-xs leading-relaxed tracking-wide">
              出生地点决定时区，时辰精确与否直接影响命盘质量。请尽量填写准确。
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            {/* Email */}
            <div id="field-email">
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                邮箱 · Email
              </label>
              <input
                type="email"
                placeholder="请输入您的邮箱"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setValidationErrors({ ...validationErrors, email: '' }); }}
                className={`${inputCls} ${validationErrors.email ? 'border-red-500 bg-red-50' : ''}`}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Gender */}
            <div id="field-gender">
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                性别 · Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setForm({ ...form, gender: 'male' }); setValidationErrors({ ...validationErrors, gender: '' }); }}
                  className={`py-3 border transition-all duration-300 text-sm ${form.gender === 'male' ? 'border-[#B8925A] bg-[#B8925A]/10 text-[#1A0F05]' : validationErrors.gender ? 'border-red-500 text-[#1A0F05]/60' : 'border-[#B8925A]/30 text-[#1A0F05]/60 hover:border-[#B8925A]/50'}`}
                >
                  男 · Male
                </button>
                <button
                  type="button"
                  onClick={() => { setForm({ ...form, gender: 'female' }); setValidationErrors({ ...validationErrors, gender: '' }); }}
                  className={`py-3 border transition-all duration-300 text-sm ${form.gender === 'female' ? 'border-[#B8925A] bg-[#B8925A]/10 text-[#1A0F05]' : validationErrors.gender ? 'border-red-500 text-[#1A0F05]/60' : 'border-[#B8925A]/30 text-[#1A0F05]/60 hover:border-[#B8925A]/50'}`}
                >
                  女 · Female
                </button>
              </div>
              {validationErrors.gender && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.gender}</p>
              )}
            </div>

            {/* Birth Date */}
            <div id="field-year">
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                出生年月日 · Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <select
                    value={form.year}
                    onChange={(e) => { setForm({ ...form, year: e.target.value }); setValidationErrors({ ...validationErrors, year: '' }); }}
                    className={`${selectCls} ${validationErrors.year ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <option value="">年</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y} 年</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
                </div>
                <div className="relative">
                  <select
                    value={form.month}
                    onChange={(e) => { setForm({ ...form, month: e.target.value }); setValidationErrors({ ...validationErrors, month: '' }); }}
                    className={`${selectCls} ${validationErrors.month ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <option value="">月</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m} 月</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
                </div>
                <div className="relative">
                  <select
                    value={form.day}
                    onChange={(e) => { setForm({ ...form, day: e.target.value }); setValidationErrors({ ...validationErrors, day: '' }); }}
                    className={`${selectCls} ${validationErrors.day ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <option value="">日</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d} 日</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
                </div>
              </div>
              {(validationErrors.year || validationErrors.month || validationErrors.day) && (
                <p className="text-red-500 text-xs mt-1">请完整选择出生日期</p>
              )}
            </div>

            {/* Birth Shichen */}
            <div id="field-shichen">
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                出生时辰 · Birth Hour
              </label>
              <div className="relative">
                <select
                  value={form.shichen}
                  onChange={(e) => { setForm({ ...form, shichen: e.target.value }); setValidationErrors({ ...validationErrors, shichen: '' }); }}
                  className={`${selectCls} ${validationErrors.shichen ? 'border-red-500 bg-red-50' : ''}`}
                >
                  <option value="">请选择出生时辰</option>
                  {SHICHEN.map(({ value, label, animal }) => (
                    <option key={value} value={value}>{label} · {animal}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
              </div>
              {validationErrors.shichen && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.shichen}</p>
              )}
            </div>

            {/* Current Location Time (for timezone calculation) */}
            <div id="field-currentHour">
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                您现在几点？· Your Current Time
              </label>
              <p className="text-[#1A0F05]/40 text-xs mb-3">
                用于计算您所在地的真太阳时，让命盘更精准
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    value={form.currentHour}
                    onChange={(e) => { setForm({ ...form, currentHour: e.target.value }); setValidationErrors({ ...validationErrors, currentHour: '' }); }}
                    className={`${selectCls} ${validationErrors.currentHour ? 'border-red-500 bg-red-50' : ''}`}
                  >
                    <option value="">时</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')} 时</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
                </div>
                <div className="relative">
                  <select
                    value={form.currentMinute}
                    onChange={(e) => setForm({ ...form, currentMinute: e.target.value })}
                    className={selectCls}
                  >
                    <option value="">分</option>
                    {minutes.map((m) => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')} 分</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
                </div>
              </div>
              {validationErrors.currentHour && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.currentHour}</p>
              )}
            </div>

            {/* Price + Submit */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[#1A0F05]/50 text-xs tracking-wider">本次命理推算费用</span>
                <span className="text-[#1A0F05] text-2xl font-light font-[family-name:var(--font-display)]">
                  $1.99 <span className="text-xs text-[#1A0F05]/40">USD</span>
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1A0F05] text-[#F7F3EC] tracking-[0.2em] text-xs hover:bg-[#B8925A] transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                    <span>正在推演命盘，请稍候……</span>
                  </>
                ) : (
                  '支付 $1.99 · 开启命理推算'
                )}
              </button>
              <p className="text-center text-[#1A0F05]/30 text-xs mt-3 tracking-wide">
                信息仅用于命理推算，不会被存储或用于任何其他用途
              </p>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ── RESULT ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {submitted && reportData && (
          <motion.section
            id="result-section"
            className="py-28 px-8 md:px-16 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Header */}
            <div className="text-center mb-14">
              <p className="text-[#B8925A] tracking-[0.3em] text-xs mb-4 uppercase">您的命理报告</p>
              <h2 className="text-[#1A0F05] mb-3 text-xl md:text-2xl font-light tracking-wide">
                {form.email}
              </h2>
              <p className="text-[#B8925A] text-sm mb-4">
                {reportData.astrolabe.siZhu.year} {reportData.astrolabe.siZhu.month} {reportData.astrolabe.siZhu.day} {reportData.astrolabe.siZhu.hour} · {reportData.astrolabe.chineseZodiac}
              </p>
              <Divider />
            </div>

            {/* Core Identity Card */}
            <div className="mb-8 p-6 bg-[#1A0F05] text-[#F7F3EC] text-center">
              <p className="text-[#B8925A] text-xs tracking-widest mb-2">核心身份</p>
              <p className="text-lg">{reportData.coreIdentity}</p>
            </div>

            {/* Report Content */}
            <div className="border border-[#B8925A]/20 p-8">
              <div className="prose prose-sm max-w-none text-[#1A0F05]/80">
                {reportData.report.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-xl font-medium text-[#1A0F05] mt-6 mb-4">{line.slice(2)}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-medium text-[#1A0F05] mt-6 mb-3">{line.slice(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-base font-medium text-[#1A0F05] mt-4 mb-2">{line.slice(4)}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 text-sm leading-relaxed">{line.slice(2)}</li>;
                  }
                  if (line.startsWith('|')) {
                    return null; // Skip table rows for now
                  }
                  if (line.trim() === '---') {
                    return <Divider key={i} />;
                  }
                  if (line.trim()) {
                    return <p key={i} className="text-sm leading-relaxed mb-3">{line}</p>;
                  }
                  return null;
                })}
              </div>
            </div>

            <div className="text-center mt-10">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setReportData(null);
                  setForm({ email: '', gender: '', year: '', month: '', day: '', shichen: '', currentHour: '', currentMinute: '' });
                  scrollToForm();
                }}
                className="text-xs tracking-widest text-[#B8925A] border-b border-[#B8925A]/40 pb-0.5 hover:border-[#B8925A] transition-colors duration-300"
              >
                重新推算
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-[#B8925A]/15 py-14 px-8 md:px-16 bg-[#F0EBE1]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[#B8925A]">☯</span>
            <span className="text-[#1A0F05] tracking-[0.2em] text-xs">天命玄机</span>
          </div>
          <p className="text-[#1A0F05]/35 text-xs tracking-wide text-center">
            源自道家传承 · 融汇古今智慧 · 以命理之光照亮人生之路
          </p>
          <p className="text-[#1A0F05]/30 text-xs tracking-wider">
            © 2025 天命玄机 · Taoist Metaphysics
          </p>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-[#B8925A]/10">
          <p className="text-[#1A0F05]/25 text-xs text-center leading-relaxed tracking-wide">
            本网站提供的命理分析仅供参考，不构成任何法律、医疗、财务建议。命理为人生指引之工具，最终决策请以您的自由意志为准。
          </p>
        </div>
      </footer>
    </div>
  );
}
