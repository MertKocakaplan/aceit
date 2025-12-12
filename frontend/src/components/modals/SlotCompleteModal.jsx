import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, HelpCircle } from 'lucide-react';

/**
 * Slot Complete Modal
 * Kullanıcı çalışma planındaki bir slot'u tamamladığında açılır
 * Soru çözdüyse doğru/yanlış/boş sayılarını girmesine olanak sağlar
 */
const SlotCompleteModal = ({ isOpen, onClose, onSubmit, slotInfo }) => {
  const [questionsCorrect, setQuestionsCorrect] = useState('');
  const [questionsWrong, setQuestionsWrong] = useState('');
  const [questionsEmpty, setQuestionsEmpty] = useState('');

  const handleSubmit = () => {
    onSubmit({
      questionsCorrect: parseInt(questionsCorrect) || 0,
      questionsWrong: parseInt(questionsWrong) || 0,
      questionsEmpty: parseInt(questionsEmpty) || 0
    });
    // Reset form
    setQuestionsCorrect('');
    setQuestionsWrong('');
    setQuestionsEmpty('');
  };

  const handleSkip = () => {
    onSubmit({
      questionsCorrect: 0,
      questionsWrong: 0,
      questionsEmpty: 0
    });
    // Reset form
    setQuestionsCorrect('');
    setQuestionsWrong('');
    setQuestionsEmpty('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-elegant-xl max-w-md w-full p-6"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white font-display">
                  Çalışma Tamamlandı!
                </h3>
                {slotInfo && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                    {slotInfo.subject?.name || 'Ders'} • {slotInfo.duration} dk
                  </p>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 dark:text-blue-300 font-sans">
                Soru çözdüysen doğru/yanlış/boş sayılarını girebilirsin. Çözmediysen boş geç.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
                  Doğru
                </label>
                <input
                  type="number"
                  min="0"
                  value={questionsCorrect}
                  onChange={(e) => setQuestionsCorrect(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
                  Yanlış
                </label>
                <input
                  type="number"
                  min="0"
                  value={questionsWrong}
                  onChange={(e) => setQuestionsWrong(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
                  Boş
                </label>
                <input
                  type="number"
                  min="0"
                  value={questionsEmpty}
                  onChange={(e) => setQuestionsEmpty(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-sans"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors font-medium font-sans"
              >
                Soru Çözmedim
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium font-sans"
              >
                Kaydet
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SlotCompleteModal;
