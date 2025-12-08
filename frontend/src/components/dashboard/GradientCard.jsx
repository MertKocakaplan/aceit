import { motion } from 'framer-motion';

/**
 * GradientCard Component
 * Reusable card with gradient top bar and SVG pattern overlay
 *
 * @param {ReactNode} children - Card content
 * @param {string} gradientColor - Gradient bar color (primary/secondary/custom)
 * @param {string} patternType - Pattern type (dots/grid/lines/none)
 * @param {string} patternId - Unique ID for SVG pattern (required if pattern is used)
 * @param {string} className - Additional CSS classes
 * @param {string} padding - Padding size (p-6/p-7/p-8)
 * @param {boolean} showGradientBar - Show gradient bar on top
 * @param {object} initial - Framer Motion initial animation
 * @param {object} animate - Framer Motion animate
 * @param {object} transition - Framer Motion transition
 */
const GradientCard = ({
  children,
  gradientColor = 'primary',
  patternType = 'dots',
  patternId = 'cardPattern',
  className = '',
  padding = 'p-8',
  showGradientBar = true,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { delay: 0.2 },
}) => {
  // Gradient bar colors
  const gradientColors = {
    primary: 'from-primary-500/50 via-primary-600/80 to-primary-500/50',
    secondary: 'from-secondary-500/50 via-secondary-600/80 to-secondary-500/50',
    success: 'from-green-500/50 via-green-600/80 to-green-500/50',
    warning: 'from-amber-500/50 via-amber-600/80 to-amber-500/50',
    danger: 'from-red-500/50 via-red-600/80 to-red-500/50',
  };

  // SVG Patterns
  const renderPattern = () => {
    if (patternType === 'none') return null;

    const patternDefs = {
      dots: (
        <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-neutral-600" />
        </pattern>
      ),
      grid: (
        <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
        </pattern>
      ),
      lines: (
        <pattern id={patternId} width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="30" stroke="currentColor" strokeWidth="1" className="text-neutral-400" />
        </pattern>
      ),
    };

    return (
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {patternDefs[patternType]}
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>
    );
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={`relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-elegant overflow-hidden ${className}`}
    >
      {/* Top gradient accent */}
      {showGradientBar && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientColors[gradientColor] || gradientColor}`} />
      )}

      {/* Pattern overlay */}
      {renderPattern()}

      {/* Content */}
      <div className={`relative ${padding}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default GradientCard;
