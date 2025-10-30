import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { GlassCard } from '../../ui';

const ActivityHeatmap = ({ yearlyData }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Intensity renkleri (dakikaya göre)
  const getIntensityColor = (duration) => {
    if (duration === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (duration < 30) return 'bg-green-200 dark:bg-green-900/40';
    if (duration < 60) return 'bg-green-300 dark:bg-green-800/60';
    if (duration < 120) return 'bg-green-400 dark:bg-green-700/80';
    if (duration < 180) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
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

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
          <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Yıllık Aktivite Takvimi
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Son 365 günlük çalışma yoğunluğu
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Ay etiketleri */}
          <div className="flex gap-1 ml-12 mb-1">
            {monthLabels.map((month, index) => (
              <div
                key={index}
                style={{
                  marginLeft: index === 0 ? 0 : `${(month.weekIndex - (monthLabels[index - 1]?.weekIndex || 0)) * 12}px`,
                }}
                className="text-xs text-gray-600 dark:text-gray-400"
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
                  className="w-8 h-3 flex items-center justify-end text-xs text-gray-600 dark:text-gray-400"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Haftalar */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  if (!day) return <div key={dayIndex} className="w-3 h-3" />;

                  const date = new Date(day.date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <motion.div
                      key={day.date}
                      whileHover={{ scale: 1.5 }}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`
                        w-3 h-3 rounded-sm cursor-pointer transition-all
                        ${getIntensityColor(day.duration)}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
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
          className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {new Date(hoveredDay.date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {hoveredDay.duration > 0 ? (
              <>
                <span className="font-medium text-green-600">
                  {Math.floor(hoveredDay.duration / 60)}s {hoveredDay.duration % 60}dk
                </span>{' '}
                çalışıldı
              </>
            ) : (
              <span className="text-gray-500">Çalışma yok</span>
            )}
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-6 text-xs text-gray-600 dark:text-gray-400">
        <span>Az</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40" />
          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800/60" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/80" />
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
        </div>
        <span>Çok</span>
      </div>
    </GlassCard>
  );
};

export default ActivityHeatmap;