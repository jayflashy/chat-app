import { body, param } from 'express-validator';

export const createChatValidator = [
  body('type')
    .isIn(['direct', 'group'])
    .withMessage('type must be either direct or group'),
  body('participants')
    .isArray({ min: 0 })
    .withMessage('participants must be an array'),
  body('participants.*')
    .optional()
    .isString()
    .withMessage('each participant must be a string user id'),
  body('name')
    .if(body('type').equals('group'))
    .isString()
    .notEmpty()
    .withMessage('name is required for group chats'),
  body('description')
    .optional()
    .isString()
    .withMessage('description must be a string')
];

export const chatIdParamValidator = [
  param('id')
    .isString()
    .withMessage('id must be a string')
    .isLength({ min: 1 })
    .withMessage('id is required')
];


