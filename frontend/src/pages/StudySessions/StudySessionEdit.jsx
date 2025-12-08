import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { subjectsAPI, studySessionsAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Save, Clock, BookOpen, CheckCircle, XCircle, MinusCircle, Edit3, X } from 'lucide-react';
import { DashboardHeader, AnimatedInput, AnimatedSelect } from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';

const StudySessionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: '',
    topicId: '',
    duration: '',
    questionsCorrect: '',
    questionsWrong: '',
    questionsEmpty: '',
  });

  // Focus state for animated inputs
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [sessionResponse, subjectsResponse] = await Promise.all([
        studySessionsAPI.getById(id),
        subjectsAPI.getAll(),
      ]);

      const session = sessionResponse.data;
      const subjectsData = subjectsResponse.data;

      setFormData({
        subjectId: session.subjectId,
        topicId: session.topicId || '',
        duration: session.duration.toString(),
        questionsCorrect: session.questionsCorrect.toString(),
        questionsWrong: session.questionsWrong.toString(),
        questionsEmpty: session.questionsEmpty.toString(),
      });

      setSubjects(subjectsData);

      // Load topics for the current subject
      if (session.subjectId) {
        try {
          const topicsResponse = await subjectsAPI.getTopics(session.subjectId);
          setTopics(topicsResponse.data);
        } catch (error) {
          console.error('Konular yüklenemedi:', error);
        }
      }
    } catch (error) {
      toast.error('Kayıt yüklenemedi');
      console.error(error);
      navigate('/study-sessions');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setFormData({
      ...formData,
      subjectId,
      topicId: '',
    });

    if (subjectId) {
      setLoadingTopics(true);
      try {
        const response = await subjectsAPI.getTopics(subjectId);
        setTopics(response.data);
      } catch (error) {
        console.error('Konular yüklenemedi:', error);
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    } else {
      setTopics([]);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'subjectId') {
      handleSubjectChange(e);
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleFocus = (e) => {
    setFocusedField(e.target.name);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        subjectId: formData.subjectId,
        topicId: formData.topicId || null,
        duration: parseInt(formData.duration),
        questionsCorrect: parseInt(formData.questionsCorrect) || 0,
        questionsWrong: parseInt(formData.questionsWrong) || 0,
        questionsEmpty: parseInt(formData.questionsEmpty) || 0,
      };

      await studySessionsAPI.update(id, updateData);
      toast.success('Başarılı! 🎉', {
        description: 'Kayıt güncellendi.',
      });
      navigate('/study-sessions');
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
        <DashboardBackgroundEffects />
        <DashboardHeader user={user} onLogout={logout} />

        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-700 dark:border-t-primary-400 rounded-full mx-auto mb-4"
              />
              <p className="text-lg text-neutral-600 dark:text-neutral-400 font-sans">Yükleniyor...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <DashboardBackgroundEffects />
      <DashboardHeader user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 via-primary-500/30 to-primary-600/20 rounded-3xl blur-xl opacity-50"></div>

          <div className="relative bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-elegant-xl overflow-hidden">
            {/* Decorative header bar */}
            <div className="relative bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 p-8 overflow-hidden">
              {/* Pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              <div className="relative z-10 flex items-center gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Edit3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-normal text-white font-display tracking-wide mb-2">
                    Çalışma Kaydını Düzenle
                  </h1>
                  <p className="text-secondary-200 text-lg font-sans">
                    Çalışma bilgilerini güncelle
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Subject & Topic Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
                  <h2 className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                    Ders Bilgileri
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subject Selection */}
                  <AnimatedSelect
                    id="subjectId"
                    name="subjectId"
                    label="Ders *"
                    value={formData.subjectId}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={BookOpen}
                    options={[
                      { value: '', label: 'Ders Seçin' },
                      ...subjects.map((subject) => ({
                        value: subject.id,
                        label: subject.name
                      }))
                    ]}
                    required
                  />

                  {/* Topic Selection */}
                  {formData.subjectId && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AnimatedSelect
                        id="topicId"
                        name="topicId"
                        label="Konu (Opsiyonel)"
                        value={formData.topicId}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        focusedField={focusedField}
                        icon={BookOpen}
                        options={[
                          { value: '', label: 'Genel (Konu seçilmedi)' },
                          ...topics.map((topic) => ({
                            value: topic.id,
                            label: topic.name
                          }))
                        ]}
                        disabled={loadingTopics || topics.length === 0}
                      />
                      {loadingTopics && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-2">
                          Konular yükleniyor...
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Duration Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
                  <h2 className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                    Süre Bilgisi
                  </h2>
                </div>

                <div className="max-w-md">
                  <AnimatedInput
                    id="duration"
                    name="duration"
                    type="number"
                    label="Çalışma Süresi (dakika) *"
                    value={formData.duration}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    focusedField={focusedField}
                    icon={Clock}
                    placeholder="60"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Question Stats Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
                  <h2 className="text-xl font-medium text-neutral-900 dark:text-white font-display">
                    Soru İstatistikleri
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Correct */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-2xl p-6 border-2 border-green-200/50 dark:border-green-800/30 group-focus-within:border-green-500 dark:group-focus-within:border-green-500 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <label htmlFor="questionsCorrect" className="text-sm font-medium text-green-800 dark:text-green-300 font-sans">
                          Doğru
                        </label>
                      </div>
                      <input
                        id="questionsCorrect"
                        name="questionsCorrect"
                        type="number"
                        min="0"
                        value={formData.questionsCorrect}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-white/70 dark:bg-neutral-900/50 border border-green-200 dark:border-green-800/50 rounded-xl focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none font-sans text-neutral-900 dark:text-white text-lg font-medium"
                      />
                    </div>
                  </div>

                  {/* Wrong */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 rounded-2xl p-6 border-2 border-red-200/50 dark:border-red-800/30 group-focus-within:border-red-500 dark:group-focus-within:border-red-500 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <label htmlFor="questionsWrong" className="text-sm font-medium text-red-800 dark:text-red-300 font-sans">
                          Yanlış
                        </label>
                      </div>
                      <input
                        id="questionsWrong"
                        name="questionsWrong"
                        type="number"
                        min="0"
                        value={formData.questionsWrong}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-white/70 dark:bg-neutral-900/50 border border-red-200 dark:border-red-800/50 rounded-xl focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none font-sans text-neutral-900 dark:text-white text-lg font-medium"
                      />
                    </div>
                  </div>

                  {/* Empty */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-2xl p-6 border-2 border-amber-200/50 dark:border-amber-800/30 group-focus-within:border-amber-500 dark:group-focus-within:border-amber-500 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                          <MinusCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <label htmlFor="questionsEmpty" className="text-sm font-medium text-amber-800 dark:text-amber-300 font-sans">
                          Boş
                        </label>
                      </div>
                      <input
                        id="questionsEmpty"
                        name="questionsEmpty"
                        type="number"
                        min="0"
                        value={formData.questionsEmpty}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-white/70 dark:bg-neutral-900/50 border border-amber-200 dark:border-amber-800/50 rounded-xl focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-sans text-neutral-900 dark:text-white text-lg font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 grid grid-cols-2 gap-4">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => navigate('/study-sessions')}
                  className="relative bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-neutral-300 dark:border-neutral-700 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-elegant hover:border-neutral-400 dark:hover:border-neutral-600 hover:scale-[1.02] overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 font-sans text-base">
                    <X className="w-5 h-5" />
                    İptal
                  </span>
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-elegant-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                >
                  {/* Button pattern */}
                  <div className="absolute inset-0 opacity-[0.08]">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="editButtonPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="0.8" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#editButtonPattern)" />
                    </svg>
                  </div>

                  <span className="relative z-10 flex items-center justify-center gap-2 font-sans text-base">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Güncelle
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StudySessionEdit;
