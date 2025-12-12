/**
 * Date Utility Functions
 * Timezone-safe date formatting utilities for backend
 */

/**
 * Get date string in YYYY-MM-DD format using local timezone
 * @param {Date} date - Date object (defaults to today)
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date in YYYY-MM-DD format using local timezone
 * @returns {string} Today's date in YYYY-MM-DD format
 */
const getTodayDate = () => {
  return getLocalDateString(new Date());
};

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date object
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get date N days from now
 * @param {number} days - Number of days from now
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getDateAfterDays = (days) => {
  const date = addDays(new Date(), days);
  return getLocalDateString(date);
};

/**
 * Compare two dates (ignoring time)
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {boolean} True if dates are the same day
 */
const isSameDay = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return getLocalDateString(d1) === getLocalDateString(d2);
};

/**
 * Check if date is today
 * @param {Date|string} date
 * @returns {boolean}
 */
const isToday = (date) => {
  return isSameDay(date, new Date());
};

/**
 * Check if date is in the past
 * @param {Date|string} date
 * @returns {boolean}
 */
const isPast = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

module.exports = {
  getLocalDateString,
  getTodayDate,
  addDays,
  getDateAfterDays,
  isSameDay,
  isToday,
  isPast,
};
