import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { studyPlanAPI, subjectsAPI } from '../../api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Save
} from 'lucide-react';
import { DashboardHeader, AnimatedBackground } from '../../ui';

const StudyPlanForm = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  // Step 2: Daily Schedule Template
  const [dailyTemplate, setDailyTemplate] = useState([]);

  // Step 3: Specific Days (auto-generated from template)
  const [days, setDays] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Fetch subjects error:', error);
      toast.error('Dersler yüklenemedi');
    }
  };

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!basicInfo.title.trim()) {
      toast.error('Başlık gereklidir');
      return false;
    }
    if (!basicInfo.startDate || !basicInfo.endDate) {
      toast.error('Başlangıç ve bitiş tarihleri gereklidir');
      return false;
    }
    if (new Date(basicInfo.startDate) >= new Date(basicInfo.endDate)) {
      toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return false;
    }
    return true;
  };

  const generateDaysFromTemplate = () => {
    const start = new Date(basicInfo.startDate);
    const end = new Date(basicInfo.endDate);
    const generatedDays = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = new Date(d).toISOString().split('T')[0];
      generatedDays.push({
        date: dateStr,
        slots: dailyTemplate.map(slot => ({
          ...slot,
          id: Math.random().toString(36).substr(2, 9) // Temporary ID
        }))
      });
    }

    setDays(generatedDays);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (dailyTemplate.length === 0) {
        toast.error('En az bir çalışma slot\'u ekleyin');
        return;
      }
      generateDaysFromTemplate();
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const addSlotToTemplate = () => {
    const newSlot = {
      id: Math.random().toString(36).substr(2, 9),
      subjectId: '',
      topicId: null,
      startTime: '09:00',
      endTime: '10:00',
      priority: 3,
      slotType: 'study',
      notes: ''
    };
    setDailyTemplate(prev => [...prev, newSlot]);
  };

  const removeSlotFromTemplate = (slotId) => {
    setDailyTemplate(prev => prev.filter(s => s.id !== slotId));
  };

  const updateTemplateSlot = (slotId, field, value) => {
    setDailyTemplate(prev =>
      prev.map(slot =>
        slot.id === slotId ? { ...slot, [field]: value } : slot
      )
    );
  };

  const updateDaySlot = (dayIndex, slotIndex, field, value) => {
    setDays(prev => {
      const newDays = [...prev];
      newDays[dayIndex].slots[slotIndex][field] = value;
      return newDays;
    });
  };

  const removeDaySlot = (dayIndex, slotIndex) => {
    setDays(prev => {
      const newDays = [...prev];
      newDays[dayIndex].slots.splice(slotIndex, 1);
      return newDays;
    });
  };

  const addSlotToDay = (dayIndex) => {
    const newSlot = {
      id: Math.random().toString(36).substr(2, 9),
      subjectId: '',
      topicId: null,
      startTime: '09:00',
      endTime: '10:00',
      priority: 3,
      slotType: 'study',
      notes: ''
    };
    setDays(prev => {
      const newDays = [...prev];
      newDays[dayIndex].slots.push(newSlot);
      return newDays;
    });
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create plan first
      const planResponse = await studyPlanAPI.create({
        title: basicInfo.title,
        description: basicInfo.description,
        startDate: basicInfo.startDate,
        endDate: basicInfo.endDate,
        isActive: basicInfo.isActive
      });

      const planId = planResponse.data.id;

      // Create days and slots
      for (const day of days) {
        // Skip days with no slots
        if (day.slots.length === 0) continue;

        const dailyGoalMinutes = day.slots.reduce((sum, slot) => {
          return sum + calculateDuration(slot.startTime, slot.endTime);
        }, 0);

        const dayResponse = await studyPlanAPI.createDay(planId, {
          date: day.date,
          dailyGoalMinutes
        });

        const dayId = dayResponse.data.id;

        // Create slots for this day
        for (const slot of day.slots) {
          if (!slot.subjectId) continue; // Skip empty slots

          await studyPlanAPI.createSlot(dayId, {
            subjectId: slot.subjectId,
            topicId: slot.topicId || null,
            startTime: slot.startTime,
            endTime: slot.endTime,
            priority: slot.priority,
            slotType: slot.slotType,
            notes: slot.notes || ''
          });
        }
      }

      toast.success('Çalışma planı oluşturuldu! 🎉');
      navigate(`/study-plans/${planId}`);
    } catch (error) {
      console.error('Create plan error:', error);
      toast.error(error.response?.data?.message || 'Plan oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectTopics = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.topics || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <h1 className="text-4xl font-normal text-neutral-900 dark:text-white font-display tracking-wide mb-2">
            Manuel Çalışma Planı Oluştur
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Kendi çalışma planınızı tamamen özelleştirin
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    step >= num
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 3 && (
                  <div
                    className={`w-16 h-1 rounded-full transition-all ${
                      step > num
                        ? 'bg-primary-600'
                        : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-16 mt-3">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Temel Bilgiler
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Günlük Şablon
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Gün Düzenle
            </span>
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1BasicInfo
              basicInfo={basicInfo}
              onChange={handleBasicInfoChange}
              onNext={handleNextStep}
            />
          )}

          {step === 2 && (
            <Step2DailyTemplate
              dailyTemplate={dailyTemplate}
              subjects={subjects}
              getSubjectTopics={getSubjectTopics}
              onAddSlot={addSlotToTemplate}
              onRemoveSlot={removeSlotFromTemplate}
              onUpdateSlot={updateTemplateSlot}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {step === 3 && (
            <Step3EditDays
              days={days}
              subjects={subjects}
              getSubjectTopics={getSubjectTopics}
              onUpdateSlot={updateDaySlot}
              onRemoveSlot={removeDaySlot}
              onAddSlot={addSlotToDay}
              onSubmit={handleSubmit}
              onPrev={handlePrevStep}
              loading={loading}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Step 1: Basic Info
const Step1BasicInfo = ({ basicInfo, onChange, onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-8"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Plan Başlığı *
          </label>
          <input
            type="text"
            value={basicInfo.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Örn: TYT Matematik Çalışma Planı"
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Açıklama
          </label>
          <textarea
            value={basicInfo.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Plan hakkında notlar..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Başlangıç Tarihi *
            </label>
            <input
              type="date"
              value={basicInfo.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Bitiş Tarihi *
            </label>
            <input
              type="date"
              value={basicInfo.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={basicInfo.isActive}
            onChange={(e) => onChange('isActive', e.target.checked)}
            className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-sm text-neutral-700 dark:text-neutral-300">
            Bu planı aktif plan olarak ayarla
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <span>Devam Et</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Step 2: Daily Template
const Step2DailyTemplate = ({
  dailyTemplate,
  subjects,
  getSubjectTopics,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot,
  onNext,
  onPrev
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-8"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          Günlük Çalışma Şablonu
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Buraya eklediğiniz slot'lar her güne otomatik olarak uygulanacak. Sonraki adımda günlere özel düzenlemeler yapabilirsiniz.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {dailyTemplate.map((slot, index) => (
          <SlotEditor
            key={slot.id}
            slot={slot}
            subjects={subjects}
            getSubjectTopics={getSubjectTopics}
            onChange={(field, value) => onUpdateSlot(slot.id, field, value)}
            onRemove={() => onRemoveSlot(slot.id)}
          />
        ))}

        {dailyTemplate.length === 0 && (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            Henüz slot eklenmedi
          </div>
        )}
      </div>

      <button
        onClick={onAddSlot}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Slot Ekle</span>
      </button>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <span>Günleri Oluştur</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Step 3: Edit Days
const Step3EditDays = ({
  days,
  subjects,
  getSubjectTopics,
  onUpdateSlot,
  onRemoveSlot,
  onAddSlot,
  onSubmit,
  onPrev,
  loading
}) => {
  const [expandedDay, setExpandedDay] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6 mb-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          Günlük Slot Düzenlemeleri
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Her günün çalışma slot'larını özelleştirebilirsiniz. İstediğiniz slot'ları silebilir veya yeni slot ekleyebilirsiniz.
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {days.map((day, dayIndex) => (
          <div
            key={day.date}
            className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden"
          >
            <button
              onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
              className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="font-medium text-neutral-900 dark:text-white">
                  {new Date(day.date).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  ({day.slots.length} slot)
                </span>
              </div>
              <motion.div
                animate={{ rotate: expandedDay === dayIndex ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-5 h-5 text-neutral-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedDay === dayIndex && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-neutral-200/50 dark:border-neutral-800/50"
                >
                  <div className="p-4 space-y-3">
                    {day.slots.map((slot, slotIndex) => (
                      <SlotEditor
                        key={slot.id}
                        slot={slot}
                        subjects={subjects}
                        getSubjectTopics={getSubjectTopics}
                        onChange={(field, value) =>
                          onUpdateSlot(dayIndex, slotIndex, field, value)
                        }
                        onRemove={() => onRemoveSlot(dayIndex, slotIndex)}
                      />
                    ))}

                    <button
                      onClick={() => onAddSlot(dayIndex)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-600 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Slot Ekle</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Planı Kaydet</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// Slot Editor Component
const SlotEditor = ({ slot, subjects, getSubjectTopics, onChange, onRemove }) => {
  const topics = slot.subjectId ? getSubjectTopics(slot.subjectId) : [];

  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
      <div className="grid grid-cols-12 gap-3">
        {/* Subject */}
        <div className="col-span-3">
          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
            Ders *
          </label>
          <select
            value={slot.subjectId}
            onChange={(e) => {
              onChange('subjectId', e.target.value);
              onChange('topicId', null); // Reset topic
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Seçiniz</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic */}
        <div className="col-span-3">
          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
            Konu
          </label>
          <select
            value={slot.topicId || ''}
            onChange={(e) => onChange('topicId', e.target.value || null)}
            disabled={!slot.subjectId}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <option value="">Seçiniz</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        <div className="col-span-2">
          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
            Başlangıç
          </label>
          <input
            type="time"
            value={slot.startTime}
            onChange={(e) => onChange('startTime', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* End Time */}
        <div className="col-span-2">
          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
            Bitiş
          </label>
          <input
            type="time"
            value={slot.endTime}
            onChange={(e) => onChange('endTime', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Slot Type */}
        <div className="col-span-1">
          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
            Tür
          </label>
          <select
            value={slot.slotType}
            onChange={(e) => onChange('slotType', e.target.value)}
            className="w-full px-2 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="study">Çalışma</option>
            <option value="review">Tekrar</option>
            <option value="practice">Pratik</option>
          </select>
        </div>

        {/* Delete */}
        <div className="col-span-1 flex items-end">
          <button
            onClick={onRemove}
            className="w-full p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-3">
        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
          Notlar
        </label>
        <input
          type="text"
          value={slot.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="İsteğe bağlı notlar..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
};

export default StudyPlanForm;
