import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { studyPlanAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Brain,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DashboardHeader } from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';
import AIStudyPlanGenerator from './AIStudyPlanGenerator';

const StudyPlanPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await studyPlanAPI.getAll();
      setPlans(response.data);
    } catch (error) {
      console.error('Fetch plans error:', error);
      toast.error('Planlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlan = (planId) => {
    navigate(`/study-plans/${planId}`);
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Bu planı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await studyPlanAPI.delete(planId);
      toast.success('Plan silindi');
      fetchPlans();
    } catch (error) {
      console.error('Delete plan error:', error);
      toast.error('Plan silinemedi');
    }
  };

  const handleActivatePlan = async (planId) => {
    try {
      await studyPlanAPI.activate(planId);
      toast.success('Plan aktif edildi');
      fetchPlans();
    } catch (error) {
      console.error('Activate plan error:', error);
      toast.error('Plan aktif edilemedi');
    }
  };

  const handleAIGeneratorClose = () => {
    setShowAIGenerator(false);
    fetchPlans();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background Effects */}
      <DashboardBackgroundEffects />

      {/* Header */}
      <DashboardHeader user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-5xl font-normal text-neutral-900 dark:text-white mb-2 font-display tracking-wide">
                Çalışma Planları
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-3 font-serif">
                Hedeflerine ulaşmak için planlarını oluştur ve takip et
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/study-plans/create-manual')}
                className="relative flex items-center gap-2 px-6 py-3.5 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-2 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 rounded-2xl font-medium shadow-elegant hover:shadow-elegant-lg hover:border-primary-400 dark:hover:border-primary-600 transition-all overflow-hidden group"
              >
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.08]">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="manualBtnGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#manualBtnGrid)" />
                  </svg>
                </div>
                <Plus className="relative w-5 h-5" />
                <span className="relative font-display">Manuel Plan</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAIGenerator(true)}
                className="relative flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white rounded-2xl font-medium shadow-elegant-xl hover:shadow-2xl transition-all overflow-hidden group"
              >
                {/* Dot pattern */}
                <div className="absolute inset-0 opacity-[0.15]">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="aiBtnDots" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#aiBtnDots)" />
                  </svg>
                </div>
                <Brain className="relative w-5 h-5" />
                <span className="relative font-display">AI ile Oluştur</span>
                <Sparkles className="relative w-4 h-4 opacity-80" />
              </motion.button>
            </div>
          </div>
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
                  Planlar Yükleniyor
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-sans">
                  Lütfen bekleyin...
                </p>
              </div>
            </div>
          </motion.div>
        ) : plans.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-3xl p-16 border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant overflow-hidden"
          >
            {/* Decorative corner patterns */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary-100/20 dark:from-primary-900/10 to-transparent rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-secondary-100/30 dark:from-secondary-900/10 to-transparent rounded-tl-full" />

            {/* Hexagonal dot pattern */}
            <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.08]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="emptyStatePattern" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                    <circle cx="20" cy="15" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                    <circle cx="5" cy="25" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#emptyStatePattern)" />
              </svg>
            </div>

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 mb-8">
                <Calendar className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-3xl font-normal text-neutral-900 dark:text-white mb-3 font-display tracking-wide">
                Henüz planın yok
              </h3>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 font-serif max-w-md mx-auto">
                AI ile kişiselleştirilmiş bir plan oluşturarak çalışmalarına başla
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAIGenerator(true)}
                className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white rounded-2xl font-medium shadow-elegant-xl hover:shadow-2xl transition-all overflow-hidden group"
              >
                {/* Wave pattern */}
                <div className="absolute inset-0 opacity-[0.12]">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="emptyWaves" width="50" height="20" patternUnits="userSpaceOnUse">
                        <path d="M0 10 Q 12.5 0, 25 10 T 50 10" stroke="white" strokeWidth="0.8" fill="none" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#emptyWaves)" />
                  </svg>
                </div>
                <Sparkles className="relative w-5 h-5" />
                <span className="relative text-lg font-display">İlk Planını Oluştur</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                {/* Glow effect for active */}
                {plan.isActive && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 via-primary-500/30 to-primary-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                )}

                <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant hover:shadow-elegant-xl transition-all duration-300 overflow-hidden group-hover:border-primary-400/50 dark:group-hover:border-primary-600/50">
                  {/* Top gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.isActive ? 'from-emerald-500 via-emerald-400 to-emerald-500' : 'from-primary-500/50 via-primary-400/30 to-primary-500/50'}`} />

                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`planPattern${plan.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-neutral-600" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#planPattern${plan.id})`} />
                    </svg>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    {plan.isActive && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-xl shadow-lg font-display">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Aktif
                      </div>
                    )}
                  </div>

                  {plan.isAIGenerated && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-800 text-white text-xs font-medium rounded-xl shadow-lg font-display">
                        <Brain className="w-3.5 h-3.5" />
                        AI
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="relative p-6 pt-14 border-b border-neutral-200/50 dark:border-neutral-800/50">
                    <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2 truncate font-display">
                      {plan.title}
                    </h3>
                    {plan.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 font-serif">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Info */}
                  <div className="relative p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="p-2 bg-primary-50 dark:bg-primary-950/30 rounded-xl">
                        <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="font-sans">
                        {new Date(plan.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} -{' '}
                        {new Date(plan.endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="p-2 bg-secondary-50 dark:bg-secondary-950/30 rounded-xl">
                        <Target className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                      </div>
                      <span className="font-sans">
                        {plan._count?.days || 0} gün • {plan.progress?.totalSlots || 0} slot
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {plan.progress && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400 font-sans">İlerleme</span>
                          <span className="font-medium text-neutral-900 dark:text-white font-display">
                            {plan.progress.completionRate.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${plan.progress.completionRate}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-primary-600 to-primary-700 rounded-full"
                          />
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-500 font-sans">
                          {plan.progress.completedSlots} / {plan.progress.totalSlots} slot tamamlandı
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="relative p-4 bg-neutral-50/80 dark:bg-neutral-800/50 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewPlan(plan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white rounded-xl font-medium transition-all font-display"
                    >
                      <Eye className="w-4 h-4" />
                      Görüntüle
                    </motion.button>

                    {!plan.isActive && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActivatePlan(plan.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                        title="Aktif Et"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeletePlan(plan.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIStudyPlanGenerator onClose={handleAIGeneratorClose} />
      )}
    </div>
  );
};

export default StudyPlanPage;
