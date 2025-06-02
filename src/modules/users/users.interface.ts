import { IRepository } from "../../core/repository/repository.interface";

export interface User {
  user_id?: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  created_at?: Date;
}

export interface UserData {
  userId?: string;
  email: string;
  name: string;
  phone: string;
  password: string;
  createdAt?: Date;
}

export interface UserGoogleData {
  refresh_token: string;
}

export interface IUserRepository<User> extends IRepository<User> {
  getGoogleData(userId: string): Promise<UserGoogleData>
}
