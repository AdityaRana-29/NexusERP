import api from './api';
import { User, ApiResponse } from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password });
    return res.data;
  },

  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
