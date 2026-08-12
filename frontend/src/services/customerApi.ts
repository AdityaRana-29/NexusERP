import api from './api';
import { Customer, PaginationMeta, ApiResponse, FollowUpNote } from '../types';

export interface CustomerFilterParams {
  search?: string;
  status?: string;
  customerType?: string;
  page?: number;
  limit?: number;
}

export const customerApi = {
  getAll: async (params?: CustomerFilterParams) => {
    const res = await api.get<ApiResponse<{ customers: Customer[]; meta: PaginationMeta }>>('/customers', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data;
  },

  create: async (data: Partial<Customer>) => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Customer>) => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<{ id: string }>>(`/customers/${id}`);
    return res.data;
  },

  addFollowUpNote: async (id: string, note: string) => {
    const res = await api.post<ApiResponse<FollowUpNote>>(`/customers/${id}/notes`, { note });
    return res.data;
  },
};
