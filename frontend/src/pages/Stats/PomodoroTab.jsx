import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  TrendingUp,
  Award,
  Coffee,
} from 'lucide-react';
import { GlassCard } from '../../ui';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const PomodoroTab = ({ pomodoroData }) => {
  // Günlük grafik verisi
  const dailyChartData = pomodoroData.daily?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    sayı: day.count,
    dakika: day.duration,
  })) || [];

  // Haftalık trend verisi
  const weeklyChartData = pomodoroData.weeklyTrend?.map((week) => ({
    hafta: new Date(week.week).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    sayı: week.count,
    dakika: week.duration,
  })) || [];

  // Saatlik dağılım verisi
  const hourlyChartData = pomodoroData.hourlyDistribution?.map((count, hour) => ({
    saat: `${hour.toString().padStart(2, '0')}:00`,
    pomodoro: count,
  })) || [];

  // Mode dağılımı
  const modeLabels = {
    work: 'Çalışma',
    short_break: 'Kısa Mola',
    long_break: 'Uzun Mola',
  };

  const modeColors = {
    work: '#3b82f6',
    short_break: '#10b981',
    long_break: '#8b5cf6',
  };

  const modeChartData = pomodoroData.modeDistribution?.map((mode) => ({
    name: modeLabels[mode.mode] || mode.mode,
    count: mode.count,
    color: modeColors[mode.mode] || '#6b7280',
  })) || [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl">
                <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Pomodoro</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {pomodoroData.total?.count || 0}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {pomodoroData.total?.durationHours || 0} saat çalışma
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Günlük Ortalama</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {pomodoroData.averageDaily || 0}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Son 30 gün
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Bu Hafta</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {pomodoroData.daily?.reduce((sum, day) => sum + day.count, 0) || 0}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Son 7 gün
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Süre</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {pomodoroData.total?.durationHours || 0}s
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Tüm zamanlar
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* En Üretken Saatler */}
      {pomodoroData.productiveHours && pomodoroData.productiveHours.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                En Üretken Saatler
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hangi saatlerde daha çok pomodoro yapıyorsun
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {pomodoroData.productiveHours.map((item, index) => (
              <div
                key={index}
                className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
              >
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {item.hour.toString().padStart(2, '0')}:00
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.count} pomodoro
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Günlük Pomodoro Grafiği */}
      {dailyChartData.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Son 7 Günlük Pomodoro
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Günlük pomodoro sayısı ve süre
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="sayı"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Pomodoro Sayısı"
              />
              <Line
                type="monotone"
                dataKey="dakika"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Süre (dk)"
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Haftalık Trend */}
      {weeklyChartData.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Haftalık Trend
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Son 4 hafta performans
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="hafta" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
              <Bar dataKey="sayı" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Pomodoro Sayısı" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Saatlik Dağılım Heatmap */}
      {hourlyChartData.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                24 Saatlik Dağılım
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hangi saatlerde ne kadar pomodoro yapıyorsun
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="saat" stroke="#6b7280" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pomodoro" radius={[4, 4, 0, 0]} name="Pomodoro">
                {hourlyChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pomodoro > 0 ? '#f59e0b' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Mode Dağılımı */}
      {modeChartData.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
              <Coffee className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Çalışma ve Mola Dağılımı
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toplam oturum sayısı
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {modeChartData.map((mode, index) => (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${mode.color}20` }}
              >
                <div className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: mode.color }}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{mode.name}</p>
                  <p className="text-2xl font-bold" style={{ color: mode.color }}>
                    {mode.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default PomodoroTab;