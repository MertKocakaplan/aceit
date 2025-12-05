import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { studySessionsAPI, subjectsAPI } from '../../api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  Award,
  Target,
  Zap,
} from 'lucide-react';
import { AnimatedBackground, DashboardHeader } from '../../ui';

const StudySessionList = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

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
      setSubjects(response.data);
    } catch (error) {
      console.error('Subjects error:', error);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await studySessionsAPI.getAll(filters);
      setSessions(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      toast.error('Kayıtlar yüklenemedi');
      console.error(error);
      setSessions([]);
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
      page: 1,
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

  // Calculate total stats
  const totalStats = sessions.reduce(
    (acc, session) => ({
      correct: acc.correct + session.questionsCorrect,
      wrong: acc.wrong + session.questionsWrong,
      empty: acc.empty + session.questionsEmpty,
      duration: acc.duration + session.duration,
    }),
    { correct: 0, wrong: 0, empty: 0, duration: 0 }
  );

  const totalQuestions = totalStats.correct + totalStats.wrong + totalStats.empty;
  const accuracy = totalQuestions > 0 ? ((totalStats.correct / totalQuestions) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-normal text-neutral-900 dark:text-white mb-3 font-display tracking-wide">
              Çalışma Geçmişi
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 font-sans text-lg">
              Tüm çalışma kayıtlarını görüntüle ve yönet
            </p>
          </motion.div>

          {/* Featured Stats & Filter Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Stats Summary - Now takes full width on large screens */}
            <div className="lg:col-span-3 relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 rounded-3xl p-8 overflow-hidden shadow-elegant-xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

              {/* Wave pattern */}
              <div className="absolute inset-0 opacity-[0.10]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="statsWaves" width="50" height="20" patternUnits="userSpaceOnUse">
                      <path d="M0 10 Q 12.5 0, 25 10 T 50 10" stroke="white" strokeWidth="0.8" fill="none" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#statsWaves)" />
                </svg>
              </div>

              <div className="relative z-10">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                      <TrendingUp className="w-6 h-6 text-secondary-200" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-normal text-white font-display tracking-wide">
                        Genel İstatistikler
                      </h3>
                      <p className="text-secondary-200 text-sm font-sans">Tüm zamanlar için özet</p>
                    </div>
                  </div>

                  {/* Filter & New Session */}
                  <div className="flex items-center gap-3">
                    {/* Compact Filter */}
                    <div className="relative">
                      <select
                        name="subjectId"
                        value={filters.subjectId}
                        onChange={handleFilterChange}
                        className="px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all outline-none font-sans text-sm appearance-none cursor-pointer pr-10"
                      >
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-neutral-800 text-white">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Filter className="w-4 h-4 text-white/60" />
                      </div>
                    </div>

                    {/* New Session Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/study-sessions/create')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-sans text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Yeni Kayıt
                    </motion.button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-secondary-400/20 to-secondary-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-secondary-200" />
                        <p className="text-xs text-secondary-200 font-sans uppercase tracking-wider">Kayıt</p>
                      </div>
                      <p className="text-4xl font-normal text-white font-display">{sessions.length}</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-300" />
                        <p className="text-xs text-secondary-200 font-sans uppercase tracking-wider">Doğru</p>
                      </div>
                      <p className="text-4xl font-normal text-green-300 font-display">{totalStats.correct}</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-300" />
                        <p className="text-xs text-secondary-200 font-sans uppercase tracking-wider">Yanlış</p>
                      </div>
                      <p className="text-4xl font-normal text-red-300 font-display">{totalStats.wrong}</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-yellow-300" />
                        <p className="text-xs text-secondary-200 font-sans uppercase tracking-wider">Başarı</p>
                      </div>
                      <p className="text-4xl font-normal text-yellow-300 font-display">{accuracy}%</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-secondary-400/20 to-secondary-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-secondary-200" />
                        <p className="text-xs text-secondary-200 font-sans uppercase tracking-wider">Süre</p>
                      </div>
                      <p className="text-4xl font-normal text-secondary-200 font-display">{formatDuration(totalStats.duration)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sessions List - Modern Table Style */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-700 dark:border-t-primary-400 rounded-full"
              />
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 font-sans">Yükleniyor...</p>
            </motion.div>
          ) : sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <BookOpen className="w-20 h-20 text-neutral-300 dark:text-neutral-700 mx-auto mb-6" />
              <h3 className="text-3xl font-normal text-neutral-900 dark:text-white mb-3 font-display">
                Henüz kayıt yok
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 font-sans text-lg">
                İlk çalışma kaydını oluşturarak başla
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/study-sessions/create')}
                className="relative bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 text-white px-8 py-4 rounded-xl font-medium hover:shadow-elegant-xl overflow-hidden inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                İlk Kaydı Oluştur
              </motion.button>
            </motion.div>
          ) : (
            <>
              {/* Table Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-sans"
              >
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-3">Ders & Konu</div>
                <div className="col-span-2">Tarih</div>
                <div className="col-span-1 text-center">Süre</div>
                <div className="col-span-3 text-center">Performans</div>
                <div className="col-span-2 text-right">İşlemler</div>
              </motion.div>

              {/* Sessions */}
              <div className="space-y-3">
                {sessions.map((session, index) => {
                  const total = session.questionsCorrect + session.questionsWrong + session.questionsEmpty;
                  const successRate = total > 0 ? (session.questionsCorrect / total) * 100 : 0;

                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                      onMouseEnter={() => setHoveredId(session.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Hover glow effect - More dramatic */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/0 via-primary-500/0 to-primary-600/0 group-hover:from-primary-600/30 group-hover:via-primary-500/40 group-hover:to-primary-600/30 rounded-2xl blur-lg transition duration-500 opacity-0 group-hover:opacity-100"></div>

                      {/* Main Row */}
                      <motion.div
                        whileHover={{ scale: 1.015, y: -4 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md border-l-4 shadow-elegant hover:shadow-elegant-xl transition-all overflow-hidden rounded-2xl"
                        style={{ borderLeftColor: session.subject.color }}
                      >
                        {/* Subtle gradient on hover - Enhanced */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-50/0 to-primary-50/0 group-hover:via-primary-50/50 group-hover:to-primary-50/40 dark:group-hover:via-primary-950/50 dark:group-hover:to-primary-950/40 transition-all duration-500" />

                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>

                        {/* Success rate progress bar - More subtle */}
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-700/60 via-green-600/60 to-green-700/60 dark:from-green-600/50 dark:via-green-500/50 dark:to-green-600/50 transition-all duration-500 group-hover:h-1.5"
                          style={{ width: `${successRate}%` }}
                          title={`Başarı Oranı: %${successRate.toFixed(1)}`}
                        />

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-6 items-center">
                          {/* Index */}
                          <div className="hidden md:flex col-span-1 justify-center">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-700 dark:text-primary-400 text-sm font-medium font-sans">
                              {(filters.page - 1) * filters.limit + index + 1}
                            </div>
                          </div>

                          {/* Subject & Topic */}
                          <div className="col-span-1 md:col-span-3">
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ scale: 1.2, rotate: 90 }}
                                className="w-4 h-4 rounded-full shadow-lg flex-shrink-0"
                                style={{ backgroundColor: session.subject.color }}
                              />
                              <div>
                                <h3 className="text-lg font-normal text-neutral-900 dark:text-white font-display">
                                  {session.subject.name}
                                </h3>
                                {session.topic && (
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">
                                    {session.topic.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span className="hidden lg:inline">{formatDate(session.date)}</span>
                              <span className="lg:hidden">{new Date(session.date).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="col-span-1 md:col-span-1">
                            <div className="flex md:justify-center items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 font-sans font-medium w-fit">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatDuration(session.duration)}</span>
                            </div>
                          </div>

                          {/* Performance Badges */}
                          <div className="col-span-1 md:col-span-3 flex justify-start md:justify-center gap-2 flex-wrap">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium font-sans border border-green-200 dark:border-green-800"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {session.questionsCorrect}
                            </motion.span>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium font-sans border border-red-200 dark:border-red-800"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              {session.questionsWrong}
                            </motion.span>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium font-sans border border-neutral-200 dark:border-neutral-600"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                              {session.questionsEmpty}
                            </motion.span>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 md:col-span-2 flex justify-start md:justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/study-sessions/${session.id}/edit`);
                              }}
                              className="p-2.5 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900 transition-all border border-primary-200 dark:border-primary-800"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(session.id);
                              }}
                              className="p-2.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 transition-all border border-red-200 dark:border-red-800"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between pt-6"
                >
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                    Toplam <span className="font-medium text-primary-700 dark:text-primary-400">{pagination.total}</span> kayıt -
                    Sayfa <span className="font-medium text-primary-700 dark:text-primary-400">{pagination.page}</span> / {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-3 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-2 border-neutral-200/80 dark:border-neutral-700/80 text-primary-700 dark:text-primary-400 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 dark:hover:bg-primary-950 hover:border-primary-400 dark:hover:border-primary-600 transition-all shadow-elegant"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-3 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-2 border-neutral-200/80 dark:border-neutral-700/80 text-primary-700 dark:text-primary-400 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 dark:hover:bg-primary-950 hover:border-primary-400 dark:hover:border-primary-600 transition-all shadow-elegant"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudySessionList;
