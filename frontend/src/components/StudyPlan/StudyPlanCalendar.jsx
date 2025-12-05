import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Brain } from 'lucide-react';

// Helper function - outside component so SlotCard can access it
const formatTime = (timeStr) => {
  return timeStr.slice(0, 5); // HH:MM format
};

// Parse time string to minutes from midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const StudyPlanCalendar = ({ weekDays, onSlotComplete }) => {
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Calculate time range from all slots
  const { minHour, maxHour, pixelsPerHour } = useMemo(() => {
    let min = 24;
    let max = 0;

    weekDays.forEach(day => {
      if (day.dayData?.slots) {
        day.dayData.slots.forEach(slot => {
          const startHour = parseInt(slot.startTime.split(':')[0]);
          const endHour = parseInt(slot.endTime.split(':')[0]);
          const endMinutes = parseInt(slot.endTime.split(':')[1]);

          if (startHour < min) min = startHour;
          if (endHour > max || (endHour === max && endMinutes > 0)) {
            max = endMinutes > 0 ? endHour + 1 : endHour;
          }
        });
      }
    });

    // Default range if no slots
    if (min === 24) min = 8;
    if (max === 0) max = 22;

    // Add padding
    min = Math.max(0, min - 1);
    max = Math.min(24, max + 1);

    return {
      minHour: min,
      maxHour: max,
      pixelsPerHour: 100 // 100px per hour (daha büyük kartlar için)
    };
  }, [weekDays]);

  const hours = useMemo(() => {
    const arr = [];
    for (let h = minHour; h < maxHour; h++) {
      arr.push(h);
    }
    return arr;
  }, [minHour, maxHour]);

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Calculate slot position and height
  const getSlotStyle = (slot) => {
    const startMinutes = timeToMinutes(slot.startTime);
    const startHourOffset = startMinutes - (minHour * 60);
    const top = (startHourOffset / 60) * pixelsPerHour;
    const height = (slot.duration / 60) * pixelsPerHour;

    return {
      top: `${top}px`,
      height: `${Math.max(height, 50)}px` // Minimum 50px height
    };
  };

  const totalHeight = (maxHour - minHour) * pixelsPerHour;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header Row - Days */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 p-2 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Saat
          </div>

          {/* Day headers */}
          {weekDays.map((day, index) => {
            const today = isToday(day.date);
            const past = isPast(day.date);

            return (
              <div
                key={day.dateStr}
                className={`
                  flex-1 p-3 text-center border-l border-neutral-200 dark:border-neutral-700
                  ${today
                    ? 'bg-primary-600 text-white'
                    : past
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    : 'bg-neutral-50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <div className="text-xs font-medium mb-1">
                  {dayNames[index]}
                </div>
                <div className="text-lg font-semibold">
                  {day.date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timetable Grid */}
        <div className="flex" style={{ height: `${totalHeight}px` }}>
          {/* Time labels column */}
          <div className="w-16 flex-shrink-0 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full text-right pr-2 text-xs text-neutral-500 dark:text-neutral-400"
                style={{
                  top: `${(hour - minHour) * pixelsPerHour}px`,
                  transform: 'translateY(-50%)'
                }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const today = isToday(day.date);
            const past = isPast(day.date);

            return (
              <div
                key={day.dateStr}
                className={`
                  flex-1 relative border-l border-neutral-200 dark:border-neutral-700
                  ${today
                    ? 'bg-primary-50/30 dark:bg-primary-950/10'
                    : past
                    ? 'bg-neutral-50/50 dark:bg-neutral-900/30 opacity-75'
                    : 'bg-white dark:bg-neutral-900/20'
                  }
                `}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-neutral-100 dark:border-neutral-800"
                    style={{ top: `${(hour - minHour) * pixelsPerHour}px` }}
                  />
                ))}

                {/* Slots */}
                {day.dayData?.slots?.map((slot, index) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    style={getSlotStyle(slot)}
                    index={index}
                    isPast={past}
                    onComplete={onSlotComplete}
                  />
                ))}

                {/* Empty state overlay */}
                {(!day.dayData?.slots || day.dayData.slots.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-xs">
                    Slot yok
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SlotCard = ({ slot, style, index, isPast, onComplete }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggleComplete = (e) => {
    e.stopPropagation();
    onComplete(slot.id, !slot.isCompleted);
  };

  const getSlotTypeLabel = (type) => {
    const types = {
      study: 'Çalışma',
      review: 'Tekrar',
      practice: 'Pratik',
      break: 'Mola'
    };
    return types[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className="absolute left-1 right-1 group cursor-pointer overflow-hidden"
      style={style}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleToggleComplete}
    >
      <div
        className={`
          h-full rounded-lg border-l-4 transition-all overflow-hidden
          ${slot.isCompleted
            ? 'bg-emerald-100/90 dark:bg-emerald-950/40 border-emerald-500'
            : 'bg-white/95 dark:bg-neutral-800/95 hover:shadow-lg border-l-4'
          }
        `}
        style={{
          borderLeftColor: slot.isCompleted ? undefined : (slot.subject?.color || '#6B7280'),
          backgroundColor: slot.isCompleted ? undefined : `${slot.subject?.color}15`
        }}
      >
        <div className="p-2.5 h-full flex flex-col">
          {/* Top row: Subject name + completion status */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className="text-sm font-semibold truncate flex-1"
              style={{ color: slot.subject?.color || '#374151' }}
            >
              {slot.subject?.name || 'Ders'}
            </span>
            {slot.isCompleted ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            )}
          </div>

          {/* Topic if space allows */}
          {slot.topic && parseInt(style.height) >= 70 && (
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate mb-1">
              {slot.topic.name}
            </p>
          )}

          {/* Bottom row: Time and duration */}
          <div className="mt-auto flex items-center justify-between gap-1">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
            </span>
            <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
              {slot.duration} dk
            </span>
          </div>

          {/* AI Badge */}
          {slot.aiReason && (
            <div className="absolute top-1 right-6">
              <Brain className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>

        {/* Tooltip for AI Reason */}
        {showTooltip && slot.aiReason && (
          <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] rounded-lg shadow-xl border border-neutral-700">
            <div className="flex items-start gap-1.5">
              <Brain className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p>{slot.aiReason}</p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-900 dark:border-t-neutral-800" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudyPlanCalendar;
