import { motion } from 'framer-motion';

const AnimatedBackground = ({
  variant = 'default', // 'default' | 'dashboard'
  particleCount = 15,
  className = ''
}) => {
  const particles = variant === 'dashboard' ? 12 : particleCount;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Large Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/30 to-purple-500/30 dark:from-blue-600/15 dark:to-purple-700/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-gradient-to-br from-purple-400/30 to-pink-500/30 dark:from-purple-600/15 dark:to-pink-700/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 40, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-20 left-1/4 w-[480px] h-[480px] bg-gradient-to-br from-indigo-400/30 to-blue-500/30 dark:from-indigo-600/15 dark:to-blue-700/15 rounded-full blur-3xl"
      />

      {/* Floating Particles */}
      {[...Array(particles)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="absolute w-2 h-2 bg-white dark:bg-gray-300 rounded-full"
          style={{
            left: `${(i * 7) % 100}%`,
            top: `${(i * 13) % 100}%`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
