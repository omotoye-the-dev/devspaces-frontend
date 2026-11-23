import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKeys";
import { queryClient } from "@/shared/lib/queryClient";
import { getUserProfile } from "@/features/profile/api/user.api";

/** The signed-in user's profile (navbar, onboarding check, own profile page). */
export const myProfileQuery = queryOptions({
  queryKey: queryKeys.profile.me(),
  queryFn: () => getUserProfile(),
});

export function useMyProfile(enabled: boolean) {
  return useQuery({ ...myProfileQuery, enabled });
}

/** Call after anything that changes a profile so every view refetches it. */
export function invalidateProfiles(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
}
