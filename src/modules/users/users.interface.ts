export interface User {
  user_id?: number;
  email: string;
  password: string;
  name: string;
  phone: string;
  created_at?: Date;
}

export interface UserData {
  userId?: number;
  email: string;
  name: string;
  phone: string;
  password: string;
  createdAt?: Date;
}
