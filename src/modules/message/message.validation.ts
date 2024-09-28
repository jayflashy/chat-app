import { body, param, query } from 'express-validator';

export const sendMessageValidator = [
  body('chatId').isString().trim().notEmpty().withMessage('chatId is required'),
  body('content').optional().isString().isLength({ min: 1 }).trim(),
  body('attachment').optional().isObject(),
  body('attachment.type')
    .optional()
    .isIn(['image', 'video', 'file', 'audio'])
    .withMessage('Invalid attachment type'),
  body('attachment.url').optional().isString(),
  body('attachment.name').optional().isString(),
  body('attachment.size').optional().isNumeric(),
];

export const listMessagesValidator = [
  param('chatId').isString().trim().notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('before').optional().isString(),
];

export const markReadValidator = [
  param('chatId').isString().trim().notEmpty(),
  body('upTo').optional().isString(),
];

export const unreadCountValidator = [
  param('chatId').isString().trim().notEmpty(),
];
