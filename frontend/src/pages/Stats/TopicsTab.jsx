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
} from 'lucide-react';
import { GlassCard } from '../../ui';

const TopicsTab = ({ topicsData }) => {
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
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'medium':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'weak':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'unstudied':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
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
    if (level === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (level === 1) return 'bg-red-300 dark:bg-red-800/60';
    if (level === 2) return 'bg-orange-300 dark:bg-orange-800/60';
    if (level === 3) return 'bg-yellow-300 dark:bg-yellow-800/60';
    if (level === 4) return 'bg-green-300 dark:bg-green-800/60';
    return 'bg-green-500 dark:bg-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <GlassCard className="p-3">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Toplam</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {topicsData.summary?.totalTopics || 0}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Çalışılmadı</p>
            <p className="text-xl font-bold text-gray-600">
              {topicsData.summary?.unstudiedTopics || 0}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <TrendingDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Zayıf</p>
            <p className="text-xl font-bold text-orange-600">
              {topicsData.summary?.weakTopics || 0}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Güçlü</p>
            <p className="text-xl font-bold text-green-600">
              {topicsData.summary?.strongTopics || 0}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tekrar</p>
            <p className="text-xl font-bold text-yellow-600">
              {topicsData.summary?.dueForReviewCount || 0}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Gecikmiş</p>
            <p className="text-xl font-bold text-red-600">
              {topicsData.summary?.overdueCount || 0}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Mastery Progress */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
            <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Mastery Progress (Konu Hakimiyeti)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Konular seviyelerine göre dağılım
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[0, 1, 2, 3, 4, 5].map(level => (
            <div key={level} className="text-center">
              <div className={`h-2 rounded-full mb-2 ${getMasteryColor(level)}`} />
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Level {level}</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {topicsData.summary?.masteryLevels?.[`level${level}`] || 0}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Filtreler */}
      <GlassCard className="p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              <span>Kategori:</span>
            </div>
            {[
              { id: 'all', label: 'Tümü', count: topicsData.topics?.length },
              { id: 'review', label: 'Tekrar Gereken', count: topicsData.summary?.dueForReviewCount },
              { id: 'overdue', label: 'Gecikmiş', count: topicsData.summary?.overdueCount },
              { id: 'weak', label: 'Zayıf', count: topicsData.summary?.weakTopics },
              { id: 'strong', label: 'Güçlü', count: topicsData.summary?.strongTopics },
              { id: 'unstudied', label: 'Çalışılmadı', count: topicsData.summary?.unstudiedTopics },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80'
                }`}
              >
                {cat.label} ({cat.count || 0})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Ders:</span>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            >
              <option value="all">Tüm Dersler</option>
              {subjects.map(subject => (
                <option key={subject.code} value={subject.code}>
                  {subject.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ml-auto">
              <ArrowUpDown className="w-4 h-4" />
              <span>Sırala:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            >
              <option value="name">Konu Adı</option>
              <option value="successRate">Başarı Oranı</option>
              <option value="duration">Çalışma Süresi</option>
              <option value="mastery">Mastery Level</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Sonuç Bilgisi */}
      {sortedTopics.length > 0 && (
        <div className="flex justify-between items-center px-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Toplam <span className="font-semibold">{sortedTopics.length}</span> konu bulundu
            {sortedTopics.length > itemsPerPage && (
              <span> • Sayfa {currentPage} / {totalPages}</span>
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedTopics.length)} arası gösteriliyor
          </p>
        </div>
      )}

      {/* Konu Listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paginatedTopics.map((item, index) => (
          <motion.div
            key={item.topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <GlassCard className="p-4 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.subject.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                      {item.topic.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.subject.name}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {getCategoryIcon(item.category)}
                  <span>{getCategoryLabel(item.category)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Başarı</p>
                  <p className="text-sm font-bold text-blue-600">
                    %{item.stats.successRate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Soru</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {item.stats.totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Süre</p>
                  <p className="text-sm font-bold text-purple-600">
                    {Math.floor(item.stats.totalDuration / 60)}dk
                  </p>
                </div>
              </div>

              {/* Mastery Level - Her zaman göster */}
              <div className="mb-3">
                {item.spacedRepetition ? (
                  <>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Mastery Level {item.spacedRepetition.repetitionLevel}</span>
                      <span>%{item.spacedRepetition.masteryPercentage}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${getMasteryColor(item.spacedRepetition.repetitionLevel)}`}
                        style={{ width: `${item.spacedRepetition.masteryPercentage}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Mastery Level 0</span>
                      <span>%0</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" style={{ width: '0%' }} />
                    </div>
                  </>
                )}
              </div>

              {/* Tekrar Durumu */}
              {item.spacedRepetition?.isOverdue && (
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                  <Flame className="w-3 h-3" />
                  <span>{item.spacedRepetition.daysOverdue} gün gecikmiş tekrar!</span>
                </div>
              )}
              {item.spacedRepetition?.needsReview && !item.spacedRepetition?.isOverdue && (
                <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" />
                  <span>Tekrar zamanı geldi</span>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {sortedTopics.length === 0 && (
        <GlassCard className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            Bu kategoride konu bulunamadı
          </p>
        </GlassCard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
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
                  // Tüm sayfaları göster
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // İlk sayfa
                  pages.push(1);

                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  // Ortadaki sayfalar
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);

                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }

                  // Son sayfa
                  pages.push(totalPages);
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
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
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </GlassCard>
      )}
    </div>
  );
};

export default TopicsTab;