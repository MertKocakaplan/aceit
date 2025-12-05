import api from './axios';

export const studyPlanAPI = {
  // Plan CRUD
  getAll: () => api.get('/study-plans'),

  getActive: () => api.get('/study-plans/active'),

  getById: (id) => api.get(`/study-plans/${id}`),

  create: (planData) => api.post('/study-plans', planData),

  update: (id, updateData) => api.put(`/study-plans/${id}`, updateData),

  delete: (id) => api.delete(`/study-plans/${id}`),

  activate: (id) => api.put(`/study-plans/${id}/activate`),

  // AI Generation
  generateAI: (preferences) => api.post('/study-plans/generate-ai', preferences, {
    timeout: 120000 // 2 dakika (AI generation uzun sürebilir)
  }),

  // Days
  createDay: (planId, dayData) => api.post(`/study-plans/${planId}/days`, dayData),

  // Slots
  createSlot: (dayId, slotData) => api.post(`/study-plans/days/${dayId}/slots`, slotData),

  updateSlot: (slotId, updateData) => api.put(`/study-plans/slots/${slotId}`, updateData),

  markSlotComplete: (slotId, completed) =>
    api.put(`/study-plans/slots/${slotId}/complete`, { completed }),

  deleteSlot: (slotId) => api.delete(`/study-plans/slots/${slotId}`),

  // Progress
  getProgress: (planId) => api.get(`/study-plans/${planId}/progress`)
};
