import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';

const Modal = ({
  show,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  if (!show) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`w-full ${maxWidthClasses[maxWidth]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          {title && (
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 pr-8">
              {title}
            </h2>
          )}

          {/* Content */}
          {children}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Modal;
