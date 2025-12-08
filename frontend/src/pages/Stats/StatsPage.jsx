import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { statsAPI, pomodoroAPI } from '../../api';
import { generateStatsPDF } from '../../utils/pdfGenerator';
import { useAIAnalysis } from '../../hooks/useAIAnalysis';
import { motion } from 'framer-motion';
import { Activity, BarChart, BookOpen, Clock, Download } from 'lucide-react';
import { DashboardHeader } from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';
import StatsOverview from './StatsOverview';
import StatsCharts from './StatsCharts';
import ActivityHeatmap from './ActivityHeatmap';
import SixMonthTrend from './SixMonthTrend';
import SubjectsTab from './SubjectsTab';
import TopicsTab from './TopicsTab';
import PomodoroTab from './PomodoroTab';

const StatsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [dailyTimeRange, setDailyTimeRange] = useState(7);
  const [yearlyActivity, setYearlyActivity] = useState([]);
  const [sixMonthTrend, setSixMonthTrend] = useState([]);
  const [subjectsDetailed, setSubjectsDetailed] = useState(null);
  const [topicsDetailed, setTopicsDetailed] = useState(null);
  const [pomodoroStats, setPomodoroStats] = useState(null);

  // AI Analysis Hook (günlük cache ile)
  const { analysis: aiAnalysis, loading: aiLoading, error: aiError } = useAIAnalysis();

  useEffect(() => {
    fetchInitialData();
  }, []);

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

  const handleDownloadPDF = () => {
    try {
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 relative overflow-hidden">
      <DashboardBackgroundEffects />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Tabs and PDF Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            {/* Tabs */}
            <div className="flex-1 relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-elegant p-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
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
                      relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all overflow-hidden group font-display
                      ${isActive
                        ? 'bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white shadow-elegant'
                        : isAvailable
                        ? 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        : 'bg-neutral-100 dark:bg-neutral-800/30 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                      }
                    `}
                  >
                    <Icon className="relative w-5 h-5" />
                    <span className="relative">{tab.label}</span>
                    {!isAvailable && (
                      <span className="relative text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded">
                        Yakında
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            </div>

            {/* PDF Download Button */}
            {overviewData && subjectsDetailed && topicsDetailed && pomodoroStats && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-elegant hover:shadow-elegant-lg transition-all font-display"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Rapor İndir</span>
              </motion.button>
            )}
          </motion.div>

          {/* Content */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-elegant-xl p-12"
            >
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-700 dark:border-t-primary-400 rounded-full"
                />
                <div className="text-center">
                  <p className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                    İstatistikler Yükleniyor
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-sans">
                    Veriler analiz ediliyor...
                  </p>
                </div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-elegant-xl p-12"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl">
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
                <div className="text-center">
                  <p className="text-xl font-medium text-neutral-900 dark:text-white font-display mb-4">
                    {error}
                  </p>
                  <button
                    onClick={fetchInitialData}
                    className="px-6 py-3 bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white rounded-xl font-medium hover:shadow-elegant-lg transition-all font-sans"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </div>
            </motion.div>
          ) : overviewData ? (
            <>
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <StatsOverview
                    data={overviewData}
                    aiAnalysis={aiAnalysis}
                    aiLoading={aiLoading}
                  />
                  <StatsCharts
                    data={{
                      daily: overviewData.daily || [],
                      weekly: overviewData.weekly || { thisWeek: {}, lastWeek: {}, comparison: {} },
                      monthly: overviewData.monthly || { thisMonth: {}, lastMonth: {}, comparison: {} },
                      subjectBreakdown: overviewData.subjectBreakdown || [],
                    }}
                    onTimeRangeChange={setDailyTimeRange}
                  />
                  {yearlyActivity.length > 0 && (
                    <ActivityHeatmap yearlyData={yearlyActivity} />
                  )}
                  {sixMonthTrend.length > 0 && (
                    <SixMonthTrend trendData={sixMonthTrend} />
                  )}
                </motion.div>
              )}
              {activeTab === 'subjects' && subjectsDetailed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <SubjectsTab
                    subjectsData={subjectsDetailed}
                    aiAnalysis={aiAnalysis}
                    aiLoading={aiLoading}
                  />
                </motion.div>
              )}
              {activeTab === 'topics' && topicsDetailed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TopicsTab
                    topicsData={topicsDetailed}
                    aiAnalysis={aiAnalysis}
                    aiLoading={aiLoading}
                  />
                </motion.div>
              )}
              {activeTab === 'pomodoro' && pomodoroStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PomodoroTab pomodoroData={pomodoroStats} />
                </motion.div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default StatsPage;
