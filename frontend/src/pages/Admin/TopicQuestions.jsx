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
  ArrowLeft,
  Upload,
} from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  GlassCard,
  AnimatedButton,
  AnimatedSelect,
} from '../../ui';

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
      console.error(error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      // response = { success: true, data: [...] }
      setSubjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await subjectsAPI.getTopics(selectedSubject);
      // response = { success: true, data: [...] }
      setTopics(response.data);
    } catch (error) {
      toast.error('Konular yüklenemedi');
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
      console.error(error);
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kayıt başarısız');
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Yükleme başarısız');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between"
          >
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Admin Panel'e Dön</span>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Konu-Soru Dağılımı
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Her yıl hangi konudan kaç soru çıktığını kaydet
              </p>
            </div>

            <AnimatedButton
              onClick={() => setShowUploadModal(true)}
              variant="primary"
              icon={Upload}
            >
              CSV Toplu Yükle
            </AnimatedButton>
          </motion.div>

          {/* Filters */}
          <GlassCard className="p-6">
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
          </GlassCard>

          {/* Topics */}
          {selectedYear && selectedSubject && (
            <>
              {loading ? (
                <GlassCard className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Konular yükleniyor...</p>
                </GlassCard>
              ) : topics.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Bu derste henüz konu yok
                  </p>
                </GlassCard>
              ) : (
                <>
                  <GlassCard className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          Konular ve Soru Sayıları
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {topics.length} konu
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topics.map((topic) => (
                          <div key={topic.id} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {topic.name}
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={questionCounts[topic.id] ?? ''}
                              onChange={(e) => handleCountChange(topic.id, e.target.value)}
                              placeholder="Soru sayısı"
                              className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  <div className="flex justify-end">
                    <AnimatedButton
                      onClick={handleSubmit}
                      variant="primary"
                      icon={Save}
                      loading={saving}
                      disabled={saving}
                    >
                      Kaydet
                    </AnimatedButton>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                CSV Toplu Yükleme
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setCsvData('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUploadCSV}
                    disabled={uploading || !csvData}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-50 hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    {uploading ? 'Yükleniyor...' : 'Yükle'}
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TopicQuestions;