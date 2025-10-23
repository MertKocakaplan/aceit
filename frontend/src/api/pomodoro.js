import api from './axios';

export const pomodoroAPI = {
  saveSession: async (data) => {
    const response = await api.post('/pomodoro', data);
    return response.data; // { success: true, data: {...} }
  },

  getStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/pomodoro/stats?${params.toString()}`);
    console.log('🔍 getStats Response:', response); 
    return response; // Tüm response döndür (data + success)
  },
};
