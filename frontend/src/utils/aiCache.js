/**
 * AI Performance Analysis Cache Utility
 * Günlük olarak yenilenen AI analizi için localStorage cache yönetimi
 * Tüm cache'ler kullanıcıya özeldir (userId ile ayrılır)
 */

import { getLocalDateString } from './dateUtils';
import logger from './logger';

/**
 * Bugünün tarihini YYYY-MM-DD formatında döner (local timezone)
 */
export const getTodayDate = () => {
  return getLocalDateString(new Date());
};

// ==========================================
// AI Performance Analysis Cache (Kullanıcıya Özel)
// ==========================================

/**
 * Kullanıcıya özel AI cache key oluştur
 * @param {string} userId
 * @returns {string}
 */
const getAICacheKey = (userId) => `ai_performance_analysis_${userId}`;

/**
 * Cache'den AI analizini al
 * @param {string} userId - Kullanıcı ID
 * @returns {Object|null} Cache'deki analiz veya null
 */
export const getAIAnalysisCache = (userId) => {
  if (!userId) return null;

  try {
    const cacheKey = getAICacheKey(userId);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const { date, analysis } = JSON.parse(cached);
    const today = getTodayDate();

    // Bugünkü analiz mi kontrol et
    if (date === today) {
      return analysis;
    }

    // Eski tarihse cache'i temizle
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    logger.error('AI cache read error:', error);
    return null;
  }
};

/**
 * AI analizini cache'e kaydet
 * @param {string} userId - Kullanıcı ID
 * @param {Object} analysis - AI analiz objesi
 */
export const setAIAnalysisCache = (userId, analysis) => {
  if (!userId) return;

  try {
    const cacheKey = getAICacheKey(userId);
    const today = getTodayDate();
    const cacheData = {
      date: today,
      analysis,
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    logger.error('AI cache write error:', error);
  }
};

/**
 * AI cache'i temizle
 * @param {string} userId - Kullanıcı ID
 */
export const clearAIAnalysisCache = (userId) => {
  if (!userId) return;

  try {
    const cacheKey = getAICacheKey(userId);
    localStorage.removeItem(cacheKey);
  } catch (error) {
    logger.error('AI cache clear error:', error);
  }
};

/**
 * Cache'in bugüne ait olup olmadığını kontrol et
 * @param {string} userId - Kullanıcı ID
 * @returns {boolean}
 */
export const isAICacheValid = (userId) => {
  if (!userId) return false;

  try {
    const cacheKey = getAICacheKey(userId);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return false;
    }

    const { date } = JSON.parse(cached);
    const today = getTodayDate();

    return date === today;
  } catch (error) {
    return false;
  }
};

// ==========================================
// Daily Guidance Cache (Kullanıcıya Özel)
// ==========================================

/**
 * Kullanıcıya özel cache key oluştur
 * @param {string} userId
 * @returns {string}
 */
const getDailyGuidanceCacheKey = (userId) => `daily_guidance_${userId}`;

/**
 * Cache'den günlük rehberliği al
 * @param {string} userId - Kullanıcı ID
 * @returns {Object|null} Cache'deki rehberlik veya null
 */
export const getDailyGuidanceCache = (userId) => {
  if (!userId) return null;

  try {
    const cacheKey = getDailyGuidanceCacheKey(userId);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const { date, guidance } = JSON.parse(cached);
    const today = getTodayDate();

    // Bugünkü rehberlik mi kontrol et
    if (date === today) {
      return guidance;
    }

    // Eski tarihse cache'i temizle
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    logger.error('Daily guidance cache read error:', error);
    return null;
  }
};

/**
 * Günlük rehberliği cache'e kaydet
 * @param {string} userId - Kullanıcı ID
 * @param {Object} guidance - Rehberlik objesi
 */
export const setDailyGuidanceCache = (userId, guidance) => {
  if (!userId) return;

  try {
    const cacheKey = getDailyGuidanceCacheKey(userId);
    const today = getTodayDate();
    const cacheData = {
      date: today,
      guidance,
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    logger.error('Daily guidance cache write error:', error);
  }
};

/**
 * Günlük rehberlik cache'ini temizle
 * @param {string} userId - Kullanıcı ID
 */
export const clearDailyGuidanceCache = (userId) => {
  if (!userId) return;

  try {
    const cacheKey = getDailyGuidanceCacheKey(userId);
    localStorage.removeItem(cacheKey);
  } catch (error) {
    logger.error('Daily guidance cache clear error:', error);
  }
};
