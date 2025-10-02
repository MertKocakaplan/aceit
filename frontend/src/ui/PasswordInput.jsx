import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import AnimatedInput from './AnimatedInput';

const PasswordInput = ({
  id = 'password',
  name = 'password',
  label = 'Şifre',
  value,
  onChange,
  onFocus,
  onBlur,
  focusedField,
  showStrength = false,
  required = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) return { strength, label: 'Zayıf', color: 'bg-red-500' };
    if (strength <= 2) return { strength, label: 'Orta', color: 'bg-yellow-500' };
    if (strength <= 3) return { strength, label: 'İyi', color: 'bg-blue-500' };
    return { strength, label: 'Güçlü', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(value);

  const RightIcon = () => (
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setShowPassword(!showPassword)}
      className="cursor-pointer"
    >
      <AnimatePresence mode="wait">
        {showPassword ? (
          <motion.div
            key="eye-off"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <EyeOff className="h-5 w-5 text-gray-500 hover:text-purple-500 transition-colors" />
          </motion.div>
        ) : (
          <motion.div
            key="eye"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Eye className="h-5 w-5 text-gray-500 hover:text-purple-500 transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  return (
    <div>
      <AnimatedInput
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        label={label}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        focusedField={focusedField}
        icon={Lock}
        rightIcon={RightIcon}
        required={required}
        {...props}
      />

      {/* Password Strength Indicator */}
      {showStrength && (
        <AnimatePresence>
          {value && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: i < passwordStrength.strength ? 1 : 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs font-bold ${
                  passwordStrength.strength <= 1 ? 'text-red-500' :
                  passwordStrength.strength <= 2 ? 'text-yellow-500' :
                  passwordStrength.strength <= 3 ? 'text-blue-500' : 'text-green-500'
                }`}
              >
                Şifre Gücü: {passwordStrength.label}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default PasswordInput;
