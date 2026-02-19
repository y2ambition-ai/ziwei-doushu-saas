'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User, Calendar, MapPin, Clock, Sparkles, ChevronDown } from 'lucide-react';
import { searchCities, City } from '@/lib/location/cities';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  email: string;
  gender: 'male' | 'female' | '';
  birthDate: string;
  birthTime: number;
  birthMinute: number;
  birthCity: string;
}

interface FormErrors {
  email?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
}

interface AstrolabeFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHICHEN_OPTIONS = [
  { value: 0, label: '子时', time: '23:00-01:00', emoji: '🐀' },
  { value: 1, label: '丑时', time: '01:00-03:00', emoji: '🐂' },
  { value: 2, label: '寅时', time: '03:00-05:00', emoji: '🐅' },
  { value: 3, label: '卯时', time: '05:00-07:00', emoji: '🐇' },
  { value: 4, label: '辰时', time: '07:00-09:00', emoji: '🐉' },
  { value: 5, label: '巳时', time: '09:00-11:00', emoji: '🐍' },
  { value: 6, label: '午时', time: '11:00-13:00', emoji: '🐴' },
  { value: 7, label: '未时', time: '13:00-15:00', emoji: '🐑' },
  { value: 8, label: '申时', time: '15:00-17:00', emoji: '🐵' },
  { value: 9, label: '酉时', time: '17:00-19:00', emoji: '🐔' },
  { value: 10, label: '戌时', time: '19:00-21:00', emoji: '🐕' },
  { value: 11, label: '亥时', time: '21:00-23:00', emoji: '🐷' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AstrolabeForm({ onSubmit, isLoading }: AstrolabeFormProps) {
  const [form, setForm] = useState<FormData>({
    email: '',
    gender: '',
    birthDate: '',
    birthTime: 6,
    birthMinute: 0,
    birthCity: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [cityQuery, setCityQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // 城市搜索结果
  const cityResults = useMemo(() => {
    if (!cityQuery) return [];
    return searchCities(cityQuery, 5);
  }, [cityQuery]);

  // 处理城市选择
  const handleCitySelect = (city: City) => {
    setForm(prev => ({ ...prev, birthCity: city.name }));
    setCityQuery(city.name);
    setShowCityDropdown(false);
    setErrors(prev => ({ ...prev, birthCity: undefined }));
  };

  // 表单验证
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!form.gender) {
      newErrors.gender = '请选择性别';
    }

    if (!form.birthDate) {
      newErrors.birthDate = '请选择出生日期';
    }

    if (!form.birthCity) {
      newErrors.birthCity = '请选择出生城市';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 邮箱 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-amber-200/80">
          邮箱 · Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
          <input
            type="email"
            value={form.email}
            onChange={e => {
              setForm(prev => ({ ...prev, email: e.target.value }));
              setErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="your@email.com"
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-amber-500/30 rounded-lg
                       text-white placeholder-amber-100/30
                       focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50
                       transition-all duration-300"
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email}</p>
        )}
      </div>

      {/* 性别 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-amber-200/80">
          性别 · Gender
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setForm(prev => ({ ...prev, gender: 'male' }));
              setErrors(prev => ({ ...prev, gender: undefined }));
            }}
            className={`py-3 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2
              ${form.gender === 'male'
                ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                : 'bg-black/40 border-amber-500/30 text-amber-100/60 hover:border-amber-400/50'
              }`}
          >
            <User className="w-5 h-5" />
            男
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(prev => ({ ...prev, gender: 'female' }));
              setErrors(prev => ({ ...prev, gender: undefined }));
            }}
            className={`py-3 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2
              ${form.gender === 'female'
                ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                : 'bg-black/40 border-amber-500/30 text-amber-100/60 hover:border-amber-400/50'
              }`}
          >
            <User className="w-5 h-5" />
            女
          </button>
        </div>
        {errors.gender && (
          <p className="text-red-400 text-sm">{errors.gender}</p>
        )}
      </div>

      {/* 出生日期 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-amber-200/80">
          出生日期 · Birth Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
          <input
            type="date"
            value={form.birthDate}
            onChange={e => {
              setForm(prev => ({ ...prev, birthDate: e.target.value }));
              setErrors(prev => ({ ...prev, birthDate: undefined }));
            }}
            max={new Date().toISOString().split('T')[0]}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-amber-500/30 rounded-lg
                       text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50
                       transition-all duration-300
                       [color-scheme:dark]"
          />
        </div>
        {errors.birthDate && (
          <p className="text-red-400 text-sm">{errors.birthDate}</p>
        )}
      </div>

      {/* 出生时辰 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-amber-200/80">
          出生时辰 · Birth Hour
        </label>
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
          <select
            value={form.birthTime}
            onChange={e => setForm(prev => ({ ...prev, birthTime: Number(e.target.value) }))}
            className="w-full pl-12 pr-10 py-3 bg-black/40 border border-amber-500/30 rounded-lg
                       text-white appearance-none cursor-pointer
                       focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50
                       transition-all duration-300"
          >
            {SHICHEN_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label} ({option.time})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50 pointer-events-none" />
        </div>
      </div>

      {/* 出生城市 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-amber-200/80">
          出生城市 · Birth City
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50 z-10" />
          <input
            type="text"
            value={cityQuery}
            onChange={e => {
              setCityQuery(e.target.value);
              setShowCityDropdown(true);
              if (!e.target.value) {
                setForm(prev => ({ ...prev, birthCity: '' }));
              }
            }}
            onFocus={() => setShowCityDropdown(true)}
            placeholder="输入城市名搜索..."
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-amber-500/30 rounded-lg
                       text-white placeholder-amber-100/30
                       focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50
                       transition-all duration-300"
          />

          {/* 城市下拉列表 */}
          <AnimatePresence>
            {showCityDropdown && cityResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-2 bg-black/90 border border-amber-500/30 rounded-lg
                           shadow-xl shadow-amber-900/20 overflow-hidden"
              >
                {cityResults.map(city => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-amber-500/20 transition-colors
                               flex items-center justify-between"
                  >
                    <span className="text-amber-100">{city.name}</span>
                    <span className="text-amber-400/50 text-sm">{city.province}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.birthCity && (
          <p className="text-red-400 text-sm">{errors.birthCity}</p>
        )}
      </div>

      {/* 提交按钮 */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500
                   text-white font-medium rounded-lg shadow-lg shadow-amber-900/30
                   hover:from-amber-500 hover:to-amber-400
                   focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-300
                   flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <span>正在推算...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>开始排盘解读</span>
          </>
        )}
      </motion.button>

      {/* 提示信息 */}
      <p className="text-center text-amber-200/40 text-sm">
        准确的出生时间和地点能让命盘解读更精准
      </p>
    </form>
  );
}
