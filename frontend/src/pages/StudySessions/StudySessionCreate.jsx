import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { subjectsAPI, studySessionsAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Clock, BookOpen, CheckCircle, XCircle, MinusCircle, ArrowLeft } from 'lucide-react';
import {
  AnimatedBackground,
  GlassCard,
  AnimatedInput,
  AnimatedSelect,
  AnimatedButton,
  DashboardHeader,
} from '../../ui';

const StudySessionCreate = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    duration: '',
    questionsCorrect: '',
    questionsWrong: '',
    questionsEmpty: '',
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectsAPI.getAll();
      setSubjects(data);
    } catch (error) {
      toast.error('Dersler yüklenemedi');
      console.error(error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sayı alanlarını integer'a çevir
      const sessionData = {
        subjectId: formData.subjectId,
        duration: parseInt(formData.duration),
        questionsCorrect: parseInt(formData.questionsCorrect) || 0,
        questionsWrong: parseInt(formData.questionsWrong) || 0,
        questionsEmpty: parseInt(formData.questionsEmpty) || 0,
      };

      console.log('📤 Gönderilen data:', sessionData); 
      console.log('👤 User exam type:', user?.examType);

      await studySessionsAPI.create(sessionData);
      toast.success('Çalışma kaydı oluşturuldu!');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Tam hata:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.message || 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  // Subjects'i select options'a çevir
  const subjectOptions = subjects.map(subject => ({
    value: subject.id,
    label: `${subject.name}`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Form Card */}
          <GlassCard className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Yeni Çalışma Kaydı
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-16">
                Bugünkü çalışmanı kaydet ve ilerlemeyi takip et
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject Selection */}
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
                disabled={loadingSubjects}
                required
              />

              {/* Duration */}
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

              {/* Question Stats */}
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

              {/* Submit Button */}
              <AnimatedButton
                type="submit"
                variant="primary"
                loading={loading}
                icon={Plus}
                className="w-full"
              >
                Kaydı Oluştur
              </AnimatedButton>
            </form>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default StudySessionCreate;