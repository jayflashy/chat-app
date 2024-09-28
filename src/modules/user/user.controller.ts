import type { Request, Response } from 'express';

import { UserService } from './user.service';
import type { IUserUpdate } from './user.types';
import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
} from '../../utils/AppError';
import type { IAuthRequest } from '../auth/auth.types';

export class UserController {
  /**
   * Get user profile by ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError('User ID is required');
    }
    const user = await UserService.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user },
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: IAuthRequest, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const updateData: IUserUpdate = req.body;

    const user = await UserService.updateUser(userId, updateData);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  }

  /**
   * Delete user account
   */
  static async deleteAccount(req: IAuthRequest, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const user = await UserService.deleteUser(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  }

  /**
   * Get all online users
   */
  static async getOnlineUsers(req: Request, res: Response): Promise<void> {
    const users = await UserService.getOnlineUsers();

    res.status(200).json({
      success: true,
      message: 'Online users retrieved successfully',
      data: { users },
    });
  }

  /**
   * Get all users (paginated)
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UserService.getAllUsers(page, limit);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  }

  /**
   * Search users by username or name
   */
  static async searchUsers(req: IAuthRequest, res: Response): Promise<void> {
    const { q } = req.query;
    const userId = req.user?._id;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    if (!q || typeof q !== 'string' || q.trim() === '') {
      throw new BadRequestError('Search query is required');
    }

    const users = await UserService.searchUsers(q as string, userId);

    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      data: { users },
    });
  }
}