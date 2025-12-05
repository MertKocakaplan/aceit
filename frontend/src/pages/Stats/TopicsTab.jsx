import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Flame,
  ArrowUpDown,
  Filter,
  Award,
  ChevronLeft,
  ChevronRight,
  Brain,
  Sparkles,
} from 'lucide-react';

const TopicsTab = ({ topicsData, aiAnalysis, aiLoading }) => {
  const [activeCategory, setActiveCategory] = useState('all'); // all, unstudied, weak, medium, strong, review, overdue
  const [sortBy, setSortBy] = useState('name'); // name, successRate, duration, mastery
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Benzersiz dersler
  const subjects = useMemo(() => {
    if (!topicsData.topics) return [];
    const unique = [...new Set(topicsData.topics.map(t => t.subject.code))];
    return unique.map(code => {
      const topic = topicsData.topics.find(t => t.subject.code === code);
      return topic.subject;
    });
  }, [topicsData.topics]);

  // Filtreleme
  const filteredTopics = useMemo(() => {
    let filtered = topicsData.topics || [];

    // Kategoriye göre filtrele
    if (activeCategory === 'unstudied') {
      filtered = topicsData.categorized?.unstudied || [];
    } else if (activeCategory === 'weak') {
      filtered = topicsData.categorized?.weak || [];
    } else if (activeCategory === 'medium') {
      filtered = topicsData.categorized?.medium || [];
    } else if (activeCategory === 'strong') {
      filtered = topicsData.categorized?.strong || [];
    } else if (activeCategory === 'review') {
      filtered = topicsData.dueForReview || [];
    } else if (activeCategory === 'overdue') {
      filtered = topicsData.overdue || [];
    }

    // Derse göre filtrele
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(t => t.subject.code === selectedSubject);
    }

    return filtered;
  }, [topicsData, activeCategory, selectedSubject]);

  // Sıralama
  const sortedTopics = useMemo(() => {
    const sorted = [...filteredTopics];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.topic.name.localeCompare(b.topic.name));
      case 'successRate':
        return sorted.sort((a, b) => b.stats.successRate - a.stats.successRate);
      case 'duration':
        return sorted.sort((a, b) => b.stats.totalDuration - a.stats.totalDuration);
      case 'mastery':
        return sorted.sort((a, b) =>
          (b.spacedRepetition?.repetitionLevel || 0) - (a.spacedRepetition?.repetitionLevel || 0)
        );
      default:
        return sorted;
    }
  }, [filteredTopics, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedTopics.length / itemsPerPage);
  const paginatedTopics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTopics.slice(startIndex, endIndex);
  }, [sortedTopics, currentPage]);

  // Kategori veya filtre değişince sayfa 1'e dön
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Kategori renkleri
  const getCategoryColor = (category) => {
    switch (category) {
      case 'strong':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700';
      case 'medium':
        return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700';
      case 'weak':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700';
      case 'unstudied':
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'strong': return 'Güçlü';
      case 'medium': return 'Orta';
      case 'weak': return 'Zayıf';
      case 'unstudied': return 'Çalışılmadı';
      default: return 'Bilinmiyor';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'strong': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'weak': return <TrendingDown className="w-4 h-4" />;
      case 'unstudied': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Mastery level rengi
  const getMasteryColor = (level) => {
    if (level === 0) return 'bg-neutral-200 dark:bg-neutral-700';
    if (level === 1) return 'bg-rose-300 dark:bg-rose-800/60';
    if (level === 2) return 'bg-orange-300 dark:bg-orange-800/60';
    if (level === 3) return 'bg-amber-300 dark:bg-amber-800/60';
    if (level === 4) return 'bg-lime-300 dark:bg-lime-800/60';
    return 'bg-emerald-500 dark:bg-emerald-600';
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats - Like Dashboard Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 rounded-3xl p-8 shadow-elegant-xl overflow-hidden border-2 border-primary-600/30"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.12]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topicsStatsDots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topicsStatsDots)" />
          </svg>
        </div>

        {/* Diagonal lines pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topicsStatsLines" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="30" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topicsStatsLines)" />
          </svg>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { icon: Target, label: 'Toplam Konu', value: topicsData.summary?.totalTopics || 0 },
            { icon: AlertCircle, label: 'Çalışılmadı', value: topicsData.summary?.unstudiedTopics || 0 },
            { icon: TrendingDown, label: 'Zayıf', value: topicsData.summary?.weakTopics || 0 },
            { icon: CheckCircle, label: 'Güçlü', value: topicsData.summary?.strongTopics || 0 },
            { icon: Clock, label: 'Tekrar Zamanı', value: topicsData.summary?.dueForReviewCount || 0 },
            { icon: Flame, label: 'Gecikmiş', value: topicsData.summary?.overdueCount || 0 },
          ].map((stat, index) => (
            <div key={index} className="relative">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5 text-secondary-200" />
                <p className="text-sm font-medium text-secondary-200/90 font-sans">{stat.label}</p>
              </div>
              <p className="text-4xl font-normal text-white font-display tracking-wide">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mastery Progress - Elegant Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-3xl p-8 border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant overflow-hidden"
      >
        {/* Decorative corner patterns */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary-100/20 dark:from-primary-900/10 to-transparent rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-secondary-100/30 dark:from-secondary-900/10 to-transparent rounded-tl-full" />

        {/* Hexagonal dot pattern */}
        <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.08]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="masteryPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                <circle cx="20" cy="15" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
                <circle cx="5" cy="25" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#masteryPattern)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl">
              <Award className="w-6 h-6 text-primary-700 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-2xl font-normal text-neutral-900 dark:text-white font-display tracking-wide">
                Konu Hakimiyeti (Mastery)
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                Konuların seviyelerine göre dağılımı
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[0, 1, 2, 3, 4, 5].map(level => (
              <motion.div
                key={level}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + level * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="relative bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 border-2 border-neutral-200 dark:border-neutral-700 text-center"
              >
                <div className={`h-2 rounded-full mb-3 ${getMasteryColor(level)} transition-all`} />
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 font-display">Level {level}</p>
                <p className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                  {topicsData.summary?.masteryLevels?.[`level${level}`] || 0}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Yorumları */}
      {aiAnalysis?.topics && !aiLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zayıf Konular AI Yorumu */}
          {aiAnalysis.topics.weakComment && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30 backdrop-blur-xl rounded-3xl border-2 border-orange-200/50 dark:border-orange-800/50 shadow-elegant p-6 overflow-hidden"
            >
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="weakPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="3" cy="3" r="1" fill="currentColor" className="text-orange-600" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#weakPattern)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-elegant">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-300 font-display uppercase tracking-wide">
                      Zayıf Konular
                    </h4>
                    <Brain className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                  {aiAnalysis.topics.weakComment}
                </p>
              </div>
            </motion.div>
          )}

          {/* Güçlü Konular AI Yorumu */}
          {aiAnalysis.topics.strongComment && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 backdrop-blur-xl rounded-3xl border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-elegant p-6 overflow-hidden"
            >
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="strongPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="3" cy="3" r="1" fill="currentColor" className="text-emerald-600" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#strongPattern)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-elegant">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 font-display uppercase tracking-wide">
                      Güçlü Konular
                    </h4>
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                  {aiAnalysis.topics.strongComment}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Filter & Category Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'all', label: 'Tümü', count: topicsData.topics?.length },
            { id: 'review', label: 'Tekrar', count: topicsData.summary?.dueForReviewCount },
            { id: 'overdue', label: 'Gecikmiş', count: topicsData.summary?.overdueCount },
            { id: 'weak', label: 'Zayıf', count: topicsData.summary?.weakTopics },
            { id: 'strong', label: 'Güçlü', count: topicsData.summary?.strongTopics },
            { id: 'unstudied', label: 'Çalışılmadı', count: topicsData.summary?.unstudiedTopics },
          ].map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(cat.id)}
              className={`relative px-6 py-3 rounded-2xl text-sm font-medium transition-all font-display overflow-hidden ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 text-white shadow-elegant'
                  : 'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 border-2 border-neutral-200/80 dark:border-neutral-700/80'
              }`}
            >
              {activeCategory === cat.id && (
                <div className="absolute inset-0 opacity-[0.08]">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern id={`catDots${cat.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" fill="white" />
                      </pattern>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill={`url(#catDots${cat.id})`} />
                  </svg>
                </div>
              )}
              <span className="relative">{cat.label} ({cat.count || 0})</span>
            </motion.button>
          ))}
        </div>

        {/* Subject & Sort Filter */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">Ders:</span>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-display cursor-pointer focus:outline-none focus:border-primary-500 transition-all"
            >
              <option value="all">Tüm Dersler</option>
              {subjects.map(subject => (
                <option key={subject.code} value={subject.code}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
              <ArrowUpDown className="w-4 h-4" />
              <span>Sırala:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-display cursor-pointer focus:outline-none focus:border-primary-500 transition-all"
            >
              <option value="name">Konu Adı</option>
              <option value="successRate">Başarı Oranı</option>
              <option value="duration">Çalışma Süresi</option>
              <option value="mastery">Mastery Level</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Result Info */}
      {sortedTopics.length > 0 && (
        <div className="flex justify-between items-center px-2 text-sm text-neutral-600 dark:text-neutral-400 font-display">
          <p>
            Toplam <span className="font-semibold text-neutral-800 dark:text-neutral-200">{sortedTopics.length}</span> konu bulundu
            {sortedTopics.length > itemsPerPage && (
              <span> • Sayfa {currentPage} / {totalPages}</span>
            )}
          </p>
          <p>
            {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedTopics.length)} arası gösteriliyor
          </p>
        </div>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedTopics.map((item, index) => (
          <motion.div
            key={item.topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (index % 10) }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-3xl shadow-elegant overflow-hidden group border-2 border-neutral-200/80 dark:border-neutral-700/80 hover:shadow-elegant-xl transition-all"
          >
            {/* Diagonal Gradient Accent */}
            <div
              className="absolute top-0 left-0 bottom-0 w-2 opacity-70 group-hover:w-3 transition-all"
              style={{
                background: `linear-gradient(to bottom, ${item.subject.color}, transparent)`
              }}
            />

            {/* Hexagonal Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`hexPattern${index}`} x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                    <polygon
                      points="28,0 56,15 56,45 28,60 0,45 0,15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-primary-700 dark:text-primary-400"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#hexPattern${index})`} />
              </svg>
            </div>

            {/* Corner Decorative Circles */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.02 }}
              className="absolute top-3 right-3 w-16 h-16 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity"
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-700 dark:text-primary-400" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-700 dark:text-primary-400" />
                <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-700 dark:text-primary-400" />
              </svg>
            </motion.div>

            {/* Bottom Decorative Wave */}
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-[0.02] dark:opacity-[0.04]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20">
                <path
                  d="M0 10 Q 25 0, 50 10 T 100 10 L 100 20 L 0 20 Z"
                  fill="currentColor"
                  className="text-primary-700 dark:text-primary-400"
                />
              </svg>
            </div>

            <div className="relative p-6 pl-8">
              {/* Header with Subject Badge */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-14 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold font-display shadow-elegant group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.subject.color }}
                    >
                      {item.subject.code.split('_')[0] || item.subject.code.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                        {item.topic.name}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-display">
                        {item.subject.name}
                      </p>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium border-2 shadow-elegant ${getCategoryColor(item.category)}`}
                  >
                    {getCategoryIcon(item.category)}
                    <span className="font-display">{getCategoryLabel(item.category)}</span>
                  </motion.div>
                </div>
              </div>

              {/* Stats - Horizontal Layout */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group/stat"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl opacity-10 group-hover/stat:opacity-20 transition-opacity" />
                  <div className="relative text-center p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-900/30 bg-white/50 dark:bg-neutral-900/50">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-display mb-1 uppercase tracking-wide">Başarı</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-display">
                      {item.stats.successRate}
                      <span className="text-sm">%</span>
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group/stat"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-2xl opacity-10 group-hover/stat:opacity-20 transition-opacity" />
                  <div className="relative text-center p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700/30 bg-white/50 dark:bg-neutral-900/50">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-display mb-1 uppercase tracking-wide">Soru</p>
                    <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 font-display">
                      {item.stats.totalQuestions}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group/stat"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl opacity-10 group-hover/stat:opacity-20 transition-opacity" />
                  <div className="relative text-center p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-900/30 bg-white/50 dark:bg-neutral-900/50">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-display mb-1 uppercase tracking-wide">Süre</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-display">
                      {Math.floor(item.stats.totalDuration / 60)}
                      <span className="text-sm">dk</span>
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Mastery Progress - Enhanced */}
              <div className="relative mb-4 p-4 rounded-2xl bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-neutral-200 dark:border-neutral-700">
                {item.spacedRepetition ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getMasteryColor(item.spacedRepetition.repetitionLevel)} shadow-elegant`}>
                          <span className="text-white font-bold text-sm font-display">
                            L{item.spacedRepetition.repetitionLevel}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-display">Mastery Level</p>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                            Level {item.spacedRepetition.repetitionLevel} • {item.spacedRepetition.masteryPercentage}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-3 overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.spacedRepetition.masteryPercentage}%` }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.02, ease: "easeOut" }}
                        className={`h-3 rounded-full transition-all ${getMasteryColor(item.spacedRepetition.repetitionLevel)} relative overflow-hidden`}
                      >
                        {/* Shine effect */}
                        <motion.div
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                        />
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 shadow-elegant">
                          <span className="text-neutral-600 dark:text-neutral-400 font-bold text-sm font-display">L0</span>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-display">Mastery Level</p>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                            Henüz çalışılmadı
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-3 shadow-inner">
                      <div className="h-3 rounded-full bg-neutral-300 dark:bg-neutral-700" style={{ width: '0%' }} />
                    </div>
                  </>
                )}
              </div>

              {/* Review Status - Enhanced */}
              {item.spacedRepetition?.isOverdue && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative overflow-hidden flex items-center gap-2 text-sm text-white px-4 py-3 rounded-2xl font-display bg-gradient-to-r from-rose-600 to-pink-600 shadow-elegant"
                >
                  {/* Animated background */}
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                  <Flame className="w-4 h-4 relative z-10" />
                  <span className="font-semibold relative z-10">{item.spacedRepetition.daysOverdue} gün gecikmiş!</span>
                </motion.div>
              )}
              {item.spacedRepetition?.needsReview && !item.spacedRepetition?.isOverdue && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-white px-4 py-3 rounded-2xl font-display bg-gradient-to-r from-amber-600 to-orange-600 shadow-elegant"
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">Tekrar zamanı geldi</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {sortedTopics.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-3xl shadow-elegant p-16 text-center border-2 border-neutral-200/80 dark:border-neutral-700/80 overflow-hidden"
        >
          {/* Decorative corner */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary-100/20 dark:from-primary-900/10 to-transparent rounded-br-full" />

          <div className="relative">
            <AlertCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-lg text-neutral-600 dark:text-neutral-400 font-display">
              Bu kategoride konu bulunamadı
            </p>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-2xl shadow-elegant p-6 border-2 border-neutral-200/80 dark:border-neutral-700/80"
        >
          <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2.5 rounded-xl transition-all ${
                currentPage === 1
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950 shadow-elegant'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {(() => {
                const pages = [];
                const maxVisible = 7;

                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push('...');
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }
                  if (currentPage < totalPages - 2) pages.push('...');
                  pages.push(totalPages);
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-neutral-400 font-display">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[44px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all font-display ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 text-white shadow-elegant'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950 shadow-elegant'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2.5 rounded-xl transition-all ${
                currentPage === totalPages
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950 shadow-elegant'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TopicsTab;
