import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BaguaBackground } from './components/BaguaBackground';

// ─── Data ────────────────────────────────────────────────────────────────────

const SHICHEN = [
  { value: 'zi', label: '子时 · 23:00–01:00', animal: '鼠' },
  { value: 'chou', label: '丑时 · 01:00–03:00', animal: '牛' },
  { value: 'yin', label: '寅时 · 03:00–05:00', animal: '虎' },
  { value: 'mao', label: '卯时 · 05:00–07:00', animal: '兔' },
  { value: 'chen', label: '辰时 · 07:00–09:00', animal: '龙' },
  { value: 'si', label: '巳时 · 09:00–11:00', animal: '蛇' },
  { value: 'wu', label: '午时 · 11:00–13:00', animal: '马' },
  { value: 'wei', label: '未时 · 13:00–15:00', animal: '羊' },
  { value: 'shen', label: '申时 · 15:00–17:00', animal: '猴' },
  { value: 'you', label: '酉时 · 17:00–19:00', animal: '鸡' },
  { value: 'xu', label: '戌时 · 19:00–21:00', animal: '狗' },
  { value: 'hai', label: '亥时 · 21:00–23:00', animal: '猪' },
];

const TIMEZONES = [
  { value: '-12:00', label: 'UTC−12:00 · Baker Island' },
  { value: '-11:00', label: 'UTC−11:00 · Niue, Samoa' },
  { value: '-10:00', label: 'UTC−10:00 · Hawaii, Tahiti' },
  { value: '-09:00', label: 'UTC−09:00 · Alaska' },
  { value: '-08:00', label: 'UTC−08:00 · Los Angeles, Vancouver' },
  { value: '-07:00', label: 'UTC−07:00 · Denver, Phoenix' },
  { value: '-06:00', label: 'UTC−06:00 · Chicago, Mexico City' },
  { value: '-05:00', label: 'UTC−05:00 · New York, Toronto' },
  { value: '-04:00', label: 'UTC−04:00 · Halifax, Santiago' },
  { value: '-03:00', label: 'UTC−03:00 · São Paulo, Buenos Aires' },
  { value: '-02:00', label: 'UTC−02:00 · South Georgia' },
  { value: '-01:00', label: 'UTC−01:00 · Azores, Cape Verde' },
  { value: '+00:00', label: 'UTC+00:00 · London, Dublin, Lisbon' },
  { value: '+01:00', label: 'UTC+01:00 · Paris, Berlin, Rome, Madrid' },
  { value: '+02:00', label: 'UTC+02:00 · Cairo, Athens, Helsinki' },
  { value: '+03:00', label: 'UTC+03:00 · Moscow, Riyadh, Nairobi' },
  { value: '+03:30', label: 'UTC+03:30 · Tehran' },
  { value: '+04:00', label: 'UTC+04:00 · Dubai, Abu Dhabi, Baku' },
  { value: '+04:30', label: 'UTC+04:30 · Kabul' },
  { value: '+05:00', label: 'UTC+05:00 · Karachi, Islamabad, Tashkent' },
  { value: '+05:30', label: 'UTC+05:30 · Mumbai, New Delhi, Colombo' },
  { value: '+05:45', label: 'UTC+05:45 · Kathmandu' },
  { value: '+06:00', label: 'UTC+06:00 · Dhaka, Almaty' },
  { value: '+06:30', label: 'UTC+06:30 · Yangon, Cocos Islands' },
  { value: '+07:00', label: 'UTC+07:00 · Bangkok, Hanoi, Jakarta' },
  { value: '+08:00', label: 'UTC+08:00 · Beijing, Singapore, Perth' },
  { value: '+09:00', label: 'UTC+09:00 · Tokyo, Seoul, Yakutsk' },
  { value: '+09:30', label: 'UTC+09:30 · Adelaide, Darwin' },
  { value: '+10:00', label: 'UTC+10:00 · Sydney, Brisbane, Vladivostok' },
  { value: '+11:00', label: 'UTC+11:00 · Solomon Islands, New Caledonia' },
  { value: '+12:00', label: 'UTC+12:00 · Auckland, Fiji, Kamchatka' },
  { value: '+13:00', label: 'UTC+13:00 · Samoa, Tonga' },
  { value: '+14:00', label: 'UTC+14:00 · Line Islands, Kiritimati' },
];

