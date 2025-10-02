import { motion } from 'framer-motion';
import { useTheme } from '../store/ThemeContext';

const StatsCard = ({
  icon: Icon,
  label,
  value,
  gradient = 'from-blue-500 to-cyan-500',
  bgLight = 'bg-gradient-to-br from-blue-50 to-cyan-50',
  bgDark = 'bg-gradient-to-br from-blue-950/50 to-cyan-950/50',
  iconBgLight = 'bg-blue-100',
  iconBgDark = 'bg-blue-900/50',
  iconColor = 'text-blue-600 dark:text-blue-400',
  index = 0,
  loading = false,
}) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group"
    >
      {/* Animated Glow */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: index * 0.3,
        }}
        className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      <div className={`relative ${isDark ? bgDark : bgLight} rounded-2xl shadow-lg border border-white/40 dark:border-gray-700/40 p-6 transition-all duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`p-3 ${isDark ? iconBgDark : iconBgLight} rounded-xl shadow-md transition-colors duration-300`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2,
            }}
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {loading ? 'Yükleniyor...' : value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
