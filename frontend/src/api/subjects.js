import api from './axios';

export const subjectsAPI = {
  // Tüm dersleri getir
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },

  // Ders detayı
  getById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  // Dersin konularını getir
  getTopics: async (subjectId) => {
    const response = await api.get(`/subjects/${subjectId}/topics`);
    return response.data;
  },
};