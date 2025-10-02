import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Calendar, Award } from 'lucide-react';
import GlassCard from './GlassCard';

const WelcomeCard = ({ user }) => {
  return (
    <GlassCard
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      glowColor="from-blue-600 via-purple-600 to-pink-600"
      className="p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Hoş geldin, {user?.fullName}!
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Sınav: <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.examType}</span></span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
            </motion.div>
          </div>
        </div>
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Award className="w-16 h-16 text-yellow-500 dark:text-yellow-400 hidden md:block" />
        </motion.div>
      </div>
    </GlassCard>
  );
};

export default WelcomeCard;
