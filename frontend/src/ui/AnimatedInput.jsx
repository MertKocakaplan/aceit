import { motion } from 'framer-motion';

const AnimatedInput = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  icon: Icon,
  rightIcon: RightIcon,
  focusedField,
  className = '',
  ...props
}) => {
  const isFocused = focusedField === name;
  const hasValue = value && value.length > 0;

  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative group"
      >
        {/* Left Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <motion.div
              animate={{
                scale: isFocused ? 1.2 : 1,
              }}
            >
              <Icon className={`h-5 w-5 transition-all duration-300 ${
                isFocused || hasValue
                  ? 'text-purple-500'
                  : 'text-gray-400'
              }`} />
            </motion.div>
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`peer block w-full ${Icon ? 'pl-12' : 'pl-4'} ${RightIcon ? 'pr-12' : 'pr-4'} py-4 bg-white/60 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 placeholder-transparent ${className}`}
          placeholder={label}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`absolute ${Icon ? 'left-12' : 'left-4'} transition-all duration-300 pointer-events-none ${
            isFocused || hasValue
              ? '-top-6 left-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
              : 'top-4 text-gray-500'
          }`}
        >
          {label}
        </label>

        {/* Right Icon */}
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center z-10">
            <RightIcon className="h-5 w-5" />
          </div>
        )}

        {/* Focus Ring Animation */}
        {isFocused && (
          <motion.div
            layoutId="focusRing"
            className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-sm -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default AnimatedInput;
