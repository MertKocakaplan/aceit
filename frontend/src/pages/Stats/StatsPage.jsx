import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { statsAPI, pomodoroAPI } from '../../api';
import { generateStatsPDF } from '../../utils/pdfGenerator';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, BarChart, BookOpen, Clock, FileText } from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  GlassCard,
} from '../../ui';
import StatsOverview from './StatsOverview';
import StatsCharts from './StatsCharts';
import ActivityHeatmap from './ActivityHeatmap';
import SixMonthTrend from './SixMonthTrend';
import SubjectsTab from './SubjectsTab';
import TopicsTab from './TopicsTab';
import PomodoroTab from './PomodoroTab';

const StatsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, subjects, topics, pomodoro, reports
  const [overviewData, setOverviewData] = useState(null);
  const [dailyTimeRange, setDailyTimeRange] = useState(7);
  const [yearlyActivity, setYearlyActivity] = useState([]);
  const [sixMonthTrend, setSixMonthTrend] = useState([]);
  const [subjectsDetailed, setSubjectsDetailed] = useState(null);
  const [topicsDetailed, setTopicsDetailed] = useState(null);
  const [pomodoroStats, setPomodoroStats] = useState(null);

useEffect(() => {
  fetchInitialData();
}, []);

// Daily time range değişince sadece daily veriyi güncelle
useEffect(() => {
  if (overviewData) {
    fetchDailyData();
  }
}, [dailyTimeRange]);

const fetchInitialData = async () => {
  setLoading(true);
  setError(null);
  try {
    const [
      overviewResponse,
      subjectBreakdownResponse,
      monthlyResponse,
      dailyResponse,
      yearlyActivityResponse,
      sixMonthTrendResponse,
      subjectsDetailedResponse,
      topicsDetailedResponse,
      pomodoroStatsResponse,
    ] = await Promise.all([
      statsAPI.getOverview(),
      statsAPI.getSubjectBreakdown(),
      statsAPI.getMonthly(),
      statsAPI.getDaily(7),
      statsAPI.getYearlyActivity(),
      statsAPI.getSixMonthTrend(),
      statsAPI.getSubjectsDetailed(),
      statsAPI.getTopicsDetailed(),
      pomodoroAPI.getDetailedStats(),
    ]);

    setOverviewData({
      ...overviewResponse.data,
      subjectBreakdown: subjectBreakdownResponse.data,
      monthly: monthlyResponse.data,
      daily: dailyResponse.data,
    });

    setYearlyActivity(yearlyActivityResponse.data);
    setSixMonthTrend(sixMonthTrendResponse.data);
    setSubjectsDetailed(subjectsDetailedResponse.data);
    setTopicsDetailed(topicsDetailedResponse.data);

    console.log('🍅 Pomodoro Stats Response:', pomodoroStatsResponse);
    console.log('🍅 Pomodoro Stats Data:', pomodoroStatsResponse.data);
    setPomodoroStats(pomodoroStatsResponse.data);
  } catch (err) {
    console.error('Initial data fetch error:', err);
    setError('İstatistikler yüklenirken bir hata oluştu');
  } finally {
    setLoading(false);
  }
};

const fetchDailyData = async () => {
  try {
    const dailyResponse = await statsAPI.getDaily(dailyTimeRange);
    
    setOverviewData(prev => ({
      ...prev,
      daily: dailyResponse.data,
    }));
  } catch (err) {
    console.error('Daily data fetch error:', err);
  }
};

/**
 * PDF raporu indir
 */
const handleDownloadPDF = () => {
  try {
    // Tüm verileri topla
    const pdfData = {
      user: {
        name: user?.name || 'Bilinmiyor',
        email: user?.email || 'Bilinmiyor',
        examType: user?.examType || 'Bilinmiyor',
      },
      overview: overviewData,
      subjects: subjectsDetailed,
      topics: topicsDetailed,
      pomodoro: pomodoroStats,
    };

    generateStatsPDF(pdfData);
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

  // Tab yapısı (şimdilik sadece overview aktif, diğerleri sonra eklenecek)
  const tabs = [
    { 
      id: 'overview', 
      label: 'Genel Özet', 
      icon: Activity,
      available: true 
    },
    { 
      id: 'subjects', 
      label: 'Dersler', 
      icon: BookOpen,
      available: true
    },
    { 
      id: 'topics', 
      label: 'Konular', 
      icon: BarChart,
      available: true
    },
    { 
      id: 'pomodoro', 
      label: 'Pomodoro', 
      icon: Clock,
      available: true
    },
  
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard'a Dön</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              İstatistikler ve Gelişim Analizi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Çalışma performansını detaylı analiz et ve gelişimini takip et
            </p>
          </motion.div>

          {/* Tabs */}
          <GlassCard className="p-2">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              {/* Sol taraf - Tab butonları */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isAvailable = tab.available;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => isAvailable && setActiveTab(tab.id)}
                      disabled={!isAvailable}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : isAvailable
                          ? 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80'
                          : 'bg-gray-100 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{tab.label}</span>
                      {!isAvailable && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                          Yakında
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sağ taraf - PDF İndir Butonu */}
              {overviewData && subjectsDetailed && topicsDetailed && pomodoroStats && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Rapor İndir (PDF)</span>
                </motion.button>
              )}
            </div>
          </GlassCard>

          {/* Content */}
          {loading ? (
            <GlassCard className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    İstatistikler Yükleniyor
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Veriler analiz ediliyor...
                  </p>
                </div>
              </div>
            </GlassCard>
          ) : error ? (
            <GlassCard className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <svg
                    className="w-12 h-12 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {error}
                  </p>
                  <button
                    onClick={fetchOverviewData}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </div>
            </GlassCard>
          ) : overviewData ? (
            <>
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Metrikler ve Rekorlar */}
                  <StatsOverview data={overviewData} />

                  {/* Grafikler */}
                  <StatsCharts
                    data={{
                      daily: overviewData.daily || [],
                      weekly: overviewData.weekly || { thisWeek: {}, lastWeek: {}, comparison: {} },
                      monthly: overviewData.monthly || { thisMonth: {}, lastMonth: {}, comparison: {} },
                      subjectBreakdown: overviewData.subjectBreakdown || [],
                    }}
                    onTimeRangeChange={setDailyTimeRange}
                  />

                  {/* Yıllık Aktivite Heatmap */}
                  {yearlyActivity.length > 0 && (
                    <ActivityHeatmap yearlyData={yearlyActivity} />
                  )}

                  {/* Son 6 Aylık Trend */}
                  {sixMonthTrend.length > 0 && (
                    <SixMonthTrend trendData={sixMonthTrend} />
                  )}
                </motion.div>
              )}
              {/* Dersler Tab */}
              {activeTab === 'subjects' && subjectsDetailed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <SubjectsTab subjectsData={subjectsDetailed} />
                </motion.div>
              )}
              {/* Konular Tab */}
              {activeTab === 'topics' && topicsDetailed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TopicsTab topicsData={topicsDetailed} />
                </motion.div>
              )}
              {/* Pomodoro Tab */}
              {activeTab === 'pomodoro' && pomodoroStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PomodoroTab pomodoroData={pomodoroStats} />
                </motion.div>
              )}
              {/* Diğer tablar için placeholder */}
              {activeTab !== 'overview' && 
              activeTab !== 'subjects' && 
              activeTab !== 'topics' && 
              activeTab !== 'pomodoro' && (
                <GlassCard className="p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Bu bölüm çok yakında eklenecek!
                  </p>
                </GlassCard>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default StatsPage;