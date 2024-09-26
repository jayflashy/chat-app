import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { IUserUpdate } from "./user.types";
import { IAuthRequest } from "../auth/auth.types";
import logger from "../../utils/logger";

export class UserController {
  /**
   * Get user profile by ID
   */
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: "User ID is required",
          timestamp: new Date().toISOString()
        });
        return;
      }
      const user = await UserService.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: { user }
      });
    } catch (error) {
      logger.error(`Get user by ID controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: IUserUpdate = req.body;
      
      const user = await UserService.updateUser(userId, updateData);
      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user }
      });
    } catch (error) {
      logger.error(`Update profile controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await UserService.deleteUser(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Account deleted successfully"
      });
    } catch (error) {
      logger.error(`Delete account controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Get all online users
   */
  static async getOnlineUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getOnlineUsers();

      res.status(200).json({
        success: true,
        message: "Online users retrieved successfully",
        data: { users }
      });
    } catch (error) {
      logger.error(`Get online users controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Get all users (paginated)
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await UserService.getAllUsers(page, limit);

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: result
      });
    } catch (error) {
      logger.error(`Get all users controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Search users by username or name
   */
  static async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: "Search query is required",
          timestamp: new Date().toISOString()
        });
        return;
      }

      // This would need to be implemented in UserService
      // For now, return a placeholder response
      res.status(200).json({
        success: true,
        message: "Search functionality coming soon",
        data: { users: [] }
      });
    } catch (error) {
      logger.error(`Search users controller error: ${error}`);
      next(error);
    }
  }
}
