

export interface GoogleUser {
  refresh_token: string;
}

export interface IGoogleRepository {
  getGoogleUser(userId: string): Promise<GoogleUser>
}