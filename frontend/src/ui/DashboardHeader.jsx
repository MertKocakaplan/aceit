import { motion } from 'framer-motion';
import { LogOut, GraduationCap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AnimatedIcon from './AnimatedIcon';

const DashboardHeader = ({ user, onLogout }) => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/30 dark:border-gray-700/30 shadow-lg transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AnimatedIcon
              icon={GraduationCap}
              variant="gradient"
              size="sm"
              shineEffect
            />
            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
              >
                Dashboard
              </motion.h1>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Hoş geldin, {user?.fullName}!
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
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
              <LogOut className="w-4 h-4 relative z-10" />
              <span className="hidden sm:inline relative z-10">Çıkış Yap</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
