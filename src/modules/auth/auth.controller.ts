import { Response } from "express";
import { AuthService } from "./auth.service";
import { IAuthRequest, ILoginRequest, IRegisterRequest } from "./auth.types";

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: IAuthRequest, res: Response): Promise<void> {
    const userData: IRegisterRequest = req.body;

    const result = await AuthService.register(userData);

    res.status(201).json(result);
  }

  /**
   * Login user
   */
  static async login(req: IAuthRequest, res: Response): Promise<void> {
    const loginData: ILoginRequest = req.body;

    const result = await AuthService.login(loginData);

    res.status(200).json(result);
  }

  /**
   * Logout user
   */
  static async logout(req: IAuthRequest, res: Response): Promise<void> {
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
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(req: IAuthRequest, res: Response): Promise<void> {
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
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(req: IAuthRequest, res: Response): Promise<void> {
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
  }
}
