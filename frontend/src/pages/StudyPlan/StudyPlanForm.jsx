import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { studyPlanAPI, subjectsAPI } from '../../api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Save,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DashboardHeader, AnimatedInput, AnimatedSelect } from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';
import { getTodayDate, getDateAfterDays, getLocalDateString } from '../../utils/dateUtils';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Pazar', short: 'Pz' },
  { id: 1, name: 'Pazartesi', short: 'Pt' },
  { id: 2, name: 'Salı', short: 'Sa' },
  { id: 3, name: 'Çarşamba', short: 'Ça' },
  { id: 4, name: 'Perşembe', short: 'Pe' },
  { id: 5, name: 'Cuma', short: 'Cu' },
  { id: 6, name: 'Cumartesi', short: 'Ct' }
];

const StudyPlanForm = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Plan Basic Info
  const [planInfo, setPlanInfo] = useState({
    title: '',
    description: '',
    startDate: getTodayDate(),
    endDate: getDateAfterDays(30),
    isActive: true
  });

  // New Slot Form
  const [newSlot, setNewSlot] = useState({
    subjectId: '',
    topicId: null,
    startTime: '09:00',
    endTime: '10:00',
    selectedDays: [1, 2, 3, 4, 5], // Default: weekdays
    slotType: 'study',
    notes: ''
  });

  // Added Slots List (template)
  const [slots, setSlots] = useState([]);

  // Focus state for animated inputs
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch {
      // Axios interceptor will show the error toast
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handlePlanInfoChange = (field, value) => {
    setPlanInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNewSlotChange = (field, value) => {
    setNewSlot(prev => ({ ...prev, [field]: value }));
  };

  const handleFocus = (e) => {
    setFocusedField(e.target.name);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const toggleDay = (dayId) => {
    setNewSlot(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter(d => d !== dayId)
        : [...prev.selectedDays, dayId].sort((a, b) => a - b)
    }));
  };

  const getSubjectTopics = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.topics || [];
  };

  const getSubjectById = (subjectId) => {
    return subjects.find(s => s.id === subjectId);
  };

  const addSlot = () => {
    if (!newSlot.subjectId) {
      toast.error('Lütfen bir ders seçin');
      return;
    }
    if (newSlot.selectedDays.length === 0) {
      toast.error('En az bir gün seçin');
      return;
    }
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('Bitiş saati başlangıç saatinden sonra olmalı');
      return;
    }

    const slot = {
      id: Math.random().toString(36).substr(2, 9),
      ...newSlot,
      subject: getSubjectById(newSlot.subjectId)
    };

    setSlots(prev => [...prev, slot]);

    // Reset form except days
    setNewSlot(prev => ({
      ...prev,
      subjectId: '',
      topicId: null,
      notes: ''
    }));

    toast.success('Çalışma slotu eklendi');
  };

  const removeSlot = (slotId) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}s ${mins}dk`;
    if (hours > 0) return `${hours} saat`;
    return `${mins} dakika`;
  };

  const getDaysText = (selectedDays) => {
    if (selectedDays.length === 7) return 'Her gün';
    if (selectedDays.length === 5 && !selectedDays.includes(0) && !selectedDays.includes(6)) {
      return 'Hafta içi';
    }
    if (selectedDays.length === 2 && selectedDays.includes(0) && selectedDays.includes(6)) {
      return 'Hafta sonu';
    }
    return selectedDays.map(d => DAYS_OF_WEEK.find(day => day.id === d)?.short).join(', ');
  };

  const getTotalWeeklyHours = () => {
    return slots.reduce((total, slot) => {
      const duration = calculateDuration(slot.startTime, slot.endTime);
      return total + (duration * slot.selectedDays.length);
    }, 0);
  };

  const handleSubmit = async () => {
    // Validation
    if (!planInfo.title.trim()) {
      toast.error('Plan başlığı gereklidir');
      return;
    }
    if (!planInfo.startDate || !planInfo.endDate) {
      toast.error('Başlangıç ve bitiş tarihleri gereklidir');
      return;
    }
    if (new Date(planInfo.startDate) >= new Date(planInfo.endDate)) {
      toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }
    if (slots.length === 0) {
      toast.error('En az bir çalışma slotu ekleyin');
      return;
    }

    setLoading(true);
    try {
      // Create plan first
      const planResponse = await studyPlanAPI.create({
        title: planInfo.title,
        description: planInfo.description,
        startDate: planInfo.startDate,
        endDate: planInfo.endDate,
        isActive: planInfo.isActive
      });

      const planId = planResponse.data.id;

      // Generate days based on date range and slots
      const start = new Date(planInfo.startDate);
      const end = new Date(planInfo.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dateStr = getLocalDateString(d);

        // Find slots that apply to this day
        const daySlots = slots.filter(slot => slot.selectedDays.includes(dayOfWeek));

        if (daySlots.length === 0) continue;

        // Calculate daily goal
        const dailyGoalMinutes = daySlots.reduce((sum, slot) => {
          return sum + calculateDuration(slot.startTime, slot.endTime);
        }, 0);

        // Create day
        const dayResponse = await studyPlanAPI.createDay(planId, {
          date: dateStr,
          dailyGoalMinutes
        });

        const dayId = dayResponse.data.id;

        // Create slots for this day
        for (const slot of daySlots) {
          await studyPlanAPI.createSlot(dayId, {
            subjectId: slot.subjectId,
            topicId: slot.topicId || null,
            startTime: slot.startTime,
            endTime: slot.endTime,
            priority: 3,
            slotType: slot.slotType,
            notes: slot.notes || ''
          });
        }
      }

      toast.success('Çalışma planı oluşturuldu! 🎉');
      navigate(`/study-plans/${planId}`);
    } catch {
      // Axios interceptor will show the error toast
    } finally {
      setLoading(false);
    }
  };

  const topics = newSlot.subjectId ? getSubjectTopics(newSlot.subjectId) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background Effects */}
      <DashboardBackgroundEffects />

      <DashboardHeader user={user} onLogout={logout} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Back Button & Title */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/study-plans')}
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Planlara Dön</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl">
              <Calendar className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-4xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                Manuel Plan Oluştur
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1 font-serif">
                Kendi çalışma programını hızlıca oluştur
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Plan Info & Add Slot */}
          <div className="space-y-6">
            {/* Plan Basic Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-3xl p-6 border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant"
            >
              <h2 className="text-xl font-medium text-neutral-900 dark:text-white font-display mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                Plan Bilgileri
              </h2>

              <div className="space-y-5">
                <AnimatedInput
                  id="title"
                  name="title"
                  type="text"
                  label="Plan Başlığı *"
                  value={planInfo.title}
                  onChange={(e) => handlePlanInfoChange('title', e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  focusedField={focusedField}
                  icon={BookOpen}
                  placeholder="Örn: TYT Hazırlık Programı"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={planInfo.description}
                    onChange={(e) => handlePlanInfoChange('description', e.target.value)}
                    placeholder="Plan hakkında notlar..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <AnimatedInput
                    id="startDate"
                    name="startDate"
                    type="date"
                    label="Başlangıç *"
                    value={planInfo.startDate}
                    onChange={(e) => handlePlanInfoChange('startDate', e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={Calendar}
                    required
                  />
                  <AnimatedInput
                    id="endDate"
                    name="endDate"
                    type="date"
                    label="Bitiş *"
                    value={planInfo.endDate}
                    onChange={(e) => handlePlanInfoChange('endDate', e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={Calendar}
                    required
                  />
                </div>

                <label className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={planInfo.isActive}
                    onChange={(e) => handlePlanInfoChange('isActive', e.target.checked)}
                    className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-medium text-emerald-900 dark:text-emerald-300">Aktif Plan</span>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Dashboard'da gösterilecek</p>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Add Slot Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-3xl p-6 border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant"
            >
              <h2 className="text-xl font-medium text-neutral-900 dark:text-white font-display mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-600" />
                Çalışma Slotu Ekle
              </h2>

              <div className="space-y-5">
                {/* Subject Selection */}
                {loadingSubjects ? (
                  <div className="h-12 bg-neutral-100 dark:bg-neutral-700 rounded-xl animate-pulse" />
                ) : (
                  <AnimatedSelect
                    id="subjectId"
                    name="subjectId"
                    label="Ders *"
                    value={newSlot.subjectId}
                    onChange={(e) => {
                      handleNewSlotChange('subjectId', e.target.value);
                      handleNewSlotChange('topicId', null);
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={BookOpen}
                    options={[
                      { value: '', label: 'Ders seçin...' },
                      ...subjects.map((subject) => ({
                        value: subject.id,
                        label: subject.name
                      }))
                    ]}
                    required
                  />
                )}

                {/* Topic Selection (if subject selected) */}
                {newSlot.subjectId && topics.length > 0 && (
                  <AnimatedSelect
                    id="topicId"
                    name="topicId"
                    label="Konu (opsiyonel)"
                    value={newSlot.topicId || ''}
                    onChange={(e) => handleNewSlotChange('topicId', e.target.value || null)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={Target}
                    options={[
                      { value: '', label: 'Tüm konular' },
                      ...topics.map((topic) => ({
                        value: topic.id,
                        label: topic.name
                      }))
                    ]}
                  />
                )}

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <AnimatedInput
                    id="startTime"
                    name="startTime"
                    type="time"
                    label="Başlangıç Saati"
                    value={newSlot.startTime}
                    onChange={(e) => handleNewSlotChange('startTime', e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={Clock}
                  />
                  <AnimatedInput
                    id="endTime"
                    name="endTime"
                    type="time"
                    label="Bitiş Saati"
                    value={newSlot.endTime}
                    onChange={(e) => handleNewSlotChange('endTime', e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={Clock}
                  />
                </div>

                {/* Days Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Günler *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = newSlot.selectedDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                            isSelected
                              ? 'bg-primary-600 text-white shadow-lg'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          }`}
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                  {/* Quick select buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setNewSlot(prev => ({ ...prev, selectedDays: [1, 2, 3, 4, 5] }))}
                      className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                      Hafta içi
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSlot(prev => ({ ...prev, selectedDays: [0, 6] }))}
                      className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                      Hafta sonu
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSlot(prev => ({ ...prev, selectedDays: [0, 1, 2, 3, 4, 5, 6] }))}
                      className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                      Her gün
                    </button>
                  </div>
                </div>

                {/* Slot Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Çalışma Türü
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'study', label: 'Çalışma', icon: BookOpen },
                      { value: 'review', label: 'Tekrar', icon: Target },
                      { value: 'practice', label: 'Pratik', icon: Sparkles }
                    ].map((type) => {
                      const isSelected = newSlot.slotType === type.value;
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleNewSlotChange('slotType', type.value)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                            isSelected
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-2 border-transparent hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <AnimatedInput
                  id="notes"
                  name="notes"
                  type="text"
                  label="Not (opsiyonel)"
                  value={newSlot.notes}
                  onChange={(e) => handleNewSlotChange('notes', e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  focusedField={focusedField}
                  icon={Sparkles}
                  placeholder="Örn: Soru çözümü, konu anlatımı..."
                />

                {/* Add Button */}
                <motion.button
                  type="button"
                  onClick={addSlot}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Slotu Ekle
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Added Slots & Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-6 shadow-elegant-xl text-white overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />

              <div className="relative">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Plan Özeti
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-primary-200 text-sm">Toplam Slot</p>
                    <p className="text-3xl font-display mt-1">{slots.length}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-primary-200 text-sm">Haftalık Çalışma</p>
                    <p className="text-3xl font-display mt-1">{formatDuration(getTotalWeeklyHours())}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Added Slots List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-3xl p-6 border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant"
            >
              <h2 className="text-xl font-medium text-neutral-900 dark:text-white font-display mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                Eklenen Slotlar
              </h2>

              {slots.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium">Henüz slot eklenmedi</p>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Soldan yeni çalışma slotu ekleyin
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  <AnimatePresence mode="popLayout">
                    {slots.map((slot) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        layout
                        className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600 group hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                      >
                        {/* Subject Color */}
                        <div
                          className="w-3 h-12 rounded-full flex-shrink-0"
                          style={{ backgroundColor: slot.subject?.color || '#7F021F' }}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-neutral-900 dark:text-white truncate">
                              {slot.subject?.name || 'Ders'}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                              {slot.slotType === 'study' ? 'Çalışma' : slot.slotType === 'review' ? 'Tekrar' : 'Pratik'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span>•</span>
                            <span>{getDaysText(slot.selectedDays)}</span>
                          </div>
                          {slot.notes && (
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 truncate">
                              {slot.notes}
                            </p>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Save Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading || slots.length === 0}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-medium shadow-elegant-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-600 disabled:hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-lg">Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  <span className="text-lg">Planı Kaydet</span>
                  <CheckCircle2 className="w-5 h-5 opacity-70" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyPlanForm;
