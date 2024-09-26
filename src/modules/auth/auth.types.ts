import { IUser } from "../user/user.types";
import { Request } from "express";
export interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: IUser;
    token: string;
  };
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface IAuthPayload {
  userId: string;
  email: string;
  username: string;
}

export interface IAuthRequest extends Request {
  user?: IUser;
}
