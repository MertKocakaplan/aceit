import { motion } from 'framer-motion';

const AnimatedBackground = ({
  variant = 'subtle', // 'subtle' | 'elegant' | 'minimal'
  className = ''
}) => {
  if (variant === 'minimal') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Minimal grain texture */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
             }}
        />
      </div>
    );
  }

  if (variant === 'elegant') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Elegant gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary-500 via-secondary-400 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.02, 0.04, 0.02],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-primary-600 via-accent-rose to-transparent rounded-full blur-3xl"
        />
      </div>
    );
  }

  // Subtle variant (default)
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Very subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary-100/30 via-white to-secondary-50/20 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900" />

      {/* Minimal animated accent */}
      <motion.div
        animate={{
          opacity: [0.02, 0.04, 0.02],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-primary-200/20 to-transparent dark:from-primary-900/10 rounded-full blur-3xl"
      />
    </div>
  );
};

export default AnimatedBackground;
