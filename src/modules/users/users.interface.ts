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
