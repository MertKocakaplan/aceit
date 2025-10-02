import { motion } from 'framer-motion';

const AnimatedIcon = ({
  icon: Icon,
  variant = 'default', // 'default' | 'gradient' | 'spin'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  shineEffect = false,
  ...props
}) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const variants = {
    default: 'bg-white/90 dark:bg-gray-800/90',
    gradient: 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
  };

  const animations = {
    default: { scale: 1.1, rotate: 360 },
    spin: { rotate: 360 },
  };

  return (
    <motion.div
      whileHover={animations[variant === 'gradient' ? 'default' : 'spin']}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`inline-flex items-center justify-center ${sizes[size]} ${variants[variant]} rounded-2xl shadow-2xl relative overflow-hidden group ${className}`}
      {...props}
    >
      {/* Shine Effect */}
      {shineEffect && (
        <motion.div
          animate={{
            x: [-200, 200],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />
      )}

      <Icon className={`${iconSizes[size]} ${variant === 'gradient' ? 'text-white' : 'text-gray-700 dark:text-gray-300'} relative z-10`} />
    </motion.div>
  );
};

export default AnimatedIcon;
