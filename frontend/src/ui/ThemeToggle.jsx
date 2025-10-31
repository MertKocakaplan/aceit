import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative p-3 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-2 border-neutral-200/80 dark:border-neutral-700/80 hover:border-primary-400 dark:hover:border-primary-600 rounded-2xl shadow-elegant hover:shadow-elegant-lg transition-all duration-300 overflow-hidden group ${className}`}
      title={isDark ? 'Açık Mod' : 'Koyu Mod'}
    >
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.06]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="themeToggleDots" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="currentColor" className="text-primary-700 dark:text-primary-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#themeToggleDots)" />
        </svg>
      </div>

      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-secondary-50/0 group-hover:from-primary-50/50 group-hover:to-secondary-50/50 dark:group-hover:from-primary-950/50 dark:group-hover:to-secondary-950/50 transition-all duration-300" />

      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-primary-700 dark:text-primary-400" />
        ) : (
          <Moon className="w-5 h-5 text-primary-700 dark:text-primary-400" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
