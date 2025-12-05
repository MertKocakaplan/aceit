import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SixMonthTrend = ({ trendData }) => {
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

  // Grafik verisi
  const chartData = trendData.map(month => ({
    month: month.monthName.split(' ')[0], // Sadece ay adı
    saat: month.durationHours,
    başarı: month.successRate,
    oturum: month.sessions,
  }));

  // Trend analizi (ilk ve son ay karşılaştırması)
  const firstMonth = trendData[0];
  const lastMonth = trendData[trendData.length - 1];

  const hoursTrend = lastMonth.durationHours - firstMonth.durationHours;
  const successTrend = lastMonth.successRate - firstMonth.successRate;

  const isHoursUp = hoursTrend > 0;
  const isSuccessUp = successTrend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-elegant overflow-hidden"
    >
      {/* Indigo Gradient Header with Diagonal Stripes */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 overflow-hidden">
        {/* Diagonal Stripe Pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="w-full h-full">
            <defs>
              <pattern id="diagonalStripes" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect x="0" y="0" width="20" height="40" fill="white" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalStripes)" />
          </svg>
        </div>

        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-normal text-white font-display">
                  Son 6 Aylık Trend Analizi
                </h3>
                <p className="text-sm text-indigo-100 font-display">
                  Aylık çalışma saati ve başarı oranı gelişimi
                </p>
              </div>
            </div>

            {/* Trend Indicators */}
            <div className="flex gap-3">
              {/* Hours Trend */}
              <div className={`px-4 py-2 rounded-xl backdrop-blur-sm border ${
                isHoursUp
                  ? 'bg-green-500/20 border-green-400/30'
                  : 'bg-red-500/20 border-red-400/30'
              }`}>
                <div className="flex items-center gap-2">
                  {isHoursUp ? (
                    <ArrowUpRight className="w-4 h-4 text-green-200" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-200" />
                  )}
                  <div>
                    <p className="text-xs text-white/80 font-display">Çalışma Saati</p>
                    <p className={`text-sm font-semibold font-display ${
                      isHoursUp ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {isHoursUp ? '+' : ''}{hoursTrend.toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Trend */}
              <div className={`px-4 py-2 rounded-xl backdrop-blur-sm border ${
                isSuccessUp
                  ? 'bg-green-500/20 border-green-400/30'
                  : 'bg-red-500/20 border-red-400/30'
              }`}>
                <div className="flex items-center gap-2">
                  {isSuccessUp ? (
                    <ArrowUpRight className="w-4 h-4 text-green-200" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-200" />
                  )}
                  <div>
                    <p className="text-xs text-white/80 font-display">Başarı Oranı</p>
                    <p className={`text-sm font-semibold font-display ${
                      isSuccessUp ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {isSuccessUp ? '+' : ''}{successTrend.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area with Decorative Elements */}
      <div className="relative p-8">
        {/* Top Decorative Corner Accents */}
        <div className="absolute top-0 left-8 w-16 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></div>
        <div className="absolute top-0 right-8 w-16 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"></div>

        {/* Side Accent Lines */}
        <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-indigo-500 via-violet-500 to-indigo-500 rounded-r-full"></div>
        <div className="absolute right-0 top-8 bottom-8 w-1 bg-gradient-to-b from-indigo-500 via-violet-500 to-indigo-500 rounded-l-full"></div>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-neutral-700"
              opacity={0.5}
            />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              className="dark:stroke-neutral-400"
              style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#6366f1"
              className="dark:stroke-indigo-400"
              style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
              label={{
                value: 'Saat',
                angle: -90,
                position: 'insideLeft',
                style: { fontFamily: 'Quicksand', fill: '#6366f1' }
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              className="dark:stroke-emerald-400"
              style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
              label={{
                value: 'Başarı %',
                angle: 90,
                position: 'insideRight',
                style: { fontFamily: 'Quicksand', fill: '#10b981' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px', fontFamily: 'Quicksand' }}
              iconType="circle"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="saat"
              stroke="url(#indigoGradient)"
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 6, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8 }}
              name="Çalışma Saati"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="başarı"
              stroke="url(#emeraldGradient)"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8 }}
              name="Başarı Oranı (%)"
            />
            <defs>
              <linearGradient id="indigoGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Bar */}
      <div className="relative px-8 py-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-50 dark:from-indigo-950/20 dark:via-violet-950/20 dark:to-indigo-950/20 border-t-2 border-indigo-100 dark:border-indigo-900">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
              Ortalama: {(trendData.reduce((sum, m) => sum + m.durationHours, 0) / trendData.length).toFixed(1)} saat/ay
            </span>
          </div>
          <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
              Ortalama: %{(trendData.reduce((sum, m) => sum + m.successRate, 0) / trendData.length).toFixed(1)} başarı
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SixMonthTrend;
