import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  className = '',
  glowEffect = true,
  glowColor = 'from-blue-600 via-purple-600 to-pink-600',
  initial = { opacity: 0, y: 30, scale: 0.95 },
  animate = { opacity: 1, y: 0, scale: 1 },
  transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  ...props
}) => {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className="relative group"
      {...props}
    >
      {/* Animated Glow Border */}
      {glowEffect && (
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute -inset-1 bg-gradient-to-r ${glowColor} rounded-3xl blur-xl opacity-75`}
        />
      )}

      {/* Main Card */}
      <div className={`relative backdrop-blur-2xl bg-white/80 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/40 transition-colors duration-300 ${className}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
