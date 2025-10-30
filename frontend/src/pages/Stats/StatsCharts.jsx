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
import { GlassCard } from '../../ui';

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
      {/* Günlük Çalışma Grafiği */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Günlük Çalışma İlerlemesi
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Son {timeRange} günlük performans
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === 7
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
              }`}
            >
              7 Gün
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === 30
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
              }`}
            >
              30 Gün
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="dakika" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Çalışma (dk)"
            />
            <Line 
              type="monotone" 
              dataKey="doğru" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Doğru Cevap"
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Haftalık/Aylık Karşılaştırma */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Dönemsel Karşılaştırma
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bu {comparisonLabel.toLowerCase()} vs geçen {comparisonLabel.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setComparisonType('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                comparisonType === 'weekly'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
              }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setComparisonType('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                comparisonType === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
              }`}
            >
              Aylık
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar 
              dataKey="çalışma" 
              fill="#8b5cf6" 
              radius={[8, 8, 0, 0]}
              name="Çalışma (dk)"
            />
            <Bar 
              dataKey="doğru" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              name="Doğru Cevap"
            />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Ders Dağılımı */}
      {subjectBreakdown.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-xl">
              <PieChartIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Ders Dağılımı ve Performans
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Çalışma süresine göre ders analizi
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
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
                  >
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Ders Listesi */}
            <div className="space-y-3">
              {subjectBreakdown.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.subject.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {item.subject.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.totalQuestions} soru · %{item.successRate} başarı
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {Math.floor(item.duration / 60)}s {item.duration % 60}dk
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.sessions} oturum
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Başarı Oranı Bar Chart */}
      {subjectBreakdown.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Ders Bazlı Başarı Oranları
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hangi derste ne kadar başarılısın
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={subjectBreakdown.map(item => ({
                name: item.subject.name,
                başarı: item.successRate,
                fill: item.subject.color,
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis type="number" domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="başarı" 
                radius={[0, 8, 8, 0]}
                name="Başarı Oranı (%)"
              >
                {subjectBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.subject.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  );
};

export default StatsCharts;