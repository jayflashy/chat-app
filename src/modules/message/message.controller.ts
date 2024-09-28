import type { Response } from 'express';

import { MessageService } from './message.service';
import { AuthenticationError, ValidationError } from '../../utils/AppError';
import type { IAuthRequest } from '../auth/auth.types';

export class MessageController {
  static async send(req: IAuthRequest, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) throw new AuthenticationError('Unauthorized');

    const { chatId, content, attachment } = req.body;
    const message = await MessageService.sendMessage({
      chatId,
      senderId: userId.toString(),
      content,
      attachment,
    });

    res
      .status(201)
      .json({ success: true, message: 'Message sent', data: message });
  }

  static async list(req: IAuthRequest, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) throw new AuthenticationError('Unauthorized');
    const { chatId } = req.params;
    if (!chatId) {
      throw new ValidationError([
        { field: 'chatId', message: 'Chat id is required' },
      ]);
    }
    const { limit, before } = req.query as { limit?: string; before?: string };
    const options: { limit?: number; before?: string } = {};
    if (typeof limit === 'string') {
      const n = parseInt(limit, 10);
      if (!Number.isNaN(n)) options.limit = n;
    }
    if (typeof before === 'string') {
      options.before = before;
    }
    const messages = await MessageService.listMessages(
      chatId,
      userId.toString(),
      options,
    );

    res
      .status(200)
      .json({ success: true, message: 'Messages fetched', data: messages });
  }

  static async markRead(req: IAuthRequest, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) throw new AuthenticationError('Unauthorized');
    const { chatId } = req.params;
    if (!chatId) {
      throw new ValidationError([
        { field: 'chatId', message: 'Chat id is required' },
      ]);
    }
    const { upTo } = req.body as { upTo?: string };

    const result = await MessageService.markAsRead(
      chatId,
      userId.toString(),
      upTo,
    );
    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: result,
    });
  }

  static async unreadCount(req: IAuthRequest, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) throw new AuthenticationError('Unauthorized');
    const { chatId } = req.params;
    if (!chatId) {
      throw new ValidationError([
        { field: 'chatId', message: 'Chat id is required' },
      ]);
    }
    const count = await MessageService.getUnreadCount(
      chatId,
      userId.toString(),
    );
    res.status(200).json({
      success: true,
      message: 'Unread count fetched',
      data: { count },
    });
  }
}
