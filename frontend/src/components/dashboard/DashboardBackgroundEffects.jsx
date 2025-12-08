import { motion } from 'framer-motion';

/**
 * Dashboard Background Effects Component
 * Renders animated background elements, patterns, and decorative shapes
 */
const DashboardBackgroundEffects = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Multi-layer texture overlays */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Diagonal lines */}
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonalLines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="currentColor" strokeWidth="1" className="text-primary-600 dark:text-primary-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalLines)" />
        </svg>
      </div>

      {/* Mesh gradient background */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(at 10% 20%, rgba(127, 2, 31, 0.08) 0px, transparent 50%),
          radial-gradient(at 90% 10%, rgba(245, 235, 208, 0.1) 0px, transparent 50%),
          radial-gradient(at 20% 80%, rgba(139, 76, 92, 0.06) 0px, transparent 50%),
          radial-gradient(at 80% 90%, rgba(127, 2, 31, 0.05) 0px, transparent 50%)
        `
      }} />

      {/* Animated organic shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 150, 0],
          y: [0, -80, 0],
          rotate: [0, 45, 0],
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-1/3 -right-1/4 w-[900px] h-[900px] bg-gradient-to-br from-primary-400 via-primary-600 to-primary-800 dark:from-primary-500 dark:via-primary-700 dark:to-primary-900 blur-3xl"
        style={{
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -120, 0],
          y: [0, 60, 0],
          rotate: [0, -60, 0],
          opacity: [0.1, 0.16, 0.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
        className="absolute -bottom-1/3 -left-1/4 w-[1000px] h-[1000px] bg-gradient-to-tr from-secondary-300 via-secondary-500 to-secondary-700 dark:from-secondary-400 dark:via-secondary-600 dark:to-secondary-800 blur-3xl"
        style={{
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 120, 240, 360],
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10
        }}
        className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-accent-rose via-primary-500 to-accent-burgundy dark:from-accent-rose dark:via-primary-600 dark:to-accent-burgundy blur-3xl"
        style={{
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        }}
      />

      {/* Geometric circles */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/3 w-96 h-96 border-2 border-primary-300/20 rounded-full"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.02, 0.05, 0.02],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute bottom-1/3 right-1/3 w-80 h-80 border border-secondary-400/20 rounded-full"
      />

      {/* Floating dots */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
          className="absolute w-2 h-2 rounded-full bg-primary-400"
          style={{
            left: `${15 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
        />
      ))}
    </div>
  );
};

export default DashboardBackgroundEffects;
