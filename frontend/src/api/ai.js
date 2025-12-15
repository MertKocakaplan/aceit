import api from './axios';

/**
 * AI API Client
 * Handles all AI-powered features
 */

export const aiAPI = {
  /**
   * AI Servisi durumunu kontrol et
   */
  checkStatus: async () => {
    const response = await api.get('/ai/status');
    return response;
  },

  /**
   * Soru çöz (metin ve/veya görüntü)
   * @param {Object} data
   * @param {string} data.questionText - Soru metni (opsiyonel)
   * @param {File} data.image - Görüntü dosyası (opsiyonel)
   */
  solveQuestion: async (data) => {
    const formData = new FormData();

    if (data.questionText) {
      formData.append('questionText', data.questionText);
    }

    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.post('/ai/solve-question', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 dakika (AI işlemleri uzun sürebilir)
    });

    return response;
  },

  /**
   * Soru geçmişini getir
   * @param {Object} params
   * @param {number} params.page - Sayfa numarası
   * @param {number} params.limit - Sayfa başına kayıt
   */
  getHistory: async (params = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await api.get('/ai/history', {
      params: { page, limit },
    });
    return response;
  },

  /**
   * Tek bir soru çözümünü getir
   * @param {string} questionId - Soru ID
   */
  getQuestionById: async (questionId) => {
    const response = await api.get(`/ai/question/${questionId}`);
    return response;
  },

  /**
   * Soru çözümünü değerlendir (1-5 yıldız)
   * @param {string} questionId - Soru ID
   * @param {number} rating - Değerlendirme (1-5)
   */
  rateQuestion: async (questionId, rating) => {
    const response = await api.post(`/ai/question/${questionId}/rate`, {
      rating,
    });
    return response;
  },

  /**
   * AI kullanım istatistiklerini getir
   */
  getStats: async () => {
    const response = await api.get('/ai/stats');
    return response;
  },

  /**
   * Performans analizi al
   */
  getPerformanceAnalysis: async () => {
    const response = await api.get('/ai/performance-analysis', {
      timeout: 120000, // 2 dakika (AI analizi uzun sürebilir)
    });
    return response;
  },
};
