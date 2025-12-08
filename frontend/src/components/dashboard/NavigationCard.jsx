import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Navigation Card Component
 * Reusable card for dashboard navigation with consistent styling and patterns
 */
const NavigationCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'default', // 'primary' | 'secondary' | 'default'
  size = 'medium', // 'large' | 'medium' | 'small'
  colorScheme = 'neutral', // 'purple' | 'emerald' | 'blue' | 'amber' | 'neutral'
  pattern = 'dots', // 'dots' | 'grid' | 'waves'
  showArrow = true,
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    large: 'col-span-12 lg:col-span-7 min-h-[240px]',
    medium: 'col-span-12 lg:col-span-5 min-h-[240px]',
    small: 'col-span-6 lg:col-span-3 min-h-[160px]',
  };

  // Variant styles
  const variantStyles = {
    primary: {
      container: 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-700 dark:via-primary-800 dark:to-primary-950 border-primary-500/30',
      decorative1: 'bg-secondary-400/10',
      decorative2: 'bg-white/5',
      icon: 'bg-white/10 border-white/20 text-white group-hover:bg-white/15',
      title: 'text-white',
      description: 'text-secondary-100',
      titleSize: 'text-3xl',
      descSize: 'text-base',
      iconSize: 'w-8 h-8',
      iconPadding: 'p-4',
      titleFont: 'font-normal',
    },
    secondary: {
      container: 'bg-gradient-to-br from-secondary-100 via-secondary-50 to-white dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900 border-secondary-200/80 dark:border-neutral-700/80 hover:border-primary-400 dark:hover:border-primary-600',
      decorativeCorner: true,
      icon: 'bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 text-primary-700 dark:text-primary-400',
      title: 'text-neutral-900 dark:text-white',
      description: 'text-neutral-600 dark:text-neutral-400',
      titleSize: 'text-2xl',
      descSize: 'text-sm',
      iconSize: 'w-7 h-7',
      iconPadding: 'p-4',
      titleFont: 'font-normal',
    },
    default: {
      container: 'bg-white/80 dark:bg-neutral-800/80 border-neutral-200/80 dark:border-neutral-700/80 hover:border-primary-400 dark:hover:border-primary-600',
      icon: 'bg-primary-50 dark:bg-primary-900/30 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 text-primary-700 dark:text-primary-400',
      title: 'text-neutral-900 dark:text-white',
      description: 'text-neutral-500 dark:text-neutral-500',
      titleSize: 'text-lg',
      descSize: 'text-sm',
      iconSize: 'w-6 h-6',
      iconPadding: 'p-3.5',
      titleFont: 'font-medium',
    },
  };

  // Color schemes for small cards
  const colorSchemes = {
    purple: {
      container: 'bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/30 dark:via-neutral-900 dark:to-pink-950/30 border-purple-200/80 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600',
      decorativeCorner: 'bg-gradient-to-bl from-purple-200/40 dark:from-purple-700/20 to-transparent',
      icon: 'bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 text-purple-600 dark:text-purple-400',
      arrow: 'text-neutral-400 group-hover:text-purple-600 dark:group-hover:text-purple-400',
    },
    emerald: {
      container: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-neutral-900 dark:to-teal-950/30 border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600',
      decorativeCorner: 'bg-gradient-to-bl from-emerald-200/40 dark:from-emerald-700/20 to-transparent',
      icon: 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      arrow: 'text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    },
    blue: {
      container: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/30 dark:via-neutral-900 dark:to-cyan-950/30 border-blue-200/80 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600',
      decorativeCorner: 'bg-gradient-to-bl from-blue-200/40 dark:from-blue-700/20 to-transparent',
      icon: 'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      arrow: 'text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400',
    },
    amber: {
      container: 'bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/30 dark:via-neutral-900 dark:to-orange-950/30 border-amber-200/80 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600',
      decorativeCorner: 'bg-gradient-to-bl from-amber-200/40 dark:from-amber-700/20 to-transparent',
      icon: 'bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 text-amber-600 dark:text-amber-400',
      arrow: 'text-neutral-400 group-hover:text-amber-600 dark:group-hover:text-amber-400',
    },
    neutral: {
      container: 'bg-white/80 dark:bg-neutral-800/80 border-neutral-200/80 dark:border-neutral-700/80 hover:border-primary-400 dark:hover:border-primary-600',
      icon: 'bg-primary-50 dark:bg-primary-900/30 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 text-primary-700 dark:text-primary-400',
      arrow: 'text-neutral-400 group-hover:text-primary-700 dark:group-hover:text-primary-400',
    },
  };

  // SVG Patterns
  const patterns = {
    dots: (
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`pattern-dots-${title}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-dots-${title})`} />
      </svg>
    ),
    grid: (
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`pattern-grid-${title}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-grid-${title})`} />
      </svg>
    ),
    waves: (
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`pattern-waves-${title}`} width="50" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q 12.5 0, 25 10 T 50 10" stroke="white" strokeWidth="0.8" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pattern-waves-${title})`} />
      </svg>
    ),
  };

  const styles = variantStyles[variant];
  const colorStyle = size === 'small' ? colorSchemes[colorScheme] : null;

  // Determine container class
  const containerClass = size === 'small' && colorStyle
    ? colorStyle.container
    : styles.container;

  return (
    <motion.button
      whileHover={{ scale: size === 'large' ? 1.01 : 1.02 }}
      whileTap={{ scale: size === 'large' ? 0.99 : 0.98 }}
      onClick={onClick}
      className={`${sizeClasses[size]} relative ${containerClass} backdrop-blur-md rounded-3xl ${size === 'large' ? 'p-8' : size === 'medium' ? 'p-7' : 'p-6'} ${variant === 'primary' ? 'shadow-elegant-xl hover:shadow-2xl' : 'hover:shadow-elegant-xl'} transition-all duration-300 group border-2 overflow-hidden ${className}`}
    >
      {/* Decorative elements for primary */}
      {variant === 'primary' && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
        </>
      )}

      {/* Decorative corner for secondary and small colored cards */}
      {(variant === 'secondary' || (size === 'small' && colorStyle?.decorativeCorner)) && (
        <div className={`absolute top-0 right-0 w-24 h-24 ${
          variant === 'secondary'
            ? 'bg-gradient-to-bl from-primary-200/30 dark:from-primary-800/20 to-transparent'
            : colorStyle.decorativeCorner
        } rounded-bl-full`} />
      )}

      {/* Additional decorative for secondary */}
      {variant === 'secondary' && (
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-300/30 dark:from-secondary-800/20 to-transparent rounded-tr-full" />
      )}

      {/* Pattern overlay */}
      {size === 'small' && colorScheme === 'neutral' ? (
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-grid-${title}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-grid-${title})`} />
          </svg>
        </div>
      ) : (
        <div className="absolute inset-0 opacity-[0.10]">
          {patterns[pattern]}
        </div>
      )}

      {/* Content */}
      {variant === 'primary' ? (
        <div className="relative flex flex-col items-start justify-between h-full">
          <div className={`${styles.iconPadding} ${styles.icon} rounded-2xl backdrop-blur-sm transition-all`}>
            <Icon className={styles.iconSize} />
          </div>
          <div className="text-left">
            <h3 className={`${styles.titleSize} ${styles.titleFont} ${styles.title} mb-2 font-display tracking-wide`}>
              {title}
            </h3>
            <p className={`${styles.description} font-serif ${styles.descSize}`}>
              {description}
            </p>
          </div>
        </div>
      ) : variant === 'secondary' ? (
        <div className="relative flex flex-col h-full">
          <div className={`${styles.iconPadding} ${styles.icon} rounded-2xl w-fit transition-colors`}>
            <Icon className={styles.iconSize} />
          </div>
          <div className="mt-auto">
            <h3 className={`${styles.titleSize} ${styles.titleFont} ${styles.title} mb-2 font-display tracking-wide`}>
              {title}
            </h3>
            <p className={`${styles.description} font-serif ${styles.descSize}`}>
              {description}
            </p>
          </div>
          {showArrow && (
            <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-neutral-400 group-hover:text-primary-700 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          )}
        </div>
      ) : (
        // Small card layout - vertical
        <div className="relative flex flex-col h-full">
          <div className={`${styles.iconPadding} ${colorStyle ? colorStyle.icon : styles.icon} rounded-xl w-fit transition-colors mb-4`}>
            <Icon className={styles.iconSize} />
          </div>
          <div className="text-left mt-auto">
            <h3 className={`${styles.titleSize} ${styles.titleFont} ${styles.title} font-display`}>
              {title}
            </h3>
            {description && (
              <p className={`${styles.description} font-serif ${styles.descSize} mt-1`}>
                {description}
              </p>
            )}
          </div>
          {showArrow && (
            <ArrowRight className={`absolute bottom-6 right-6 w-5 h-5 ${colorStyle ? colorStyle.arrow : 'text-neutral-400 group-hover:text-primary-700 dark:group-hover:text-primary-400'} group-hover:translate-x-1 transition-all`} />
          )}
        </div>
      )}
    </motion.button>
  );
};

export default NavigationCard;
