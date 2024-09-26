import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastSeen(): Promise<IUser>;
  setOnlineStatus(isOnline: boolean): Promise<IUser>;
}

export interface IUserInput {
  username: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface IUserUpdate {
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface IUserResponse {
  _id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserRegister extends IUserInput {
  confirmPassword: string;
}
