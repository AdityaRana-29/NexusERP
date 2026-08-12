import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProductService } from '../services/productService';
import { InventoryService } from '../services/inventoryService';
import { sendSuccess, sendError } from '../utils/response';
import { MovementType } from '../types/enums';

export class ProductController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, category, lowStockOnly, page, limit } = req.query;
      const result = await ProductService.getAll({
        search: search as string,
        category: category as string,
        lowStockOnly: lowStockOnly === 'true',
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return sendSuccess(res, result, 'Products retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch products', 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getById(id);
      return sendSuccess(res, product, 'Product details retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Product not found', 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { productName, SKU, category, unitPrice, currentStock, minimumStockAlert, warehouseLocation } = req.body;
      if (!productName || !SKU || !category || unitPrice === undefined || !warehouseLocation) {
        return sendError(res, 'Product name, SKU, category, unit price, and warehouse location are required.', 400);
      }

      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const product = await ProductService.create(
        {
          productName,
          SKU,
          category,
          unitPrice: Number(unitPrice),
          currentStock: currentStock ? Number(currentStock) : 0,
          minimumStockAlert: minimumStockAlert ? Number(minimumStockAlert) : 10,
          warehouseLocation,
        },
        userId
      );

      return sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create product', 400);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await ProductService.update(id, req.body);
      return sendSuccess(res, updated, 'Product updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update product', 400);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProductService.delete(id);
      return sendSuccess(res, result, 'Product deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete product', 400);
    }
  }
}

export class InventoryController {
  static async getStockMovements(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, movementType, search, page, limit } = req.query;
      const result = await InventoryService.getStockMovements({
        productId: productId as string,
        movementType: movementType as MovementType,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 15,
      });

      return sendSuccess(res, result, 'Stock movements retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch stock movements', 500);
    }
  }

  static async recordMovement(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, quantityChanged, movementType, reason } = req.body;
      if (!productId || !quantityChanged || !movementType || !reason) {
        return sendError(res, 'Product ID, quantity changed, movement type (IN/OUT), and reason are required.', 400);
      }

      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const movement = await InventoryService.recordManualMovement({
        productId,
        quantityChanged: Number(quantityChanged),
        movementType: movementType as MovementType,
        reason,
        createdBy: userId,
      });

      return sendSuccess(res, movement, 'Stock movement recorded successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to record stock movement', 400);
    }
  }
}
