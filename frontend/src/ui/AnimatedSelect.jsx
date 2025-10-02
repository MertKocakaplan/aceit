import { motion } from 'framer-motion';

const AnimatedSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  focusedField,
  icon: Icon,
  options = [],
  required = false,
  className = '',
  ...props
}) => {
  const isFocused = focusedField === name;

  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative group"
      >
        {/* Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <motion.div
              animate={{
                scale: isFocused ? 1.2 : 1,
              }}
            >
              <Icon className="h-5 w-5 text-purple-500" />
            </motion.div>
          </div>
        )}

        {/* Select */}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          className={`block w-full ${Icon ? 'pl-12' : 'pl-4'} pr-10 py-3.5 bg-white/60 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 appearance-none cursor-pointer text-gray-700 font-medium ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Label */}
        <label className="absolute -top-6 left-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {label}
        </label>

        {/* Focus Ring */}
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

export default AnimatedSelect;
