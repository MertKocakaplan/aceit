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
  Sparkles
} from 'lucide-react';
import { DashboardHeader, AnimatedBackground } from '../../ui';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
        <AnimatedBackground variant="dashboard" className="fixed -z-10" />
        <DashboardHeader user={user} onLogout={logout} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                  Çalışma Planlarım
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Planlarını oluştur ve takip et
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/study-plans/create-manual')}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Manuel Plan Oluştur
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAIGenerator(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
              >
                <Brain className="w-5 h-5" />
                AI Planı Oluştur
              </motion.button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-6">
              <Calendar className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-medium text-neutral-900 dark:text-white mb-2">
              Henüz planınız yok
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              AI ile kişiselleştirilmiş bir plan oluşturarak başlayın
            </p>
            <button
              onClick={() => setShowAIGenerator(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sparkles className="w-5 h-5" />
              İlk Planını Oluştur
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                {/* Glow effect */}
                {plan.isActive && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 via-primary-500/30 to-primary-600/20 rounded-2xl blur-xl opacity-50"></div>
                )}

                <div className="relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Active Badge */}
                  {plan.isActive && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Aktif
                      </div>
                    </div>
                  )}

                  {/* AI Generated Badge */}
                  {plan.isAIGenerated && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full shadow-lg">
                        <Brain className="w-3.5 h-3.5" />
                        AI
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800/50">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2 truncate">
                      {plan.title}
                    </h3>
                    {plan.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(plan.startDate).toLocaleDateString('tr-TR')} -{' '}
                        {new Date(plan.endDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Target className="w-4 h-4" />
                      <span>
                        {plan._count?.days || 0} gün • {plan.progress?.totalSlots || 0} slot
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {plan.progress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">İlerleme</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {plan.progress.completionRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${plan.progress.completionRate}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                          />
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-500">
                          {plan.progress.completedSlots} / {plan.progress.totalSlots} slot tamamlandı
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center gap-2">
                    <button
                      onClick={() => handleViewPlan(plan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Görüntüle
                    </button>

                    {!plan.isActive && (
                      <button
                        onClick={() => handleActivatePlan(plan.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIStudyPlanGenerator
          onClose={handleAIGeneratorClose}
        />
      )}
    </div>
  );
};

export default StudyPlanPage;
