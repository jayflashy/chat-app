import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

import Message from './message.model';
import type { IMessage } from './message.model';
import {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} from '../../utils/AppError';
import Chat from '../chat/chat.model';

export interface SendMessageDto {
  chatId: string;
  senderId: string;
  content?: string;
  attachment?: {
    type: 'image' | 'video' | 'file' | 'audio';
    url?: string;
    name?: string;
    size?: number;
  } | null;
}

export class MessageService {
  static async sendMessage(dto: SendMessageDto) {
    const { chatId, senderId, content, attachment } = dto;

    if (!Types.ObjectId.isValid(chatId)) {
      throw new ValidationError([
        { field: 'chatId', message: 'Invalid chat id', value: chatId },
      ]);
    }
    if (!Types.ObjectId.isValid(senderId)) {
      throw new ValidationError([
        { field: 'senderId', message: 'Invalid sender id', value: senderId },
      ]);
    }
    if (!content && !attachment) {
      throw new ValidationError([
        { field: 'content', message: 'content or attachment is required' },
      ]);
    }

    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': senderId,
      isActive: true,
    });
    if (!chat) {
      throw new NotFoundError('Chat not found or access denied');
    }

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content: content || undefined,
      attachment: attachment || undefined,
      readBy: [{ user: new Types.ObjectId(senderId), readAt: new Date() }],
    });

    // Update chat's lastMessage reference
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    return message;
  }

  static async listMessages(
    chatId: string,
    userId: string,
    options?: { limit?: number; before?: string },
  ) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new ValidationError([
        { field: 'chatId', message: 'Invalid chat id', value: chatId },
      ]);
    }
    const isMember = await Chat.countDocuments({
      _id: chatId,
      'participants.user': userId,
      isActive: true,
    });
    if (!isMember) {
      throw new AuthenticationError('Not a member of this chat');
    }
    const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
    const beforeId =
      options?.before && Types.ObjectId.isValid(options.before)
        ? new Types.ObjectId(options.before)
        : undefined;

    const filter: FilterQuery<IMessage> = { chat: new Types.ObjectId(chatId) };
    if (beforeId) {
      filter._id = { $lt: beforeId };
    }

    const messages = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .populate('sender', 'username email avatar');
    return messages.reverse();
  }

  static async markAsRead(
    chatId: string,
    userId: string,
    upToMessageId?: string,
  ) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new ValidationError([
        { field: 'chatId', message: 'Invalid chat id', value: chatId },
      ]);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new ValidationError([
        { field: 'userId', message: 'Invalid user id', value: userId },
      ]);
    }
    const isMember = await Chat.countDocuments({
      _id: chatId,
      'participants.user': userId,
      isActive: true,
    });
    if (!isMember) {
      throw new AuthenticationError('Not a member of this chat');
    }

    const match: FilterQuery<IMessage> = { chat: new Types.ObjectId(chatId) };
    if (upToMessageId && Types.ObjectId.isValid(upToMessageId)) {
      match._id = { $lte: new Types.ObjectId(upToMessageId) };
    }

    const result = await Message.updateMany(
      {
        ...match,
        'readBy.user': { $ne: new Types.ObjectId(userId) },
      },
      {
        $addToSet: {
          readBy: { user: new Types.ObjectId(userId), readAt: new Date() },
        },
      },
    );
    return { modified: result.modifiedCount };
  }

  static async getUnreadCount(chatId: string, userId: string) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new ValidationError([
        { field: 'chatId', message: 'Invalid chat id', value: chatId },
      ]);
    }
    const count = await Message.countDocuments({
      chat: chatId,
      'readBy.user': { $ne: new Types.ObjectId(userId) },
    });
    return count;
  }
}
