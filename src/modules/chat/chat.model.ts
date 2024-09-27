import { Schema, model } from 'mongoose';
import { IChat, IChatParticipant } from './chat.interface';

const participantSchema = new Schema<IChatParticipant>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  joinedAt: { 
    type: Date, 
    default: Date.now 
  },
  role: { 
    type: String, 
    enum: ['admin', 'member'], 
    default: 'member' 
  }
}, { _id: false });

const chatSchema = new Schema<IChat>({
  type: { 
    type: String, 
    enum: ['direct', 'group'], 
    required: true 
  },
  participants: [participantSchema],
  name: { 
    type: String,
    required: function() { 
      return this.type === 'group'; 
    }
  },
  description: String,
  avatar: String,
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastMessage: { 
    type: Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  // Normalized key for direct chats to ensure uniqueness regardless of order
  membersKey: { type: String, index: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster querying
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ type: 1, 'participants.user': 1 });

// Virtual for populating messages
chatSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'chat'
});

// Compute membersKey for direct chats before validation
chatSchema.pre('validate', function (this: any, next) {
  if (this.type === 'direct' && Array.isArray(this.participants)) {
    const ids = this.participants
      .map((p: any) => p.user?.toString())
      .filter(Boolean)
      .sort();
    // For a valid direct chat, there should be exactly two participants
    if (ids.length === 2) {
      this.membersKey = ids.join(':');
    } else {
      this.membersKey = undefined;
    }
  } else {
    this.membersKey = undefined;
  }
  next();
});

// Prevent duplicate direct chats using normalized membersKey
chatSchema.index(
  { membersKey: 1 },
  {
    unique: true,
    partialFilterExpression: { type: 'direct', membersKey: { $exists: true } },
    name: 'unique_direct_membersKey'
  }
);

const Chat = model<IChat>('Chat', chatSchema);

export default Chat;
