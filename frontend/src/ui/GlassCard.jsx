import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  className = '',
  variant = 'default', // 'default', 'elegant', 'minimal'
  hover = true,
  glow = false,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  ...props
}) => {
  const variants = {
    default: 'bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60',
    elegant: 'bg-gradient-to-br from-secondary-50 to-white dark:from-neutral-900 dark:to-neutral-800 border border-primary-100/30 dark:border-primary-900/30',
    minimal: 'bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200/40 dark:border-neutral-700/40',
  };

  const hoverEffects = hover
    ? 'hover:shadow-elegant-lg hover:border-primary-200/60 dark:hover:border-primary-800/60 hover:-translate-y-0.5'
    : '';

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className="relative group"
      {...props}
    >
      {/* Subtle Glow Effect - Only on hover or when enabled */}
      {glow && (
        <div className="absolute -inset-[1px] bg-gradient-to-br from-primary-500/5 via-secondary-400/5 to-primary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      )}

      {/* Main Card */}
      <div className={`
        relative rounded-2xl shadow-elegant
        transition-all duration-300
        ${variants[variant]}
        ${hoverEffects}
        ${className}
      `}>
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
