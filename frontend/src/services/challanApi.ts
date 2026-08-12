import api from './api';
import { Challan, PaginationMeta, ApiResponse, ChallanStatus } from '../types';

export interface ChallanFilterParams {
  search?: string;
  status?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface CreateChallanPayload {
  customerId: string;
  items: { productId: string; quantity: number }[];
  status?: ChallanStatus;
}

export const challanApi = {
  getAll: async (params?: ChallanFilterParams) => {
    const res = await api.get<ApiResponse<{ challans: Challan[]; meta: PaginationMeta }>>('/challans', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Challan>>(`/challans/${id}`);
    return res.data;
  },

  create: async (payload: CreateChallanPayload) => {
    const res = await api.post<ApiResponse<Challan>>('/challans', payload);
    return res.data;
  },

  updateStatus: async (id: string, status: ChallanStatus) => {
    const res = await api.put<ApiResponse<Challan>>(`/challans/${id}/status`, { status });
    return res.data;
  },
};
