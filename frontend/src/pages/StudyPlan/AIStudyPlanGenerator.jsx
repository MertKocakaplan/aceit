import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectsAPI, studyPlanAPI } from '../../api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  X,
  Calendar,
  Clock,
  Sparkles,
  Target,
  Settings,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const AIStudyPlanGenerator = ({ onClose }) => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [preferences, setPreferences] = useState({
    startDate: '',
    endDate: '',
    dailyStudyHours: 5,
    preferredStartTime: '09:00',
    preferredEndTime: '22:00',
    breakDuration: 15,
    focusOnWeakTopics: true,
    includeReviewSessions: true,
    prioritySubjects: []
  });

  useEffect(() => {
    fetchSubjects();

    // Set default start date to today
    const today = new Date();
    const startDateStr = today.toISOString().split('T')[0];

    // Set default end date to 30 days from now
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    const endDateStr = endDate.toISOString().split('T')[0];

    setPreferences(prev => ({
      ...prev,
      startDate: startDateStr,
      endDate: endDateStr
    }));
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Fetch subjects error:', error);
      toast.error('Dersler yüklenemedi');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubjectToggle = (subjectId) => {
    setPreferences(prev => {
      const prioritySubjects = prev.prioritySubjects.includes(subjectId)
        ? prev.prioritySubjects.filter(id => id !== subjectId)
        : [...prev.prioritySubjects, subjectId];

      return {
        ...prev,
        prioritySubjects
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const startDate = new Date(preferences.startDate);
    const endDate = new Date(preferences.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error('Başlangıç tarihi bugünden önce olamaz');
      return;
    }

    if (endDate <= startDate) {
      toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      toast.error('Plan en az 7 gün olmalıdır');
      return;
    }

    if (daysDiff > 365) {
      toast.error('Plan en fazla 365 gün olabilir');
      return;
    }

    setGenerating(true);

    try {
      // Number değerlerini düzelt (input'tan string geliyor)
      const payload = {
        ...preferences,
        dailyStudyHours: Number(preferences.dailyStudyHours),
        breakDuration: Number(preferences.breakDuration)
      };

      const response = await studyPlanAPI.generateAI(payload);

      toast.success('AI planınız başarıyla oluşturuldu! 🎉', {
        description: 'Kişiselleştirilmiş çalışma planınızı görüntüleyebilirsiniz.'
      });

      // Close modal and navigate to detail page
      onClose();
      navigate(`/study-plans/${response.data.id}`);
    } catch (error) {
      console.error('Generate AI plan error:', error);

      const errorMessage = error.response?.data?.message || 'Plan oluşturulamadı';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl"
        >
          {/* Close Button - Fixed positioning with higher z-index */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!generating) onClose();
            }}
            disabled={generating}
            className="absolute top-4 right-4 z-50 p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-neutral-200/50 dark:border-neutral-700/50"
          >
            <X className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
          </button>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 overflow-hidden">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative z-10 flex items-center gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-normal text-white font-display tracking-wide mb-2">
                  AI Çalışma Planı
                </h2>
                <p className="text-white/90 text-lg">
                  Kişiselleştirilmiş çalışma planınızı oluşturun
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Date Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                  Tarih Aralığı
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Başlangıç Tarihi *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-neutral-400 group-focus-within:text-indigo-600" />
                    </div>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={preferences.startDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Bitiş Tarihi *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-neutral-400 group-focus-within:text-indigo-600" />
                    </div>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={preferences.endDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Study Hours & Time Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                  Çalışma Saatleri
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="dailyStudyHours" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Günlük Çalışma Saati *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Clock className="w-5 h-5 text-neutral-400 group-focus-within:text-indigo-600" />
                    </div>
                    <input
                      id="dailyStudyHours"
                      name="dailyStudyHours"
                      type="number"
                      min="1"
                      max="12"
                      value={preferences.dailyStudyHours}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="preferredStartTime" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Başlangıç Saati *
                  </label>
                  <input
                    id="preferredStartTime"
                    name="preferredStartTime"
                    type="time"
                    value={preferences.preferredStartTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="preferredEndTime" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Bitiş Saati *
                  </label>
                  <input
                    id="preferredEndTime"
                    name="preferredEndTime"
                    type="time"
                    value={preferences.preferredEndTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Break Duration */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                  Mola Ayarları
                </h3>
              </div>

              <div className="max-w-xs">
                <label htmlFor="breakDuration" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Mola Süresi (dakika) *
                </label>
                <input
                  id="breakDuration"
                  name="breakDuration"
                  type="number"
                  min="5"
                  max="30"
                  value={preferences.breakDuration}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            {/* AI Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                  AI Tercihleri
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="focusOnWeakTopics"
                    checked={preferences.focusOnWeakTopics}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-neutral-900 dark:text-white">
                        Zayıf Konulara Odaklan
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Başarı oranınız düşük olan konulara daha fazla zaman ayırın
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="includeReviewSessions"
                    checked={preferences.includeReviewSessions}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-neutral-900 dark:text-white">
                        Tekrar Seansları Ekle
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Öğrenilen konuları pekiştirmek için tekrar seansları planlayın
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Priority Subjects */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                  Öncelikli Dersler (Opsiyonel)
                </h3>
              </div>

              {loadingSubjects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map((subject) => {
                    const isSelected = preferences.prioritySubjects.includes(subject.id);
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => handleSubjectToggle(subject.id)}
                        className={`
                          flex items-center gap-2 p-3 rounded-xl border-2 transition-all
                          ${isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }
                        `}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="text-sm font-medium truncate">
                          {subject.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Seçtiğiniz dersler için daha fazla zaman ayrılacaktır
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6 space-y-4">
              {generating && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <div>
                      <p className="font-medium">AI planınızı oluşturuyor...</p>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                        Bu işlem 30-60 saniye sürebilir. Lütfen bekleyin.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={generating || loadingSubjects}
                className="relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
              >
                {/* Button pattern */}
                <div className="absolute inset-0 opacity-[0.08]">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="aiButtonPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="0.8" fill="white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#aiButtonPattern)" />
                  </svg>
                </div>

                <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      AI Planı Oluştur
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIStudyPlanGenerator;
