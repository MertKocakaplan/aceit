import axios from 'axios';
import { toast } from 'sonner';

// Environment variable for API URL (with fallback for development)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 saniye timeout
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('İstek gönderilirken bir hata oluştu');
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Hata mesajını belirle
    let errorMessage = 'Bir hata oluştu';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'İstek zaman aşımına uğradı';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
    } else if (error.response) {
      // Sunucudan gelen hata
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorMessage = data.message || 'Geçersiz istek';
          break;
        case 401:
          errorMessage = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Toast göster ve yönlendir
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          break;
        case 403:
          errorMessage = 'Bu işlem için yetkiniz yok';
          break;
        case 404:
          errorMessage = data.message || 'Kayıt bulunamadı';
          break;
        case 409:
          errorMessage = data.message || 'Bu kayıt zaten mevcut';
          break;
        case 422:
          errorMessage = data.message || 'Geçersiz veri';
          break;
        case 429:
          errorMessage = 'Çok fazla istek gönderdiniz. Lütfen bekleyin.';
          break;
        case 500:
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
          break;
        case 503:
          errorMessage = 'Sunucu şu an bakımda. Lütfen daha sonra tekrar deneyin.';
          break;
        default:
          errorMessage = data.message || `Hata (${status})`;
      }
    }

    // Toast göster (401 hariç, çünkü zaten gösteriliyor)
    if (error.response?.status !== 401) {
      toast.error(errorMessage, {
        duration: 4000,
      });
    }

    // Hata objesini döndür
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;