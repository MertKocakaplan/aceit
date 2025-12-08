/**
 * Dashboard utility functions
 */

/**
 * Format duration from minutes to human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2s 30dk" or "45dk")
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0dk';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours}s`;
  }
  return `${mins}dk`;
};

/**
 * Format date to relative time (e.g., "Bugün", "Dün", "3 gün önce")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted relative date
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Bugün';
  } else if (diffDays === 1) {
    return 'Dün';
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  }
};

/**
 * Get Tailwind CSS color class for a subject
 * @param {string} subjectName - Subject name
 * @returns {string} Tailwind color class
 */
export const getSubjectColor = (subjectName) => {
  const colors = {
    'Matematik': 'bg-blue-500',
    'Fizik': 'bg-purple-500',
    'Kimya': 'bg-green-500',
    'Biyoloji': 'bg-emerald-500',
    'Türkçe': 'bg-red-500',
    'Tarih': 'bg-amber-500',
    'Coğrafya': 'bg-teal-500',
    'Felsefe': 'bg-indigo-500',
    'İngilizce': 'bg-pink-500',
  };
  return colors[subjectName] || 'bg-primary-500';
};
