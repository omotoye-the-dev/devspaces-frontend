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
  role?: string;
  bio?: string;
  [key: string]: unknown;
}

/**
 * Fetches the user profile from /api/User/profile.
 * When `id` is passed, it requests the profile for that specific author/user ID via ?id={id}.
 */
export async function getUserProfile(id?: string): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>(ENDPOINTS.USER.PROFILE, {
    params: id ? { id } : undefined,
  });
  return response.data;
}

const profileCache = new Map<string, Promise<UserProfile>>();

/**
 * Fetches a user profile with deduplication and in-memory caching by user ID.
 */
export async function getUserProfileById(id: string): Promise<UserProfile> {
  if (!id) {
    throw new Error("A valid user ID is required to fetch a profile");
  }

  const existing = profileCache.get(id);
  if (existing) {
    return existing;
  }

  const request = getUserProfile(id).catch((err: unknown) => {
    // Evict failed request so subsequent attempts can retry
    profileCache.delete(id);
    throw err;
  });

  profileCache.set(id, request);
  return request;
}

/**
 * Formats a display name from a user profile, with graceful fallback.
 */
export function formatProfileName(
  profile?: UserProfile | null,
  fallback = "DevSpace Author",
): string {
  if (!profile) return fallback;
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  if (profile.name && typeof profile.name === "string") return profile.name;
  if (profile.fullName && typeof profile.fullName === "string") return profile.fullName;
  if (profile.userName && typeof profile.userName === "string") return profile.userName;
  if (profile.username && typeof profile.username === "string") return profile.username;
  return fallback;
}

/**
 * Retrieves the preferred avatar URL from a user profile.
 */
export function getProfileAvatar(profile?: UserProfile | null): string | undefined {
  if (!profile) return undefined;
  return (
    (profile.avatarUrl as string | undefined) ||
    (profile.avatar as string | undefined) ||
    (profile.profilePictureUrl as string | undefined) ||
    undefined
  );
}

/**
 * Retrieves the display role from a user profile.
 */
export function getProfileRole(profile?: UserProfile | null): string | undefined {
  if (!profile) return undefined;
  return typeof profile.role === "string" && profile.role.trim().length > 0
    ? profile.role.trim()
    : undefined;
}
