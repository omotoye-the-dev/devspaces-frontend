import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  OAuthCallbackPayload,
  AuthResponse,
  SignUpPayload,
} from "@/types/auth.types";

/**
 * Registers a new user with their personal details and credentials.
 */
export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    ENDPOINTS.AUTH.SIGN_UP,
    payload,
  );
  return response.data;
}

/**
 * Redirects the user to the backend OAuth initiation endpoint.
 */
export function initiateOAuth(provider: "google" | "github"): void {
  if (provider === "google") {
    window.location.href = ENDPOINTS.AUTH.GOOGLE_INIT;
  } else {
    window.location.href = ENDPOINTS.AUTH.GITHUB_INIT;
  }
}

/**
 * Sends the OAuth authorization code to backend to complete authentication.
 */
export async function handleOAuthCallback(
  provider: "google" | "github",
  payload: OAuthCallbackPayload,
): Promise<AuthResponse> {
  const endpoint =
    provider === "google"
      ? ENDPOINTS.AUTH.GOOGLE_CALLBACK
      : ENDPOINTS.AUTH.GITHUB_CALLBACK;

  const response = await apiClient.post<AuthResponse>(endpoint, payload);
  return response.data;
}
