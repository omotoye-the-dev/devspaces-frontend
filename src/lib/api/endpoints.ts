export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ENDPOINTS = {
  AUTH: {
    SIGN_UP: `${API_BASE_URL}/api/Auth/signup`,
    SIGN_IN: `${API_BASE_URL}/api/Auth/signin`,
    GOOGLE_INIT: `${API_BASE_URL}/api/Auth/google`,
    GITHUB_INIT: `${API_BASE_URL}/api/Auth/github`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/api/Auth/google/callback`,
    GITHUB_CALLBACK: `${API_BASE_URL}/api/Auth/github/callback`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/Auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/Auth/reset-password`,
    VERIFY_ACCOUNT: `${API_BASE_URL}/api/Auth/verify-email`,
    RESEND_OTP: `${API_BASE_URL}/api/Auth/resend-otp`,
  },
} as const;
