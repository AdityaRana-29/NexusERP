import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ChallanService } from '../services/challanService';
import { sendSuccess, sendError } from '../utils/response';
import { ChallanStatus } from '../types/enums';

export class ChallanController {
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { customerId, items, status } = req.body;
      if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'Customer ID and at least one item are required.', 400);
      }

      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const challan = await ChallanService.create(
        {
          customerId,
          items,
          status,
        },
        userId
      );

      return sendSuccess(res, challan, 'Sales Challan created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create sales challan', 400);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, status, customerId, page, limit } = req.query;
      const result = await ChallanService.getAll({
        search: search as string,
        status: status as ChallanStatus,
        customerId: customerId as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return sendSuccess(res, result, 'Sales challans retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch sales challans', 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.getById(id);
      return sendSuccess(res, challan, 'Sales challan details retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Sales challan not found', 404);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !Object.values(ChallanStatus).includes(status)) {
        return sendError(res, 'Valid status (Draft, Confirmed, Cancelled) is required.', 400);
      }

      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const updatedChallan = await ChallanService.updateStatus(id, status as ChallanStatus, userId);
      return sendSuccess(res, updatedChallan, `Sales challan status updated to ${status}`);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update sales challan status', 400);
    }
  }
}
