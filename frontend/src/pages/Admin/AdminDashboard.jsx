import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { adminAPI } from '../../api';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  BookOpen,
  BarChart3,
  Shield,
  ArrowRight,
  Activity,
  TrendingUp,
  Brain,
  Zap,
  Clock,
} from 'lucide-react';
import {
  DashboardHeader,
} from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';
import logger from '../../utils/logger';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.stats.get();
      setStats(response.data);
    } catch (error) {
      logger.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      icon: Users,
      label: 'Toplam Kullanıcı',
      value: stats?.totalUsers || 0,
      color: 'from-blue-600 to-cyan-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Shield,
      label: 'Admin Sayısı',
      value: stats?.adminCount || 0,
      color: 'from-purple-600 to-fuchsia-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: TrendingUp,
      label: 'Bugün Kayıt',
      value: stats?.todayUsers || 0,
      color: 'from-emerald-600 to-teal-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Activity,
      label: 'Toplam Çalışma',
      value: stats?.totalSessions || 0,
      color: 'from-orange-600 to-rose-600',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  const menuItems = [
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcıları görüntüle ve yönet',
      icon: Users,
      path: '/admin/users',
      gradient: 'from-blue-600 to-cyan-600',
      pattern: 'circles',
    },
    {
      title: 'Sınav Yılları',
      description: 'Yıl ve tarih yönetimi',
      icon: Calendar,
      path: '/admin/exam-years',
      gradient: 'from-purple-600 to-fuchsia-600',
      pattern: 'diagonal',
    },
    {
      title: 'Konu-Soru Dağılımı',
      description: 'Konuların soru sayılarını güncelle',
      icon: BookOpen,
      path: '/admin/topic-questions',
      gradient: 'from-emerald-600 to-teal-600',
      pattern: 'dots',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <DashboardBackgroundEffects />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header with Shield Icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl shadow-elegant">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-normal bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent font-display">
                  Admin Panel
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 font-display">
                  Sistem yönetimi ve istatistikler
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant overflow-hidden group"
              >
                {/* Top Gradient Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 font-display">
                      {stat.label}
                    </p>
                    {loading ? (
                      <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
                    ) : (
                      <p className={`text-4xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-display`}>
                        {stat.value}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Token Usage Section */}
          {stats?.aiUsage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-normal text-neutral-800 dark:text-neutral-200 mb-6 font-display flex items-center gap-3">
                <Brain className="w-7 h-7 text-primary-600" />
                AI Token Kullanımı
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Token Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Tokens */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white shadow-elegant relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full">
                        <defs>
                          <pattern id="tokenDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#tokenDots)" />
                      </svg>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5" />
                        <p className="text-sm font-medium opacity-90">Toplam Token</p>
                      </div>
                      <p className="text-3xl font-light font-display">
                        {(stats.aiUsage.totalTokens / 1000000).toFixed(2)}M
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        {stats.aiUsage.totalQuestions} soru
                      </p>
                    </div>
                  </motion.div>

                  {/* Today's Tokens */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 }}
                    className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-elegant relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full">
                        <defs>
                          <pattern id="todayDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#todayDots)" />
                      </svg>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <p className="text-sm font-medium opacity-90">Bugün</p>
                      </div>
                      <p className="text-3xl font-light font-display">
                        {(stats.aiUsage.todayTokens / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        {stats.aiUsage.todayQuestions} soru
                      </p>
                    </div>
                  </motion.div>

                  {/* Average Tokens */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-5 text-white shadow-elegant relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full">
                        <defs>
                          <pattern id="avgDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#avgDots)" />
                      </svg>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5" />
                        <p className="text-sm font-medium opacity-90">Ort. Token</p>
                      </div>
                      <p className="text-3xl font-light font-display">
                        {stats.aiUsage.avgTokensPerQuestion}
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        soru başına
                      </p>
                    </div>
                  </motion.div>

                  {/* Average Response Time */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.65 }}
                    className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-2xl p-5 text-white shadow-elegant relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full">
                        <defs>
                          <pattern id="timeDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#timeDots)" />
                      </svg>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5" />
                        <p className="text-sm font-medium opacity-90">Ort. Yanıt</p>
                      </div>
                      <p className="text-3xl font-light font-display">
                        {(stats.aiUsage.avgResponseTime / 1000).toFixed(1)}s
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        süre
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Daily Usage Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-elegant"
                >
                  <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4 font-display flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    Son 30 Gün Kullanım
                  </h3>
                  <div className="space-y-2">
                    {stats.aiUsage.dailyUsage.slice(0, 7).map((day, index) => {
                      const date = new Date(day.date);
                      const maxTokens = Math.max(...stats.aiUsage.dailyUsage.map(d => d.tokens));
                      const percentage = (day.tokens / maxTokens) * 100;

                      return (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-xs text-neutral-600 dark:text-neutral-400 w-20 font-display">
                            {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </span>
                          <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-8 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-primary-600 to-primary-800 rounded-full flex items-center justify-end pr-3"
                            >
                              {percentage > 20 && (
                                <span className="text-xs font-medium text-white font-display">
                                  {(day.tokens / 1000).toFixed(1)}K
                                </span>
                              )}
                            </motion.div>
                          </div>
                          <span className="text-xs text-neutral-500 dark:text-neutral-500 w-12 text-right font-display">
                            {day.questions}q
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400 font-display">Son 30 Gün</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200 font-display">
                        {(stats.aiUsage.last30DaysTokens / 1000).toFixed(1)}K token
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Menu Cards - 2x2 Grid */}
          <div>
            <h2 className="text-2xl font-normal text-neutral-800 dark:text-neutral-200 mb-6 font-display">
              Yönetim Modülleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => navigate(item.path)}
                  className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-elegant overflow-hidden cursor-pointer group"
                >
                  {/* Gradient Header */}
                  <div className={`relative bg-gradient-to-r ${item.gradient} p-6 overflow-hidden`}>
                    {/* Pattern Background */}
                    <div className="absolute inset-0 opacity-10">
                      {item.pattern === 'circles' && (
                        <svg className="w-full h-full">
                          <defs>
                            <pattern id={`pattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                              <circle cx="20" cy="20" r="8" fill="white" />
                            </pattern>
                          </defs>
                          <rect x="0" y="0" width="100%" height="100%" fill={`url(#pattern-${index})`} />
                        </svg>
                      )}
                      {item.pattern === 'diagonal' && (
                        <svg className="w-full h-full">
                          <defs>
                            <pattern id={`pattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                              <rect x="0" y="0" width="20" height="40" fill="white" />
                            </pattern>
                          </defs>
                          <rect x="0" y="0" width="100%" height="100%" fill={`url(#pattern-${index})`} />
                        </svg>
                      )}
                      {item.pattern === 'dots' && (
                        <svg className="w-full h-full">
                          <defs>
                            <pattern id={`pattern-${index}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                              <circle cx="15" cy="15" r="2" fill="white" />
                            </pattern>
                          </defs>
                          <rect x="0" y="0" width="100%" height="100%" fill={`url(#pattern-${index})`} />
                        </svg>
                      )}
                      {item.pattern === 'waves' && (
                        <svg className="w-full h-full">
                          <defs>
                            <pattern id={`pattern-${index}`} x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                              <path d="M0 10 Q 25 0, 50 10 T 100 10" fill="none" stroke="white" strokeWidth="2" />
                            </pattern>
                          </defs>
                          <rect x="0" y="0" width="100%" height="100%" fill={`url(#pattern-${index})`} />
                        </svg>
                      )}
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-normal text-white font-display">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6">
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4 font-display">
                      {item.description}
                    </p>

                    <div className={`flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all font-display`}>
                      <span>Modüle Git</span>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 border-2 border-transparent group-hover:border-neutral-200 dark:group-hover:border-neutral-700 rounded-3xl transition-all pointer-events-none`}></div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 rounded-3xl p-6 overflow-hidden shadow-elegant-xl"
          >
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="infoDots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="2" fill="white" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#infoDots)" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white font-display">
                  Yönetici Erişimi
                </h3>
                <p className="text-sm text-secondary-200 font-display">
                  Bu panel sadece yetkili yöneticiler tarafından görüntülenebilir. Lütfen sistem verilerini dikkatli bir şekilde yönetin.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
