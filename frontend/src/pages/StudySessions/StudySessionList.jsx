import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { studySessionsAPI, subjectsAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Plus,
  Clock,
  Calendar,
  BookOpen,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  GlassCard,
  AnimatedButton,
  AnimatedSelect,
} from '../../ui';

const StudySessionList = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    subjectId: '',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchSubjects();
    fetchSessions();
  }, [filters]);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      // response = { success: true, data: [...] }
      setSubjects(response.data);
    } catch (error) {
      console.error('Subjects error:', error);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await studySessionsAPI.getAll(filters);
      console.log('📦 Response:', response);
      
      setSessions(response.data || []); 
      setPagination(response.pagination || null);
    } catch (error) {
      toast.error('Kayıtlar yüklenemedi');
      console.error(error);
      setSessions([]); // Hata durumunda boş array
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await studySessionsAPI.delete(id);
      toast.success('Kayıt silindi');
      fetchSessions();
    } catch (error) {
      toast.error('Kayıt silinemedi');
      console.error(error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1, // Filter değişince sayfa 1'e dön
    });
  };

  const goToPage = (page) => {
    setFilters({ ...filters, page });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`;
  };

  const subjectOptions = [
    { value: '', label: 'Tüm Dersler' },
    ...subjects.map((subject) => ({
      value: subject.id,
      label: subject.name,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />

      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Çalışma Geçmişi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tüm çalışma kayıtlarını görüntüle ve yönet
              </p>
            </div>

            <AnimatedButton
              onClick={() => navigate('/study-sessions/create')}
              variant="primary"
              icon={Plus}
            >
              Yeni Kayıt
            </AnimatedButton>
          </motion.div>

          {/* Filters */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Filtrele
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedSelect
                name="subjectId"
                value={filters.subjectId}
                onChange={handleFilterChange}
                options={subjectOptions}
                icon={BookOpen}
                label="Ders"
              />
            </div>
          </GlassCard>

          {/* Sessions List */}
          {loading ? (
            <GlassCard className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            </GlassCard>
          ) : sessions.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Henüz kayıt yok
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                İlk çalışma kaydını oluşturarak başla
              </p>
              <AnimatedButton
                onClick={() => navigate('/study-sessions/create')}
                variant="primary"
                icon={Plus}
              >
                İlk Kaydı Oluştur
              </AnimatedButton>
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard className="p-6 hover:shadow-xl transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Subject & Date */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: session.subject.color }}
                            />
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              {session.subject.name}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(session.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(session.duration)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Stats */}
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Doğru</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              {session.questionsCorrect}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Yanlış</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              {session.questionsWrong}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Boş</p>
                            <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                              {session.questionsEmpty}
                            </p>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/study-sessions/${session.id}/edit`)}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(session.id)}
                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Toplam {pagination.total} kayıt - Sayfa {pagination.page} / {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudySessionList;