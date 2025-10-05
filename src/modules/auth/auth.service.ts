import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';

import type {
  ILoginRequest,
  IRegisterRequest,
  IAuthResponse,
  IAuthPayload,
} from './auth.types';
import { BadRequestError } from '../../utils/AppError';
import logger from '../../utils/logger';
import { UserService } from '../user/user.service';
import type { IUserInput } from '../user/user.types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: IRegisterRequest): Promise<IAuthResponse> {
    try {
      const { confirmPassword, ...userInput } = userData;

      // Check if passwords match
      if (userData.password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Check if email already exists
      const emailExists = await UserService.emailExists(userData.email);     
      // Check if username already exists
      const usernameExists = await UserService.usernameExists(
        userData.username,
      );

      if (emailExists || usernameExists) {
        throw new BadRequestError(
          'A user with that email or username already exists.',
        );
      }
      // Create user
      const user = await UserService.createUser(userInput as IUserInput);

      // Generate JWT token
      const token = this.generateToken({
        userId: user._id,
        email: user.email,
        username: user.username,
      });

      logger.info(`User registered successfully: ${user.email}`);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token,
        },
      };
    } catch (error) {
      logger.error(`Registration error: ${error}`);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(loginData: ILoginRequest): Promise<IAuthResponse> {
    try {
      const { email, password } = loginData;

      // Find user with password
      const user = await UserService.findByEmailWithPassword(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update online status
      await user.setOnlineStatus(true);

      // Generate JWT token
      const token = this.generateToken({
        userId: user._id,
        email: user.email,
        username: user.username,
      });

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
        },
      };
    } catch (error) {
      logger.error(`Login error: ${error}`);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Update online status to false
      await UserService.updateOnlineStatus(userId, false);

      logger.info(`User logged out: ${userId}`);

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      logger.error(`Logout error: ${error}`);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string) {
    try {
      const user = await UserService.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'User profile retrieved successfully',
        data: { user },
      };
    } catch (error) {
      logger.error(`Get current user error: ${error}`);
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: IAuthPayload): string {
    const secretEnv = process.env.JWT_SECRET;
    if (!secretEnv) {
      throw new Error('JWT_SECRET is not defined');
    }

    const secret: Secret = secretEnv;
    const expiresIn: NonNullable<SignOptions['expiresIn']> = (process.env.JWT_EXPIRE ?? '7d') as unknown as NonNullable<SignOptions['expiresIn']>;

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): IAuthPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      return jwt.verify(token, secret) as IAuthPayload;
    } catch (error) {
      throw new Error(`Invalid or expired token: ${error}`);
    }
  }

  /**
   * Refresh token (generate new token with same payload)
   */
  static async refreshToken(
    userId: string,
  ): Promise<{ success: boolean; data: { token: string } }> {
    try {
      const user = await UserService.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const token = this.generateToken({
        userId: user._id,
        email: user.email,
        username: user.username,
      });

      return {
        success: true,
        data: { token },
      };
    } catch (error) {
      logger.error(`Refresh token error: ${error}`);
      throw error;
    }
  }
}
