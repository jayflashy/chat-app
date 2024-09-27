import type { CreateChatDto, IChat } from './chat.interface';
import Chat from './chat.model';
import { ValidationError } from '../../utils/AppError';
import { UserService } from '../user/user.service';

export class ChatService {
  /**
   * Create a new chat
   */
  static async createChat(createChatDto: CreateChatDto): Promise<IChat> {
    const { type, participants, name, description, createdBy } = createChatDto;

    // For direct messages, check if a chat already exists between these users
    if (type === 'direct') {
      const members = Array.from(new Set([createdBy, ...(participants || [])]))
        .map(String)
        .sort();
      if (members.length !== 2) {
        throw new ValidationError([
          {
            field: 'participants',
            message: 'Direct chat must have exactly two distinct participants',
          },
        ]);
      }

      // Verify both users exist
      const [idA, idB] = members as [string, string];
      const [userA, userB] = await Promise.all([
        UserService.findById(idA),
        UserService.findById(idB),
      ]);
      const missing: Array<{
        field: string;
        message: string;
        value?: unknown;
      }> = [];
      if (!userA)
        missing.push({
          field: 'participants',
          message: 'User not found',
          value: idA,
        });
      if (!userB)
        missing.push({
          field: 'participants',
          message: 'User not found',
          value: idB,
        });
      if (missing.length) {
        throw new ValidationError(missing);
      }
      const membersKey = members.join(':');
      const existingChat = await Chat.findOne({ type: 'direct', membersKey });
      if (existingChat) {
        return existingChat as IChat;
      }
      // ensure membersKey is set for new chat
      const chat = new Chat({
        type,
        participants: [
          { user: idA, role: 'member' },
          { user: idB, role: 'member' },
        ],
        name,
        description,
        createdBy,
        isActive: true,
        membersKey,
      });
      await chat.save();
      return chat as IChat;
    }

    // Prepare participants array with the creator as admin
    const others = (participants || []).filter(
      (userId) => userId.toString() !== createdBy.toString(),
    );

    // Validate that all other participants exist
    if (others.length) {
      const results = await Promise.all(
        others.map((id) => UserService.findById(String(id))),
      );
      const missing: Array<{
        field: string;
        message: string;
        value?: unknown;
      }> = [];
      results.forEach((u, idx) => {
        if (!u)
          missing.push({
            field: 'participants',
            message: 'User not found',
            value: String(others[idx]),
          });
      });
      if (missing.length) {
        throw new ValidationError(missing);
      }
    }

    const chatParticipants = [
      { user: createdBy, role: 'admin' as const },
      ...others.map((userId) => ({ user: userId, role: 'member' as const })),
    ];

    const chat = new Chat({
      type,
      participants: chatParticipants,
      name,
      description,
      createdBy,
      isActive: true,
    });

    await chat.save();
    return chat as IChat;
  }

  /**
   * Find a direct chat between two users
   */
  static async findDirectChat(
    userId1: string,
    userId2: string,
  ): Promise<IChat | null> {
    const membersKey = [userId1, userId2].map(String).sort().join(':');
    const chat = await Chat.findOne({ type: 'direct', membersKey });
    return chat as IChat | null;
  }

  /**
   * Get all chats for a user
   */
  static async getUserChats(userId: string): Promise<IChat[]> {
    const chats = await Chat.find({
      'participants.user': userId,
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .populate('participants.user', 'username email avatar')
      .populate('lastMessage');
    return chats as unknown as IChat[];
  }

  /**
   * Get a single chat by ID if the user is a participant
   */
  static async getChatById(
    chatId: string,
    userId: string,
  ): Promise<IChat | null> {
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId,
      isActive: true,
    })
      .populate('participants.user', 'username email avatar')
      .populate('lastMessage');
    return chat as IChat | null;
  }

  /**
   * Update last message in a chat
   */
  static async updateLastMessage(
    chatId: string,
    messageId: string,
  ): Promise<IChat | null> {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: messageId },
      { new: true },
    );
    return chat as IChat | null;
  }

  /**
   * Check if a user is a participant in a chat
   */
  static async isUserInChat(chatId: string, userId: string): Promise<boolean> {
    const count = await Chat.countDocuments({
      _id: chatId,
      'participants.user': userId,
      isActive: true,
    });
    return count > 0;
  }
}