const METHODS = [
  {
    symbol: '☯',
    title: '太阳历推演',
    desc: '以太阳实际位置为基准，精算出生时刻对应的天文能量场，还原宇宙本真信息。',
  },
  {
    symbol: '✦',
    title: '紫微斗数',
    desc: '中国命理学最精密的体系，通过十四主星与十二宫位的交织，构建完整的命运蓝图。',
  },
  {
    symbol: '⚡',
    title: '六爻纳甲',
    desc: '源自《周易》的古老预测之法，以六十四卦为镜，洞见过去、现在与未来之变化。',
  },
  {
    symbol: '⊕',
    title: '八字命理',
    desc: '年柱、月柱、日柱、时柱四柱并立，天干地支相生相克，精准勾勒人生轨迹。',
  },
  {
    symbol: '◈',
    title: '五行生克',
    desc: '金木水火土五行之间的流转制衡，揭示您命中最需补益与需注意的能量维度。',
  },
  {
    symbol: '◯',
    title: '奇门遁甲',
    desc: '道家最高级的时空运算体系，综合天时、地利、人和三维度给出精准人生指引。',
  },
];

const MOCK_RESULT = {
  pattern: '坤命火局，贵人福星照命',
  elements: [
    { name: '木', value: 15, color: '#4a7c59' },
    { name: '火', value: 32, color: '#c0392b' },
    { name: '土', value: 28, color: '#b8935a' },
    { name: '金', value: 10, color: '#8e8e8e' },
    { name: '水', value: 15, color: '#2980b9' },
  ],
  ziwei: '紫微星临命宫，气宇不凡，天生领导气质，适合开创事业。辅以天府星，财帛充盈，中晚年运势尤为旺盛。',
  liuyao: {
    hexagram: '水火既济',
    interpretation: '六爻卦象得"水火既济"，阴阳已成平衡之势，当前阶段宜守成、深耕，方能积蓄能量以待来年腾飞之机。',
  },
  annual: '2025年流年太岁"乙巳"蛇年入命，事业宫文曲星聚集，学业与创作方向大吉。三月至六月为黄金期，宜主动出击。',
  advice: [
    '命局偏火，需以水性事物调候——靠近江河湖海，或从事水利、金融、航运等行业为宜',
    '今年农历三月（4月）为关键转折点，宜把握贵人提携机遇，勿因犹豫错失',
    '健康方面注意心脏与眼睛，作息规律、减少熬夜，方能保住旺盛的火性能量',
    '感情宫有吉星照临，今年下半年缘分显现，属水之人与您最为相配',
  ],
};

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

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [form, setForm] = useState({
    email: '',
    gender: '',
    year: '',
    month: '',
    day: '',
    shichen: '',
    timezone: '+08:00',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  const years = Array.from({ length: 120 }, (_, i) => 2010 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.gender || !form.year || !form.month || !form.day || !form.shichen) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 2200);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const inputCls =
    'w-full bg-transparent border border-[#B8925A]/30 rounded-none px-4 py-3 text-[#1A0F05] placeholder-[#1A0F05]/30 focus:outline-none focus:border-[#B8925A] transition-colors duration-300 text-sm';

  const selectCls =
    'w-full bg-[#F7F3EC] border border-[#B8925A]/30 rounded-none px-4 py-3 text-[#1A0F05] focus:outline-none focus:border-[#B8925A] transition-colors duration-300 text-sm appearance-none cursor-pointer';

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: '#F7F3EC', fontFamily: "'Noto Serif SC', serif" }}
    >

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-5"
        style={{ backgroundColor: 'rgba(247,243,236,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(184,146,90,0.15)' }}>
        <div className="flex items-center gap-3">
          <span className="text-[#B8925A] text-lg">☯</span>
          <span className="text-[#1A0F05] tracking-[0.2em] text-sm" style={{ fontFamily: "'Noto Serif SC', serif" }}>
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
            <h2 className="text-[#1A0F05] mb-8 leading-snug"
              style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 300, letterSpacing: '0.04em' }}>
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
                <div className="text-[#B8925A] text-3xl mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
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
        className="py-28 px-8 md:px-16"
        style={{ backgroundColor: '#F0EBE1' }}
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
            <h2 className="text-[#1A0F05] mb-4"
              style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 300, letterSpacing: '0.04em' }}>
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
            <div>
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                邮箱 · Email
              </label>
              <input
                type="email"
                placeholder="请输入您的邮箱"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                性别 · Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, gender: 'male' })}
                  className={`py-3 border transition-all duration-300 text-sm ${form.gender === 'male' ? 'border-[#B8925A] bg-[#B8925A]/10 text-[#1A0F05]' : 'border-[#B8925A]/30 text-[#1A0F05]/60 hover:border-[#B8925A]/50'}`}
                >
                  男 · Male
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, gender: 'female' })}
                  className={`py-3 border transition-all duration-300 text-sm ${form.gender === 'female' ? 'border-[#B8925A] bg-[#B8925A]/10 text-[#1A0F05]' : 'border-[#B8925A]/30 text-[#1A0F05]/60 hover:border-[#B8925A]/50'}`}
                >
                  女 · Female
                </button>
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                出生年月日 · Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className={selectCls}
                    required
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
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className={selectCls}
                    required
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
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className={selectCls}
                    required
                  >
                    <option value="">日</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d} 日</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
                </div>
              </div>
            </div>

            {/* Birth Shichen */}
            <div>
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                出生时辰 · Birth Hour (Chinese 2-hr Period)
              </label>
              <div className="relative">
                <select
                  value={form.shichen}
                  onChange={(e) => setForm({ ...form, shichen: e.target.value })}
                  className={selectCls}
                  required
                >
                  <option value="">请选择出生时辰</option>
                  {SHICHEN.map(({ value, label, animal }) => (
                    <option key={value} value={value}>{label} · {animal}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
              </div>
              <p className="mt-2 text-[#1A0F05]/35 text-xs tracking-wide">
                * 时辰以出生当地时间为准，若不知确切时辰，可选择大致时段
              </p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-[#1A0F05]/60 text-xs tracking-widest mb-2">
                出生地时区 · Birth Location Timezone
              </label>
              <div className="relative">
                <select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className={selectCls}
                >
                  {TIMEZONES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B8925A]/60 text-xs">▾</span>
              </div>
              <p className="mt-2 text-[#1A0F05]/35 text-xs tracking-wide">
                * 时区用于将当地时间反算至北京标准时（UTC+8），确保命盘精准
              </p>
            </div>

            {/* Price + Submit */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[#1A0F05]/50 text-xs tracking-wider">本次命理推算费用</span>
                <span className="text-[#1A0F05]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 300 }}>
                  $1.99 <span className="text-xs text-[#1A0F05]/40" style={{ fontSize: '0.75rem' }}>USD</span>
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
        {submitted && (
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
              <h2 className="text-[#1A0F05] mb-3"
                style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300, letterSpacing: '0.04em' }}>
                {form.email} · {MOCK_RESULT.pattern}
              </h2>
              <Divider />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Five Elements */}
              <div className="border border-[#B8925A]/20 p-8">
                <h3 className="text-[#1A0F05] tracking-widest text-sm mb-6" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  五行能量分布
                </h3>
                <div className="space-y-4">
                  {MOCK_RESULT.elements.map(({ name, value, color }) => (
                    <div key={name}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#1A0F05]/70 tracking-widest">{name}</span>
                        <span className="text-[#1A0F05]/50">{value}%</span>
                      </div>
                      <div className="h-px bg-[#1A0F05]/10 relative">
                        <motion.div
                          className="absolute top-0 left-0 h-full"
                          style={{ backgroundColor: color, opacity: 0.7 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Annual Fortune */}
              <div className="border border-[#B8925A]/20 p-8">
                <h3 className="text-[#1A0F05] tracking-widest text-sm mb-5" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  流年运势
                </h3>
                <p className="text-[#1A0F05]/60 text-xs leading-loose tracking-wide">
                  {MOCK_RESULT.annual}
                </p>
              </div>

              {/* Purple Star */}
              <div className="border border-[#B8925A]/20 p-8">
                <h3 className="text-[#1A0F05] tracking-widest text-sm mb-5" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  紫微斗数 · 命宫解析
                </h3>
                <p className="text-[#1A0F05]/60 text-xs leading-loose tracking-wide">
                  {MOCK_RESULT.ziwei}
                </p>
              </div>

              {/* Liu Yao */}
              <div className="border border-[#B8925A]/20 p-8">
                <h3 className="text-[#1A0F05] tracking-widest text-sm mb-5" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  六爻卦象 · {MOCK_RESULT.liuyao.hexagram.split('·')[0] || '水火既济'}
                </h3>
                <p className="text-[#1A0F05]/60 text-xs leading-loose tracking-wide">
                  {MOCK_RESULT.liuyao.interpretation}
                </p>
              </div>
            </div>

            {/* Advice */}
            <div className="mt-8 border border-[#B8925A]/20 p-8">
              <h3 className="text-[#1A0F05] tracking-widest text-sm mb-6" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                道家指引 · 四项建议
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                {MOCK_RESULT.advice.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-[#B8925A] text-xs mt-0.5 flex-shrink-0">
                      {['☰', '☵', '☲', '☷'][i]}
                    </span>
                    <p className="text-[#1A0F05]/60 text-xs leading-loose tracking-wide">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-10">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ email: '', gender: '', year: '', month: '', day: '', shichen: '', timezone: '+08:00' });
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

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-[#B8925A]/15 py-14 px-8 md:px-16"
        style={{ backgroundColor: '#F0EBE1' }}>
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