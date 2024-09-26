import { Request, Response, NextFunction } from "express";
import { AuthService } from "../modules/auth/auth.service";
import { UserService } from "../modules/user/user.service";
import { IUser } from "../modules/user/user.types";
import logger from "../utils/logger";

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Access token required",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Get user from database
    const user = await UserService.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: "Account is deactivated",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const payload = AuthService.verifyToken(token);
      const user = await UserService.findById(payload.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
