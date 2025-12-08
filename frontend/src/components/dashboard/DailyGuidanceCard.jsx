import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Daily Guidance Card Component
 * Displays daily guidance message with optional AI insight
 */
const DailyGuidanceCard = ({ dailyGuidance }) => {
  if (!dailyGuidance || !dailyGuidance.guidance) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mb-12"
    >
      <div className="relative bg-gradient-to-r from-secondary-50 via-white to-secondary-50 dark:from-neutral-800/80 dark:via-neutral-800/60 dark:to-neutral-800/80 backdrop-blur-md rounded-2xl p-6 border border-secondary-200/50 dark:border-neutral-700/50 shadow-sm overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400/50 via-primary-600/80 to-primary-400/50" />

        {/* Content */}
        <div className="relative flex items-start gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl shrink-0">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-primary-700 dark:text-primary-400 mb-1 font-sans">
              Günlük Rehberlik
            </h4>
            <p className="text-base text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed">
              {dailyGuidance.guidance}
            </p>
            {/* AI Insight varsa göster */}
            {dailyGuidance.aiInsight && (
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 font-serif leading-relaxed border-t border-neutral-200/50 dark:border-neutral-700/50 pt-3">
                {dailyGuidance.aiInsight}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyGuidanceCard;
