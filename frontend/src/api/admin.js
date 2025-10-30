import api from './axios';

export const adminAPI = {
  // Exam Years (axios interceptor zaten response.data döndürür)
  examYears: {
    getAll: async () => api.get('/admin/exam-years'),
    getById: async (id) => api.get(`/admin/exam-years/${id}`),
    create: async (data) => api.post('/admin/exam-years', data),
    update: async (id, data) => api.put(`/admin/exam-years/${id}`, data),
    setActive: async (id) => api.patch(`/admin/exam-years/${id}/set-active`),
    delete: async (id) => api.delete(`/admin/exam-years/${id}`),
  },

  // Topic Question Counts
  topicQuestionCounts: {
    getByExamYear: async (examYearId) => api.get('/admin/topic-question-counts', { params: { examYearId } }),
    getByTopic: async (topicId) => api.get(`/admin/topic-question-counts/by-topic/${topicId}`),
    upsertBulk: async (data) => api.post('/admin/topic-question-counts/bulk', data),
    upsert: async (data) => api.put('/admin/topic-question-counts', data),
    delete: async (id) => api.delete(`/admin/topic-question-counts/${id}`),
    uploadCSV: async (data) => api.post('/admin/topic-question-counts/upload-csv', data),
  },

  // Users
  users: {
    getAll: async (filters) => api.get('/admin/users', { params: filters }),
    getById: async (id) => api.get(`/admin/users/${id}`),
    updateRole: async (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
    delete: async (id) => api.delete(`/admin/users/${id}`),
  },

  // Stats
  stats: {
    get: async () => api.get('/admin/stats'),
  },
};