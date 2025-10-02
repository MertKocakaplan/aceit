import { motion } from 'framer-motion';

const AnimatedButton = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  rightIcon: RightIcon,
  shineEffect = true,
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-purple-500/50',
    secondary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-purple-500/50',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-red-500/50',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center justify-center gap-3 py-4 px-6 ${variants[variant]} font-bold text-lg rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group ${className}`}
      {...props}
    >
      {/* Animated Shine Background */}
      {shineEffect && (
        <motion.div
          animate={{
            x: [-1000, 1000],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      )}

      {/* Content */}
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full relative"
          />
          <span className="relative">{typeof children === 'string' ? 'Yükleniyor...' : children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-6 h-6 relative" />}
          <span className="relative">{children}</span>
          {RightIcon && (
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <RightIcon className="w-5 h-5 relative" />
            </motion.div>
          )}
        </>
      )}
    </motion.button>
  );
};

export default AnimatedButton;
