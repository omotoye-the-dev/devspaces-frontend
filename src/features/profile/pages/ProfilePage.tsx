import { useState, useEffect, useMemo, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiFileText, FiFolder, FiActivity, FiUser } from "react-icons/fi";
import { Tabs, type TabItem } from "@/shared/ui";
import { EditProfileModal } from "@/features/profile/components/EditProfileModal";
import {
  formatProfileName,
  getProfileAvatar,
  getProfileLinks,
  followAuthor,
  getUserActivity,
  getUserAbout,
  type UserActivityItem,
  type UserAboutInfo,
} from "@/features/profile/api/user.api";
import type { ResourceItem } from "@/features/resources/components/ResourceCard";
import { useAuthStore } from "@/store";
import { toast } from "@/shared/hooks/useToast";
import { getApiErrorMessage } from "@/shared/lib/utils/apiError";
import { getStatNumber } from "@/features/profile/utils/profileHelpers";
import { useProfileData } from "@/features/profile/hooks/useProfileData";
import { useProfileResourceActions } from "@/features/profile/hooks/useProfileResourceActions";
import { ProfileHeader } from "@/features/profile/components/profile-page/ProfileHeader";
import { ProfileHeaderSkeleton } from "@/features/profile/components/profile-page/ProfileHeaderSkeleton";
import { ProfileArticlesTab } from "@/features/profile/components/profile-page/ProfileArticlesTab";
import { ProfileResourcesTab } from "@/features/profile/components/profile-page/ProfileResourcesTab";
import { ProfileActivityTab } from "@/features/profile/components/profile-page/ProfileActivityTab";
import { ProfileAboutTab } from "@/features/profile/components/profile-page/ProfileAboutTab";

type ProfileTab = "articles" | "resources" | "activity" | "about";

