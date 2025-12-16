import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { studyPlanAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Calendar,
  Brain,
  ArrowLeft,
  CheckCircle,
  Target,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DashboardHeader } from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';
import StudyPlanCalendar from '../../components/StudyPlan/StudyPlanCalendar';
import SlotCompleteModal from '../../components/modals/SlotCompleteModal';
import logger from '../../utils/logger';

const StudyPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const response = await studyPlanAPI.getById(id);
      setPlan(response.data);

      // Set selected week to plan start date
      if (response.data.startDate) {
        setSelectedWeek(new Date(response.data.startDate));
      }
    } catch (error) {
      logger.error('Fetch plan error:', error);
      // Axios interceptor will show the error toast
      navigate('/study-plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotComplete = async (slotId, completed) => {
    // Eğer kullanıcı slot'u tamamladı olarak işaretliyorsa modal aç
    if (completed) {
      setSelectedSlot(slotId);
      setModalOpen(true);
    } else {
      // Tamamlanmadı işaretliyorsa direkt API çağır
      try {
        await studyPlanAPI.markSlotComplete(slotId, false);
        toast.success('Tamamlanmadı olarak işaretlendi');
        fetchPlan();
      } catch (error) {
        logger.error('Mark slot incomplete error:', error);
        // Axios interceptor will show the error toast
      }
    }
  };

  const handleModalSubmit = async (questionData) => {
    try {
      await studyPlanAPI.markSlotComplete(selectedSlot, true, questionData);
      toast.success('Tamamlandı! 🎉');

      // Modal'ı kapat
      setModalOpen(false);
      setSelectedSlot(null);

      // Plan'ı yenile
      fetchPlan();
    } catch (error) {
      logger.error('Mark slot complete error:', error);
      // Axios interceptor will show the error toast
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSlot(null);
  };

  const handleWeekChange = (direction) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newWeek);
  };

  const getWeekDays = () => {
    if (!plan) return [];

    const startOfWeek = new Date(selectedWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);

      // Local timezone kullanarak date string oluştur (timezone offset olmadan)
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Backend'den gelen tarihi de local timezone'a çevir
      const dayData = plan.days?.find(d => {
        const backendDate = new Date(d.date);
        const backendYear = backendDate.getFullYear();
        const backendMonth = String(backendDate.getMonth() + 1).padStart(2, '0');
        const backendDay = String(backendDate.getDate()).padStart(2, '0');
        const backendDateStr = `${backendYear}-${backendMonth}-${backendDay}`;
        return backendDateStr === dateStr;
      });

      weekDays.push({
        date: currentDate,
        dateStr,
        dayData
      });
    }

    return weekDays;
  };

  const parseWeeklyGoals = () => {
    if (!plan?.weeklyGoals) return [];

    try {
      return JSON.parse(plan.weeklyGoals);
    } catch (error) {
      logger.error('Parse weekly goals error:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 relative overflow-hidden">
        <DashboardBackgroundEffects />
        <DashboardHeader user={user} onLogout={logout} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const weekDays = getWeekDays();
  const weeklyGoals = parseWeeklyGoals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 relative overflow-hidden">
      <DashboardBackgroundEffects />
      <DashboardHeader user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/study-plans')}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Planlara Dön</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                    {plan.title}
                  </h1>
                  {plan.isActive && (
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                      Aktif
                    </span>
                  )}
                  {plan.isAIGenerated && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full">
                      <Brain className="w-3.5 h-3.5" />
                      AI
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {plan.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Tarih Aralığı</span>
              </div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {new Date(plan.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} -{' '}
                {new Date(plan.endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Toplam Slot</span>
              </div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {plan.progress?.totalSlots || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Tamamlanan</span>
              </div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {plan.progress?.completedSlots || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">İlerleme</span>
              </div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {plan.progress?.completionRate?.toFixed(1) || 0}%
              </p>
            </motion.div>
          </div>

          {/* Weekly Goals */}
          {plan.isAIGenerated && weeklyGoals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    Haftalık Hedefler
                  </h2>
                </div>
                <div className="space-y-3">
                  {weeklyGoals.map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white text-sm font-semibold rounded-lg flex-shrink-0">
                        {goal.week}
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 flex-1">
                        {goal.goal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => handleWeekChange('prev')}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {weekDays[0]?.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} -{' '}
                {weekDays[6]?.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>

              <button
                onClick={() => handleWeekChange('next')}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>

            {/* Calendar Component */}
            <StudyPlanCalendar
              weekDays={weekDays}
              onSlotComplete={handleSlotComplete}
            />
          </div>
        </motion.div>
      </main>

      {/* Slot Complete Modal */}
      <SlotCompleteModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        slotInfo={
          selectedSlot && plan
            ? plan.days
                ?.flatMap((d) => d.slots || [])
                .find((s) => s.id === selectedSlot)
            : null
        }
      />
    </div>
  );
};

export default StudyPlanDetail;
