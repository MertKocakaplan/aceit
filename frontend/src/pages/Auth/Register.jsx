import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, BookOpen, ArrowRight, Rocket, Zap, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '../../ui';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    { value: 'LGS', label: 'LGS (Ortaokul)' },
    { value: 'YKS_SAYISAL', label: 'YKS Sayısal' },
    { value: 'YKS_ESIT_AGIRLIK', label: 'YKS Eşit Ağırlık' },
    { value: 'YKS_SOZEL', label: 'YKS Sözel' },
    { value: 'YKS_DIL', label: 'YKS Dil' },
  ];

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const labels = ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

    return { strength, label: labels[strength - 1] || '', color: colors[strength - 1] || 'bg-gray-300' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-secondary-100 via-neutral-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Right Side - Visual/Branding */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 relative overflow-hidden"
      >
        {/* Artistic Background */}
        <div className="absolute inset-0">
          {/* Gradient Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950" />

          {/* Cross pattern texture */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Diagonal lines */}
          <div className="absolute inset-0 opacity-[0.15]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="registerLeftDiagonal" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#registerLeftDiagonal)" />
            </svg>
          </div>

          {/* Animated organic shapes */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, 30, 0],
              rotate: [0, -90, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-secondary-400 to-secondary-600 blur-3xl"
            style={{
              borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            }}
          />

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 40, 0],
              y: [0, -40, 0],
              rotate: [0, 45, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-primary-900 to-primary-950 blur-3xl"
            style={{
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-end text-white p-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-lg w-full"
          >
            <h3 className="text-5xl font-normal font-display tracking-wide mb-6 text-right">
              Yolculuğuna Başla
            </h3>
            <p className="text-xl text-secondary-100 font-sans mb-12 leading-relaxed text-right">
              Binlerce öğrenci gibi sen de hedeflerine ulaşmanın keyfini yaşa
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: Rocket, label: 'Hızlı Başlangıç', description: 'Dakikalar içinde çalışmaya başla' },
                { icon: Zap, label: 'Akıllı Takip', description: 'İlerlemeni otomatik olarak izle' },
                { icon: CheckCircle, label: 'Kanıtlanmış Yöntem', description: 'Başarılı öğrencilerin tercihi' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="flex-1 text-right">
                    <h4 className="font-medium font-sans text-lg mb-1">{item.label}</h4>
                    <p className="text-sm text-secondary-100 font-sans">{item.description}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl">
                    <item.icon className="w-6 h-6 text-secondary-200" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 overflow-y-auto"
      >
        <div className="max-w-md w-full py-8">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl flex items-center justify-center shadow-elegant-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-normal text-primary-700 dark:text-primary-400 font-display tracking-wide">
                AceIt
              </h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-normal text-neutral-900 dark:text-white font-display tracking-wide mb-3">
              Hesap Oluştur
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 font-sans text-lg">
              Ücretsiz hesap oluştur ve başarıya doğru ilk adımı at
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                Ad Soyad
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-sans text-neutral-900 dark:text-white"
                  placeholder="Adınız Soyadınız"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-sans text-neutral-900 dark:text-white"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                Kullanıcı Adı
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-sans text-neutral-900 dark:text-white"
                  placeholder="kullaniciadi"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                Şifre
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-sans text-neutral-900 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i < passwordStrength.strength ? passwordStrength.color : 'bg-neutral-200 dark:bg-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.label && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans">
                      Şifre gücü: <span className="font-medium">{passwordStrength.label}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Exam Type */}
            <div className="space-y-2">
              <label htmlFor="examType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                Sınav Türü
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <BookOpen className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" />
                </div>
                <select
                  id="examType"
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-sans appearance-none cursor-pointer text-neutral-900 dark:text-white"
                >
                  {examOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-8 bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 text-white py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-elegant-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
            >
              {/* Button pattern */}
              <div className="absolute inset-0 opacity-[0.08]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="registerButtonPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.8" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#registerButtonPattern)" />
                </svg>
              </div>

              <span className="relative z-10 flex items-center justify-center gap-2 font-sans text-base">
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Kayıt yapılıyor...
                  </>
                ) : (
                  <>
                    Kayıt Ol
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Login Link */}
            <div className="text-center pt-6">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                Zaten hesabın var mı?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors underline-offset-4 hover:underline"
                >
                  Giriş Yap
                </Link>
              </p>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
