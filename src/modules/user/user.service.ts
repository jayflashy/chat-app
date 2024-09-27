import User from './user.model';
import type { IUser, IUserInput, IUserUpdate } from './user.types';
import logger from '../../utils/logger';

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: IUserInput): Promise<IUser> {
    try {
      const user = new User(userData);
      await user.save();
      logger.info(`User created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`Error creating user: ${error}`);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email, isActive: true });
      return user;
    } catch (error) {
      logger.error(`Error finding user by email: ${error}`);
      throw error;
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ username, isActive: true });
      return user;
    } catch (error) {
      logger.error(`Error finding user by username: ${error}`);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ _id: id, isActive: true });
      return user;
    } catch (error) {
      logger.error(`Error finding user by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Find user by ID with password (for authentication)
   */
  static async findByIdWithPassword(id: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ _id: id, isActive: true }).select(
        '+password',
      );
      return user;
    } catch (error) {
      logger.error(`Error finding user by ID with password: ${error}`);
      throw error;
    }
  }

  /**
   * Find user by email with password (for authentication)
   */
  static async findByEmailWithPassword(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email, isActive: true }).select(
        '+password',
      );
      return user;
    } catch (error) {
      logger.error(`Error finding user by email with password: ${error}`);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    updateData: IUserUpdate,
  ): Promise<IUser | null> {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id, isActive: true },
        updateData,
        {
          new: true,
          runValidators: true,
        },
      );
      if (user) {
        logger.info(`User updated: ${user.email}`);
      }
      return user;
    } catch (error) {
      logger.error(`Error updating user: ${error}`);
      throw error;
    }
  }

  /**
   * Soft delete user (set isActive to false)
   */
  static async deleteUser(id: string): Promise<IUser | null> {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id, isActive: true },
        { isActive: false },
        { new: true },
      );
      if (user) {
        logger.info(`User deleted: ${user.email}`);
      }
      return user;
    } catch (error) {
      logger.error(`Error deleting user: ${error}`);
      throw error;
    }
  }

  /**
   * Get all online users
   */
  static async getOnlineUsers(): Promise<IUser[]> {
    try {
      const users = await User.find({ isOnline: true, isActive: true })
        .select('-password')
        .sort({ lastSeen: -1 });
      return users;
    } catch (error) {
      logger.error(`Error getting online users: ${error}`);
      throw error;
    }
  }

  /**
   * Get all users (paginated)
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: IUser[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        User.find({ isActive: true })
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments({ isActive: true }),
      ]);

      return {
        users,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      logger.error(`Error getting all users: ${error}`);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email, isActive: true });
      return !!user;
    } catch (error) {
      logger.error(`Error checking if email exists: ${error}`);
      throw error;
    }
  }

  /**
   * Check if username exists
   */
  static async usernameExists(username: string): Promise<boolean> {
    try {
      const user = await User.findOne({ username, isActive: true });
      return !!user;
    } catch (error) {
      logger.error(`Error checking if username exists: ${error}`);
      throw error;
    }
  }

  /**
   * Update user's online status
   */
  static async updateOnlineStatus(
    id: string,
    isOnline: boolean,
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      if (user) {
        await user.setOnlineStatus(isOnline);
        logger.info(`User ${user.email} online status updated to: ${isOnline}`);
      }
      return user;
    } catch (error) {
      logger.error(`Error updating online status: ${error}`);
      throw error;
    }
  }

  /**
   * Update user's last seen
   */
  static async updateLastSeen(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      if (user) {
        await user.updateLastSeen();
      }
      return user;
    } catch (error) {
      logger.error(`Error updating last seen: ${error}`);
      throw error;
    }
  }
}