export default function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [activeTab, setActiveTab] = useState<ProfileTab>("articles");
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
  const [followersOffset, setFollowersOffset] = useState<number>(0);
  const [activities, setActivities] = useState<UserActivityItem[]>([]);
  const [activityLoadedForUserId, setActivityLoadedForUserId] = useState<string | null>(null);
  const [aboutStats, setAboutStats] = useState<UserAboutInfo | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  const isOwnProfile = Boolean(
    !id ||
    id === "me" ||
    (currentUser?.id && id === currentUser.id) ||
    (currentUser?.userName && id === currentUser.userName) ||
    (currentUser?.username && id === currentUser.username),
  );

  const {
    profile,
    setProfile,
    articles,
    resources,
    setResources,
    isFollowing,
    setIsFollowing,
    isLoading,
  } = useProfileData(id, isOwnProfile);

  const targetUserId =
    (profile?.id as string | undefined) || id || (isOwnProfile ? currentUser?.id : undefined);

  const isActivityLoading =
    activeTab === "activity" && Boolean(targetUserId) && activityLoadedForUserId !== targetUserId;

  useEffect(() => {
    if (activeTab !== "activity" || !targetUserId) return;
    if (activityLoadedForUserId === targetUserId) return;

    let active = true;

    getUserActivity(targetUserId)
      .then((page) => {
        if (!active) return;
        setActivities(page.items);
        setActivityLoadedForUserId(targetUserId);
      })
      .catch((err: unknown) => {
        if (active) {
          toast.error(getApiErrorMessage(err, "Failed to load activity"));
          setActivityLoadedForUserId(targetUserId);
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab, targetUserId, activityLoadedForUserId]);

  const visibleActivities = useMemo(
    () => activities.filter((item) => isOwnProfile || item.visibility !== "Private"),
    [activities, isOwnProfile],
  );

  const firstArticle = articles[0];
  const firstArticleAuthorName =
    firstArticle?.author?.name || firstArticle?.author?.userName || firstArticle?.authorName;
  const firstArticleUserName =
    firstArticle?.author?.userName ||
    (firstArticle as unknown as { authorUserName?: string })?.authorUserName;
  const firstArticleAvatar =
    firstArticle?.author?.avatarUrl ||
    (firstArticle as unknown as { authorAvatar?: string })?.authorAvatar;

  const username =
    (profile?.userName as string | undefined) ||
    (profile?.username as string | undefined) ||
    (isOwnProfile ? currentUser?.username : firstArticleUserName) ||
    undefined;

  useEffect(() => {
    if (!username) return;

    let active = true;

    getUserAbout(username)
      .then((info) => {
        if (active) setAboutStats(info);
      })
      .catch(() => {
        if (active) setAboutStats(null);
      });

    return () => {
      active = false;
    };
  }, [username]);

  const activeAboutStats = username ? aboutStats : null;

  const defaultName = isOwnProfile
    ? currentUser?.username
    : firstArticleAuthorName || firstArticleUserName;

  const displayName = formatProfileName(profile, defaultName || username || "");

  const bio = (profile?.bio as string | undefined) || "";

  const avatarUrl = getProfileAvatar(profile) || (isOwnProfile ? undefined : firstArticleAvatar);

  const location = (profile?.location as string | undefined) || "";
  const {
    websiteUrl: website,
    githubUrl: github,
    xUrl: twitter,
    linkedInUrl,
  } = getProfileLinks(profile);

  const rawFollowers =
    activeAboutStats?.followersCount ??
    getStatNumber(
      profile?.totalFollowers,
      profile?.followersCount,
      profile?.followers,
      profile?.followerCount,
      (profile as Record<string, unknown> | null)?.totalFollowerCount,
    );
  const followersCount = Math.max(0, rawFollowers + followersOffset);

  const rawFollowing =
    activeAboutStats?.followingCount ??
    getStatNumber(
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

  const profileTabs: TabItem[] = useMemo(
    () => [
      {
        id: "articles",
        label: "Articles",
        count: articlesCount,
        icon: <FiFileText className="w-4 h-4" />,
      },
      {
        id: "resources",
        label: "Resources",
        count: resourcesCount,
        icon: <FiFolder className="w-4 h-4" />,
      },
      { id: "activity", label: "Activity", icon: <FiActivity className="w-4 h-4" /> },
      { id: "about", label: "About", icon: <FiUser className="w-4 h-4" /> },
    ],
    [articlesCount, resourcesCount],
  );

  const {
    handleLiveResourceCounts,
    handleResourceUpvote,
    handleResourceDownvote,
    handleResourceBookmark,
  } = useProfileResourceActions(resources, setResources);

  const handleResourceClick = (cardItem: ResourceItem): void => {
    if (isOwnProfile) {
      navigate(`/resources/${cardItem.id}/edit`);
    } else {
      navigate(`/resources/${cardItem.id}`);
    }
  };

  const handleFollowToggle = async (): Promise<void> => {
    const targetId = id || (profile?.id as string | undefined);
    if (!targetId || isFollowLoading) return;

    if (!isAuthenticated && !currentUser) {
      toast.info("Please log in to follow authors");
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
        <ProfileHeaderSkeleton />
      ) : (
        <ProfileHeader
          avatarUrl={avatarUrl}
          displayName={displayName}
          username={username}
          bio={bio}
          location={location}
          website={website}
          github={github}
          twitter={twitter}
          linkedInUrl={linkedInUrl}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          isFollowLoading={isFollowLoading}
          onFollowToggle={handleFollowToggle}
          onShare={handleShare}
          onMessage={handleMessage}
          followersCount={followersCount}
          followingCount={followingCount}
          articlesCount={articlesCount}
          resourcesCount={resourcesCount}
        />
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
          <ProfileArticlesTab
            isLoading={isLoading}
            articles={articles}
            displayName={displayName}
            avatarUrl={avatarUrl}
            authorRole={profile?.role as string | undefined}
            isOwnProfile={isOwnProfile}
          />
        )}

        {activeTab === "resources" && (
          <ProfileResourcesTab
            isLoading={isLoading}
            resources={resources}
            isOwnProfile={isOwnProfile}
            displayName={displayName}
            onLiveCounts={handleLiveResourceCounts}
            onResourceClick={handleResourceClick}
            onUpvote={handleResourceUpvote}
            onDownvote={handleResourceDownvote}
            onBookmark={handleResourceBookmark}
          />
        )}

        {activeTab === "activity" && (
          <ProfileActivityTab
            isActivityLoading={isActivityLoading}
            visibleActivities={visibleActivities}
            isOwnProfile={isOwnProfile}
            displayName={displayName}
          />
        )}

        {activeTab === "about" && (
          <ProfileAboutTab
            displayName={displayName}
            bio={bio}
            isOwnProfile={isOwnProfile}
            onEditProfile={() => setIsEditProfileOpen(true)}
            website={website}
            github={github}
            twitter={twitter}
            linkedInUrl={linkedInUrl}
          />
        )}
      </section>

      <EditProfileModal
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onUpdated={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
      />
    </div>
  );
}
