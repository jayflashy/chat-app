import { Document, Types } from 'mongoose';

export interface IChatParticipant {
  user: string | Types.ObjectId;
  joinedAt: Date;
  role: 'admin' | 'member';
}

export interface IChat extends Document {
  type: 'direct' | 'group';
  participants: IChatParticipant[];
  name?: string;
  description?: string;
  avatar?: string;
  createdBy: string | Types.ObjectId;
  isActive: boolean;
  membersKey?: string; // normalized key for direct chats (sorted participant ids joined by ':')
  lastMessage?: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateChatDto = {
  type: 'direct' | 'group';
  participants: string[]; // array of user IDs
  name?: string;
  description?: string;
  createdBy: string;
};
