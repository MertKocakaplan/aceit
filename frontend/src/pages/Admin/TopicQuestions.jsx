import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { adminAPI, subjectsAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Save,
  Upload,
} from 'lucide-react';
import {
  DashboardHeader,
  AnimatedButton,
  AnimatedSelect,
  Modal,
} from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';
import logger from '../../utils/logger';

const TopicQuestions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // CSV Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchYears();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics();
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedYear && selectedSubject) {
      fetchQuestionCounts();
    }
  }, [selectedYear, selectedSubject]);

  const fetchYears = async () => {
    try {
      const response = await adminAPI.examYears.getAll();
      // response = { success: true, data: [...] }
      setYears(response.data);
      const activeYear = response.data.find(y => y.isActive);
      if (activeYear) {
        setSelectedYear(activeYear.id);
      }
    } catch (error) {
      logger.error('Failed to fetch exam years:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      // response = { success: true, data: [...] }
      setSubjects(response.data);
    } catch (error) {
      logger.error('Failed to fetch subjects:', error);
    }
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await subjectsAPI.getTopics(selectedSubject);
      // response = { success: true, data: [...] }
      setTopics(response.data);
    } catch {
      // Axios interceptor will show the error toast
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionCounts = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.topicQuestionCounts.getByExamYear(selectedYear);
      // response = { success: true, data: [...] }
      const data = response.data;

      const counts = {};
      data.forEach(item => {
        counts[item.topicId] = item.questionCount;
      });
      setQuestionCounts(counts);
    } catch (error) {
      logger.error('Failed to fetch question counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (topicId, value) => {
    setQuestionCounts({
      ...questionCounts,
      [topicId]: value === '' ? '' : parseInt(value) || 0,
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = topics
        .filter(topic => questionCounts[topic.id] !== undefined && questionCounts[topic.id] !== '')
        .map(topic => ({
          topicId: topic.id,
          questionCount: parseInt(questionCounts[topic.id]) || 0,
        }));

      if (data.length === 0) {
        toast.error('Lütfen en az bir konu için soru sayısı girin');
        setSaving(false);
        return;
      }

      await adminAPI.topicQuestionCounts.upsertBulk({
        examYearId: selectedYear,
        data,
      });

      toast.success(`${data.length} konu güncellendi`);
    } catch {
      // Axios interceptor will show the error toast
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCSV = async () => {
    setUploading(true);
    try {
      const result = await adminAPI.topicQuestionCounts.uploadCSV({ csvData });
      toast.success(result.message);
      setShowUploadModal(false);
      setCsvData('');
      fetchYears();
    } catch {
      // Axios interceptor will show the error toast
    } finally {
      setUploading(false);
    }
  };

  const yearOptions = years.map(year => ({
    value: year.id,
    label: `${year.year}${year.isActive ? ' (Aktif)' : ''}`,
  }));

  const subjectOptions = subjects.map(subject => ({
    value: subject.id,
    label: subject.name,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <DashboardBackgroundEffects />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-elegant">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-normal bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-display">
                    Konu-Soru Dağılımı
                  </h1>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1 font-display">
                    Her yıl hangi konudan kaç soru çıktığını kaydet
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-elegant font-display font-medium flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                CSV Toplu Yükle
              </motion.button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600"></div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatedSelect
                  id="year"
                  name="year"
                  label="Sınav Yılı"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  icon={Calendar}
                  options={[
                    { value: '', label: 'Yıl Seçin' },
                    ...yearOptions,
                  ]}
                  required
                />

                <AnimatedSelect
                  id="subject"
                  name="subject"
                  label="Ders"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  icon={BookOpen}
                  options={[
                    { value: '', label: 'Ders Seçin' },
                    ...subjectOptions,
                  ]}
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Topics */}
          {selectedYear && selectedSubject && (
            <>
              {loading ? (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-emerald-600 mx-auto"></div>
                  <p className="mt-4 text-neutral-600 dark:text-neutral-400 font-display">Konular yükleniyor...</p>
                </div>
              ) : topics.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant p-12 text-center"
                >
                  <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400 font-display">
                    Bu derste henüz konu yok
                  </p>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600"></div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 font-display">
                            Konular ve Soru Sayıları
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display">
                            <span className="font-semibold">{topics.length}</span> konu
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {topics.map((topic) => (
                            <div key={topic.id} className="space-y-2">
                              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
                                {topic.name}
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={questionCounts[topic.id] ?? ''}
                                onChange={(e) => handleCountChange(topic.id, e.target.value)}
                                placeholder="Soru sayısı"
                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-display"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-elegant font-display font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </motion.button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* CSV Upload Modal */}
      <Modal
        show={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setCsvData('');
        }}
        title="CSV Toplu Yükleme"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-display">
              CSV Verisi (Virgülle ayrılmış)
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Ders,Konu,2024,2023,2022,2021,2020,2019,2018
TÜRKÇE,Ses Bilgisi,0,1,0,1,0,1,3
TÜRKÇE,Dil Bilgisi,0,2,3,2,3,8,1
..."
              rows={15}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm transition-all"
            />
          </div>

          <div className="flex gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowUploadModal(false);
                setCsvData('');
              }}
              className="flex-1 px-4 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-display font-medium"
            >
              İptal
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUploadCSV}
              disabled={uploading || !csvData}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl disabled:opacity-50 hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-elegant font-display font-medium"
            >
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TopicQuestions;