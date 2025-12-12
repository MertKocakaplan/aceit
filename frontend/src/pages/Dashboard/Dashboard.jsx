import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import { statsAPI, studySessionsAPI, studyPlanAPI } from '../../api';
import {
  Clock,
  Target,
  TrendingUp,
  Plus,
  BookOpen,
  BarChart3,
  Shield,
  Timer,
  Flame,
  Calendar,
  ArrowRight,
  ChevronRight,
  Brain,
  Play,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../../ui';
import { getDailyGuidanceCache, setDailyGuidanceCache, getAIAnalysisCache } from '../../utils/aiCache';
import { formatDuration, formatDate, getSubjectColor } from '../../utils/dashboard';
import {
  DashboardBackgroundEffects,
  ExamCountdownCard,
  DailyGuidanceCard,
  DailyGoalProgressCard,
  StatsBarItem,
  NavigationCard
} from '../../components/dashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [examCountdown, setExamCountdown] = useState(null);
  const [dailyGuidance, setDailyGuidance] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Stats, exam countdown, recent sessions ve daily goal paralel olarak al
      const [statsResponse, examResponse, sessionsResponse, dailyGoalResponse] = await Promise.all([
        statsAPI.getSummary(),
        statsAPI.getExamCountdown(),
        studySessionsAPI.getAll({ limit: 5 }),
        studyPlanAPI.getActiveDaily().catch(() => ({ data: null })) // Hata olursa null dön
      ]);
      setStats(statsResponse.data);
      setExamCountdown(examResponse.data);
      setRecentSessions(sessionsResponse.data || []);
      setDailyGoal(dailyGoalResponse.data);

      // Daily Guidance: Önce cache kontrol et (kullanıcıya özel)
      let guidanceData = getDailyGuidanceCache(user?.id);

      if (!guidanceData) {
        // Cache yoksa API'den al ve cache'le
        const response = await statsAPI.getDailyGuidance();
        guidanceData = response.data;
        setDailyGuidanceCache(user?.id, guidanceData);
      }

      // AI cache varsa, overview.summary'yi ekle (kullanıcıya özel)
      const aiCache = getAIAnalysisCache(user?.id);
      if (aiCache?.overview?.summary) {
        guidanceData = {
          ...guidanceData,
          aiInsight: aiCache.overview.summary
        };
      }

      setDailyGuidance(guidanceData);
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background Effects */}
      <DashboardBackgroundEffects />

      {/* Header */}
      <header className="relative z-20 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-md shadow-sm">
        {/* Decorative gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-400/30 dark:via-primary-600/30 to-transparent" />

        {/* Subtle shadow gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-neutral-100/20 dark:to-neutral-950/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-600 dark:to-primary-800 rounded-2xl flex items-center justify-center shadow-elegant-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-normal text-primary-700 dark:text-primary-400 font-display tracking-wide">
                AceIt
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {user?.role === 'ADMIN' && (
                <>
                  <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-700"></div>
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all font-sans"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </>
              )}

              <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-700"></div>

              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors font-sans"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section with Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative">
            {/* Welcome Text + Exam Countdown */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 gap-6">
              <div>
                <h2 className="text-5xl font-normal text-neutral-900 dark:text-white mb-2 font-display tracking-wide">
                  Hoş geldin,
                </h2>
                <p className="text-5xl font-normal text-primary-700 dark:text-primary-400 font-display tracking-wide">
                  {user?.name || user?.username || 'Kullanıcı'}
                </p>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-3 font-serif">
                  Bugün nasıl bir çalışma planın var?
                </p>
              </div>

              {/* Exam Countdown Card */}
              <ExamCountdownCard examCountdown={examCountdown} />
            </div>

            {/* Stats Bar - Horizontal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 rounded-3xl p-8 shadow-elegant-xl overflow-hidden border-2 border-primary-600/30"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

              {/* Dot grid pattern */}
              <div className="absolute inset-0 opacity-[0.12]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="statsDots" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#statsDots)" />
                </svg>
              </div>

              {/* Diagonal lines pattern */}
              <div className="absolute inset-0 opacity-[0.04]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="statsLines" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="30" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#statsLines)" />
                </svg>
              </div>

              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatsBarItem
                  icon={Clock}
                  label="Toplam Çalışma"
                  value={stats?.totalDurationHours || 0}
                  unit="saat"
                  loading={loading}
                />
                <StatsBarItem
                  icon={Target}
                  label="Çözülen Soru"
                  value={stats?.totalQuestions || 0}
                  unit="soru"
                  loading={loading}
                />
                <StatsBarItem
                  icon={TrendingUp}
                  label="Başarı Oranı"
                  value={stats?.successRate || 0}
                  unit="%"
                  loading={loading}
                />
                <StatsBarItem
                  icon={Flame}
                  label="Streak"
                  value={stats?.currentStreak || 0}
                  unit="gün"
                  loading={loading}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Daily Guidance */}
        <DailyGuidanceCard dailyGuidance={dailyGuidance} />

        {/* Bento Grid Navigation */}
        <div className="grid grid-cols-12 gap-5 mb-12">
          {/* Row 1: Primary Action + Study Plans */}
          <NavigationCard
            icon={Plus}
            title="Yeni Çalışma Başlat"
            description="Çalışma kaydı oluştur ve ilerlemeni takip et"
            onClick={() => navigate('/study-sessions/create')}
            variant="primary"
            size="large"
            pattern="waves"
            showArrow={false}
          />

          <NavigationCard
            icon={Calendar}
            title="Çalışma Planları"
            description="AI destekli kişisel planlarınız"
            onClick={() => navigate('/study-plans')}
            variant="secondary"
            size="medium"
            pattern="grid"
          />

          {/* Row 2: 4 equal cards */}
          <NavigationCard
            icon={Brain}
            title="AI Soru Çözücü"
            description="Yapay zeka ile çöz"
            onClick={() => navigate('/ai/question-solver')}
            size="small"
            colorScheme="purple"
          />

          <NavigationCard
            icon={BarChart3}
            title="İstatistikler"
            description="Detaylı analiz"
            onClick={() => navigate('/stats')}
            size="small"
            colorScheme="emerald"
          />

          <NavigationCard
            icon={BookOpen}
            title="Geçmiş"
            description="Çalışma kayıtları"
            onClick={() => navigate('/study-sessions')}
            size="small"
            colorScheme="blue"
          />

          <NavigationCard
            icon={Timer}
            title="Pomodoro"
            description="Zamanlayıcı"
            onClick={() => navigate('/pomodoro')}
            size="small"
            colorScheme="amber"
          />
        </div>

        {/* Daily Goal Progress */}
        <DailyGoalProgressCard dailyGoal={dailyGoal} />

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-3xl p-8 border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant overflow-hidden"
        >
          {/* Decorative corner patterns */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary-100/20 dark:from-primary-900/10 to-transparent rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-secondary-100/30 dark:from-secondary-900/10 to-transparent rounded-tl-full" />

          {/* Hexagonal dot pattern */}
          <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.08]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="recentActivityPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                  <circle cx="20" cy="15" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                  <circle cx="5" cy="25" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#recentActivityPattern)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">Son Aktiviteler</h3>
              <button
                onClick={() => navigate('/study-sessions')}
                className="text-primary-700 dark:text-primary-400 hover:underline text-sm font-normal flex items-center gap-1 font-sans"
              >
                Tümünü Gör
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-2xl bg-neutral-100/50 dark:bg-neutral-700/30">
                    <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-600" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-600 rounded mb-2" />
                      <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-600 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session, idx) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => navigate(`/study-sessions/${session.id}/edit`)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-700/30 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer group"
                  >
                    {/* Subject color indicator */}
                    <div className={`w-12 h-12 rounded-xl ${getSubjectColor(session.subject?.name)} flex items-center justify-center shadow-sm`}>
                      <Play className="w-5 h-5 text-white" />
                    </div>

                    {/* Session info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-neutral-900 dark:text-white font-sans truncate">
                          {session.subject?.name || 'Ders'}
                        </h4>
                        {session.topic?.name && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            • {session.topic.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(session.duration)}
                        </span>
                        {session.questionsCompleted > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {session.questionsCompleted} soru
                          </span>
                        )}
                        <span className="text-neutral-400">
                          {formatDate(session.date)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium font-serif">Henüz aktivite bulunmuyor</p>
                <p className="text-sm mt-2 font-sans">İlk çalışmanı başlat ve ilerlemeni takip et!</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
