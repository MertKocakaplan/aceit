import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { pomodoroAPI } from '../../api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Coffee,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import {
  AnimatedBackground,
  DashboardHeader,
  GlassCard,
  AnimatedButton,
} from '../../ui';

const PomodoroTimer = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      
      console.log('📅 Bugünkü tarih:', dateStr);
      
      const response = await pomodoroAPI.getStats({
        startDate: dateStr,
        endDate: dateStr,
      });
      
      console.log('📦 Full Response:', response);
      
      // Backend { success: true, data: {...} } döndürüyorsa
      // Axios interceptor { success, data, ... } parse ediyor
      const stats = response.data || response;
      
      console.log('📊 Stats:', stats);
      console.log('🔢 workSessions:', stats.workSessions);
      
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
    console.log('⏰ Timer tamamlandı, mode:', mode);
    setIsActive(false);

    if (settings.soundEnabled) {
      playSound();
    }

    if (mode === 'work') {
      console.log('💼 Çalışma tamamlandı, kaydediliyor...');
      
      try {
        const result = await pomodoroAPI.saveSession({
          duration: settings.workDuration,
          mode: 'work',
          subjectId: null,
        });
        console.log('✅ Kayıt başarılı:', result);
        
        await fetchTodayStats();
        console.log('📊 İstatistikler güncellendi');
      } catch (error) {
        console.error('❌ Pomodoro kayıt hatası:', error);
        setCompletedPomodoros(completedPomodoros + 1);
      }

      toast.success('🎉 Pomodoro tamamlandı! Mola zamanı.');

      const newCompleted = completedPomodoros + 1;
      const isLongBreak = newCompleted % 4 === 0;
      const breakDuration = isLongBreak
        ? settings.longBreakDuration
        : settings.breakDuration;

      console.log('⏭️ Mod değiştiriliyor:', isLongBreak ? 'longBreak' : 'break');
      console.log('⏭️ autoStartBreak:', settings.autoStartBreak);

      setMode(isLongBreak ? 'longBreak' : 'break');
      setMinutes(breakDuration);
      setSeconds(0);

      if (settings.autoStartBreak) {
        console.log('🚀 1 saniye sonra otomatik başlayacak');
        setTimeout(() => {
          console.log('▶️ Otomatik başlatılıyor');
          setIsActive(true);
        }, 1000);
      }
    } else {
      console.log('☕ Mola tamamlandı');
      console.log('⏭️ autoStartWork:', settings.autoStartWork);
      
      toast.success('☕ Mola bitti! Çalışmaya devam.');
      setMode('work');
      setMinutes(settings.workDuration);
      setSeconds(0);

      if (settings.autoStartWork) {
        console.log('🚀 1 saniye sonra otomatik başlayacak');
        setTimeout(() => {
          console.log('▶️ Otomatik başlatılıyor');
          setIsActive(true);
        }, 1000);
      }
    }
  };

  const playSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUBAMT6Ln8LpmHgU7k9r00H4pBS19zu/akj4KFmS56+qnWBETU6jn9L5xJAU1jNP01IU2Bx9zwO/mnlINCFCm5O+9byEGNI/Y8tGAKwUme8vv3ZU+ChZhtuvsp1oTElOo5/S+cyQFNo3T9NWHNwcfccDv5p5SDQhPpeTvvW0hBTOP1/LQgCoFJnrK792UPQoVYLXr7KdbExJTqOf0vnMkBTaM0/TUhzYHH3HA7+aeUg0IT6Xk771tIQU0j9fy0IArBSZ6yu/dlD0KFV+16+ynWxMSU6jn9L5zJAU2jNP01Ic2Bx9xwO/mnlINCE+l5O+9bSEFNI/X8tCAKwUmesrv3ZQ9ChVftevsp1sTElOo5/S+cyQFNozT9NSHNgcfccDv5p5SDQhPpeTvvW0hBTSP1/LQgCsFJnrK792UPQoVX7Xr7KdbExJTqOf0vnMkBTaM0/TUhzYHH3HA7+aeUg0IT6Xk771tIQU0j9fy0IArBSZ6yu/dlD0KFV+16+ynWxMSU6jn9L5zJAU2jNP01Ic2Bx9xwO/mnlINCE+l5O+9bSEFNI/X8tCAKwUmesrv3ZQ9ChVftevsp1sTElOo5/S+cyQFNozT9NSHNgcfccDv5p5SDQhPpeTvvW0hBTSP1/LQgCsFJnrK792UPQoVX7Xr7KdbExJTqOf0vnMkBTaM0/TUhzYHH3HA7+aeUg0IT6Xk771tIQU0j9fy0IArBSZ6yu/dlD0KFV+16+ynWxMSU6jn9L5zJAU2jNP01Ic2Bx9xwO/mnlINCE+l5O+9bSEFNI/X8tCAKwUmesrv3ZQ9ChVftevsp1sTElOo5/S+cyQFNozT9NSHNgcfccDv5p5SDQhPpeTvvW0hBTSP1/LQgCsFJnrK792UPQoVX7Xr7KdbExJTqOf0vnMkBTaM0/TUhzYHH3HA7+aeUg0IT6Xk771tIQU0j9fy0IArBSZ6yu/dlD0KFV+16+ynWxMSU6jn9L5zJAU2jNP01Ic2Bx9xwO/mnlINCE+l5O+9bSEFNI/X8tCAKwUmesrv3ZQ9ChVftevsp1sTElOo5/S+cw==');
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Sound play error:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <AnimatedBackground variant="dashboard" className="fixed -z-10" />
      <DashboardHeader user={user} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard'a Dön</span>
          </motion.button>

          {/* Timer Card */}
          <GlassCard className="p-8">
            <div className="text-center space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                  Pomodoro Timer
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Odaklan, çalış, ara ver
                </p>
              </div>

              {/* Mode Switch */}
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => switchMode('work')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'work'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Çalışma
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => switchMode('break')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'break' || mode === 'longBreak'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5" />
                    Mola
                  </div>
                </motion.button>
              </div>

              {/* Circular Timer */}
              <div className="relative w-80 h-80 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 140}`}
                    strokeDashoffset={`${2 * Math.PI * 140 * (1 - percentage / 100)}`}
                    className={`transition-all duration-1000 ${
                      mode === 'work'
                        ? 'text-blue-500'
                        : 'text-green-500'
                    }`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-7xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                      {formatTime(minutes, seconds)}
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      {mode === 'work' && '🎯 Çalışma Zamanı'}
                      {mode === 'break' && '☕ Kısa Mola'}
                      {mode === 'longBreak' && '🌟 Uzun Mola'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTimer}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg flex items-center justify-center"
                >
                  {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={resetTimer}
                  className="w-16 h-16 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 shadow-lg flex items-center justify-center"
                >
                  <RotateCcw className="w-6 h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-16 h-16 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 shadow-lg flex items-center justify-center"
                >
                  <Settings className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-8 pt-4">
                <div className="text-center">
                  {loadingStats ? (
                    <div className="text-3xl font-bold text-gray-400">...</div>
                  ) : (
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {completedPomodoros}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Bugün Tamamlanan
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.floor(completedPomodoros * settings.workDuration / 60)}h {(completedPomodoros * settings.workDuration) % 60}m
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Bugün Toplam
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {4 - (completedPomodoros % 4)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Uzun Molaya
                  </div>
                </div>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl"
                >
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Ayarlar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Çalışma Süresi (dk)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={tempSettings.workDuration}
                        onChange={(e) => setTempSettings({ ...tempSettings, workDuration: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kısa Mola (dk)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={tempSettings.breakDuration}
                        onChange={(e) => setTempSettings({ ...tempSettings, breakDuration: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Uzun Mola (dk)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={tempSettings.longBreakDuration}
                        onChange={(e) => setTempSettings({ ...tempSettings, longBreakDuration: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="soundEnabled"
                        checked={tempSettings.soundEnabled}
                        onChange={(e) => setTempSettings({ ...tempSettings, soundEnabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="soundEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Ses bildirimleri
                      </label>
                    </div>
                  </div>

                  {/* Kaydet/İptal Butonları */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setTempSettings(settings);
                        setShowSettings(false);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={saveSettings}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                      Kaydet
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default PomodoroTimer;