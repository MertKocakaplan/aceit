import api from './axios';

export const statsAPI = {
  // Genel özet
  getSummary: async () => {
    const response = await api.get('/stats/summary');
    return response.data;
  },

  // Günlük istatistikler
  getDaily: async (days = 7) => {
    const response = await api.get(`/stats/daily?days=${days}`);
    return response.data;
  },

  // Haftalık karşılaştırma
  getWeekly: async () => {
    const response = await api.get('/stats/weekly');
    return response.data;
  },

  // Aylık karşılaştırma
  getMonthly: async () => {
    const response = await api.get('/stats/monthly');
    return response.data;
  },

  // Ders dağılımı
  getSubjectBreakdown: async () => {
    const response = await api.get('/stats/subject-breakdown');
    return response.data;
  },
};