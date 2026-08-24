import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export interface UserProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  userName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string | null;
  avatar?: string | null;
  profilePictureUrl?: string | null;
  [key: string]: unknown;
}

/**
 * Fetches the user profile from /api/User/profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>(ENDPOINTS.USER.PROFILE);
  return response.data;
}
