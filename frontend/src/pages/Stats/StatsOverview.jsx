import { motion } from 'framer-motion';
import {
  Clock,
  Target,
  TrendingUp,
  Award,
  Flame,
  Trophy,
  Calendar,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { GlassCard } from '../../ui';

const StatsOverview = ({ data }) => {
  // Veri kontrolü - undefined veya eksik veri varsa default değerler kullan
  const summary = data?.summary || {};
  const streak = data?.streak || { currentStreak: 0, longestStreak: 0, totalStudyDays: 0 };
  const records = data?.records || { daily: {}, weekly: {} };
  const preparation = data?.preparation || { percentage: 0, studiedTopics: 0, totalTopics: 0 };
  const velocity = data?.velocity || { status: 'normal', currentVelocity: 1.0, durationIncrease: 0, efficiencyChange: 0 };
  const weekly = data?.weekly || { 
    thisWeek: { duration: 0, correct: 0 }, 
    lastWeek: { duration: 0, correct: 0 },
    comparison: { durationChange: 0, questionsChange: 0 }
  };
  const successTrend = data?.successTrend || { 
    trend: [], 
    trendDirection: 'stable', 
    currentRate: 0 
  };
  
  // Trend ikonu
  const getTrendIcon = (direction) => {
    if (direction === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (direction === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };


  // Gelişim hızı durumu
  const getVelocityStatus = (status) => {
    const statusMap = {
      fast: { text: 'Hızlı', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
      normal: { text: 'Normal', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      slow: { text: 'Yavaş', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    };
    return statusMap[status] || statusMap.normal;
  };

  const velocityStatus = getVelocityStatus(velocity.status);

  return (
    <div className="space-y-6">
      {/* Ana Metrikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Çalışma Saati */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Çalışma</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {summary.totalDurationHours}s
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {summary.totalSessions} oturum · {summary.totalStudyDays} gün
            </div>
          </GlassCard>
        </motion.div>

        {/* Bu Hafta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Bu Hafta</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {Math.floor(weekly.thisWeek.duration / 60)}s
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {weekly.comparison.durationChange >= 0 ? (
                <ArrowUp className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDown className="w-3 h-3 text-red-500" />
              )}
              <span className={weekly.comparison.durationChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                %{Math.abs(weekly.comparison.durationChange)}
              </span>
              <span className="text-gray-500 dark:text-gray-500">geçen haftaya göre</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Mevcut Streak</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {streak.currentStreak} gün
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Rekor: {streak.longestStreak} gün 🏆
            </div>
          </GlassCard>
        </motion.div>

        {/* Hazırlık Yüzdesi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Hazırlık</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  %{preparation.percentage}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {preparation.studiedTopics}/{preparation.totalTopics} konu
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Performans Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Toplam Soru İstatistikleri */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Toplam Sorular
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tüm zamanlar
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Toplam Soru</span>
              <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {summary.totalQuestions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Doğru</span>
              <span className="text-xl font-bold text-green-600">
                {summary.totalCorrect}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Yanlış</span>
              <span className="text-xl font-bold text-red-600">
                {summary.totalWrong}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Boş</span>
              <span className="text-xl font-bold text-gray-500">
                {summary.totalEmpty}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200">Başarı Oranı</span>
                <span className="text-2xl font-bold text-blue-600">
                  %{summary.successRate}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Başarı Trendi */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Başarı Trendi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Son 4 hafta
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(successTrend.trendDirection)}
              <span className={`text-sm font-medium ${
                successTrend.trendDirection === 'up' ? 'text-green-600' :
                successTrend.trendDirection === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {successTrend.trendDirection === 'up' ? 'Yükseliyor' :
                 successTrend.trendDirection === 'down' ? 'Düşüyor' :
                 'Sabit'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {successTrend.trend.map((week, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                  {new Date(week.week).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${week.successRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 w-12 text-right">
                  %{week.successRate}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Rekorlar */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl">
            <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Rekorlar ve Başarılar
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              En iyi performansların
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Günlük Rekorlar */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Günlük Rekorlar
            </h4>
            {records.daily.mostQuestions && (
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Çok Soru</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(records.daily.mostQuestions.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {records.daily.mostQuestions.count}
                </span>
              </div>
            )}
            {records.daily.mostStudy && (
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Çok Çalışma</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(records.daily.mostStudy.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {Math.floor(records.daily.mostStudy.duration / 60)}s {records.daily.mostStudy.duration % 60}dk
                </span>
              </div>
            )}
          </div>

          {/* Haftalık Rekorlar */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Haftalık Rekorlar
            </h4>
            {records.weekly.mostQuestions && (
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Çok Soru</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(records.weekly.mostQuestions.weekStart).toLocaleDateString('tr-TR')} haftası
                  </p>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {records.weekly.mostQuestions.count}
                </span>
              </div>
            )}
            {records.weekly.mostStudy && (
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Çok Çalışma</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(records.weekly.mostStudy.weekStart).toLocaleDateString('tr-TR')} haftası
                  </p>
                </div>
                <span className="text-xl font-bold text-orange-600">
                  {Math.floor(records.weekly.mostStudy.duration / 60)}s
                </span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Gelişim Hızı */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Gelişim Hızı
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Son 2 hafta performans analizi
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${velocityStatus.bg}`}>
            <span className={`font-semibold ${velocityStatus.color}`}>
              {velocityStatus.text}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Öğrenme Katsayısı</p>
            <p className="text-3xl font-bold text-blue-600">
              {velocity.currentVelocity}x
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Çalışma Artışı</p>
            <p className="text-3xl font-bold text-green-600">
              {velocity.durationIncrease >= 0 ? '+' : ''}{velocity.durationIncrease}%
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verimlilik</p>
            <p className="text-3xl font-bold text-purple-600">
              {velocity.efficiencyChange >= 0 ? '+' : ''}{velocity.efficiencyChange}%
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default StatsOverview;