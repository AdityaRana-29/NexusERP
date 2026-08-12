import api from './api';
import { StockMovement, PaginationMeta, ApiResponse, MovementType } from '../types';

export interface InventoryFilterParams {
  productId?: string;
  movementType?: MovementType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RecordMovementInput {
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
}

export const inventoryApi = {
  getStockMovements: async (params?: InventoryFilterParams) => {
    const res = await api.get<ApiResponse<{ movements: StockMovement[]; meta: PaginationMeta }>>('/stock-movement', { params });
    return res.data;
  },

  recordMovement: async (data: RecordMovementInput) => {
    const res = await api.post<ApiResponse<StockMovement>>('/stock-movement', data);
    return res.data;
  },
};
