import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { pomodoroAPI } from '../../api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Coffee,
  BookOpen,
  Clock,
  Trophy,
  Flame,
  X,
} from 'lucide-react';
import {
  DashboardHeader,
} from '../../ui';
import { DashboardBackgroundEffects } from '../../components/dashboard';

const PomodoroTimer = () => {
  const { user, logout } = useAuth();

  // Timer states
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'break' | 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    autoStartBreak: true,
    autoStartWork: true,
    soundEnabled: true,
  });

  const [tempSettings, setTempSettings] = useState(settings);
  const [showSettings, setShowSettings] = useState(false);

  // Settings'i localStorage'dan yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setTempSettings(parsed);
      setMinutes(parsed.workDuration);
    }
  }, []);

  // Bugünkü istatistikleri çek
  useEffect(() => {
    fetchTodayStats();
  }, []);

  const fetchTodayStats = async () => {
    setLoadingStats(true);
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const response = await pomodoroAPI.getStats({
        startDate: dateStr,
        endDate: dateStr,
      });

      const stats = response.data || response;
      setCompletedPomodoros(stats.workSessions || 0);
    } catch (error) {
      console.error('Bugünkü istatistikler yüklenemedi:', error);
      setCompletedPomodoros(0);
    } finally {
      setLoadingStats(false);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = async () => {
    setIsActive(false);

    if (settings.soundEnabled) {
      playSound();
    }

    if (mode === 'work') {
      try {
        await pomodoroAPI.saveSession({
          duration: settings.workDuration,
          mode: 'work',
          subjectId: null,
        });
        await fetchTodayStats();
      } catch (error) {
        console.error('Pomodoro kayıt hatası:', error);
        setCompletedPomodoros(completedPomodoros + 1);
      }

      toast.success('🎉 Pomodoro tamamlandı! Mola zamanı.');

      const newCompleted = completedPomodoros + 1;
      const isLongBreak = newCompleted % 4 === 0;
      const breakDuration = isLongBreak
        ? settings.longBreakDuration
        : settings.breakDuration;

      setMode(isLongBreak ? 'longBreak' : 'break');
      setMinutes(breakDuration);
      setSeconds(0);

      if (settings.autoStartBreak) {
        setTimeout(() => setIsActive(true), 1000);
      }
    } else {
      toast.success('☕ Mola bitti! Çalışmaya devam.');
      setMode('work');
      setMinutes(settings.workDuration);
      setSeconds(0);

      if (settings.autoStartWork) {
        setTimeout(() => setIsActive(true), 1000);
      }
    }
  };

  const playSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUBAMT6Ln8LpmHgU7k9r00H4pBS19zu/akj4KFmS56+qnWBETU6jn9L5xJAU1jNP01IU2Bx9zwO/mnlINCFCm5O+9byEGNI/Y8tGAKwUme8vv3ZU+ChZhtuvsp1oTElOo5/S+cyQFNo3T9NWHNwcfccDv5p5SDQhPpeTvvW0hBTOP1/LQgCoFJnrK792UPQoVYLXr7KdbExJTqOf0vnMkBTaM0/TUhzYHH3HA7+aeUg0IT6Xk771tIQU0j9fy0IArBSZ6yu/dlD0KFV+16+ynWxMSU6jn9L5zJAU2jNP01Ic2Bx9xwO/mnlINCE+l5O+9bSEFNI/X8tCAKwUmesrv3ZQ9ChVftevsp1sTElOo5/S+cyQFNozT9NSHNgcfccDv5p5SDQhPpeTvvW0hBTSP1/LQgCsFJnrK792UPQoVX7Xr7KdbExJTqOf0vnMkBTaM0/TUhzYHH3HA7+aeUg0IT6Xk771tIQU0j9fy0IArBSZ6yu/dlD0KFV+16+ynWxMSU6jn9L5zJAU2jNP01Ic2Bx9xwO/mnlINCE+l5O+9bSEFNI/X8tCAKwUmesrv3ZQ9ChVftevsp1sTElOo5/S+cyQFNozT9NSHNgcfccDv5p5SDQhPpeTvvW0hBTSP1/LQgCsFJnrK792UPQoVX7Xr7KdbExJTqOf0vnMkBTaM0/TUhzYHH3HA7+aeUg0IT6Xk771tIQU0j9fy0IArBSZ6yu/dlD0KFV+16+ynWxMSU6jn9L5zJAU2jNP01Ic2Bx9xwO/mnlINCE+l5O+9bSEFNI/X8tCAKwUmesrv3ZQ9ChVftevsp1sTElOo5/S+cyQFNozT9NSHNgcfccDv5p5SDQhPpeTvvW0hBTSP1/LQgCsFJnrK792UPQoVX7Xr7KdbExJTqOf0vnMkBTaM0/TUhzYHH3HA7+aeUg0IT6Xk771tIQU0j9fy0IArBSZ6yu/dlD0KFV+16+ynWxMSU6jn9L5zJAU2jNP01Ic2Bx9xwO/mnlINCE+l5O+9bSEFNI/X8tCAKwUmesrv3ZQ9ChVftevsp1sTElOo5/S+cw==');
      audio.play().catch(() => {}); // Ses çalmazsa sessizce devam et
    } catch {
      // Ses çalma hatası - önemsiz
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMinutes(settings.workDuration);
    } else {
      const isLongBreak = completedPomodoros % 4 === 0;
      setMinutes(isLongBreak ? settings.longBreakDuration : settings.breakDuration);
    }
    setSeconds(0);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'work') {
      setMinutes(settings.workDuration);
    } else {
      setMinutes(settings.breakDuration);
    }
    setSeconds(0);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(tempSettings));
    toast.success('Ayarlar kaydedildi');
    setShowSettings(false);

    // Timer'ı sıfırla
    setIsActive(false);
    if (mode === 'work') {
      setMinutes(tempSettings.workDuration);
    } else {
      setMinutes(tempSettings.breakDuration);
    }
    setSeconds(0);
  };

  const formatTime = (mins, secs) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    if (mode === 'work') return settings.workDuration;
    if (mode === 'longBreak') return settings.longBreakDuration;
    return settings.breakDuration;
  };

  const percentage = ((getTotalDuration() * 60 - (minutes * 60 + seconds)) / (getTotalDuration() * 60)) * 100;

  const getModeConfig = () => {
    if (mode === 'work') {
      return {
        gradient: 'from-primary-600 via-primary-700 to-primary-900',
        textColor: 'text-primary-600 dark:text-primary-400',
        icon: BookOpen,
        label: 'Çalışma Zamanı',
        emoji: '🎯',
      };
    }
    return {
      gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      icon: Coffee,
      label: mode === 'longBreak' ? 'Uzun Mola' : 'Kısa Mola',
      emoji: mode === 'longBreak' ? '🌟' : '☕',
    };
  };

  const modeConfig = getModeConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      <DashboardBackgroundEffects />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="mb-8">
            <h2 className="text-5xl font-normal text-neutral-900 dark:text-white mb-2 font-display tracking-wide">
              Pomodoro
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-3 font-serif">
              Odaklan, çalış, ara ver
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl shadow-elegant-xl overflow-hidden border-2 border-neutral-200/80 dark:border-neutral-700/80"
            >
              {/* Top gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${modeConfig.gradient}`} />

              {/* Hexagonal pattern */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hexPattern" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                      <polygon
                        points="28,0 56,15 56,45 28,60 0,45 0,15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-primary-700 dark:text-primary-400"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hexPattern)" />
                </svg>
              </div>

              <div className="relative p-12">
                {/* Mode Selector */}
                <div className="flex justify-center gap-3 mb-12">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => switchMode('work')}
                    className={`relative px-8 py-4 rounded-2xl font-medium transition-all overflow-hidden ${
                      mode === 'work'
                        ? `bg-gradient-to-r ${modeConfig.gradient} text-white shadow-elegant`
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {mode === 'work' && (
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full">
                          <defs>
                            <pattern id="workDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                              <circle cx="2" cy="2" r="1" fill="white" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#workDots)" />
                        </svg>
                      </div>
                    )}
                    <div className="relative flex items-center gap-2 font-display">
                      <BookOpen className="w-5 h-5" />
                      Çalışma
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => switchMode('break')}
                    className={`relative px-8 py-4 rounded-2xl font-medium transition-all overflow-hidden ${
                      mode !== 'work'
                        ? `bg-gradient-to-r ${modeConfig.gradient} text-white shadow-elegant`
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {mode !== 'work' && (
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full">
                          <defs>
                            <pattern id="breakDots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                              <circle cx="2" cy="2" r="1" fill="white" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#breakDots)" />
                        </svg>
                      </div>
                    )}
                    <div className="relative flex items-center gap-2 font-display">
                      <Coffee className="w-5 h-5" />
                      Mola
                    </div>
                  </motion.button>
                </div>

                {/* Circular Timer - Dashboard Style */}
                <div className="relative w-96 h-96 mx-auto mb-12">
                  {/* SVG Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="192"
                      cy="192"
                      r="160"
                      stroke="currentColor"
                      strokeWidth="20"
                      fill="none"
                      className="text-neutral-200 dark:text-neutral-800"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="192"
                      cy="192"
                      r="160"
                      stroke="url(#timerGradient)"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 160}`}
                      strokeDashoffset={`${2 * Math.PI * 160 * (1 - percentage / 100)}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: `${2 * Math.PI * 160}` }}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 160 * (1 - percentage / 100)}` }}
                    />
                    <defs>
                      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className={mode === 'work' ? 'text-primary-600' : 'text-emerald-600'} stopColor="currentColor" />
                        <stop offset="100%" className={mode === 'work' ? 'text-primary-900' : 'text-cyan-700'} stopColor="currentColor" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Time Display - Centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        key={`${minutes}-${seconds}`}
                        initial={{ scale: 0.95, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-8xl font-light bg-gradient-to-br from-neutral-800 to-neutral-900 dark:from-neutral-100 dark:to-neutral-200 bg-clip-text text-transparent font-display mb-4"
                      >
                        {formatTime(minutes, seconds)}
                      </motion.div>
                      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r ${modeConfig.gradient} text-white text-sm font-display`}>
                        <span className="text-lg">{modeConfig.emoji}</span>
                        <span>{modeConfig.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTimer}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${modeConfig.gradient} text-white shadow-elegant-xl flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                    {isActive ? (
                      <Pause className="w-10 h-10 relative z-10" />
                    ) : (
                      <Play className="w-10 h-10 ml-0.5 relative z-10" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTimer}
                    className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-elegant flex items-center justify-center transition-all"
                  >
                    <RotateCcw className="w-7 h-7" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-elegant flex items-center justify-center transition-all"
                  >
                    <Settings className="w-7 h-7" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl shadow-elegant overflow-hidden border-2 border-neutral-200/80 dark:border-neutral-700/80"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600" />

                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl">
                          <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-normal text-neutral-800 dark:text-neutral-200 font-display">
                          Ayarlar
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
                          Çalışma (dk)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={tempSettings.workDuration}
                          onChange={(e) => setTempSettings({ ...tempSettings, workDuration: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 font-display focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
                          Kısa Mola (dk)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={tempSettings.breakDuration}
                          onChange={(e) => setTempSettings({ ...tempSettings, breakDuration: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 font-display focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
                          Uzun Mola (dk)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={tempSettings.longBreakDuration}
                          onChange={(e) => setTempSettings({ ...tempSettings, longBreakDuration: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 font-display focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl mb-6">
                      <label htmlFor="soundEnabled" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-display">
                        🔔 Ses bildirimleri
                      </label>
                      <input
                        type="checkbox"
                        id="soundEnabled"
                        checked={tempSettings.soundEnabled}
                        onChange={(e) => setTempSettings({ ...tempSettings, soundEnabled: e.target.checked })}
                        className="w-5 h-5 rounded text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setTempSettings(settings);
                          setShowSettings(false);
                        }}
                        className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all font-display font-medium"
                      >
                        İptal
                      </button>
                      <button
                        onClick={saveSettings}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-elegant font-display font-medium"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats Sidebar - Dashboard Style */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 dark:from-primary-800 dark:via-primary-900 dark:to-primary-950 rounded-3xl p-8 shadow-elegant-xl overflow-hidden border-2 border-primary-600/30"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

              {/* Dot pattern */}
              <div className="absolute inset-0 opacity-[0.12]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="todayDots" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#todayDots)" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-normal text-white font-display">Bugün</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-sm text-secondary-100 font-display mb-2">Tamamlanan</p>
                    {loadingStats ? (
                      <div className="h-16 bg-white/10 rounded-lg animate-pulse" />
                    ) : (
                      <div className="text-6xl font-light text-white font-display">
                        {completedPomodoros}
                      </div>
                    )}
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-sm text-secondary-100 font-display mb-2">Toplam Süre</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-light text-white font-display">
                        {Math.floor(completedPomodoros * settings.workDuration / 60)}
                      </span>
                      <span className="text-lg text-secondary-100 font-display">saat</span>
                      <span className="text-4xl font-light text-white font-display ml-2">
                        {(completedPomodoros * settings.workDuration) % 60}
                      </span>
                      <span className="text-lg text-secondary-100 font-display">dk</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Progress to Long Break */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-8 shadow-elegant overflow-hidden border-2 border-neutral-200/80 dark:border-neutral-700/80"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

              {/* Corner decoration */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-3 right-3 w-16 h-16 opacity-5 dark:opacity-10"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600" />
                </svg>
              </motion.div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl">
                  <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-normal text-neutral-800 dark:text-neutral-200 font-display">
                  Uzun Molaya
                </h3>
              </div>

              <div className="text-center py-6 mb-6">
                <motion.div
                  key={completedPomodoros}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-7xl font-light bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent font-display mb-2"
                >
                  {4 - (completedPomodoros % 4)}
                </motion.div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display">
                  Pomodoro kaldı
                </p>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: i < (completedPomodoros % 4) ? 1.2 : 1 }}
                    className={`w-4 h-4 rounded-full transition-all ${
                      i < (completedPomodoros % 4)
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg'
                        : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Tip Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-3xl p-6 border-2 border-emerald-200/80 dark:border-emerald-800/30 overflow-hidden"
            >
              {/* Wave decoration */}
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 50 Q 25 25, 50 50 T 100 50 L 100 100 L 0 100 Z" fill="currentColor" className="text-emerald-600" />
                </svg>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl shrink-0">
                  <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2 font-display">
                    💡 İpucu
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-display leading-relaxed">
                    Her 4 Pomodoro'dan sonra uzun bir mola al. Bu sana yeniden enerjilenmek için fırsat verir.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PomodoroTimer;
