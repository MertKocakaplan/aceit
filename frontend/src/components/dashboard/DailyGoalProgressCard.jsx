import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle, TrendingUp } from 'lucide-react';

/**
 * Daily Goal Progress Card Component
 * Displays daily study goal from active plan and current progress
 */
const DailyGoalProgressCard = ({ dailyGoal }) => {
  if (!dailyGoal || !dailyGoal.hasActiveDay) {
    return null;
  }

  const {
    dailyGoalMinutes,
    completedMinutes,
    remainingMinutes,
    percentComplete,
    planTitle,
    slots
  } = dailyGoal;

  const completedHours = Math.floor(completedMinutes / 60);
  const completedMins = completedMinutes % 60;
  const goalHours = Math.floor(dailyGoalMinutes / 60);
  const goalMins = dailyGoalMinutes % 60;

  const isGoalReached = percentComplete >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-12"
    >
      <div className={`relative rounded-3xl p-6 border-2 shadow-elegant overflow-hidden ${
        isGoalReached
          ? 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-400 dark:border-emerald-600'
          : 'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-neutral-200/80 dark:border-neutral-700/80'
      }`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dailyGoalPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" className={isGoalReached ? 'text-emerald-600' : 'text-primary-600'} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dailyGoalPattern)" />
          </svg>
        </div>

        {/* Header */}
        <div className="relative flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${
            isGoalReached
              ? 'bg-emerald-500'
              : 'bg-primary-600'
          }`}>
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-semibold font-display ${
              isGoalReached
                ? 'text-emerald-900 dark:text-emerald-300'
                : 'text-neutral-900 dark:text-white'
            }`}>
              {isGoalReached ? '🎉 Günlük Hedef Tamamlandı!' : 'Günlük Çalışma Hedefi'}
            </h3>
            {planTitle && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                {planTitle}
              </p>
            )}
          </div>
        </div>

        {/* Progress Stats */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Completed */}
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm rounded-xl p-4 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                Tamamlanan
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-display">
              {completedHours > 0 && `${completedHours}s `}
              {completedMins}dk
            </p>
          </div>

          {/* Target */}
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm rounded-xl p-4 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                Hedef
              </p>
            </div>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-display">
              {goalHours > 0 && `${goalHours}s `}
              {goalMins}dk
            </p>
          </div>

          {/* Remaining */}
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm rounded-xl p-4 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                Kalan
              </p>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-display">
              {isGoalReached ? '0dk' : `${Math.floor(remainingMinutes / 60) > 0 ? `${Math.floor(remainingMinutes / 60)}s ` : ''}${remainingMinutes % 60}dk`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400 font-sans">İlerleme</span>
            <span className={`font-semibold font-display ${
              isGoalReached
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-primary-600 dark:text-primary-400'
            }`}>
              {percentComplete.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentComplete, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                  : 'bg-gradient-to-r from-primary-600 to-primary-700'
              }`}
            />
          </div>
        </div>

        {/* Slots Preview */}
        {slots && slots.length > 0 && (
          <div className="relative mt-6 pt-6 border-t border-neutral-200/50 dark:border-neutral-700/50">
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 font-display">
              Bugünün Çalışma Slotları
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {slots.map((slot, index) => (
                <div
                  key={slot.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    slot.isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white/40 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-700/50'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: slot.subjectColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate font-sans">
                      {slot.subject}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 font-sans">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                  {slot.isCompleted && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyGoalProgressCard;