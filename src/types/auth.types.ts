export interface OAuthCallbackPayload {
  code: string;
  state?: string;
}

export interface AuthUser {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
  message?: string;
  isSuccess?: boolean;
}
