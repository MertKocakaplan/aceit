import api from './axios';

export const subjectsAPI = {
  // axios interceptor zaten response.data döndürür
  getAll: async () => api.get('/subjects'),
  getById: async (id) => api.get(`/subjects/${id}`),
  getTopics: async (subjectId) => api.get(`/subjects/${subjectId}/topics`),
};