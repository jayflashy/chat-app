import { Router } from 'express';

import { UserController } from './user.controller';
import { updateProfileValidator } from './user.validation';
import {
  authenticateToken,
  optionalAuth,
} from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { catchAsync } from '../../utils/catchAsync';

const router: Router = Router();

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               name:
 *                 type: string
 *                 example: John Doe
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *               bio:
 *                 type: string
 *                 example: Hello, I'm John!
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.put(
  '/profile',
  authenticateToken,
  updateProfileValidator,
  validateRequest,
  catchAsync(UserController.updateProfile),
);

/**
 * @swagger
 * /users/profile:
 *   delete:
 *     summary: Delete user account
 *     description: Soft delete the authenticated user's account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account deleted successfully
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.delete(
  '/profile',
  authenticateToken,
  catchAsync(UserController.deleteAccount),
);

/**
 * @swagger
 * /users/online:
 *   get:
 *     summary: Get online users
 *     description: Get a list of all currently online users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Online users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Online users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get('/online', catchAsync(UserController.getOnlineUsers));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Get a paginated list of all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     pages:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 */
router.get('/', catchAsync(UserController.getAllUsers));

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     description: Search users by username or name
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Search results retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 */
router.get('/search', catchAsync(UserController.searchUsers));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Get a user's profile by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', catchAsync(UserController.getUserById));

export default router;
