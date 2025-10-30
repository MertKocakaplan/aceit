import api from './axios';

export const pomodoroAPI = {
  // axios interceptor zaten response.data döndürür → { success: true, data: {...} }
  saveSession: async (data) => api.post('/pomodoro', data),

  getStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    return api.get(`/pomodoro/stats?${params.toString()}`);
  },

  // Stats sayfası için detaylı istatistikler
  getDetailedStats: async () => {
    return api.get('/pomodoro/stats'); 
  },
};