export interface GoogleUser {
  user_id: string;
  refresh_token: string;
}

export interface IGoogleRepository {
  getGoogleUser(userId: string): Promise<GoogleUser>
}