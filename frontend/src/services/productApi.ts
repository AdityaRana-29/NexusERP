import api from './api';
import { Product, PaginationMeta, ApiResponse } from '../types';

export interface ProductFilterParams {
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
  page?: number;
  limit?: number;
}

export const productApi = {
  getAll: async (params?: ProductFilterParams) => {
    const res = await api.get<ApiResponse<{ products: Product[]; meta: PaginationMeta }>>('/products', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },

  create: async (data: Partial<Product>) => {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Product>) => {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<{ id: string }>>(`/products/${id}`);
    return res.data;
  },
};
