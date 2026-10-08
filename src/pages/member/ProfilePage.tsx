import { useState, useEffect, useMemo, type JSX, type MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiLink,
  FiGithub,
  FiTwitter,
  FiShare2,
  FiMail,
  FiUsers,
  FiUserPlus,
  FiFileText,
  FiBookOpen,
  FiActivity,
  FiUser,
  FiFolder,
  FiCheck,
  FiArrowUp,
  FiArrowDown,
  FiDownload,
} from "react-icons/fi";
import { BsPatchCheckFill } from "react-icons/bs";
import { Avatar, Button, Tabs, Skeleton, EmptyState, type TabItem } from "@/components/common";
import {
  getUserProfile,
  formatProfileName,
  getProfileAvatar,
  followAuthor,
  type UserProfile,
} from "@/lib/api/user.api";
import { getArticles, getMyPosts, type Article } from "@/features/articles/api/articleApi";
import { ArticleCard } from "@/features/articles/components/ArticleCard";
import {
  getResources,
  voteResource,
  saveResource,
} from "@/features/resources/api/resources.api";
import { ResourceCard, type ResourceItem } from "@/features/resources/components/ResourceCard";
import type { ResourceListItem } from "@/types/resources.types";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function mapToResourceCardItem(item: ResourceListItem): ResourceItem {
  const upvotes = item.upvoteCount ?? 0;
  const isUpvoted = Boolean(item.isUpvotedByMe) && upvotes > 0;
  const isDownvoted = Boolean(item.isDownvotedByMe);

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    icon: item.logoUrl || undefined,
    url: item.externalUrl || undefined,
    tags: (item.tags || []).map((t) => (typeof t === "string" ? t : t.name)),
    author: {
      id: item.uploader?.userId,
      name: item.uploader?.name || item.uploader?.username || "DevSpace Contributor",
      avatarUrl: item.uploader?.avatarUrl || undefined,
    },
    updatedAt: formatDate(item.createdAt),
    upvotesCount: upvotes,
    downvotesCount: item.downvoteCount ?? 0,
    isUpvoted,
    isDownvoted,
    isBookmarked: item.isSavedByMe,
  };
}

type ProfileTab = "articles" | "resources" | "activity" | "about";

