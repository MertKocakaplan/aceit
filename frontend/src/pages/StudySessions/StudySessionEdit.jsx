import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { subjectsAPI, studySessionsAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Save, Clock, BookOpen, CheckCircle, XCircle, MinusCircle, ArrowLeft } from 'lucide-react';
import {
  AnimatedBackground,
  GlassCard,
  AnimatedInput,
  AnimatedSelect,
  AnimatedButton,
  DashboardHeader,
} from '../../ui';

const StudySessionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    duration: '',
    topicId: '',
    questionsCorrect: '',
    questionsWrong: '',
    questionsEmpty: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [session, subjectsData] = await Promise.all([
        studySessionsAPI.getById(id),
        subjectsAPI.getAll(),
      ]);

      setFormData({
        subjectId: session.subjectId,
        duration: session.duration.toString(),
        questionsCorrect: session.questionsCorrect.toString(),
        questionsWrong: session.questionsWrong.toString(),
        questionsEmpty: session.questionsEmpty.toString(),
      });

      setSubjects(subjectsData);
    } catch (error) {
      toast.error('Kayıt yüklenemedi');
      console.error(error);
      navigate('/study-sessions');
    } finally {
      setLoadingData(false);
    }
  };

    // Ders değişince konuları getir
  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setFormData({
      ...formData,
      subjectId,
      topicId: '', // Ders değişince konu sıfırlansın
    });

    if (subjectId) {
      setLoadingTopics(true);
      try {
        const topicsData = await subjectsAPI.getTopics(subjectId);
        setTopics(topicsData);
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
    // Subject değişiyorsa özel handler
    if (e.target.name === 'subjectId') {
      handleSubjectChange(e);
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
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
      toast.success('Kayıt güncellendi!');
      navigate('/study-sessions');
    } catch (error) {
      toast.error(error.message || 'Kayıt güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = subjects.map(subject => ({
    value: subject.id,
    label: subject.name,
  }));

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AnimatedBackground variant="dashboard" className="fixed -z-10" />
        <DashboardHeader user={user} onLogout={logout} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GlassCard className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/study-sessions')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geçmişe Dön</span>
          </motion.button>

          <GlassCard className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Save className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Çalışma Kaydını Düzenle
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-16">
                Çalışma bilgilerini güncelle
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatedSelect
                id="subjectId"
                name="subjectId"
                label="Ders"
                value={formData.subjectId}
                onChange={handleChange}
                onFocus={() => setFocusedField('subjectId')}
                onBlur={() => setFocusedField(null)}
                focusedField={focusedField}
                icon={BookOpen}
                options={subjectOptions}
                required
              />

              {/* Topic Selection - Opsiyonel */}
              {formData.subjectId && (
                <AnimatedSelect
                  id="topicId"
                  name="topicId"
                  label="Konu (Opsiyonel)"
                  value={formData.topicId}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('topicId')}
                  onBlur={() => setFocusedField(null)}
                  focusedField={focusedField}
                  icon={BookOpen}
                  options={[
                    { value: '', label: 'Genel (Konu seçilmedi)' },
                    ...topics.map(topic => ({
                      value: topic.id,
                      label: topic.name,
                    })),
                  ]}
                  disabled={loadingTopics || topics.length === 0}
                />
              )}

              {loadingTopics && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Konular yükleniyor...
                </p>
              )}

              <AnimatedInput
                id="duration"
                name="duration"
                type="number"
                label="Çalışma Süresi (dakika)"
                value={formData.duration}
                onChange={handleChange}
                onFocus={() => setFocusedField('duration')}
                onBlur={() => setFocusedField(null)}
                focusedField={focusedField}
                icon={Clock}
                min="1"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnimatedInput
                  id="questionsCorrect"
                  name="questionsCorrect"
                  type="number"
                  label="Doğru"
                  value={formData.questionsCorrect}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('questionsCorrect')}
                  onBlur={() => setFocusedField(null)}
                  focusedField={focusedField}
                  icon={CheckCircle}
                  min="0"
                  placeholder="0"
                />

                <AnimatedInput
                  id="questionsWrong"
                  name="questionsWrong"
                  type="number"
                  label="Yanlış"
                  value={formData.questionsWrong}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('questionsWrong')}
                  onBlur={() => setFocusedField(null)}
                  focusedField={focusedField}
                  icon={XCircle}
                  min="0"
                  placeholder="0"
                />

                <AnimatedInput
                  id="questionsEmpty"
                  name="questionsEmpty"
                  type="number"
                  label="Boş"
                  value={formData.questionsEmpty}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('questionsEmpty')}
                  onBlur={() => setFocusedField(null)}
                  focusedField={focusedField}
                  icon={MinusCircle}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-4">
                <AnimatedButton
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/study-sessions')}
                  className="flex-1"
                >
                  İptal
                </AnimatedButton>
                <AnimatedButton
                  type="submit"
                  variant="primary"
                  loading={loading}
                  icon={Save}
                  className="flex-1"
                >
                  Güncelle
                </AnimatedButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default StudySessionEdit;