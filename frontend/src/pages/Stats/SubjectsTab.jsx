import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Filter,
  BarChart3,
  Brain,
  Sparkles,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const SubjectsTab = ({ subjectsData, aiAnalysis, aiLoading }) => {
  const [sortBy, setSortBy] = useState('name'); // name, duration, successRate, completion
  const [filterStatus, setFilterStatus] = useState('all'); // all, good, medium, insufficient

  // Filtreleme
  const filteredSubjects = useMemo(() => {
    let filtered = subjectsData.subjects || [];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    return filtered;
  }, [subjectsData.subjects, filterStatus]);

  // Sıralama
  const sortedSubjects = useMemo(() => {
    const sorted = [...filteredSubjects];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.subject.name.localeCompare(b.subject.name));
      case 'duration':
        return sorted.sort((a, b) => b.stats.totalDuration - a.stats.totalDuration);
      case 'successRate':
        return sorted.sort((a, b) => b.stats.successRate - a.stats.successRate);
      case 'completion':
        return sorted.sort((a, b) => b.topics.completionRate - a.topics.completionRate);
      default:
        return sorted;
    }
  }, [filteredSubjects, sortBy]);

  // Durum renkleri
  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700';
      case 'insufficient':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'good': return 'İyi';
      case 'medium': return 'Orta';
      case 'insufficient': return 'Yetersiz';
      default: return 'Bilinmiyor';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <TrendingUp className="w-4 h-4" />;
      case 'medium': return <ArrowUpDown className="w-4 h-4" />;
      case 'insufficient': return <TrendingDown className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Soru dağılımı grafik verisi
  const questionDistributionData = sortedSubjects.map(s => ({
    name: s.subject.name,
    doğru: s.stats.correctQuestions,
    yanlış: s.stats.wrongQuestions,
    boş: s.stats.emptyQuestions,
  }));

  // AI yorumunu ders adına göre bul
  const getAICommentForSubject = (subjectName) => {
    if (!aiAnalysis?.subjects || aiLoading) return null;

    const comment = aiAnalysis.subjects.find(
      s => s.subjectName?.toLowerCase().includes(subjectName.toLowerCase()) ||
           subjectName.toLowerCase().includes(s.subjectName?.toLowerCase())
    );

    return comment?.comment || null;
  };

  return (
    <div className="space-y-8">
      {/* Hero Stats Banner - Orange/Amber Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-8 overflow-hidden shadow-elegant-xl"
      >
        {/* Honeycomb Pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="w-full h-full">
            <defs>
              <pattern id="hexPattern" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                <polygon points="28,0 56,15 56,45 28,60 0,45 0,15" fill="none" stroke="white" strokeWidth="2" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#hexPattern)" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, label: 'Toplam Ders', value: subjectsData.summary?.totalSubjects || 0, color: 'white' },
            { icon: CheckCircle, label: 'İyi Durum', value: subjectsData.summary?.statusCounts?.good || 0, color: 'emerald' },
            { icon: AlertCircle, label: 'Orta Durum', value: subjectsData.summary?.statusCounts?.medium || 0, color: 'amber' },
            { icon: TrendingDown, label: 'Yetersiz', value: subjectsData.summary?.statusCounts?.insufficient || 0, color: 'rose' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 group cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 bg-white/10 rounded-xl`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-white/80 font-display mb-1">{stat.label}</p>
              <p className="text-4xl font-normal text-white font-display">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
                <Filter className="w-4 h-4" />
                <span>Filtre:</span>
              </div>
              {['all', 'good', 'medium', 'insufficient'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all font-display ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-elegant'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {status === 'all' ? 'Tümü' : getStatusLabel(status)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
                <ArrowUpDown className="w-4 h-4" />
                <span>Sırala:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-display cursor-pointer focus:outline-none focus:border-orange-500"
              >
                <option value="name">Ders Adı</option>
                <option value="duration">Çalışma Süresi</option>
                <option value="successRate">Başarı Oranı</option>
                <option value="completion">Tamamlanma</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedSubjects.map((item, index) => (
          <motion.div
            key={item.subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            whileHover={{ y: -4 }}
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-elegant overflow-hidden group"
          >
            {/* Left Color Accent */}
            <div
              className="absolute left-0 top-0 bottom-0 w-2 transition-all group-hover:w-3"
              style={{ backgroundColor: item.subject.color }}
            ></div>

            <div className="p-6 pl-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-white dark:ring-neutral-900 flex-shrink-0"
                    style={{ backgroundColor: item.subject.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 truncate font-display text-lg">
                      {item.subject.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-display">
                      {item.stats.totalSessions} oturum
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border-2 ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="font-display">{getStatusLabel(item.status)}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-5">
                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 font-display">Saat</p>
                  <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                    {item.stats.totalDurationHours}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-display">Başarı</p>
                  <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 font-display">
                    %{item.stats.successRate}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-display">Net</p>
                  <p className="text-xl font-semibold text-purple-600 dark:text-purple-400 font-display">
                    {item.stats.net}
                  </p>
                </div>
                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 font-display">Soru</p>
                  <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                    {item.stats.totalQuestions}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2 font-display">
                  <span>Konu Tamamlanma</span>
                  <span className="font-semibold">{item.topics.studied}/{item.topics.total}</span>
                </div>
                <div className="relative w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.topics.completionRate}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                    className="h-3 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${item.subject.color}, ${item.subject.color}dd)`
                    }}
                  />
                </div>
              </div>

              {/* Last Study Date */}
              {item.lastStudyDate && (
                <div className="mt-4 pt-4 border-t-2 border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 font-display">
                    <Clock className="w-4 h-4" />
                    <span>
                      Son çalışma:{' '}
                      <span className="font-semibold">
                        {new Date(item.lastStudyDate).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* AI Yorumu */}
              {(() => {
                const aiComment = getAICommentForSubject(item.subject.name);
                if (aiComment) {
                  return (
                    <div className="mt-4 pt-4 border-t-2 border-indigo-100 dark:border-indigo-900/30">
                      <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
                        <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 font-display uppercase tracking-wide">
                              AI Değerlendirme
                            </span>
                            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                            {aiComment}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Question Distribution Chart */}
      {questionDistributionData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-elegant overflow-hidden"
        >
          {/* Chart Header */}
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6">
            <div className="absolute inset-0 opacity-[0.05]">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="chartDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1.5" fill="currentColor" className="text-purple-600" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#chartDots)" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-elegant border border-purple-200 dark:border-purple-800">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal text-neutral-800 dark:text-neutral-200 font-display">
                  Ders Bazlı Soru Dağılımı
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display">
                  Doğru, yanlış ve boş soru sayıları karşılaştırması
                </p>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="p-8">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={questionDistributionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  className="dark:stroke-neutral-700"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  className="dark:stroke-neutral-400"
                  style={{ fontSize: '11px', fontFamily: 'Quicksand' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#6b7280"
                  className="dark:stroke-neutral-400"
                  style={{ fontSize: '12px', fontFamily: 'Quicksand' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'Quicksand',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', fontFamily: 'Quicksand' }}
                />
                <Bar dataKey="doğru" fill="#10b981" name="Doğru" radius={[8, 8, 0, 0]} />
                <Bar dataKey="yanlış" fill="#ef4444" name="Yanlış" radius={[8, 8, 0, 0]} />
                <Bar dataKey="boş" fill="#6b7280" name="Boş" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SubjectsTab;
