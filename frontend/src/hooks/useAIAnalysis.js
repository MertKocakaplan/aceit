import { useState, useEffect } from 'react';
import { aiAPI } from '../api';
import { getAIAnalysisCache, setAIAnalysisCache } from '../utils/aiCache';
import { useAuth } from '../store/AuthContext';

/**
 * AI Performance Analysis Hook
 * Günlük cache ile AI analizini yönetir (kullanıcıya özel)
 */
export const useAIAnalysis = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchAIAnalysis();
    }
  }, [user?.id]);

  const fetchAIAnalysis = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Önce cache'i kontrol et (kullanıcıya özel)
      const cached = getAIAnalysisCache(user.id);

      if (cached) {
        setAnalysis(cached);
        setLoading(false);
        return;
      }

      // Cache yoksa API'den al
      const response = await aiAPI.getPerformanceAnalysis();

      if (response.data) {
        // Cache'e kaydet (kullanıcıya özel)
        setAIAnalysisCache(user.id, response.data);
        setAnalysis(response.data);
      }
    } catch (err) {
      console.error('AI analysis fetch error:', err);
      setError(err.message || 'AI analizi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  // Manuel yenileme fonksiyonu
  const refresh = async () => {
    await fetchAIAnalysis();
  };

  return {
    analysis,
    loading,
    error,
    refresh,
  };
};
