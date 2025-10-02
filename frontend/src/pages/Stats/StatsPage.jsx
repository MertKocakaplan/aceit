import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { statsAPI } from '../../api';
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
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  GlassCard,
  StatsCard,
} from '../../ui';

const StatsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    summary: null,
    daily: [],
    weekly: null,
    monthly: null,
    subjectBreakdown: [],
  });
  const [timeRange, setTimeRange] = useState(7); // 7 veya 30 gün

  useEffect(() => {
    fetchAllStats();
  }, [timeRange]);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [summary, daily, weekly, monthly, subjectBreakdown] = await Promise.all([
        statsAPI.getSummary(),
        statsAPI.getDaily(timeRange),
        statsAPI.getWeekly(),
        statsAPI.getMonthly(),
        statsAPI.getSubjectBreakdown(),
      ]);

      setStats({
        summary,
        daily,
        weekly,
        monthly,
        subjectBreakdown,
      });
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Renk paleti
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

  // Günlük veriyi grafik formatına çevir
  const dailyChartData = stats.daily.map((day) => ({
    date: new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    dakika: day.duration,
    soru: day.correct + day.wrong + day.empty,
    doğru: day.correct,
  }));

  // Ders dağılımı grafik formatı
  const subjectChartData = stats.subjectBreakdown.map((item) => ({
    name: item.subject.name,
    value: item.duration,
    color: item.subject.color,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              İstatistikler
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Çalışma performansını analiz et
            </p>
          </motion.div>

          {loading ? (
            <GlassCard className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </GlassCard>
          ) : (
            <>
              {/* Haftalık/Aylık Karşılaştırma */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bu Hafta */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        Bu Hafta
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        vs Geçen Hafta
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Çalışma Süresi</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {Math.floor(stats.weekly.thisWeek.duration / 60)}s {stats.weekly.thisWeek.duration % 60}dk
                        </p>
                        <p className={`text-sm ${stats.weekly.comparison.durationChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.weekly.comparison.durationChange >= 0 ? '+' : ''}{stats.weekly.comparison.durationChange}%
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Doğru Cevap</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {stats.weekly.thisWeek.correct}
                        </p>
                        <p className={`text-sm ${stats.weekly.comparison.questionsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.weekly.comparison.questionsChange >= 0 ? '+' : ''}{stats.weekly.comparison.questionsChange}%
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Bu Ay */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        Bu Ay
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        vs Geçen Ay
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Çalışma Süresi</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {Math.floor(stats.monthly.thisMonth.duration / 60)}s {stats.monthly.thisMonth.duration % 60}dk
                        </p>
                        <p className={`text-sm ${stats.monthly.comparison.durationChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.monthly.comparison.durationChange >= 0 ? '+' : ''}{stats.monthly.comparison.durationChange}%
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Doğru Cevap</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {stats.monthly.thisMonth.correct}
                        </p>
                        <p className={`text-sm ${stats.monthly.comparison.questionsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.monthly.comparison.questionsChange >= 0 ? '+' : ''}{stats.monthly.comparison.questionsChange}%
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Günlük Çalışma Grafiği */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      Günlük Çalışma
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTimeRange(7)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === 7
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      7 Gün
                    </button>
                    <button
                      onClick={() => setTimeRange(30)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === 30
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      30 Gün
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="dakika" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="doğru" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </GlassCard>

              {/* Ders Dağılımı */}
              {stats.subjectBreakdown.length > 0 && (
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                      <PieChartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      Ders Dağılımı
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {stats.subjectBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.subject.color }}
                            />
                            <span className="text-gray-800 dark:text-gray-200 font-medium">
                              {item.subject.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                              {Math.floor(item.duration / 60)}s {item.duration % 60}dk
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {item.totalQuestions} soru ({item.successRate}%)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StatsPage;