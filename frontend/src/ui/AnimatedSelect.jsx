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
      {/* Label - Always on top */}
      <label
        htmlFor={id}
        className="block text-sm font-bold bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent mb-2"
      >
        {label}
      </label>

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
              <Icon className="h-5 w-5 text-primary-700 dark:text-primary-400" />
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
          className={`block w-full ${Icon ? 'pl-12' : 'pl-4'} pr-10 py-3.5 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border-2 border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500/30 focus:border-primary-700 dark:focus:border-primary-500 transition-all duration-300 appearance-none cursor-pointer text-neutral-700 dark:text-neutral-300 font-medium ${className}`}
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
          <svg className="h-5 w-5 text-neutral-400 dark:text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Focus Ring */}
        {isFocused && (
          <motion.div
            layoutId="focusRing"
            className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-2xl blur-sm -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default AnimatedSelect;
