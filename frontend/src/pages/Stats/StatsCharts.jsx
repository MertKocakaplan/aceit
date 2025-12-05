import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  TrendingUp,
} from 'lucide-react';

const StatsCharts = ({ data, onTimeRangeChange }) => {
  const { daily, weekly, monthly, subjectBreakdown } = data;
  const [timeRange, setTimeRange] = useState(7); // 7 veya 30 gün
  const [comparisonType, setComparisonType] = useState('weekly'); // weekly veya monthly

  // TimeRange değişince parent'a bildir
  useEffect(() => {
    if (onTimeRangeChange) {
      onTimeRangeChange(timeRange);
    }
  }, [timeRange, onTimeRangeChange]);

  // Renk paleti
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

  // Günlük veriyi grafik formatına çevir
  const dailyChartData = daily.map((day) => ({
    date: new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    dakika: day.duration,
    soru: day.correct + day.wrong + day.empty,
    doğru: day.correct,
  }));

  // Ders dağılımı grafik formatı
  const subjectChartData = subjectBreakdown.map((item) => ({
    name: item.subject.name,
    value: item.duration,
    color: item.subject.color,
  }));

  // Karşılaştırma verisi
  const comparisonData = comparisonType === 'weekly' ? weekly : monthly;
  const comparisonLabel = comparisonType === 'weekly' ? 'Hafta' : 'Ay';

  const comparisonChartData = [
    {
      name: `Geçen ${comparisonLabel}`,
      çalışma: comparisonType === 'weekly' ? weekly.lastWeek.duration : monthly.lastMonth.duration,
      doğru: comparisonType === 'weekly' ? weekly.lastWeek.correct : monthly.lastMonth.correct,
    },
    {
      name: `Bu ${comparisonLabel}`,
      çalışma: comparisonType === 'weekly' ? weekly.thisWeek.duration : monthly.thisMonth.duration,
      doğru: comparisonType === 'weekly' ? weekly.thisWeek.correct : monthly.thisMonth.correct,
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-4 rounded-xl shadow-elegant border border-neutral-200 dark:border-neutral-700">
          <p className="font-medium text-neutral-800 dark:text-neutral-200 mb-2 font-display">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-display" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* 1. Günlük Çalışma Grafiği - Blue Wave Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-elegant overflow-hidden"
      >
        {/* Decorative Top Wave Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 overflow-hidden">
          {/* Wave Pattern SVG Background */}
          <div className="absolute inset-0 opacity-[0.15]">
            <svg className="w-full h-full">
              <defs>
                <pattern id="wavePattern" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 10 Q 25 0, 50 10 T 100 10" fill="none" stroke="white" strokeWidth="2" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#wavePattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-normal text-white font-display">
                  Günlük Çalışma İlerlemesi
                </h3>
                <p className="text-sm text-blue-100 font-display">
                  Son {timeRange} günlük performans detayı
                </p>
              </div>
            </div>
            {/* Time Range Toggle */}
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              <button
                onClick={() => setTimeRange(7)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all font-display ${
                  timeRange === 7
                    ? 'bg-white text-blue-700 shadow-elegant'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                7 Gün
              </button>
              <button
                onClick={() => setTimeRange(30)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all font-display ${
                  timeRange === 30
                    ? 'bg-white text-blue-700 shadow-elegant'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                30 Gün
              </button>
            </div>
          </div>
        </div>

        {/* Chart Area with Subtle Side Accent */}
        <div className="relative">
          {/* Left Blue Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400"></div>

          <div className="p-8 pl-12">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  className="dark:stroke-neutral-400"
                  style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
                />
                <YAxis
                  stroke="#6b7280"
                  className="dark:stroke-neutral-400"
                  style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', fontFamily: 'Quicksand' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="dakika"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Çalışma (dk)"
                />
                <Line
                  type="monotone"
                  dataKey="doğru"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Doğru Cevap"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* 2. Dönemsel Karşılaştırma - Purple Side Panel Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-elegant overflow-hidden"
      >
        <div className="flex">
          {/* Purple Decorative Sidebar */}
          <div className="relative w-2 bg-gradient-to-b from-purple-600 via-purple-700 to-pink-600 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="purpleDots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#purpleDots)" />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal text-neutral-800 dark:text-neutral-200 font-display">
                      Dönemsel Karşılaştırma
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display">
                      Bu {comparisonLabel.toLowerCase()} vs geçen {comparisonLabel.toLowerCase()}
                    </p>
                  </div>
                </div>
                {/* Comparison Type Toggle */}
                <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                  <button
                    onClick={() => setComparisonType('weekly')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all font-display ${
                      comparisonType === 'weekly'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-elegant'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    Haftalık
                  </button>
                  <button
                    onClick={() => setComparisonType('monthly')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all font-display ${
                      comparisonType === 'monthly'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-elegant'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    Aylık
                  </button>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="p-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    className="dark:stroke-neutral-400"
                    style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    className="dark:stroke-neutral-400"
                    style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', fontFamily: 'Quicksand' }}
                    iconType="rect"
                  />
                  <Bar
                    dataKey="çalışma"
                    fill="url(#purpleGradient)"
                    radius={[12, 12, 0, 0]}
                    name="Çalışma (dk)"
                  />
                  <Bar
                    dataKey="doğru"
                    fill="url(#greenGradient)"
                    radius={[12, 12, 0, 0]}
                    name="Doğru Cevap"
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Ders Dağılımı - Pink Diagonal Accent Design */}
      {subjectBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-elegant overflow-hidden"
        >
          {/* Diagonal Decorative Corner */}
          <div className="absolute top-0 right-0 w-64 h-64 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/5 dark:to-rose-500/5 rotate-45 rounded-3xl"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/5 dark:to-rose-500/5 rotate-45 rounded-3xl"></div>
          </div>

          {/* Header with Rose Gradient Bottom Border */}
          <div className="relative p-6 border-b-4 border-gradient-to-r from-pink-500 via-rose-500 to-pink-600">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600"></div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl border border-pink-200 dark:border-pink-800">
                <PieChartIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal text-neutral-800 dark:text-neutral-200 font-display">
                  Ders Dağılımı ve Performans
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display">
                  Çalışma süresine göre detaylı ders analizi
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart with Decorative Frame */}
            <div className="relative">
              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-pink-300 dark:border-pink-700 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-pink-300 dark:border-pink-700 rounded-br-2xl"></div>

              <div className="flex items-center justify-center min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      style={{ fontFamily: 'Quicksand', fontSize: '12px' }}
                    >
                      {subjectChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ders Listesi with Individual Cards */}
            <div className="space-y-3">
              {subjectBreakdown.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Left Color Accent Bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-all group-hover:w-2"
                    style={{ backgroundColor: item.subject.color }}
                  ></div>

                  <div className="flex items-center justify-between p-4 pl-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border-2 border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-neutral-900"
                        style={{ backgroundColor: item.subject.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate font-display">
                          {item.subject.name}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-display">
                          {item.totalQuestions} soru · %{item.successRate} başarı
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                        {Math.floor(item.duration / 60)}s {item.duration % 60}dk
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-display">
                        {item.sessions} oturum
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Başarı Oranı Bar Chart - Green Bottom Accent Design */}
      {subjectBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-elegant overflow-hidden"
        >
          {/* Header with Cross Pattern Background */}
          <div className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="absolute inset-0 opacity-[0.06]">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="crossPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20 0 L20 40 M0 20 L40 20" stroke="currentColor" strokeWidth="1" className="text-green-600" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#crossPattern)" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-elegant border border-green-200 dark:border-green-800">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal text-neutral-800 dark:text-neutral-200 font-display">
                  Ders Bazlı Başarı Oranları
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display">
                  Hangi derste ne kadar başarılısın
                </p>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="relative p-8">
            {/* Bottom Green Gradient Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600"></div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={subjectBreakdown.map(item => ({
                  name: item.subject.name,
                  başarı: item.successRate,
                  fill: item.subject.color,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" opacity={0.5} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#6b7280"
                  className="dark:stroke-neutral-400"
                  style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6b7280"
                  className="dark:stroke-neutral-400"
                  style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="başarı"
                  radius={[0, 12, 12, 0]}
                  name="Başarı Oranı (%)"
                >
                  {subjectBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.subject.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StatsCharts;
