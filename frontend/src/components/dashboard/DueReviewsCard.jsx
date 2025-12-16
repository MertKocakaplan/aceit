import { motion } from 'framer-motion';
import { Clock, Flame, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Due Reviews Card Component
 * Displays topics that need review based on spaced repetition schedule
 */
const DueReviewsCard = ({ dueTopics, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <div className="relative bg-gradient-to-r from-amber-50 via-white to-orange-50 dark:from-amber-950/30 dark:via-neutral-900 dark:to-orange-950/30 backdrop-blur-md rounded-2xl p-6 border border-amber-200/50 dark:border-amber-800/50 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl shrink-0 animate-pulse">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 font-sans">
                Bugün Tekrar Edilecekler
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-serif">
                Yükleniyor...
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!dueTopics || dueTopics.length === 0) {
    return null;
  }

  // Gecikmiş konular var mı?
  const overdueTopics = dueTopics.filter(t => t.daysOverdue > 0);
  const hasOverdue = overdueTopics.length > 0;
  const normalDueTopics = dueTopics.filter(t => t.daysOverdue === 0);

  // Önce gecikmiş, sonra normal tekrarlar
  const sortedTopics = [...overdueTopics, ...normalDueTopics];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-12"
    >
      <div className={`relative ${
        hasOverdue
          ? 'bg-gradient-to-r from-red-50 via-rose-50 to-red-50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-red-950/30 border-red-200/50 dark:border-red-800/50'
          : 'bg-gradient-to-r from-amber-50 via-white to-orange-50 dark:from-amber-950/30 dark:via-neutral-900 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-800/50'
      } backdrop-blur-md rounded-2xl p-6 border shadow-sm overflow-hidden`}>
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          hasOverdue
            ? 'bg-gradient-to-r from-red-400/50 via-red-600/80 to-red-400/50'
            : 'bg-gradient-to-r from-amber-400/50 via-amber-600/80 to-amber-400/50'
        }`} />

        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dueReviewsDots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" className={hasOverdue ? 'text-red-600' : 'text-amber-600'} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dueReviewsDots)" />
          </svg>
        </div>

        {/* Header */}
        <div className="relative flex items-start gap-4 mb-4">
          <div className={`p-3 ${
            hasOverdue
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-amber-100 dark:bg-amber-900/30'
          } rounded-xl shrink-0`}>
            {hasOverdue ? (
              <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-medium ${
                  hasOverdue
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-amber-700 dark:text-amber-400'
                } mb-1 font-sans`}>
                  Bugün Tekrar Edilecekler
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-serif">
                  {hasOverdue ? (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {overdueTopics.length} konu gecikmiş
                    </span>
                  ) : (
                    <span>
                      {dueTopics.length} konu tekrar zamanı geldi
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => navigate('/stats?tab=topics&filter=review')}
                className={`text-xs font-medium ${
                  hasOverdue
                    ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
                    : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                } transition-colors font-sans flex items-center gap-1`}
              >
                Tümünü Gör
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Topics List */}
        <div className="relative space-y-2">
          {sortedTopics.slice(0, 5).map((topic, index) => (
            <motion.button
              key={topic.topicId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(`/study-sessions/create?topicId=${topic.topicId}&subjectId=${topic.topic.subject.id}`)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${
                topic.daysOverdue > 0
                  ? 'bg-red-100/80 dark:bg-red-900/20 hover:bg-red-200/80 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/30'
                  : 'bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 border border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700'
              } transition-all text-left group`}
            >
              {/* Subject Badge */}
              <div
                className="w-12 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold font-display shadow-sm shrink-0"
                style={{ backgroundColor: topic.topic.subject.color }}
              >
                {topic.topic.subject.code.split('_')[0] || topic.topic.subject.code.substring(0, 3).toUpperCase()}
              </div>

              {/* Topic Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  topic.daysOverdue > 0
                    ? 'text-red-900 dark:text-red-200'
                    : 'text-neutral-900 dark:text-neutral-200'
                } truncate font-display`}>
                  {topic.topic.name}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans">
                  {topic.topic.subject.name}
                </p>
              </div>

              {/* Status Badge */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
                topic.daysOverdue > 0
                  ? 'bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                  : 'bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
              }`}>
                {topic.daysOverdue > 0 ? (
                  <>
                    <Flame className="w-3 h-3" />
                    <span className="font-display">{topic.daysOverdue} gün gecikmiş</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span className="font-display">Tekrar zamanı</span>
                  </>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className={`w-4 h-4 ${
                topic.daysOverdue > 0
                  ? 'text-red-400 group-hover:text-red-600 dark:text-red-500 dark:group-hover:text-red-400'
                  : 'text-amber-400 group-hover:text-amber-600 dark:text-amber-500 dark:group-hover:text-amber-400'
              } transition-colors group-hover:translate-x-0.5 shrink-0`} />
            </motion.button>
          ))}

          {/* Show more indicator */}
          {sortedTopics.length > 5 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate('/stats?tab=topics&filter=review')}
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl ${
                hasOverdue
                  ? 'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-400'
                  : 'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-400'
              } text-sm font-medium transition-colors font-sans`}
            >
              <span>+{sortedTopics.length - 5} konu daha var</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Empty state (shouldn't happen since we return null, but just in case) */}
        {sortedTopics.length === 0 && (
          <div className="relative flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mb-3" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif">
              Şu an tekrar edilmesi gereken konu yok
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DueReviewsCard;