export default function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("articles");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
  const [followersOffset, setFollowersOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isOwnProfile = Boolean(
    !id ||
      id === "me" ||
      (currentUser?.id && id === currentUser.id) ||
      (currentUser?.userName && id === currentUser.userName) ||
      (currentUser?.username && id === currentUser.username),
  );

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
                  const authorUsername = (art.author?.userName || art.author?.username)?.toLowerCase();
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
                const authorUsername = (art.author?.userName || art.author?.username)?.toLowerCase();
                const authorName = (art.author?.name || art.authorName)?.toLowerCase();

                if (targetId && authorId && authorId === targetId) return true;
                if (targetUsername && authorUsername && authorUsername === targetUsername) return true;
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
            : (
                (profileRes.userName || profileRes.username) as string | undefined
              )?.toLowerCase();

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
                if (targetResUsername && uploaderUsername && uploaderUsername === targetResUsername) return true;
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

  const firstArticle = articles[0];
  const firstArticleAuthorName =
    firstArticle?.author?.name || firstArticle?.author?.userName || firstArticle?.authorName;
  const firstArticleUserName =
    firstArticle?.author?.userName ||
    (firstArticle as unknown as { authorUserName?: string })?.authorUserName;
  const firstArticleAvatar =
    firstArticle?.author?.avatarUrl ||
    (firstArticle as unknown as { authorAvatar?: string })?.authorAvatar;

  const defaultName = isOwnProfile
    ? currentUser?.username || "DevSpace Member"
    : firstArticleAuthorName || "DevSpace Author";

  const displayName = formatProfileName(profile, defaultName);

  const username =
    (profile?.userName as string | undefined) ||
    (profile?.username as string | undefined) ||
    (isOwnProfile ? currentUser?.username : firstArticleUserName) ||
    "member";

  const bio =
    (profile?.bio as string | undefined) ||
    (profile?.role as string | undefined) ||
    "Software Engineer building on DevSpace.";

  const avatarUrl = getProfileAvatar(profile) || (isOwnProfile ? undefined : firstArticleAvatar);

  const location = (profile?.location as string | undefined) || "";
  const website = (profile?.website as string | undefined) || "";
  const github = (profile?.github as string | undefined) || "";
  const twitter = (profile?.twitter as string | undefined) || "";

  const getStatNumber = (...candidates: unknown[]): number => {
    for (const val of candidates) {
      if (typeof val === "number" && !isNaN(val)) return val;
      if (typeof val === "string" && val.trim() !== "") {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 0;
  };

  const rawFollowers = getStatNumber(
    profile?.totalFollowers,
    profile?.followersCount,
    profile?.followers,
    profile?.followerCount,
    (profile as Record<string, unknown> | null)?.totalFollowerCount,
  );
  const followersCount = Math.max(0, rawFollowers + followersOffset);

  const rawFollowing = getStatNumber(
    profile?.totalFollowed,
    profile?.totalFollowing,
    profile?.followingCount,
    profile?.followedCount,
    profile?.following,
    (profile as Record<string, unknown> | null)?.totalFollowedCount,
  );
  const followingCount = rawFollowing;

  const articlesCount = articles.length;
  const rawResourcesStat = getStatNumber(
    profile?.resourcesCount,
    profile?.totalResources,
    (profile as Record<string, unknown> | null)?.resourceCount,
    (profile as Record<string, unknown> | null)?.totalResourceCount,
  );
  const resourcesCount = resources.length > 0 ? resources.length : rawResourcesStat;

  const totalResourceUpvotes = useMemo(
    () => resources.reduce((acc, r) => acc + (r.upvoteCount || 0), 0),
    [resources],
  );
  const totalResourceDownloads = useMemo(
    () => resources.reduce((acc, r) => acc + (r.downloadCount || 0), 0),
    [resources],
  );
  const totalResourceDownvotes = useMemo(
    () => resources.reduce((acc, r) => acc + (r.downvoteCount || 0), 0),
    [resources],
  );

  const profileTabs: TabItem[] = useMemo(
    () => [
      { id: "articles", label: "Articles", count: articlesCount, icon: <FiFileText className="w-4 h-4" /> },
      { id: "resources", label: "Resources", count: resourcesCount, icon: <FiFolder className="w-4 h-4" /> },
      { id: "activity", label: "Activity", icon: <FiActivity className="w-4 h-4" /> },
      { id: "about", label: "About", icon: <FiUser className="w-4 h-4" /> },
    ],
    [articlesCount, resourcesCount],
  );

  const handleResourceClick = (cardItem: ResourceItem): void => {
    if (isOwnProfile) {
      navigate(`/resources/${cardItem.id}/edit`);
    } else {
      navigate(`/resources/${cardItem.id}`);
    }
  };

  const handleResourceUpvote = async (
    resId: string,
    e: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.stopPropagation();
    const target = resources.find((r) => r.id === resId);
    if (!target) return;

    const wasUpvoted = Boolean(target.isUpvotedByMe) && (target.upvoteCount ?? 0) > 0;
    const wasDownvoted = Boolean(target.isDownvotedByMe);
    const previousVote: -1 | 0 | 1 = wasUpvoted ? 1 : wasDownvoted ? -1 : 0;

    // Toggle: if already upvoted, unvote to 0. Otherwise vote 1.
    const nextVote: -1 | 0 | 1 = wasUpvoted ? 0 : 1;
    const delta = wasUpvoted ? -1 : 1;

    setResources((prev) =>
      prev.map((r) =>
        r.id === resId
          ? {
              ...r,
              isUpvotedByMe: nextVote === 1,
              isDownvotedByMe: false,
              upvoteCount: Math.max(0, (r.upvoteCount || 0) + delta),
            }
          : r,
      ),
    );

    try {
      const res = await voteResource(resId, nextVote, previousVote);
      setResources((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                isUpvotedByMe: res.data.isUpvoted,
                isDownvotedByMe: res.data.isDownvoted ?? false,
                upvoteCount: res.data.upvoteCount,
                downvoteCount: res.data.downvoteCount,
              }
            : r,
        ),
      );
    } catch (err: unknown) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                isUpvotedByMe: target.isUpvotedByMe,
                isDownvotedByMe: target.isDownvotedByMe,
                upvoteCount: target.upvoteCount,
              }
            : r,
        ),
      );
      toast.error(getApiErrorMessage(err, "Failed to record vote"));
    }
  };

  const handleResourceDownvote = async (
    resId: string,
    e: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.stopPropagation();
    const target = resources.find((r) => r.id === resId);
    if (!target) return;

    const wasUpvoted = Boolean(target.isUpvotedByMe) && (target.upvoteCount ?? 0) > 0;
    const wasDownvoted = Boolean(target.isDownvotedByMe);
    const previousVote: -1 | 0 | 1 = wasUpvoted ? 1 : wasDownvoted ? -1 : 0;

    // Toggle: if already downvoted, unvote to 0. Otherwise vote -1.
    const nextVote: -1 | 0 | 1 = wasDownvoted ? 0 : -1;
    const upvoteDelta = wasUpvoted ? -1 : 0;

    setResources((prev) =>
      prev.map((r) =>
        r.id === resId
          ? {
              ...r,
              isUpvotedByMe: false,
              isDownvotedByMe: nextVote === -1,
              upvoteCount: Math.max(0, (r.upvoteCount || 0) + upvoteDelta),
            }
          : r,
      ),
    );

    try {
      const res = await voteResource(resId, nextVote, previousVote);
      setResources((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                isUpvotedByMe: res.data.isUpvoted,
                isDownvotedByMe: res.data.isDownvoted ?? (nextVote === -1),
                upvoteCount: res.data.upvoteCount,
                downvoteCount: res.data.downvoteCount,
              }
            : r,
        ),
      );
    } catch (err: unknown) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                isUpvotedByMe: target.isUpvotedByMe,
                isDownvotedByMe: target.isDownvotedByMe,
                upvoteCount: target.upvoteCount,
              }
            : r,
        ),
      );
      toast.error(getApiErrorMessage(err, "Failed to record downvote"));
    }
  };

  const handleResourceBookmark = async (
    resId: string,
    e: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.stopPropagation();
    const target = resources.find((r) => r.id === resId);
    if (!target) return;

    const nextSaved = !target.isSavedByMe;

    setResources((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, isSavedByMe: nextSaved } : r)),
    );

    try {
      await saveResource(resId, nextSaved);
      toast.success(nextSaved ? "Saved to your bookmarks" : "Removed from bookmarks");
    } catch (err: unknown) {
      setResources((prev) =>
        prev.map((r) => (r.id === resId ? { ...r, isSavedByMe: !nextSaved } : r)),
      );
      toast.error(getApiErrorMessage(err, "Failed to update saved status"));
    }
  };

  const handleFollowToggle = async (): Promise<void> => {
    const targetId = id || (profile?.id as string | undefined);
    if (!targetId || isFollowLoading) return;

    if (!isAuthenticated && !currentUser) {
      toast.error("Please sign in to follow authors");
      return;
    }

    if (currentUser?.id && targetId === currentUser.id) {
      toast.info("You cannot follow yourself");
      return;
    }

    const previousState = isFollowing;
    const nextState = !previousState;
    const offsetDelta = nextState ? 1 : -1;

    // Optimistic UI update
    setIsFollowing(nextState);
    setFollowersOffset((prev) => prev + offsetDelta);
    setIsFollowLoading(true);

    try {
      const res = await followAuthor(targetId);
      if (res && typeof res.isFollowing === "boolean") {
        setIsFollowing(res.isFollowing);
      }
      if (nextState) {
        toast.success(`You are now following ${displayName}`);
      } else {
        toast.info(`Unfollowed ${displayName}`);
      }
    } catch (err: unknown) {
      // Revert on failure
      setIsFollowing(previousState);
      setFollowersOffset((prev) => prev - offsetDelta);
      toast.error(getApiErrorMessage(err) || "Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShare = async (): Promise<void> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard!");
      } else {
        toast.info("Sharing not supported in this browser");
      }
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleMessage = (): void => {
    toast.info(`Starting conversation with ${displayName}...`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-inter">
      {/* ── Profile Header Card ───────────────────────────────────────── */}
      {isLoading ? (
        <section className="relative bg-white border border-border/70 rounded-2xl md:rounded-3xl shadow-xs overflow-hidden">
          <div className="h-28 sm:h-32 bg-slate-100 animate-pulse" />
          <div className="px-6 pb-6 sm:px-8 sm:pb-8 -mt-14 sm:-mt-16">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
                <Skeleton
                  variant="circular"
                  width={112}
                  height={112}
                  className="ring-4 ring-white rounded-full shrink-0 shadow-md"
                />
                <div className="space-y-2 flex-1 min-w-0 w-full">
                  <Skeleton variant="text" width={200} height={28} />
                  <Skeleton variant="text" width={110} height={16} />
                  <Skeleton variant="text" width="85%" height={16} />
                  <div className="flex items-center gap-3 pt-1">
                    <Skeleton variant="text" width={80} height={14} />
                    <Skeleton variant="text" width={100} height={14} />
                  </div>
                </div>
              </div>
              <div className="lg:pl-8 lg:border-l lg:border-border/60 shrink-0 w-full sm:w-auto">
                <div className="grid grid-cols-2 divide-x divide-y divide-border/60 border rounded-2xl bg-white/80 overflow-hidden text-center min-w-60 sm:min-w-67.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1.5"
                    >
                      <Skeleton variant="circular" width={18} height={18} />
                      <Skeleton variant="text" width={40} height={22} />
                      <Skeleton variant="text" width={50} height={12} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative bg-white border border-border/70 rounded-2xl md:rounded-3xl shadow-xs overflow-hidden">
          {/* Soft atmospheric gradient banner */}
          <div className="h-28 sm:h-32 bg-linear-to-r from-blue-100/60 via-purple-100/40 to-indigo-100/30" />

          <div className="px-6 pb-6 sm:px-8 sm:pb-8 -mt-14 sm:-mt-16">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Avatar + Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
                {/* Shared Avatar Component with 2xl size & status dot */}
                <Avatar
                  src={avatarUrl}
                  alt={displayName}
                  name={displayName}
                  size="2xl"
                  status="online"
                  href={false}
                  className="ring-4 ring-white shadow-md shrink-0"
                />

                {/* User Identity & Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                        {displayName}
                      </h1>
                      <BsPatchCheckFill
                        className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-blue-600 shrink-0"
                        title="Verified member"
                        aria-label="Verified member"
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-text/50">@{username}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-text/80 leading-relaxed max-w-2xl">{bio}</p>

                  {/* Social & Meta Links */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text/60 pt-0.5">
                    {location && (
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3.5 h-3.5 text-text/40 shrink-0" />
                        <span>{location}</span>
                      </span>
                    )}

                    {website && (
                      <>
                        {location && <span className="text-border/80 hidden sm:inline">|</span>}
                        <a
                          href={`https://${website.replace(/^https?:\/\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                        >
                          <FiLink className="w-3.5 h-3.5 shrink-0" />
                          <span>{website}</span>
                        </a>
                      </>
                    )}

                    {github && (
                      <>
                        {(location || website) && (
                          <span className="text-border/80 hidden sm:inline">|</span>
                        )}
                        <a
                          href={`https://${github.replace(/^https?:\/\//, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-text/70 hover:text-text font-medium"
                        >
                          <FiGithub className="w-3.5 h-3.5 shrink-0" />
                          <span>{github}</span>
                        </a>
                      </>
                    )}

                    {twitter && (
                      <>
                        {(location || website || github) && (
                          <span className="text-border/80 hidden sm:inline">|</span>
                        )}
                        <a
                          href={`https://x.com/${twitter.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#1DA1F2] hover:underline font-medium"
                        >
                          <FiTwitter className="w-3.5 h-3.5 shrink-0" />
                          <span>{twitter}</span>
                        </a>
                      </>
                    )}
                  </div>

                  {/* Action Buttons using shared Button component */}
                  <div className="flex items-center gap-2.5 pt-2">
                    {!isOwnProfile && (
                      <Button
                        variant={isFollowing ? "secondary" : "primary"}
                        size="sm"
                        isLoading={isFollowLoading}
                        onClick={handleFollowToggle}
                        leftIcon={
                          isFollowing ? (
                            <FiCheck className="w-4 h-4" />
                          ) : (
                            <FiUserPlus className="w-4 h-4" />
                          )
                        }
                        className="rounded-xl px-5 h-9 font-semibold"
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    )}

                    {isOwnProfile && (
                      <Button
                        href="/articles/new"
                        variant="primary"
                        size="sm"
                        className="rounded-xl px-5 h-9 font-semibold"
                      >
                        Write Article
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleShare}
                      aria-label="Share profile"
                      title="Share profile"
                      className="h-9 w-9 p-0 rounded-xl"
                    >
                      <FiShare2 className="w-4 h-4" />
                    </Button>

                    {!isOwnProfile && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleMessage}
                        aria-label="Send message"
                        title="Send message"
                        className="h-9 w-9 p-0 rounded-xl"
                      >
                        <FiMail className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: 2x2 Stats Grid */}
              <div className="lg:pl-8 lg:border-border/60 shrink-0 w-full sm:w-auto">
                <div className="grid grid-cols-2 divide-x divide-y shadow-2xl divide-border/60  rounded-2xl bg-white/80 overflow-hidden text-center min-w-60 sm:min-w-67.5">
                  {/* Followers */}
                  <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1">
                    <FiUsers className="w-4.5 h-4.5 text-text/40" />
                    <span className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                      {followersCount}
                    </span>
                    <span className="text-[11px] font-medium text-text/50">Followers</span>
                  </div>

                  {/* Following */}
                  <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1">
                    <FiUserPlus className="w-4.5 h-4.5 text-text/40" />
                    <span className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                      {followingCount}
                    </span>
                    <span className="text-[11px] font-medium text-text/50">Following</span>
                  </div>

                  {/* Articles */}
                  <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1">
                    <FiFileText className="w-4.5 h-4.5 text-text/40" />
                    <span className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                      {articlesCount}
                    </span>
                    <span className="text-[11px] font-medium text-text/50">Articles</span>
                  </div>

                  {/* Resources */}
                  <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1">
                    <FiBookOpen className="w-4.5 h-4.5 text-text/40" />
                    <span className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                      {resourcesCount}
                    </span>
                    <span className="text-[11px] font-medium text-text/50">Resources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Navigation Tabs using shared Tabs component ──────────────── */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as ProfileTab)}
        items={profileTabs}
        variant="line"
      />

      {/* ── Tab Panels Content ────────────────────────────────────────── */}
      <section aria-label="Profile content" className="pt-2">
        {activeTab === "articles" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" className="h-72 w-full rounded-2xl" />
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.map((art) => (
                  <ArticleCard
                    key={art.id}
                    id={art.id}
                    authorId={art.author?.id || art.authorId}
                    title={art.title}
                    excerpt={art.excerpt || art.content.slice(0, 110) + "..."}
                    tagNames={art.tags || art.tagNames || []}
                    coverImage={art.coverImageUrl || art.coverImage}
                    authorName={art.author?.name || art.author?.userName || art.authorName || displayName}
                    authorAvatar={art.author?.avatarUrl || avatarUrl}
                    authorRole={profile?.role as string | undefined}
                    createdAt={art.createdAt}
                    readTimeMinutes={art.readingTimeMinutes ?? art.readingTime ?? 4}
                    likes={art.likeCount ?? art.likes ?? 0}
                    comments={art.commentCount ?? art.comments ?? 0}
                    isLiked={Boolean(art.liked ?? art.isLiked)}
                    isEditable={isOwnProfile}
                    status={isOwnProfile ? art.status : undefined}
                    targetHref={isOwnProfile ? `/articles/${art.id}/edit` : `/articles/${art.id}`}
                    variant="vertical"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FiFileText className="w-10 h-10 text-text/30" />}
                title="No articles published yet"
                description={
                  isOwnProfile
                    ? "You haven't written any articles yet."
                    : `${displayName} hasn't written any articles yet.`
                }
                bordered
                action={
                  <Button href="/articles/new" size="sm" className="rounded-xl">
                    Write an Article
                  </Button>
                }
              />
            )}
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-5">
            {/* Resource Engagement Stats Strip */}
            {!isLoading && resources.length > 0 && (
              <div className="grid grid-cols-3 gap-3 p-3.5 sm:p-4 bg-white border border-border/80 rounded-2xl shadow-2xs text-center">
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-text/60 font-medium">
                    <FiArrowUp className="w-3.5 h-3.5 text-primary" />
                    <span>Upvotes</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-text">
                    {totalResourceUpvotes}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center gap-0.5 border-x border-border/70">
                  <div className="flex items-center gap-1.5 text-xs text-text/60 font-medium">
                    <FiDownload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Downloads</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-text">
                    {totalResourceDownloads}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-text/60 font-medium">
                    <FiArrowDown className="w-3.5 h-3.5 text-rose-500" />
                    <span>Downvotes</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-text">
                    {totalResourceDownvotes}
                  </span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" className="h-64 w-full rounded-2xl" />
                ))}
              </div>
            ) : resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {resources.map((item) => (
                  <ResourceCard
                    key={item.id}
                    resource={mapToResourceCardItem(item)}
                    onClick={handleResourceClick}
                    onUpvote={handleResourceUpvote}
                    onDownvote={handleResourceDownvote}
                    onBookmark={handleResourceBookmark}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FiFolder className="w-10 h-10 text-text/30" />}
                title="No resources shared yet"
                description={
                  isOwnProfile
                    ? "You haven't shared any developer resources yet."
                    : `${displayName} hasn't shared any developer resources yet.`
                }
                bordered
                action={
                  isOwnProfile ? (
                    <Button href="/resources" size="sm" className="rounded-xl">
                      Browse & Add Resources
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text">Recent Activity</h3>
            <div className="space-y-3 divide-y divide-border/60">
              {[
                {
                  action: "Published a new article",
                  target: "Architecting Resilient Web Applications in 2026",
                  time: "2 days ago",
                },
                {
                  action: "Liked an article",
                  target: "Understanding TypeScript 5.8 Decorators",
                  time: "4 days ago",
                },
                {
                  action: "Commented on",
                  target: "State Management in Modern React with Zustand",
                  time: "1 week ago",
                },
              ].map((act, index) => (
                <div key={index} className="pt-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-text/60">
                      {act.action}: <span className="font-semibold text-text">{act.target}</span>
                    </p>
                    <p className="text-[11px] text-text/40">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-text mb-2">About {displayName}</h3>
              <p className="text-sm text-text/70 leading-relaxed max-w-3xl">
                {bio} Passionate about building fast, accessible web applications and developer
                tooling. Writing regularly about React, TypeScript, design systems, and software
                craftsmanship.
              </p>
            </div>

            <div className="border-t border-border/60 pt-4">
              <h4 className="text-xs font-bold text-text/50 uppercase tracking-wider mb-2.5">
                Skills & Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "React",
                  "TypeScript",
                  "Next.js",
                  "Tailwind CSS",
                  "Node.js",
                  "Accessibility (a11y)",
                  "State Management",
                  "GraphQL",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-text border border-border/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
