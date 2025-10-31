import { motion } from 'framer-motion';

const AnimatedButton = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  rightIcon: RightIcon,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 shadow-elegant hover:shadow-elegant-lg',
    secondary: 'bg-secondary-500 text-primary-900 hover:bg-secondary-600 active:bg-secondary-700 shadow-elegant',
    outline: 'bg-transparent border-2 border-primary-700 text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950 dark:text-primary-300 dark:border-primary-500',
    ghost: 'bg-transparent text-primary-700 hover:bg-primary-50 dark:hover:bg-neutral-800 dark:text-primary-400',
    minimal: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-elegant',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative flex items-center justify-center gap-2
        ${variants[variant]}
        ${sizes[size]}
        font-medium rounded-xl
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
      {...props}
    >
      {/* Content */}
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
          <span>{typeof children === 'string' ? 'Yükleniyor...' : children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          <span>{children}</span>
          {RightIcon && <RightIcon className="w-5 h-5" />}
        </>
      )}
    </motion.button>
  );
};

export default AnimatedButton;
