import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, User, GraduationCap, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import {
  AnimatedBackground,
  GlassCard,
  AnimatedInput,
  EmailInput,
  PasswordInput,
  AnimatedSelect,
  AnimatedButton,
  AnimatedIcon,
} from '../../ui';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
    examType: 'LGS',
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
      await register(formData);
      toast.success('Kayıt başarılı! Hoş geldiniz.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const examOptions = [
    { value: 'LGS', label: '🎯 LGS (Ortaokul)' },
    { value: 'YKS_SAYISAL', label: '🔬 YKS Sayısal' },
    { value: 'YKS_ESIT_AGIRLIK', label: '⚖️ YKS Eşit Ağırlık' },
    { value: 'YKS_SOZEL', label: '📚 YKS Sözel' },
    { value: 'YKS_DIL', label: '🌍 YKS Dil' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Register Card */}
      <GlassCard className="max-w-md w-full mx-4 p-8 space-y-6">
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
            Hesap oluşturun
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Full Name */}
          <AnimatedInput
            id="fullName"
            name="fullName"
            type="text"
            label="Ad Soyad"
            value={formData.fullName}
            onChange={handleChange}
            onFocus={() => setFocusedField('fullName')}
            onBlur={() => setFocusedField(null)}
            focusedField={focusedField}
            icon={User}
            required
          />

          {/* Email */}
          <EmailInput
            id="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            focusedField={focusedField}
            showValidation={true}
            required
          />

          {/* Username */}
          <AnimatedInput
            id="username"
            name="username"
            type="text"
            label="Kullanıcı Adı"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            focusedField={focusedField}
            icon={User}
            required
          />

          {/* Password */}
          <PasswordInput
            id="password"
            name="password"
            label="Şifre"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            focusedField={focusedField}
            showStrength={true}
            required
          />

          {/* Exam Type */}
          <AnimatedSelect
            id="examType"
            name="examType"
            label="Sınav Türü"
            value={formData.examType}
            onChange={handleChange}
            onFocus={() => setFocusedField('examType')}
            onBlur={() => setFocusedField(null)}
            focusedField={focusedField}
            icon={BookOpen}
            options={examOptions}
            required
          />

          {/* Submit Button */}
          <AnimatedButton
            type="submit"
            variant="primary"
            loading={loading}
            icon={UserPlus}
            rightIcon={ArrowRight}
            className="w-full mt-6"
          >
            Kayıt Ol
          </AnimatedButton>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-2"
          >
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all relative group"
              >
                Giriş Yap
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
          Başarıya giden yolda ilk adımını at 🚀
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
