import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CustomerService } from '../services/customerService';
import { sendSuccess, sendError } from '../utils/response';
import { CustomerStatus, CustomerType } from '../types/enums';

export class CustomerController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, status, customerType, page, limit } = req.query;
      const result = await CustomerService.getAll({
        search: search as string,
        status: status as CustomerStatus,
        customerType: customerType as CustomerType,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return sendSuccess(res, result, 'Customers retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch customers', 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getById(id);
      return sendSuccess(res, customer, 'Customer details retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Customer not found', 404);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { customerName, mobileNumber, email, businessName, gstNumber, customerType, address, status, followUpDate, notes } = req.body;
      if (!customerName || !mobileNumber || !email || !businessName || !address) {
        return sendError(res, 'Customer name, mobile number, email, business name, and address are required.', 400);
      }

      const customer = await CustomerService.create({
        customerName,
        mobileNumber,
        email,
        businessName,
        gstNumber,
        customerType,
        address,
        status,
        followUpDate,
        notes,
      });

      return sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create customer', 400);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await CustomerService.update(id, req.body);
      return sendSuccess(res, updated, 'Customer updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update customer', 400);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerService.delete(id);
      return sendSuccess(res, result, 'Customer deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete customer', 400);
    }
  }

  static async addFollowUpNote(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      if (!note) {
        return sendError(res, 'Note text is required', 400);
      }

      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const followUp = await CustomerService.addFollowUpNote(id, note, userId);
      return sendSuccess(res, followUp, 'Follow-up note added successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to add follow-up note', 400);
    }
  }
}
