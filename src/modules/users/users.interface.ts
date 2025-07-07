import { IRepository } from "../../core/repository/repository.interface";

export interface User {
  user_id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  is_admin: boolean;
  created_at?: Date;
}

export interface UserData {
  userId: string;
  email: string;
  name: string;
  phone: string;
  password: string;
  isAdmin: boolean;
  createdAt?: Date;
}

export interface UserGoogleData {
  refresh_token: string;
}

export interface IUserRepository extends IRepository<User> {
  getGoogleData(userId: string): Promise<UserGoogleData>
}
