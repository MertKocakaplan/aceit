import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { LogIn, Mail, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import {
  AnimatedBackground,
  GlassCard,
  AnimatedInput,
  PasswordInput,
  AnimatedButton,
  AnimatedIcon,
} from '../../ui';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('Hoş geldiniz! 🎉', {
        description: 'Başarıyla giriş yaptınız.',
      });
      navigate('/dashboard');
    } catch (error) {
      // Hata mesajı axios interceptor tarafından gösterilecek
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Login Card */}
      <GlassCard className="max-w-md w-full mx-4 p-8 space-y-8">
        {/* Header with Animated Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <AnimatedIcon
            icon={GraduationCap}
            variant="gradient"
            size="lg"
            shineEffect
            className="mx-auto mb-4"
          />

          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold mb-2"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AceIt
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 flex items-center justify-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
            </motion.div>
            Hesabınıza giriş yapın
          </motion.p>
        </motion.div>

        {/* Form with Enhanced Animations */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email/Username Input */}
          <AnimatedInput
            id="identifier"
            name="identifier"
            type="text"
            label="Email veya Kullanıcı Adı"
            value={formData.identifier}
            onChange={handleChange}
            onFocus={() => setFocusedField('identifier')}
            onBlur={() => setFocusedField(null)}
            focusedField={focusedField}
            icon={Mail}
            required
          />

          {/* Password Input */}
          <PasswordInput
            id="password"
            name="password"
            label="Şifre"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            focusedField={focusedField}
            required
          />

          {/* Submit Button */}
          <AnimatedButton
            type="submit"
            variant="primary"
            loading={loading}
            icon={LogIn}
            rightIcon={ArrowRight}
            className="w-full"
          >
            Giriş Yap
          </AnimatedButton>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-2"
          >
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link
                to="/register"
                className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all relative group"
              >
                Kayıt Ol
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </motion.div>
        </motion.form>
      </GlassCard>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.p
          whileHover={{ scale: 1.05 }}
          className="text-sm text-gray-600 font-medium backdrop-blur-sm bg-white/40 rounded-full px-6 py-3 shadow-lg"
        >
          Sınavlarına hazırlanmanın en etkili yolu ✨
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
