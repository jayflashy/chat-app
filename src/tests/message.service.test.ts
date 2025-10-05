import { MessageService } from '../modules/message/message.service';
import Chat from '../modules/chat/chat.model';
import Message from '../modules/message/message.model';
import { Types } from 'mongoose';
import { AuthenticationError, ValidationError } from '../utils/AppError';

jest.mock('../modules/chat/chat.model');
jest.mock('../modules/message/message.model');

type AnyFn = (...args: any[]) => any;

describe('MessageService', () => {
  const mockedChat = Chat as unknown as jest.Mocked<typeof Chat> & {
    findOne: jest.Mock<AnyFn>;
    findByIdAndUpdate: jest.Mock<AnyFn>;
    countDocuments: jest.Mock<AnyFn>;
  };
  const mockedMessage = Message as unknown as jest.Mocked<typeof Message> & {
    create: jest.Mock<AnyFn>;
    find: jest.Mock<AnyFn>;
    updateMany: jest.Mock<AnyFn>;
    countDocuments: jest.Mock<AnyFn>;
  };

  const c1 = new Types.ObjectId().toString();
  const u1 = new Types.ObjectId().toString();
  const m1 = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('sendMessage', () => {
    it('validates inputs', async () => {
      await expect(
        MessageService.sendMessage({ chatId: '', senderId: u1, content: 'hi' }),
      ).rejects.toBeInstanceOf(ValidationError);

      await expect(
        MessageService.sendMessage({ chatId: c1, senderId: '', content: 'hi' }),
      ).rejects.toBeInstanceOf(ValidationError);

      await expect(
        MessageService.sendMessage({ chatId: c1, senderId: u1 } as any),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('throws if chat not found for sender', async () => {
      mockedChat.findOne = jest.fn().mockResolvedValue(null);
      await expect(
        MessageService.sendMessage({ chatId: c1, senderId: u1, content: 'hi' }),
      ).rejects.toThrow('Chat not found');
    });

    it('creates message and updates lastMessage', async () => {
      mockedChat.findOne = jest.fn().mockResolvedValue({ _id: c1 });
      const populate = jest.fn().mockResolvedValue({ _id: m1, content: 'hi' });
      mockedMessage.create = jest.fn().mockResolvedValue({ _id: m1, populate });
      mockedChat.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      const res = await MessageService.sendMessage({ chatId: c1, senderId: u1, content: 'hi' });
      expect(mockedMessage.create).toHaveBeenCalled();
      expect(mockedChat.findByIdAndUpdate).toHaveBeenCalledWith(c1, { lastMessage: m1 });
      expect(res).toEqual({ _id: m1, content: 'hi' } as any);
    });
  });

  describe('listMessages', () => {
    it('requires membership', async () => {
      mockedChat.countDocuments = jest.fn().mockResolvedValue(0);
      await expect(
        MessageService.listMessages(c1, u1),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('returns messages in chronological order', async () => {
      mockedChat.countDocuments = jest.fn().mockResolvedValue(1);
      const populate = jest.fn().mockResolvedValue([{ _id: '2' }, { _id: '1' }]);
      const limit = jest.fn().mockReturnValue({ populate });
      const sort = jest.fn().mockReturnValue({ limit });
      mockedMessage.find = jest.fn().mockReturnValue({ sort });

      const res = await MessageService.listMessages(c1, u1, { limit: 10 });
      expect(res.map((m: any) => m._id)).toEqual(['1', '2']);
      expect(mockedMessage.find).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('requires membership', async () => {
      mockedChat.countDocuments = jest.fn().mockResolvedValue(0);
      await expect(
        MessageService.markAsRead(c1, u1),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('updates unread messages and returns modified count', async () => {
      mockedChat.countDocuments = jest.fn().mockResolvedValue(1);
      mockedMessage.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 3 });
      const res = await MessageService.markAsRead(c1, u1);
      expect(res).toEqual({ modified: 3 });
      expect(mockedMessage.updateMany).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('counts unread messages for user', async () => {
      mockedMessage.countDocuments = jest.fn().mockResolvedValue(5);
      const res = await MessageService.getUnreadCount(c1, u1);
      expect(res).toBe(5);
      expect(mockedMessage.countDocuments).toHaveBeenCalled();
    });
  });
});


