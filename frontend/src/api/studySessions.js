import api from './axios';

export const studySessionsAPI = {
  // Tüm çalışma kayıtları
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);

    const response = await api.get(`/study-sessions?${params.toString()}`);
    return response;
  },

  // Tek kayıt
  getById: async (id) => {
    const response = await api.get(`/study-sessions/${id}`);
    return response.data;
  },

  // Yeni kayıt oluştur
  create: async (sessionData) => {
    const response = await api.post('/study-sessions', sessionData);
    return response.data;
  },

  // Güncelle
  update: async (id, updateData) => {
    const response = await api.put(`/study-sessions/${id}`, updateData);
    return response.data;
  },

  // Sil
  delete: async (id) => {
    const response = await api.delete(`/study-sessions/${id}`);
    return response;
  },
};