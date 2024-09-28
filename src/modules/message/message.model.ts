import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IMessageAttachment {
  type: 'image' | 'video' | 'file' | 'audio';
  url?: string;
  name?: string;
  size?: number;
}

export interface IReadByEntry {
  user: Types.ObjectId;
  readAt: Date;
}

export interface IMessage {
  _id: Types.ObjectId;
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  content?: string;
  attachment?: IMessageAttachment | null;
  readBy: IReadByEntry[];
  deleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IMessageAttachment>(
  {
    type: {
      type: String,
      enum: ['image', 'video', 'file', 'audio'],
      required: function (this: any) {
        return !!this.type;
      },
    },
    url: String,
    name: String,
    size: Number,
  },
  { _id: false },
);

const readBySchema = new Schema<IReadByEntry>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: function (this: any) {
        return !this.attachment;
      },
      trim: true,
    },
    attachment: {
      type: attachmentSchema,
      default: null,
    },
    readBy: {
      type: [readBySchema],
      default: [],
    },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

// Indexes for performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ chat: 1, _id: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });

const Message = model<IMessage>('Message', messageSchema);

export default Message;
