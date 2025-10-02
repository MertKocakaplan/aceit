import { useEffect, useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { statsAPI } from '../../api';
import { Clock, Target, TrendingUp } from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  WelcomeCard,
  StatsCard,
  ComingSoonCard,
} from '../../ui';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await statsAPI.getSummary();
      setStats(data);
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      icon: Clock,
      label: 'Toplam Çalışma',
      value: `${stats?.totalDurationHours || 0} saat`,
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      bgDark: 'bg-gradient-to-br from-blue-950/50 to-cyan-950/50',
      iconBgLight: 'bg-blue-100',
      iconBgDark: 'bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Target,
      label: 'Toplam Soru',
      value: `${stats?.totalQuestions || 0} soru`,
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-gradient-to-br from-purple-50 to-pink-50',
      bgDark: 'bg-gradient-to-br from-purple-950/50 to-pink-950/50',
      iconBgLight: 'bg-purple-100',
      iconBgDark: 'bg-purple-900/50',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: TrendingUp,
      label: 'Başarı Oranı',
      value: `${stats?.successRate || 0}%`,
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-gradient-to-br from-green-50 to-emerald-50',
      bgDark: 'bg-gradient-to-br from-green-950/50 to-emerald-950/50',
      iconBgLight: 'bg-green-100',
      iconBgDark: 'bg-green-900/50',
      iconColor: 'text-green-600 dark:text-green-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Enhanced Animated Background */}
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />

      {/* Header */}
      <DashboardHeader user={user} onLogout={logout} />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <WelcomeCard user={user} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          
          {/* Coming Soon */}
          <ComingSoonCard />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
