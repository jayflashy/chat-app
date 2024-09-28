import { Router } from 'express';

import { MessageController } from './message.controller';
import {
  sendMessageValidator,
  listMessagesValidator,
  markReadValidator,
  unreadCountValidator,
} from './message.validation';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { catchAsync } from '../../utils/catchAsync';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     description: Send a text message or an attachment to a chat the user belongs to.
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *             properties:
 *               chatId:
 *                 type: string
 *               content:
 *                 type: string
 *                 description: Required if attachment is not provided
 *               attachment:
 *                 type: object
 *                 required: false
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [image, video, file, audio]
 *                   url:
 *                     type: string
 *                   name:
 *                     type: string
 *                   size:
 *                     type: number
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  sendMessageValidator,
  validateRequest,
  catchAsync(MessageController.send),
);

/**
 * @swagger
 * /messages/{chatId}:
 *   get:
 *     summary: List messages in a chat
 *     description: Returns messages for a chat, paginated with optional cursor.
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Page size (default 50)
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: Return messages with id less than this (cursor)
 *     responses:
 *       200:
 *         description: Messages fetched
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get(
  '/:chatId',
  listMessagesValidator,
  validateRequest,
  catchAsync(MessageController.list),
);

/**
 * @swagger
 * /messages/{chatId}/read:
 *   post:
 *     summary: Mark chat messages as read
 *     description: Marks all messages as read up to the specified message id (inclusive). If not provided, marks all current messages as read.
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               upTo:
 *                 type: string
 *                 description: Message id up to which to mark as read
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.post(
  '/:chatId/read',
  markReadValidator,
  validateRequest,
  catchAsync(MessageController.markRead),
);

/**
 * @swagger
 * /messages/{chatId}/unread-count:
 *   get:
 *     summary: Get unread count for a chat
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unread count fetched
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get(
  '/:chatId/unread-count',
  unreadCountValidator,
  validateRequest,
  catchAsync(MessageController.unreadCount),
);

export default router;
