import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import { statsAPI } from '../../api';
import {
  Clock,
  Target,
  TrendingUp,
  Plus,
  BookOpen,
  BarChart3,
  Shield,
  Timer,
  LogOut,
  Flame,
  Award,
  Calendar,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground, GlassCard, AnimatedButton, ThemeToggle } from '../../ui';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsAPI.getSummary();
      setStats(response.data);
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Plus,
      label: 'Yeni Çalışma',
      description: 'Çalışma kaydı oluştur',
      onClick: () => navigate('/study-sessions/create'),
      variant: 'primary',
    },
    {
      icon: BookOpen,
      label: 'Geçmiş',
      description: 'Çalışma geçmişini gör',
      onClick: () => navigate('/study-sessions'),
      variant: 'outline',
    },
    {
      icon: BarChart3,
      label: 'İstatistikler',
      description: 'Detaylı analiz',
      onClick: () => navigate('/stats'),
      variant: 'outline',
    },
    {
      icon: Timer,
      label: 'Pomodoro',
      description: 'Odaklanmış çalışma',
      onClick: () => navigate('/pomodoro'),
      variant: 'outline',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 relative overflow-hidden">
      {/* Artistic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Multi-layer texture overlays */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonalLines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="currentColor" strokeWidth="1" className="text-primary-600 dark:text-primary-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalLines)" />
          </svg>
        </div>

        {/* Mesh gradient background */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(at 10% 20%, rgba(127, 2, 31, 0.08) 0px, transparent 50%),
            radial-gradient(at 90% 10%, rgba(245, 235, 208, 0.1) 0px, transparent 50%),
            radial-gradient(at 20% 80%, rgba(139, 76, 92, 0.06) 0px, transparent 50%),
            radial-gradient(at 80% 90%, rgba(127, 2, 31, 0.05) 0px, transparent 50%)
          `
        }} />

        {/* Animated organic shapes */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 150, 0],
            y: [0, -80, 0],
            rotate: [0, 45, 0],
            opacity: [0.08, 0.14, 0.08],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/3 -right-1/4 w-[900px] h-[900px] bg-gradient-to-br from-primary-400 via-primary-600 to-primary-800 dark:from-primary-500 dark:via-primary-700 dark:to-primary-900 blur-3xl"
          style={{
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          }}
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -120, 0],
            y: [0, 60, 0],
            rotate: [0, -60, 0],
            opacity: [0.1, 0.16, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute -bottom-1/3 -left-1/4 w-[1000px] h-[1000px] bg-gradient-to-tr from-secondary-300 via-secondary-500 to-secondary-700 dark:from-secondary-400 dark:via-secondary-600 dark:to-secondary-800 blur-3xl"
          style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          }}
        />

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 120, 240, 360],
            opacity: [0.08, 0.14, 0.08],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-accent-rose via-primary-500 to-accent-burgundy dark:from-accent-rose dark:via-primary-600 dark:to-accent-burgundy blur-3xl"
          style={{
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          }}
        />

        {/* Geometric circles */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/3 w-96 h-96 border-2 border-primary-300/20 rounded-full"
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-1/3 right-1/3 w-80 h-80 border border-secondary-400/20 rounded-full"
        />

        {/* Floating dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute w-2 h-2 rounded-full bg-primary-400"
            style={{
              left: `${15 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative border-b border-primary-200/30 dark:border-primary-900/30 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-elegant">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl flex items-center justify-center shadow-elegant-lg">
                <span className="text-white font-bold text-lg font-display">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-normal text-primary-700 dark:text-primary-400 font-display tracking-wide">AceIt</h1>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans">Sınav Hazırlık</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <ThemeToggle />
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50/50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900 transition-all backdrop-blur-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Admin</span>
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 transition-all backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Çıkış</span>
              </button>
            </motion.div>
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
            {/* Welcome Text */}
            <div className="mb-8">
              <h2 className="text-5xl font-light text-neutral-900 dark:text-white mb-2 font-display tracking-wide">
                Hoş geldin,
              </h2>
              <p className="text-5xl font-normal text-primary-700 dark:text-primary-400 font-display tracking-wide">
                {user?.name || user?.username || 'Kullanıcı'}
              </p>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-3 font-serif">
                Bugün nasıl bir çalışma planın var?
              </p>
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

        {/* Quick Actions - Different Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Primary Action - Larger */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <button
              onClick={() => navigate('/study-sessions/create')}
              className="w-full h-full min-h-[200px] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-700 dark:via-primary-800 dark:to-primary-950 rounded-3xl p-8 shadow-elegant-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden border-2 border-primary-500/30"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

              {/* Wave pattern */}
              <div className="absolute inset-0 opacity-[0.10]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="waves" width="50" height="20" patternUnits="userSpaceOnUse">
                      <path d="M0 10 Q 12.5 0, 25 10 T 50 10" stroke="white" strokeWidth="0.8" fill="none" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#waves)" />
                </svg>
              </div>

              <div className="relative flex flex-col items-start justify-between h-full">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 group-hover:bg-white/15 transition-all">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-3xl font-light text-white mb-2 font-display tracking-wide">Yeni Çalışma Başlat</h3>
                  <p className="text-secondary-100 font-serif text-base">Çalışma kaydı oluştur ve ilerlemeni takip et</p>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Secondary Actions - Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-1 gap-4"
          >
            {[
              { icon: BookOpen, label: 'Geçmiş', route: '/study-sessions' },
              { icon: BarChart3, label: 'İstatistikler', route: '/stats' },
              { icon: Timer, label: 'Pomodoro', route: '/pomodoro' },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.route)}
                className="relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-2xl p-6 hover:bg-white dark:hover:bg-neutral-800 transition-all duration-300 group border-2 border-neutral-200/80 dark:border-neutral-700/80 hover:border-primary-400 dark:hover:border-primary-700 hover:shadow-elegant-lg flex items-center justify-between overflow-hidden"
              >
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.08]">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`quickActionGrid${idx}`} width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#quickActionGrid${idx})`} />
                  </svg>
                </div>

                <div className="relative flex items-center gap-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900 transition-colors">
                    <action.icon className="w-5 h-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <span className="font-light text-neutral-900 dark:text-white font-sans text-base">{action.label}</span>
                </div>
                <ArrowRight className="relative w-5 h-5 text-neutral-400 group-hover:text-primary-700 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </motion.div>
        </div>

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
              <h3 className="text-3xl font-light text-neutral-900 dark:text-white font-display tracking-wide">Son Aktiviteler</h3>
              <button className="text-primary-700 dark:text-primary-400 hover:underline text-sm font-light flex items-center gap-1 font-sans">
                Tümünü Gör
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium font-serif">Henüz aktivite bulunmuyor</p>
              <p className="text-sm mt-2 font-sans">İlk çalışmanı başlat ve ilerlemeni takip et!</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// Stats Bar Item Component (for horizontal bar)
const StatsBarItem = ({ icon: Icon, label, value, unit, loading }) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-secondary-200" />
        <p className="text-sm font-medium text-secondary-200/90 font-sans">{label}</p>
      </div>
      {loading ? (
        <div className="h-10 w-20 bg-white/10 rounded animate-pulse" />
      ) : (
        <p className="text-5xl font-light text-white font-display tracking-wide">
          {value}
          <span className="text-xl text-secondary-100 ml-2 font-normal font-serif">{unit}</span>
        </p>
      )}
    </div>
  );
};

export default Dashboard;