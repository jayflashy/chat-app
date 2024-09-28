import { Types } from 'mongoose';
import type { Server, Socket } from 'socket.io';

import { AuthService } from '../modules/auth/auth.service';
import { ChatService } from '../modules/chat/chat.service';
import { MessageService } from '../modules/message/message.service';
import type { SendMessageDto } from '../modules/message/message.service';
import { UserService } from '../modules/user/user.service';
import { AuthenticationError, ValidationError } from '../utils/AppError';
import { validateSendMessagePayload } from '../utils/socketValidator';
import logger from '../utils/logger';

type AuthedSocket = Socket & { userId?: string };

function getTokenFromHandshake(socket: Socket): string | null {
  const authHeader = socket.handshake.headers.authorization as
    | string
    | undefined;
  if (authHeader && authHeader.startsWith('Bearer '))
    return authHeader.split(' ')[1] || null;
  const token =
    (socket.handshake.auth as any)?.token ||
    (socket.handshake.query?.token as string | undefined);
  return token || null;
}

export default function socketHandler(io: Server) {
  io.use(async (socket: AuthedSocket, next) => {
    try {
      const token = getTokenFromHandshake(socket);
      if (!token) return next(new AuthenticationError('Unauthorized'));
      const payload = AuthService.verifyToken(token);
      const user = await UserService.findById(payload.userId);
      if (!user || !user.isActive)
        return next(new AuthenticationError('Unauthorized'));
      socket.userId = String(user._id);
      next();
    } catch (err) {
      next(new AuthenticationError(`Unauthorized ${err}`));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    const userId = socket.userId as string;
    logger.info(`Socket connected: ${socket.id} user=${userId}`);

    socket.join(`user:${userId}`);

    socket.on(
      'chat:join',
      async (
        chatId: string,
        ack?: (result: {
          success: boolean;
          error?: string;
          details?: any[];
        }) => void,
      ) => {
        try {
          if (!Types.ObjectId.isValid(chatId))
            throw new ValidationError([
              { field: 'chatId', message: 'Invalid chat id' },
            ]);
          const isMember = await ChatService.isUserInChat(chatId, userId);
          if (!isMember)
            throw new AuthenticationError('Not a member of this chat');
          socket.join(`chat:${chatId}`);
          ack?.({ success: true });
        } catch (e: any) {
          logger.error('Failed to join chat:', e);
          if (e instanceof ValidationError) {
            ack?.({ success: false, error: e.message, details: e.details });
          } else {
            ack?.({
              success: false,
              error: e?.message || 'Failed to join chat',
            });
          }
        }
      },
    );

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on(
      'message:send',
      async (
        payload: any,
        ack?: (result: {
          success: boolean;
          error?: string;
          details?: Array<{ field: string; message: string }>;
        }) => void,
      ) => {
        try {
          // Validate payload
          validateSendMessagePayload(payload);

          const { chatId, content, attachment } = payload;
          const dto: SendMessageDto = {
            chatId,
            senderId: userId,
            ...(content && { content }),
            ...(attachment && { attachment }),
          };

          const message = await MessageService.sendMessage(dto);
          io.to(`chat:${payload.chatId}`).emit('message:new', message);
          ack?.({ success: true });
        } catch (e: any) {
          if (e instanceof ValidationError) {
            ack?.({
              success: false,
              error: 'Validation failed',
              details: e.details,
            });
          } else {
            logger.error('Failed to send message:', e);
            ack?.({
              success: false,
              error: e?.message || 'Failed to send message',
            });
          }
        }
      },
    );

    socket.on(
      'message:read',
      async (
        payload: { chatId: string; upTo?: string },
        ack?: (result: {
          success: boolean;
          modified?: number;
          error?: string;
          details?: any[];
        }) => void,
      ) => {
        try {
          if (!Types.ObjectId.isValid(payload.chatId)) {
            throw new ValidationError([
              { field: 'chatId', message: 'Invalid chat ID' },
            ]);
          }
          if (payload.upTo && !Types.ObjectId.isValid(payload.upTo)) {
            throw new ValidationError([
              { field: 'upTo', message: 'Invalid message ID for upTo' },
            ]);
          }
          const result = await MessageService.markAsRead(
            payload.chatId,
            userId,
            payload.upTo,
          );
          io.to(`chat:${payload.chatId}`).emit('message:read', {
            chatId: payload.chatId,
            userId,
            upTo: payload.upTo,
            modified: result.modified,
          });
          ack?.({ success: true, modified: result.modified });
        } catch (e: any) {
          logger.error('Failed to mark as read:', e);
          if (e instanceof ValidationError) {
            ack?.({ success: false, error: e.message, details: e.details });
          } else {
            ack?.({
              success: false,
              error: e?.message || 'Failed to mark as read',
            });
          }
        }
      },
    );

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} reason=${reason}`);
    });
  });
}
