import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // sends httpOnly cookie automatically on every request
});

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
    // httpOnly cookie is set by server automatically
    // Store token in sessionStorage for Socket.io (tab-scoped, cleared on browser close)
    if (response.data?.data?.token) {
      sessionStorage.setItem('socketToken', response.data.data.token);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    // Clear server-side httpOnly cookie via API
    try {
      await api.post('/auth/logout');
    } catch {}
    // Clear non-sensitive localStorage metadata
    localStorage.removeItem('accountType');
    localStorage.removeItem('userId');
    localStorage.removeItem('organizationData');
    localStorage.removeItem('isOrgAdmin');
    localStorage.removeItem('adminOrgId');
    localStorage.removeItem('adminOrgName');
    localStorage.removeItem('isAdmin');
    // Clear socket token
    sessionStorage.removeItem('socketToken');
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },
};

export default api;
