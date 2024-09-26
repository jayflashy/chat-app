import { Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { IAuthRequest, ILoginRequest, IRegisterRequest } from "./auth.types";
import logger from "../../utils/logger";

export class AuthController {
  /**
   * Register a new user
   */
  static async register(
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData: IRegisterRequest = req.body;

      const result = await AuthService.register(userData);

      res.status(201).json(result);
    } catch (error) {
      logger.error(`Register controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const loginData: ILoginRequest = req.body;

      const result = await AuthService.login(loginData);

      res.status(200).json(result);
    } catch (error) {
      logger.error(`Login controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await AuthService.logout(userId);

      res.status(200).json(result);
    } catch (error) {
      logger.error(`Logout controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await AuthService.getCurrentUser(userId);

      res.status(200).json(result);
    } catch (error) {
      logger.error(`Get current user controller error: ${error}`);
      next(error);
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(
    req: IAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await AuthService.refreshToken(userId);

      res.status(200).json(result);
    } catch (error) {
      logger.error(`Refresh token controller error: ${error}`);
      next(error);
    }
  }
}
