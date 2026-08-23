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

export interface SignInPayload {
  usernameOrEmail: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  email?: string;
  userName?: string;
  expiresAt?: string;
  success?: boolean;
  message?: string;
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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface LogoutPayload {
  refreshToken?: string;
}



