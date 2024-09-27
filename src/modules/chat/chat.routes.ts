import { Router } from 'express';

import { ChatController } from './chat.controller';
import { createChatValidator, chatIdParamValidator } from './chat.validation';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { catchAsync } from '../../utils/catchAsync';

const router = Router();

// Apply auth middleware to all chat routes
router.use(authenticateToken);

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Create a new chat (direct or group)
 *     description: Create a direct chat with another user or a group chat.
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [direct, group]
 *                 example: direct
 *               participants:
 *                 type: array
 *                 description: Other participant IDs (exclude self)
 *                 items:
 *                   type: string
 *                 example: ["64f9a1c2e4b0c3a1f0a1b2c3"]
 *               name:
 *                 type: string
 *                 description: Required for group chats
 *                 example: Team Alpha
 *               description:
 *                 type: string
 *                 example: Project team chat
 *     responses:
 *       201:
 *         description: Chat created successfully
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  createChatValidator,
  validateRequest,
  catchAsync(ChatController.createChat),
);

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     description: Returns a list of chats where the user is a participant.
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chats fetched successfully
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', catchAsync(ChatController.getUserChats));

/**
 * @swagger
 * /chats/{id}:
 *   get:
 *     summary: Get a chat by ID
 *     description: Returns a single chat if the user is a participant.
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat fetched successfully
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  chatIdParamValidator,
  validateRequest,
  catchAsync(ChatController.getChatById),
);

export default router;
