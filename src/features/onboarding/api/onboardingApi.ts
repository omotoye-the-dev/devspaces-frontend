import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { UserProfile } from "@/lib/api/user.api";

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  userName?: string;
  avatar?: File;
  bio?: string;
  xUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  isProfileCompleted?: boolean;
}

/** POST /api/v1/users/me/interested-tags */
export async function updateInterestedTags(tagIds: string[]): Promise<void> {
  await apiClient.post(ENDPOINTS.USER.INTERESTED_TAGS, { tags: tagIds });
}

/** PATCH /api/v1/users/profile (multipart/form-data) */
export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const formData = new FormData();

  if (payload.firstName !== undefined) formData.append("FirstName", payload.firstName);
  if (payload.lastName !== undefined) formData.append("LastName", payload.lastName);
  if (payload.userName !== undefined) formData.append("UserName", payload.userName);
  if (payload.avatar) formData.append("Avatar", payload.avatar);
  if (payload.bio !== undefined) formData.append("Bio", payload.bio);
  if (payload.xUrl !== undefined) formData.append("XUrl", payload.xUrl);
  if (payload.linkedInUrl !== undefined) formData.append("LinkedInUrl", payload.linkedInUrl);
  if (payload.githubUrl !== undefined) formData.append("GithubUrl", payload.githubUrl);
  if (payload.websiteUrl !== undefined) formData.append("WebsiteUrl", payload.websiteUrl);
  if (payload.isProfileCompleted !== undefined) {
    formData.append("IsProfileCompleted", String(payload.isProfileCompleted));
  }

  const response = await apiClient.patch<Record<string, unknown>>(
    ENDPOINTS.USER.PROFILE,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  const body = response.data;
  if (body && typeof body === "object" && "data" in body && body.data && typeof body.data === "object") {
    return body.data as UserProfile;
  }
  return body as UserProfile;
}
