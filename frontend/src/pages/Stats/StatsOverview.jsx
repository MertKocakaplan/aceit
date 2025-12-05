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
  Zap,
  BarChart3,
  Brain,
  Sparkles,
  Loader2,
} from 'lucide-react';

const StatsOverview = ({ data, aiAnalysis, aiLoading }) => {
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
    return <Minus className="w-4 h-4 text-neutral-400" />;
  };

  // Gelişim hızı durumu
  const getVelocityStatus = (status) => {
    const statusMap = {
      fast: { text: 'Hızlı', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700' },
      normal: { text: 'Normal', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' },
      slow: { text: 'Yavaş', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300 dark:border-orange-700' },
    };
    return statusMap[status] || statusMap.normal;
  };

  const velocityStatus = getVelocityStatus(velocity.status);

  return (
    <div className="space-y-8">
      {/* Hero Stats Banner - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 rounded-3xl p-8 overflow-hidden shadow-elegant-xl"
      >
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="statsHeroPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1.5" fill="white" />
                <circle cx="30" cy="30" r="1.5" fill="white" />
                <circle cx="55" cy="55" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#statsHeroPattern)" />
          </svg>
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        {/* Header */}
        <div className="relative z-10 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-normal text-white font-display tracking-wide">
                Genel Performans
              </h2>
              <p className="text-secondary-200 font-sans">Tüm zamanlar için özet</p>
            </div>
          </div>
        </div>

        {/* 4-Column Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Toplam Çalışma */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-white/0 group-hover:bg-white/10 rounded-2xl blur transition duration-500" />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 group-hover:border-white/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-secondary-200" />
                <p className="text-sm text-secondary-200/90 font-sans">Toplam Çalışma</p>
              </div>
              <p className="text-5xl font-normal text-white font-display tracking-wide mb-1">
                {summary.totalDurationHours}<span className="text-2xl text-secondary-100">s</span>
              </p>
              <p className="text-xs text-secondary-200 font-sans">
                {summary.totalSessions} oturum · {summary.totalStudyDays} gün
              </p>
            </div>
          </motion.div>

          {/* Bu Hafta */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-white/0 group-hover:bg-white/10 rounded-2xl blur transition duration-500" />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 group-hover:border-white/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-secondary-200" />
                <p className="text-sm text-secondary-200/90 font-sans">Bu Hafta</p>
              </div>
              <p className="text-5xl font-normal text-white font-display tracking-wide mb-1">
                {Math.floor(weekly.thisWeek.duration / 60)}<span className="text-2xl text-secondary-100">s</span>
              </p>
              <div className="flex items-center gap-1 text-xs">
                {weekly.comparison.durationChange >= 0 ? (
                  <ArrowUp className="w-3 h-3 text-green-300" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-300" />
                )}
                <span className={`font-medium ${weekly.comparison.durationChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  %{Math.abs(weekly.comparison.durationChange)}
                </span>
                <span className="text-secondary-200 font-sans">geçen hafta</span>
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-white/0 group-hover:bg-white/10 rounded-2xl blur transition duration-500" />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 group-hover:border-white/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-5 h-5 text-orange-300" />
                <p className="text-sm text-secondary-200/90 font-sans">Streak</p>
              </div>
              <p className="text-5xl font-normal text-white font-display tracking-wide mb-1">
                {streak.currentStreak}<span className="text-2xl text-secondary-100"> gün</span>
              </p>
              <p className="text-xs text-secondary-200 font-sans">
                Rekor: {streak.longestStreak} gün 🏆
              </p>
            </div>
          </motion.div>

          {/* Hazırlık */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-white/0 group-hover:bg-white/10 rounded-2xl blur transition duration-500" />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 group-hover:border-white/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-5 h-5 text-green-300" />
                <p className="text-sm text-secondary-200/90 font-sans">Hazırlık</p>
              </div>
              <p className="text-5xl font-normal text-white font-display tracking-wide mb-1">
                %{preparation.percentage}
              </p>
              <p className="text-xs text-secondary-200 font-sans">
                {preparation.studiedTopics}/{preparation.totalTopics} konu
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Dual Column Layout - Soru İstatistikleri & Başarı Trendi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Toplam Soru İstatistikleri - Modern Horizontal Layout */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-elegant-xl p-8 overflow-hidden"
        >
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/20 dark:from-primary-900/10 to-transparent rounded-bl-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl">
                <CheckCircle className="w-6 h-6 text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-2xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                  Toplam Sorular
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                  Tüm zamanlar
                </p>
              </div>
            </div>

            {/* Horizontal bars for stats */}
            <div className="space-y-4">
              {/* Toplam */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">Toplam Soru</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white font-display">
                    {summary.totalQuestions}
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-600 to-primary-800 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Doğru */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">Doğru</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400 font-display">
                    {summary.totalCorrect}
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-700 rounded-full transition-all duration-1000"
                    style={{ width: `${(summary.totalCorrect / summary.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Yanlış */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">Yanlış</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400 font-display">
                    {summary.totalWrong}
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-700 rounded-full transition-all duration-1000"
                    style={{ width: `${(summary.totalWrong / summary.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Boş */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">Boş</span>
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-display">
                    {summary.totalEmpty}
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-700 rounded-full transition-all duration-1000"
                    style={{ width: `${(summary.totalEmpty / summary.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Başarı Oranı - Highlighted */}
              <div className="mt-6 pt-6 border-t-2 border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-neutral-900 dark:text-white font-display">Başarı Oranı</span>
                  <span className="text-4xl font-bold text-primary-700 dark:text-primary-400 font-display">
                    %{summary.successRate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Başarı Trendi - Vertical Bars */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-elegant-xl p-8 overflow-hidden"
        >
          {/* Decorative corner */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary-100/20 dark:from-secondary-900/10 to-transparent rounded-br-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-primary-700 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                    Başarı Trendi
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                    Son 4 hafta
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/50 rounded-full">
                {getTrendIcon(successTrend.trendDirection)}
                <span className={`text-sm font-medium ${
                  successTrend.trendDirection === 'up' ? 'text-green-600 dark:text-green-400' :
                  successTrend.trendDirection === 'down' ? 'text-red-600 dark:text-red-400' :
                  'text-neutral-600 dark:text-neutral-400'
                } font-sans`}>
                  {successTrend.trendDirection === 'up' ? 'Yükseliyor' :
                   successTrend.trendDirection === 'down' ? 'Düşüyor' :
                   'Sabit'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {successTrend.trend.map((week, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 w-24 font-sans">
                    {new Date(week.week).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex-1 relative h-8 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${week.successRate}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-500 dark:via-primary-600 dark:to-primary-700 rounded-xl relative overflow-hidden"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                    </motion.div>
                  </div>
                  <span className="text-lg font-bold text-neutral-900 dark:text-white w-16 text-right font-display">
                    %{week.successRate}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rekorlar - Horizontal Split */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-elegant-xl overflow-hidden"
      >
        {/* Decorative header bar */}
        <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-600 dark:via-amber-700 dark:to-amber-800 p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.08]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="recordsPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.8" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#recordsPattern)" />
            </svg>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-normal text-white font-display tracking-wide">
                Rekorlar ve Başarılar
              </h3>
              <p className="text-amber-100 font-sans">En iyi performansların</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Günlük Rekorlar */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-neutral-900 dark:text-white font-display mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
              Günlük Rekorlar
            </h4>
            {records.daily.mostQuestions && (
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex justify-between items-center p-4 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded-xl backdrop-blur-sm">
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">En Çok Soru</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 font-sans">
                      {new Date(records.daily.mostQuestions.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-display">
                    {records.daily.mostQuestions.count}
                  </span>
                </div>
              </motion.div>
            )}
            {records.daily.mostStudy && (
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex justify-between items-center p-4 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/30 rounded-xl backdrop-blur-sm">
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">En Çok Çalışma</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 font-sans">
                      {new Date(records.daily.mostStudy.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400 font-display">
                    {Math.floor(records.daily.mostStudy.duration / 60)}s
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Haftalık Rekorlar */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-neutral-900 dark:text-white font-display mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
              Haftalık Rekorlar
            </h4>
            {records.weekly.mostQuestions && (
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex justify-between items-center p-4 bg-green-50/80 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/30 rounded-xl backdrop-blur-sm">
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">En Çok Soru</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 font-sans">
                      {new Date(records.weekly.mostQuestions.weekStart).toLocaleDateString('tr-TR')} haftası
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400 font-display">
                    {records.weekly.mostQuestions.count}
                  </span>
                </div>
              </motion.div>
            )}
            {records.weekly.mostStudy && (
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex justify-between items-center p-4 bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/30 rounded-xl backdrop-blur-sm">
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">En Çok Çalışma</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 font-sans">
                      {new Date(records.weekly.mostStudy.weekStart).toLocaleDateString('tr-TR')} haftası
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-orange-600 dark:text-orange-400 font-display">
                    {Math.floor(records.weekly.mostStudy.duration / 60)}s
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Gelişim Hızı - Full Width Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-elegant-xl p-8 overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="velocityPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#velocityPattern)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl">
                <Award className="w-6 h-6 text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-2xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                  Gelişim Hızı
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                  Son 2 hafta performans analizi
                </p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-full border-2 ${velocityStatus.bg} ${velocityStatus.border}`}>
              <span className={`text-lg font-bold ${velocityStatus.color} font-display`}>
                {velocityStatus.text}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Öğrenme Katsayısı */}
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 font-sans">Öğrenme Katsayısı</p>
                </div>
                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 font-display">
                  {velocity.currentVelocity}x
                </p>
              </div>
            </motion.div>

            {/* Çalışma Artışı */}
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center p-8 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-2xl border-2 border-green-200/50 dark:border-green-800/30">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 font-sans">Çalışma Artışı</p>
                </div>
                <p className="text-5xl font-bold text-green-600 dark:text-green-400 font-display">
                  {velocity.durationIncrease >= 0 ? '+' : ''}{velocity.durationIncrease}%
                </p>
              </div>
            </motion.div>

            {/* Verimlilik */}
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl border-2 border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300 font-sans">Verimlilik</p>
                </div>
                <p className="text-5xl font-bold text-purple-600 dark:text-purple-400 font-display">
                  {velocity.efficiencyChange >= 0 ? '+' : ''}{velocity.efficiencyChange}%
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* AI Analizi Kartı */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 backdrop-blur-xl rounded-3xl border-2 border-indigo-200/50 dark:border-indigo-800/50 shadow-elegant-xl p-8 overflow-hidden"
      >
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl animate-pulse delay-1000" />

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="aiPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1.5" fill="currentColor" className="text-indigo-700 dark:text-indigo-400" />
                <circle cx="20" cy="15" r="1" fill="currentColor" className="text-purple-700 dark:text-purple-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#aiPattern)" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-elegant">
              <Brain className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                  AI Günlük Değerlendirme
                </h3>
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                Yapay zeka destekli performans analizi
              </p>
            </div>
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                AI analizi oluşturuluyor...
              </p>
            </div>
          ) : aiAnalysis?.overview ? (
            <div className="space-y-4">
              {/* Genel Özet */}
              <div className="p-5 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 font-display uppercase tracking-wide">
                    Genel Durum
                  </h4>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                  {aiAnalysis.overview.summary}
                </p>
              </div>

              {/* Haftalık Hedef */}
              {aiAnalysis.overview.weeklyGoal && (
                <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 font-display uppercase tracking-wide">
                      Bu Hafta İçin
                    </h4>
                  </div>
                  <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                    {aiAnalysis.overview.weeklyGoal}
                  </p>
                </div>
              )}

              {/* Meta Info */}
              {aiAnalysis.meta && (
                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-500 pt-3 border-t border-indigo-200/30 dark:border-indigo-800/30">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    AI Model: {aiAnalysis.meta.model}
                  </span>
                  <span>•</span>
                  <span>
                    Oluşturulma: {new Date(aiAnalysis.generatedAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-500 font-sans">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>AI analizi yüklenemedi</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StatsOverview;
