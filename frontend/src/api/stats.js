import api from './axios';

export const statsAPI = {
  // NOT: axios interceptor zaten response.data dönüyor (axios.js:32)
  // Bu yüzden tekrar .data eklemeye gerek yok

  // Genel özet
  getSummary: async () => {
    return await api.get('/stats/summary');
  },

  // Günlük istatistikler
  getDaily: async (days = 7) => {
    return await api.get(`/stats/daily?days=${days}`);
  },

  // Haftalık karşılaştırma
  getWeekly: async () => {
    return await api.get('/stats/weekly');
  },

  // Aylık karşılaştırma
  getMonthly: async () => {
    return await api.get('/stats/monthly');
  },

  // Ders dağılımı
  getSubjectBreakdown: async () => {
    return await api.get('/stats/subject-breakdown');
  },

  // Streak
  getStreak: async () => {
    return await api.get('/stats/streak');
  },

  // Rekorlar
  getRecords: async () => {
    return await api.get('/stats/records');
  },

  // Başarı trendi
  getSuccessTrend: async () => {
    return await api.get('/stats/success-trend');
  },

  // Hazırlık durumu
  getPreparation: async () => {
    return await api.get('/stats/preparation');
  },

  // Gelişim hızı
  getVelocity: async () => {
    return await api.get('/stats/velocity');
  },

  // FAZ 1: Tüm veriler (optimize edilmiş)
  getOverview: async () => {
    return await api.get('/stats/overview');
  },
    // Yıllık aktivite (heatmap)
  getYearlyActivity: async () => {
    const response = await api.get('/stats/yearly-activity');
    return response;
  },

  // Son 6 ay trend
  getSixMonthTrend: async () => {
    const response = await api.get('/stats/six-month-trend');
    return response;
  },

  // Ders detaylı analiz (Dersler tab'ı)
  getSubjectsDetailed: async () => {
    const response = await api.get('/stats/subjects-detailed');
    return response;
  },

  // Konu detaylı analiz (Konular tab'ı)
  getTopicsDetailed: async () => {
    const response = await api.get('/stats/topics-detailed');
    return response;
  },

  // Sınava kalan süre
  getExamCountdown: async () => {
    const response = await api.get('/stats/exam-countdown');
    return response;
  },

  // Günlük rehberlik
  getDailyGuidance: async () => {
    const response = await api.get('/stats/daily-guidance');
    return response;
  },
};

