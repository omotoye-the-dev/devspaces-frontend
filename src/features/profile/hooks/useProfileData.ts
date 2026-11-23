import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { getUserProfile, type UserProfile } from "@/features/profile/api/user.api";
import { getArticles, getMyPosts, type Article } from "@/features/articles/api/articleApi";
import { getResources } from "@/features/resources/api/resources.api";
import type { ResourceListItem } from "@/features/resources/types/resources.types";

/**
 * Loads a profile plus that user's articles and resources.
 * `id` is the route param (undefined or "me" means the signed-in user).
 */
export function useProfileData(id: string | undefined, isOwnProfile: boolean) {
  const currentUser = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [prevId, setPrevId] = useState<string | undefined>(id);
  if (id !== prevId) {
    setPrevId(id);
    setIsLoading(true);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadData(): Promise<void> {
      try {
        const profileRes = await getUserProfile(id);
        if (cancelled) return;

        setProfile(profileRes);
        const isFollowedInitial =
          typeof profileRes.following === "boolean"
            ? profileRes.following
            : typeof profileRes.isFollowing === "boolean"
              ? profileRes.isFollowing
              : false;
        setIsFollowing(isFollowedInitial);

        // Determine if this is the logged-in user's own profile
        const myId = currentUser?.id || (profileRes.id as string | undefined);
        const myUsername = (
          currentUser?.username ||
          currentUser?.userName ||
          (profileRes.username as string | undefined) ||
          (profileRes.userName as string | undefined)
        )?.toLowerCase();

        const isViewingSelf = Boolean(
          !id ||
          id === "me" ||
          (myId && id === myId) ||
          (myUsername && id.toLowerCase() === myUsername) ||
          (currentUser?.id && profileRes.id && currentUser.id === profileRes.id),
        );

        let userArticles: Article[] = [];
        let userResources: ResourceListItem[] = [];

        // ── 1. Fetch Articles ───────────────────────────────────────────
        if (isViewingSelf) {
          try {
            const myPosts = await getMyPosts();
            if (Array.isArray(myPosts) && myPosts.length > 0) {
              userArticles = myPosts;
            }
          } catch {
            // Fall back to feed filtering
          }

          if (userArticles.length === 0) {
            try {
              const allPosts = await getArticles();
              if (Array.isArray(allPosts)) {
                userArticles = allPosts.filter((art) => {
                  const authorId = art.author?.id || art.authorId;
                  const authorUsername = (
                    art.author?.userName || art.author?.username
                  )?.toLowerCase();
                  if (myId && authorId && authorId === myId) return true;
                  if (myUsername && authorUsername && authorUsername === myUsername) return true;
                  return false;
                });
              }
            } catch {
              // Fallback silently
            }
          }
        } else {
          try {
            const allPosts = await getArticles();
            if (Array.isArray(allPosts)) {
              const targetId = (profileRes.id as string | undefined) || id;
              const targetUsername = (
                (profileRes.userName || profileRes.username) as string | undefined
              )?.toLowerCase();
              const targetName = (profileRes.name || profileRes.fullName)?.toLowerCase();

              userArticles = allPosts.filter((art) => {
                const authorId = art.author?.id || art.authorId;
                const authorUsername = (
                  art.author?.userName || art.author?.username
                )?.toLowerCase();
                const authorName = (art.author?.name || art.authorName)?.toLowerCase();

                if (targetId && authorId && authorId === targetId) return true;
                if (targetUsername && authorUsername && authorUsername === targetUsername)
                  return true;
                if (targetName && authorName && authorName === targetName) return true;
                return false;
              });
            }
          } catch {
            // Fallback silently
          }
        }

        // ── 2. Fetch Resources ──────────────────────────────────────────
        try {
          const targetResId = isViewingSelf ? myId : (profileRes.id as string | undefined) || id;
          const targetResUsername = isViewingSelf
            ? myUsername
            : ((profileRes.userName || profileRes.username) as string | undefined)?.toLowerCase();

          // Try querying getResources with uploaderId filter
          const resQuery = await getResources({
            uploaderId: targetResId,
            pageSize: 50,
          });

          if (Array.isArray(resQuery.data) && resQuery.data.length > 0) {
            userResources = resQuery.data;
          } else {
            // Fall back to querying feed and filtering by uploader
            const allRes = await getResources({ pageSize: 50 });
            if (Array.isArray(allRes.data)) {
              userResources = allRes.data.filter((r) => {
                const uploaderId = r.uploader?.userId;
                const uploaderUsername = r.uploader?.username?.toLowerCase();
                if (targetResId && uploaderId && uploaderId === targetResId) return true;
                if (targetResUsername && uploaderUsername && uploaderUsername === targetResUsername)
                  return true;
                return false;
              });
            }
          }
        } catch {
          // Fallback silently
        }

        if (!cancelled) {
          setArticles(userArticles);
          setResources(userResources);
        }
      } catch {
        // Keep fallback data gracefully on network error
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [id, isOwnProfile, currentUser?.id, currentUser?.username, currentUser?.userName]);

  return {
    profile,
    setProfile,
    articles,
    resources,
    setResources,
    isFollowing,
    setIsFollowing,
    isLoading,
  };
}
