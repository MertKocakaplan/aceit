import api from './axios';

export const adminAPI = {
  // Exam Years
  examYears: {
    getAll: async () => {
      const response = await api.get('/admin/exam-years');
      return response.data;
    },
    getById: async (id) => {
      const response = await api.get(`/admin/exam-years/${id}`);
      return response.data;
    },
    create: async (data) => {
      const response = await api.post('/admin/exam-years', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await api.put(`/admin/exam-years/${id}`, data);
      return response.data;
    },
    setActive: async (id) => {
      const response = await api.patch(`/admin/exam-years/${id}/set-active`);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/admin/exam-years/${id}`);
      return response.data;
    },
  },

  // Topic Question Counts
  topicQuestionCounts: {
    getByExamYear: async (examYearId) => {
      const response = await api.get('/admin/topic-question-counts', {
        params: { examYearId },
      });
      return response.data;
    },
    getByTopic: async (topicId) => {
      const response = await api.get(`/admin/topic-question-counts/by-topic/${topicId}`);
      return response.data;
    },
    upsertBulk: async (data) => {
      const response = await api.post('/admin/topic-question-counts/bulk', data);
      return response.data;
    },
    upsert: async (data) => {
      const response = await api.put('/admin/topic-question-counts', data);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/admin/topic-question-counts/${id}`);
      return response.data;
    },
    uploadCSV: async (data) => {
  const response = await api.post('/admin/topic-question-counts/upload-csv', data);
  return response;
},
  },

  // Users
  users: {
    getAll: async (filters) => {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    },
    getById: async (id) => {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    },
    updateRole: async (id, role) => {
      const response = await api.patch(`/admin/users/${id}/role`, { role });
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    },
  },

  // Stats
  stats: {
    get: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
  },
};