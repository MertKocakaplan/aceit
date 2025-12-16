import api from './axios';

export const spacedRepetitionAPI = {
  /**
   * Tekrarı gereken konuları getir
   * @param {number} limit - Maksimum konu sayısı (default: 10)
   * @returns {Promise} Tekrar edilmesi gereken konular
   */
  getDueTopics: async (limit = 10) => {
    return api.get(`/spaced-repetition/due?limit=${limit}`);
  },

  /**
   * Spaced repetition istatistikleri
   * @returns {Promise} Genel istatistikler
   */
  getStats: async () => {
    return api.get('/spaced-repetition/stats');
  },

  /**
   * Belirli bir konu için tekrar bilgisi
   * @param {string} topicId - Konu ID
   * @returns {Promise} Konu tekrar bilgisi
   */
  getTopicInfo: async (topicId) => {
    return api.get(`/spaced-repetition/topic/${topicId}`);
  },

  /**
   * Konu çalışma sonrası tekrar kaydını güncelle
   * @param {string} topicId - Konu ID
   * @param {number} performanceScore - Performans skoru (0-1)
   * @returns {Promise} Güncellenmiş kayıt
   */
  updateProgress: async (topicId, performanceScore) => {
    return api.post('/spaced-repetition/update', {
      topicId,
      performanceScore
    });
  }
};
