import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Auth API calls
export const authAPI = {
  signup: async (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    profileData?: {
      realName?: string;
      country?: string;
      isNepal?: boolean;
      games?: Array<{ game: string; rank: string; isPrimary: boolean }>;
    };
  }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: { email: string; password: string; rememberMe?: boolean }) => {
    const response = await api.post('/auth/login', data);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accountType');
    localStorage.removeItem('organizationData');
    localStorage.removeItem('isOrgAdmin');
    localStorage.removeItem('adminOrgId');
    localStorage.removeItem('adminOrgName');
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },
};

export default api;
