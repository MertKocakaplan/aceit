import api from './axios';

export const authAPI = {
  // Kayıt
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Giriş
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.success && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Çıkış
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Mevcut kullanıcı
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Token yenile
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
};