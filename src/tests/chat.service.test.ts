import { ChatService } from '../modules/chat/chat.service';
import Chat from '../modules/chat/chat.model';
import { UserService } from '../modules/user/user.service';
import { ValidationError } from '../utils/AppError';

jest.mock('../modules/chat/chat.model');
jest.mock('../modules/user/user.service');

type AnyFn = (...args: any[]) => any;

describe('ChatService', () => {
  it('smoke: file loaded', () => {
    expect(true).toBe(true);
  });
  const mockedChat = Chat as unknown as jest.Mocked<typeof Chat> & {
    findOne: jest.Mock<AnyFn>;
    findByIdAndUpdate: jest.Mock<AnyFn>;
    countDocuments: jest.Mock<AnyFn>;
    find: jest.Mock<AnyFn>;
  };
  const mockedUserService = jest.mocked(UserService);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('createChat - direct', () => {
    it('throws if not exactly two distinct participants', async () => {
      await expect(
        ChatService.createChat({
          type: 'direct',
          participants: ['a'],
          createdBy: 'a',
        } as any),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('throws if either user does not exist', async () => {
      mockedUserService.findById.mockResolvedValueOnce(null as any);
      mockedUserService.findById.mockResolvedValueOnce({ _id: 'b' } as any);
      await expect(
        ChatService.createChat({
          type: 'direct',
          participants: ['b'],
          createdBy: 'a',
        } as any),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('returns existing direct chat if found', async () => {
      mockedUserService.findById.mockResolvedValue({ _id: 'a' } as any);
      mockedUserService.findById.mockResolvedValue({ _id: 'b' } as any);
      mockedChat.findOne = jest.fn().mockResolvedValue({ _id: 'chat1' });
      const res = await ChatService.createChat({
        type: 'direct',
        participants: ['b'],
        createdBy: 'a',
      } as any);
      expect(res).toEqual({ _id: 'chat1' } as any);
      expect(mockedChat.findOne).toHaveBeenCalled();
    });

    it('creates new direct chat when none exists', async () => {
      mockedUserService.findById.mockResolvedValue({ _id: 'a' } as any);
      mockedUserService.findById.mockResolvedValue({ _id: 'b' } as any);
      mockedChat.findOne = jest.fn().mockResolvedValue(null);
      const save = jest.fn().mockResolvedValue(undefined);
      (Chat as unknown as jest.Mock).mockImplementation((doc: any) => ({ ...doc, save }));

      const res = await ChatService.createChat({
        type: 'direct',
        participants: ['b'],
        createdBy: 'a',
        name: undefined,
        description: undefined,
      } as any);

      expect(save).toHaveBeenCalled();
      expect(res.type).toBe('direct');
      expect(res.participants).toHaveLength(2);
      expect(res.membersKey).toBeDefined();
    });
  });

  describe('createChat - group', () => {
    it('creates group chat with creator as admin and validates others', async () => {
      mockedUserService.findById.mockResolvedValue({ _id: 'u2' } as any);
      mockedUserService.findById.mockResolvedValue({ _id: 'u3' } as any);
      const save = jest.fn().mockResolvedValue(undefined);
      (Chat as unknown as jest.Mock).mockImplementation((doc: any) => ({ ...doc, save }));

      const res = await ChatService.createChat({
        type: 'group',
        participants: ['u2', 'u3'],
        createdBy: 'u1',
        name: 'Team',
        description: 'desc',
      } as any);

      expect(save).toHaveBeenCalled();
      expect(res.type).toBe('group');
      expect(res.participants[0]).toEqual({ user: 'u1', role: 'admin' });
      expect(res.participants).toHaveLength(3);
    });
  });

  it('findDirectChat finds by membersKey', async () => {
    mockedChat.findOne = jest.fn().mockResolvedValue({ _id: 'c1' });
    const res = await ChatService.findDirectChat('b', 'a');
    expect(res).toEqual({ _id: 'c1' } as any);
    expect(mockedChat.findOne).toHaveBeenCalledWith({ type: 'direct', membersKey: 'a:b' });
  });

  it('getUserChats sorts and populates', async () => {
    const populate2 = jest.fn().mockResolvedValue([{ _id: 'c1' }]);
    const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
    const sort = jest.fn().mockReturnValue({ populate: populate1 });
    mockedChat.find = jest.fn().mockReturnValue({ sort });
    const res = await ChatService.getUserChats('u1');
    expect(res).toEqual([{ _id: 'c1' }] as any);
    expect(mockedChat.find).toHaveBeenCalledWith({ 'participants.user': 'u1', isActive: true });
  });

  it('getChatById finds one and populates', async () => {
    const populate2 = jest.fn().mockResolvedValue({ _id: 'c1' });
    const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
    mockedChat.findOne = jest.fn().mockReturnValue({ populate: populate1 });
    const res = await ChatService.getChatById('c1', 'u1');
    expect(res).toEqual({ _id: 'c1' } as any);
    expect(mockedChat.findOne).toHaveBeenCalledWith({ _id: 'c1', 'participants.user': 'u1', isActive: true });
  });

  it('updateLastMessage updates and returns chat', async () => {
    mockedChat.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'c1', lastMessage: 'm1' });
    const res = await ChatService.updateLastMessage('c1', 'm1');
    expect(res).toEqual({ _id: 'c1', lastMessage: 'm1' } as any);
    expect(mockedChat.findByIdAndUpdate).toHaveBeenCalledWith('c1', { lastMessage: 'm1' }, { new: true });
  });

  it('isUserInChat returns boolean from countDocuments', async () => {
    mockedChat.countDocuments = jest.fn().mockResolvedValue(1);
    const res = await ChatService.isUserInChat('c1', 'u1');
    expect(res).toBe(true);
    expect(mockedChat.countDocuments).toHaveBeenCalledWith({ _id: 'c1', 'participants.user': 'u1', isActive: true });
  });
});


