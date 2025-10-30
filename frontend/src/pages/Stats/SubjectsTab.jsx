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
} from 'lucide-react';
import { GlassCard } from '../../ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const SubjectsTab = ({ subjectsData }) => {
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
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'insufficient':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
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

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Toplam Ders</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {subjectsData.summary?.totalSubjects || 0}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">İyi Durum</p>
              <p className="text-xl font-bold text-green-600">
                {subjectsData.summary?.statusCounts?.good || 0}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Orta Durum</p>
              <p className="text-xl font-bold text-yellow-600">
                {subjectsData.summary?.statusCounts?.medium || 0}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Yetersiz</p>
              <p className="text-xl font-bold text-red-600">
                {subjectsData.summary?.statusCounts?.insufficient || 0}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filtreler */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Filter className="w-4 h-4" />
            <span>Filtrele:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'good', 'medium', 'insufficient'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80'
                }`}
              >
                {status === 'all' ? 'Tümü' : getStatusLabel(status)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ml-auto">
            <ArrowUpDown className="w-4 h-4" />
            <span>Sırala:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="name">Ders Adı</option>
            <option value="duration">Çalışma Süresi</option>
            <option value="successRate">Başarı Oranı</option>
            <option value="completion">Tamamlanma</option>
          </select>
        </div>
      </GlassCard>

      {/* Ders Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedSubjects.map((item, index) => (
          <motion.div
            key={item.subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="p-5 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.subject.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate">
                      {item.subject.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.stats.totalSessions} oturum
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span>{getStatusLabel(item.status)}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Çalışma Süresi</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {item.stats.totalDurationHours}s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Başarı Oranı</p>
                  <p className="text-lg font-bold text-blue-600">
                    %{item.stats.successRate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Net</p>
                  <p className="text-lg font-bold text-purple-600">
                    {item.stats.net}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Toplam Soru</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {item.stats.totalQuestions}
                  </p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Konu Tamamlanma</span>
                    <span>{item.topics.studied}/{item.topics.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.topics.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Son Çalışma */}
              {item.lastStudyDate && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      Son çalışma:{' '}
                      {new Date(item.lastStudyDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Soru Dağılımı Grafiği */}
      {questionDistributionData.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
              <BarChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Ders Bazlı Soru Dağılımı
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Doğru, yanlış ve boş soru sayıları
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={questionDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="doğru" fill="#10b981" name="Doğru" />
              <Bar dataKey="yanlış" fill="#ef4444" name="Yanlış" />
              <Bar dataKey="boş" fill="#6b7280" name="Boş" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  );
};

export default SubjectsTab;