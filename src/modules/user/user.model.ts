import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';

import type { IUser } from './user.types';

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    avatar: {
      type: String,
      default: null,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Allow null/empty
          return (
            /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v) ||
            /^uploads\/.+$/.test(v)
          );
        },
        message: 'Avatar must be a valid URL or file path',
      },
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        if ('password' in ret) {
          delete (ret as any).password;
        }
        return ret;
      },
    },
  },
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ isOnline: 1, lastSeen: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last seen method
userSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date();
  return this.save();
};

// Update online status method
userSchema.methods.setOnlineStatus = function (isOnline: boolean) {
  this.isOnline = isOnline;
  if (!isOnline) {
    this.lastSeen = new Date();
  }
  return this.save();
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
