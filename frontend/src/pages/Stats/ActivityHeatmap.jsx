import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame } from 'lucide-react';

const ActivityHeatmap = ({ yearlyData }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Intensity renkleri (dakikaya göre)
  const getIntensityColor = (duration) => {
    if (duration === 0) return 'bg-neutral-100 dark:bg-neutral-800/50';
    if (duration < 30) return 'bg-emerald-200 dark:bg-emerald-900/40';
    if (duration < 60) return 'bg-emerald-300 dark:bg-emerald-800/60';
    if (duration < 120) return 'bg-emerald-400 dark:bg-emerald-700/80';
    if (duration < 180) return 'bg-emerald-500 dark:bg-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500';
  };

  // Haftaları grupla (her hafta 7 gün)
  const weeks = [];
  let currentWeek = [];

  yearlyData.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === yearlyData.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Ay etiketleri (her ayın ilk haftasında)
  const monthLabels = [];
  let lastMonth = '';

  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay) {
      const date = new Date(firstDay.date);
      const month = date.toLocaleDateString('tr-TR', { month: 'short' });

      if (month !== lastMonth) {
        monthLabels.push({
          weekIndex,
          label: month.charAt(0).toUpperCase() + month.slice(1),
        });
        lastMonth = month;
      }
    }
  });

  // Gün etiketleri (Pazartesi, Çarşamba, Cuma)
  const dayLabels = ['Pzt', '', 'Çar', '', 'Cum', '', ''];

  // Toplam aktif gün sayısı ve streak hesaplama
  const totalActiveDays = yearlyData.filter(day => day.duration > 0).length;
  const totalDuration = yearlyData.reduce((sum, day) => sum + day.duration, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-elegant overflow-hidden"
    >
      {/* Teal/Cyan Gradient Header with Grid Pattern */}
      <div className="relative bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 p-6 overflow-hidden">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-[0.12]">
          <svg className="w-full h-full">
            <defs>
              <pattern id="gridPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#gridPattern)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-normal text-white font-display">
                Yıllık Aktivite Takvimi
              </h3>
              <p className="text-sm text-teal-100 font-display">
                Son 365 günlük çalışma yoğunluğu haritası
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-xs text-teal-100 font-display">Aktif Günler</p>
              <p className="text-2xl font-normal text-white font-display">{totalActiveDays}</p>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-xs text-teal-100 font-display">Toplam Süre</p>
              <p className="text-2xl font-normal text-white font-display">
                {Math.floor(totalDuration / 60)}<span className="text-sm">s</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Heatmap Area */}
        <div className="flex-1 p-8">
          {/* Decorative Corner Frames */}
          <div className="absolute top-24 left-0 w-12 h-12 border-l-4 border-t-4 border-teal-200 dark:border-teal-800 opacity-30"></div>
          <div className="absolute top-24 right-0 w-12 h-12 border-r-4 border-t-4 border-teal-200 dark:border-teal-800 opacity-30"></div>

          {/* Heatmap */}
          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1">
              {/* Ay etiketleri */}
              <div className="flex gap-1 ml-12 mb-1">
                {monthLabels.map((month, index) => (
                  <div
                    key={index}
                    style={{
                      marginLeft: index === 0 ? 0 : `${(month.weekIndex - (monthLabels[index - 1]?.weekIndex || 0)) * 14}px`,
                    }}
                    className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-display"
                  >
                    {month.label}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-1">
                {/* Gün etiketleri (sol taraf) */}
                <div className="flex flex-col gap-1 mr-2">
                  {dayLabels.map((label, index) => (
                    <div
                      key={index}
                      className="w-8 h-3.5 flex items-center justify-end text-xs font-medium text-neutral-600 dark:text-neutral-400 font-display"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Haftalar */}
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      if (!day) return <div key={dayIndex} className="w-3.5 h-3.5" />;

                      const date = new Date(day.date);
                      const isToday = date.toDateString() === new Date().toDateString();

                      return (
                        <motion.div
                          key={day.date}
                          whileHover={{ scale: 1.8, zIndex: 10 }}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`
                            w-3.5 h-3.5 rounded-md cursor-pointer transition-all
                            ${getIntensityColor(day.duration)}
                            ${isToday ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900' : ''}
                            hover:ring-2 hover:ring-teal-400
                          `}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-br from-neutral-50 to-teal-50 dark:from-neutral-800 dark:to-teal-950/30 rounded-2xl border-2 border-teal-200 dark:border-teal-800 shadow-elegant"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-display">
                    {new Date(hoveredDay.date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-display">
                    {hoveredDay.duration > 0 ? (
                      <>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {Math.floor(hoveredDay.duration / 60)}s {hoveredDay.duration % 60}dk
                        </span>{' '}
                        çalışıldı
                      </>
                    ) : (
                      <span className="text-neutral-500">Çalışma yok</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Legend with Vertical Layout */}
        <div className="relative w-2 bg-gradient-to-b from-teal-600 via-cyan-600 to-teal-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full">
              <defs>
                <pattern id="sidebarDots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="4" cy="4" r="0.5" fill="white" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#sidebarDots)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Legend Bar */}
      <div className="relative px-8 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t-2 border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 font-display">
            <span>Az</span>
            <div className="flex gap-1.5">
              <div className="w-4 h-4 rounded-md bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700" />
              <div className="w-4 h-4 rounded-md bg-emerald-200 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800" />
              <div className="w-4 h-4 rounded-md bg-emerald-300 dark:bg-emerald-800/60 border border-emerald-400 dark:border-emerald-700" />
              <div className="w-4 h-4 rounded-md bg-emerald-400 dark:bg-emerald-700/80 border border-emerald-500 dark:border-emerald-600" />
              <div className="w-4 h-4 rounded-md bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-500" />
              <div className="w-4 h-4 rounded-md bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400" />
            </div>
            <span>Çok</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 font-display">
              Consistency is key!
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityHeatmap;
