import { body } from 'express-validator';

export const usernameValidator = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
];

export const nameValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
];

export const updateProfileValidator = [
  ...usernameValidator,
  ...nameValidator,
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
];
