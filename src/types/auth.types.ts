export interface OAuthCallbackPayload {
  code: string;
  state?: string;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthUser {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
  message?: string;
  isSuccess?: boolean;
  errors?: string[] | Record<string, string[]>;
}
