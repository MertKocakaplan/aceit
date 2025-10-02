import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimatedIcon from './AnimatedIcon';

const ComingSoonCard = () => {
  return (
    <GlassCard
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      glowEffect={true}
      glowColor="from-blue-600 via-purple-600 to-pink-600"
      className="p-8 md:p-12"
    >
      <div className="text-center">
        <AnimatedIcon
          icon={Sparkles}
          variant="gradient"
          size="md"
          shineEffect
          className="mx-auto mb-6"
        />
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3"
        >
          Yeni Özellikler Çok Yakında!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Çalışma takibi, soru çözme, performans analizi, istatistikler ve daha fazlası çok yakında burada olacak 🚀
        </motion.p>
      </div>
    </GlassCard>
  );
};

export default ComingSoonCard;
