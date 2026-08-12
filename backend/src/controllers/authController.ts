import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required.', 400);
      }

      const result = await AuthService.register({ name, email, password, role });
      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed', 400);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password are required.', 400);
      }

      const result = await AuthService.login({ email, password });
      return sendSuccess(res, result, 'User logged in successfully', 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed', 401);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }
      const user = await AuthService.getUserProfile(req.user.userId);
      return sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch profile', 500);
    }
  }
}
