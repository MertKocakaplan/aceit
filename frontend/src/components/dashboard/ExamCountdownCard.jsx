import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

/**
 * Exam Countdown Card Component
 * Displays countdown to exam with urgency-based styling
 */
const ExamCountdownCard = ({ examCountdown }) => {
  if (!examCountdown || examCountdown.daysRemaining === null) {
    return null;
  }

  const { daysRemaining, examType, urgencyLevel, formattedRemaining } = examCountdown;

  // Urgency level styles
  const urgencyStyles = {
    critical: 'bg-gradient-to-br from-red-500 to-red-700 border-red-400 text-white',
    urgent: 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 text-white',
    moderate: 'bg-gradient-to-br from-primary-500 to-primary-700 border-primary-400 text-white',
    relaxed: 'bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white'
  };

  const isRelaxed = urgencyLevel === 'relaxed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className={`relative p-6 rounded-2xl border-2 min-w-[280px] overflow-hidden ${urgencyStyles[urgencyLevel] || urgencyStyles.relaxed}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="examCountdownDots" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#examCountdownDots)" />
        </svg>
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className={`w-5 h-5 ${isRelaxed ? 'text-primary-600 dark:text-primary-400' : ''}`} />
          <span className={`text-sm font-medium ${isRelaxed ? 'text-neutral-600 dark:text-neutral-400' : 'text-white/90'}`}>
            {examType} Sınavına Kalan
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-display">
            {daysRemaining}
          </span>
          <span className={`text-lg font-medium ${isRelaxed ? 'text-neutral-600 dark:text-neutral-400' : 'text-white/80'}`}>
            gün
          </span>
        </div>
        <p className={`text-xs mt-1 ${isRelaxed ? 'text-neutral-500 dark:text-neutral-500' : 'text-white/70'}`}>
          {formattedRemaining}
        </p>
      </div>
    </motion.div>
  );
};

export default ExamCountdownCard;
