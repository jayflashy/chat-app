import type { Response } from 'express';
import { Types } from 'mongoose';

import type { CreateChatDto } from './chat.interface';
import { ChatService } from './chat.service';
import type { IAuthRequest } from '../../modules/auth/auth.types';
import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
} from '../../utils/AppError';

export class ChatController {
  /**
   * Create a new chat (direct or group)
   */
  static async createChat(req: IAuthRequest, res: Response): Promise<void> {
    const { type, participants, name, description } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new AuthenticationError('Unauthorized');
    }

    const allParticipants = [
      ...new Set([...(participants || []), userId.toString()]),
    ];

    const createChatDto: CreateChatDto = {
      type,
      participants: allParticipants,
      name,
      description,
      createdBy: userId.toString(),
    };

    const chat = await ChatService.createChat(createChatDto);

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: chat,
    });
  }

  /**
   * Get all chats for the authenticated user
   */
  static async getUserChats(req: IAuthRequest, res: Response): Promise<void> {
    const userId = req.user?._id;

    if (!userId) {
      throw new AuthenticationError('Unauthorized');
    }

    const chats = await ChatService.getUserChats(userId.toString());

    res.status(200).json({
      success: true,
      message: 'Chats fetched successfully',
      data: chats,
    });
  }

  /**
   * Get a single chat by ID if the user is a participant
   */
  static async getChatById(req: IAuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new AuthenticationError('Unauthorized');
    }

    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid chat ID');
    }

    const chat = await ChatService.getChatById(id, userId.toString());

    if (!chat) {
      throw new NotFoundError('Chat not found or access denied');
    }

    res.status(200).json({
      success: true,
      message: 'Chat fetched successfully',
      data: chat,
    });
  }
}
