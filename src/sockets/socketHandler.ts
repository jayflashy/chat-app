import { Types } from 'mongoose';
import type { Server, Socket } from 'socket.io';

import { AuthService } from '../modules/auth/auth.service';
import { ChatService } from '../modules/chat/chat.service';
import { MessageService } from '../modules/message/message.service';
import type { SendMessageDto } from '../modules/message/message.service';
import { UserService } from '../modules/user/user.service';
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
      if (!token) return next(new Error('Unauthorized'));
      const payload = AuthService.verifyToken(token);
      const user = await UserService.findById(payload.userId);
      if (!user || !user.isActive) return next(new Error('Unauthorized'));
      socket.userId = String(user._id);
      next();
    } catch (err) {
      next(new Error(`Unauthorized ${err}`));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    const userId = socket.userId as string;
    logger.info(`Socket connected: ${socket.id} user=${userId}`);

    socket.join(`user:${userId}`);

    socket.on(
      'chat:join',
      async (chatId: string, ack?: (ok: boolean, err?: string) => void) => {
        try {
          if (!Types.ObjectId.isValid(chatId))
            throw new Error('Invalid chat id');
          const isMember = await ChatService.isUserInChat(chatId, userId);
          if (!isMember) throw new Error('Not a member of this chat');
          socket.join(`chat:${chatId}`);
          ack?.(true);
        } catch (e: any) {
          ack?.(false, e?.message || 'Failed to join chat');
        }
      },
    );

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on(
      'message:send',
      async (
        payload: {
          chatId: string;
          content?: string;
          attachment?: {
            type: 'image' | 'video' | 'file' | 'audio';
            url?: string;
            name?: string;
            size?: number;
          };
        },
        ack?: (result: { success: boolean; error?: string }) => void,
      ) => {
        try {
          const dto: SendMessageDto = {
            chatId: payload.chatId,
            senderId: userId,
            ...(payload.content !== undefined
              ? { content: payload.content }
              : {}),
            ...(payload.attachment !== undefined
              ? { attachment: payload.attachment }
              : {}),
          };
          const message = await MessageService.sendMessage(dto);
          io.to(`chat:${payload.chatId}`).emit('message:new', message);
          ack?.({ success: true });
        } catch (e: any) {
          ack?.({
            success: false,
            error: e?.message || 'Failed to send message',
          });
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
        }) => void,
      ) => {
        try {
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
          ack?.({
            success: false,
            error: e?.message || 'Failed to mark as read',
          });
        }
      },
    );

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} reason=${reason}`);
    });
  });
}
