import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, AlertCircle } from 'lucide-react';
import AnimatedInput from './AnimatedInput';

const EmailInput = ({
  id = 'email',
  name = 'email',
  label = 'Email',
  value,
  onChange,
  onFocus,
  onBlur,
  focusedField,
  showValidation = true,
  required = true,
  ...props
}) => {
  // Email validation
  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const RightIcon = () => (
    <AnimatePresence>
      {value && showValidation && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          {isEmailValid(value) ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AnimatedInput
      id={id}
      name={name}
      type="email"
      label={label}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      focusedField={focusedField}
      icon={Mail}
      rightIcon={value && showValidation ? RightIcon : undefined}
      required={required}
      {...props}
    />
  );
};

export default EmailInput;
