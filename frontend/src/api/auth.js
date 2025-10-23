import api from './axios';

export const authAPI = {
  // Kayıt
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.success && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
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
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Mevcut kullanıcı
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data; 
  },

  // Token yenile
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.success && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    return response;
  },
};