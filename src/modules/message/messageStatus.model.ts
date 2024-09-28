import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IMessageStatus {
  _id: Types.ObjectId;
  message: Types.ObjectId;
  user: Types.ObjectId;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const messageStatusSchema = new Schema<IMessageStatus>(
  {
    message: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

messageStatusSchema.index({ message: 1, user: 1 }, { unique: true });

const MessageStatus = model<IMessageStatus>(
  'MessageStatus',
  messageStatusSchema,
);

export default MessageStatus;
