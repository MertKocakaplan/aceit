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
  Settings,
  Shield,
} from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  GlassCard,
  StatsCard,
  AnimatedButton,
} from '../../ui';

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
      // response = { success: true, data: {...} }
      setStats(response.data);
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      icon: Users,
      label: 'Toplam Kullanıcı',
      value: stats?.totalUsers || 0,
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      bgDark: 'bg-gradient-to-br from-blue-950/50 to-cyan-950/50',
      iconBgLight: 'bg-blue-100',
      iconBgDark: 'bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Shield,
      label: 'Admin Sayısı',
      value: stats?.adminCount || 0,
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-gradient-to-br from-purple-50 to-pink-50',
      bgDark: 'bg-gradient-to-br from-purple-950/50 to-pink-950/50',
      iconBgLight: 'bg-purple-100',
      iconBgDark: 'bg-purple-900/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: Users,
      label: 'Bugün Kayıt',
      value: stats?.todayUsers || 0,
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-gradient-to-br from-green-50 to-emerald-50',
      bgDark: 'bg-gradient-to-br from-green-950/50 to-emerald-950/50',
      iconBgLight: 'bg-green-100',
      iconBgDark: 'bg-green-900/50',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: BarChart3,
      label: 'Toplam Çalışma',
      value: stats?.totalSessions || 0,
      gradient: 'from-orange-500 to-red-500',
      bgLight: 'bg-gradient-to-br from-orange-50 to-red-50',
      bgDark: 'bg-gradient-to-br from-orange-950/50 to-red-950/50',
      iconBgLight: 'bg-orange-100',
      iconBgDark: 'bg-orange-900/50',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  const menuItems = [
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcıları görüntüle ve yönet',
      icon: Users,
      onClick: () => navigate('/admin/users'),
      color: 'blue',
    },
    {
      title: 'Sınav Yılları',
      description: 'Yıl ve tarih yönetimi',
      icon: Calendar,
      onClick: () => navigate('/admin/exam-years'),
      color: 'purple',
    },
    {
      title: 'Konu-Soru Dağılımı',
      description: 'Konuların soru sayılarını güncelle',
      icon: BookOpen,
      onClick: () => navigate('/admin/topic-questions'),
      color: 'green',
    },
    {
      title: 'Sistem Ayarları',
      description: 'Genel ayarlar ve yapılandırma',
      icon: Settings,
      onClick: () => navigate('/admin/settings'),
      color: 'orange',
    },
  ];

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
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sistem yönetimi ve istatistikler
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat, index) => (
              <StatsCard
                key={index}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                gradient={stat.gradient}
                bgLight={stat.bgLight}
                bgDark={stat.bgDark}
                iconBgLight={stat.iconBgLight}
                iconBgDark={stat.iconBgDark}
                iconColor={stat.iconColor}
                index={index}
                loading={loading}
              />
            ))}
          </div>

          {/* Menu Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                <GlassCard
                  className="p-6 cursor-pointer hover:shadow-xl transition-all"
                  onClick={item.onClick}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-${item.color}-100 dark:bg-${item.color}-900/50 rounded-xl`}>
                      <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;