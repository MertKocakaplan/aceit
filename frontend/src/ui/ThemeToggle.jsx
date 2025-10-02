import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group ${className}`}
      title={isDark ? 'Açık Mod' : 'Koyu Mod'}
    >
      {/* Button Shine */}
      <motion.div
        animate={{
          x: [-100, 100],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 2,
        }}
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
      />

      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
