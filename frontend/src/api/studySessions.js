import api from './axios';

export const studySessionsAPI = {
  // axios interceptor zaten response.data döndürür → { success: true, data: {...}, pagination?: {...} }

  // Tüm çalışma kayıtları
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);
    return api.get(`/study-sessions?${params.toString()}`);
  },

  // Tek kayıt
  getById: async (id) => api.get(`/study-sessions/${id}`),

  // Yeni kayıt oluştur
  create: async (sessionData) => api.post('/study-sessions', sessionData),

  // Güncelle
  update: async (id, updateData) => api.put(`/study-sessions/${id}`, updateData),

  // Sil
  delete: async (id) => api.delete(`/study-sessions/${id}`),
};