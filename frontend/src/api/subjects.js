import api from './axios';

export const subjectsAPI = {
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data; // ← array döndür
  },

  getById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  getTopics: async (subjectId) => {
    const response = await api.get(`/subjects/${subjectId}/topics`);
    return response.data;
  },
};