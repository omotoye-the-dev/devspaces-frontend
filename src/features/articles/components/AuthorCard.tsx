import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router-dom";

import {
  Card,
  Avatar,
  Button,
  Skeleton,
} from "@/components/common";

import {
  getUserProfileById,
  formatProfileName,
  getProfileAvatar,
  getProfileRole,
  type UserProfile,
} from "@/lib/api/user.api";

export interface AuthorCardProps {
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  company?: string;
  authorBio?: string;
  articlesCount?: number | string;
  followersCount?: number | string;
  followingCount?: number | string;
  isAuthor?: boolean;
}

export function AuthorCard({
  authorId,
  authorName = "DevSpace Author",
  authorAvatar,
  authorRole,
  company,
  authorBio,
  articlesCount,
  followersCount,
  followingCount,
  isAuthor = false,
}: AuthorCardProps): JSX.Element {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [isLoading, setIsLoading] =
    useState<boolean>(false);

  useEffect(() => {
    if (!authorId) {
      return;
    }

    let isSubscribed = true;

    async function loadAuthor(): Promise<void> {
      try {
        setIsLoading(true);

        const data =
          await getUserProfileById(authorId as string);

        if (isSubscribed) {
          setProfile(data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    void loadAuthor();

    return () => {
      isSubscribed = false;
    };
  }, [authorId]);

  const displayName =
    authorName &&
    authorName !== "DevSpace Author"
      ? authorName
      : formatProfileName(
          profile,
          authorName || "DevSpace Author",
        );

  const displayAvatar =
    authorAvatar ?? getProfileAvatar(profile);

  const displayRole =
    authorRole ??
    getProfileRole(profile) ??
    "Community Author";

  const rawCompany =
    company ||
    (profile?.company as string | undefined) ||
    "";

  const displayCompany = rawCompany
    ? rawCompany.startsWith("@")
      ? rawCompany
      : `@ ${rawCompany}`
    : "";

  const displayBio =
    authorBio ||
    (profile?.bio as string | undefined) ||
    "Building accessible, resilient, and performant web applications.";

  /**
   * Converts the different possible API
   * response formats into a number.
   *
   * This follows the same logic used
   * in ProfilePage.
   */
  const getStatNumber = (
    ...candidates: unknown[]
  ): number => {
    for (const value of candidates) {
      if (
        typeof value === "number" &&
        Number.isFinite(value)
      ) {
        return value;
      }

      if (
        typeof value === "string" &&
        value.trim() !== ""
      ) {
        const parsed =
          Number.parseInt(value, 10);

        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    return 0;
  };

  /**
   * Followers
   *
   * Check all possible fields returned
   * by the API, matching ProfilePage.
   *
   * The prop is used as a fallback when
   * the profile endpoint doesn't provide
   * a follower count.
   */
  const totalFollowers = getStatNumber(
    profile?.totalFollowers,
    profile?.followersCount,
    profile?.followers,
    profile?.followerCount,
    (
      profile as Record<
        string,
        unknown
      > | null
    )?.totalFollowerCount,
    followersCount,
  );

  /**
   * Following
   *
   * Same field resolution logic as
   * ProfilePage.
   */
  const totalFollowing = getStatNumber(
    profile?.totalFollowed,
    profile?.totalFollowing,
    profile?.followingCount,
    profile?.followedCount,
    profile?.following,
    (
      profile as Record<
        string,
        unknown
      > | null
    )?.totalFollowedCount,
    followingCount,
  );

  /**
   * Articles
   */
  const totalArticles = getStatNumber(
    profile?.articlesCount,
    articlesCount,
  );

  const profileUrl = isAuthor
    ? "/profile"
    : authorId
      ? `/profile/${authorId}`
      : "/profile";

  if (isLoading) {
    return (
      <Card
        variant="default"
        padding="md"
        className="
          rounded-2xl
          border-border/80
          bg-white
          shadow-xs
        "
      >
        <Skeleton
          variant="text"
          width={140}
          height={18}
          className="mb-4"
        />

        <div className="mb-4 flex items-center gap-3.5">
          <Skeleton
            variant="circular"
            width={56}
            height={56}
          />

          <div className="flex-1 space-y-2">
            <Skeleton
              variant="text"
              width="65%"
              height={16}
            />

            <Skeleton
              variant="text"
              width="80%"
              height={12}
            />

            <Skeleton
              variant="text"
              width="45%"
              height={12}
            />
          </div>
        </div>

        <Skeleton
          variant="text"
          width="100%"
          height={14}
          count={2}
          className="mb-4"
        />

        <div className="mb-5 flex gap-4">
          <Skeleton
            variant="text"
            width={60}
            height={14}
          />

          <Skeleton
            variant="text"
            width={60}
            height={14}
          />

          <Skeleton
            variant="text"
            width={60}
            height={14}
          />
        </div>

        <Skeleton
          variant="rounded"
          width="100%"
          height={40}
          className="rounded-xl"
        />
      </Card>
    );
  }

  return (
    <Card
      variant="default"
      padding="md"
      className="
        rounded-2xl
        border-border/80
        bg-white
        text-text
        shadow-xs
        font-inter
      "
    >
      {/* Header title */}
      <h3
        className="
          mb-4
          text-base
          font-bold
          tracking-tight
          text-slate-900
        "
      >
        About the author
      </h3>

      {/* Author Identity */}
      <div className="mb-4 flex items-center gap-3.5">
        <Avatar
          src={displayAvatar}
          name={displayName}
          size="xl"
          shape="circle"
          href={profileUrl}
          className="
            h-14
            w-14
            shrink-0
            ring-1
            ring-border/80
            shadow-xs
            sm:h-16
            sm:w-16
          "
        />

        <div className="min-w-0 flex-1">
          <Link
            to={profileUrl}
            className="
              rounded-xs
              hover:underline
              focus-visible:outline-hidden
              focus-visible:ring-1
              focus-visible:ring-primary
            "
          >
            <h4
              className="
                truncate
                text-base
                font-bold
                leading-snug
                text-slate-900
              "
            >
              {displayName}
            </h4>
          </Link>

          <p
            className="
              mt-0.5
              truncate
              text-xs
              font-medium
              leading-tight
              text-slate-600
            "
          >
            {displayRole}
          </p>

          {displayCompany && (
            <p
              className="
                mt-0.5
                truncate
                text-xs
                leading-tight
                text-slate-500
              "
            >
              {displayCompany}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      <p
        className="
          mb-4
          text-xs
          leading-relaxed
          text-slate-700
          sm:text-sm
        "
      >
        {displayBio}
      </p>

      {/* Stats row */}
      <div
        className="
          mb-5
          flex
          items-center
          gap-4
          text-xs
        "
      >
        {/* Articles */}
        <div>
          <span
            className="
              font-bold
              text-slate-900
            "
          >
            {totalArticles}
          </span>{" "}
          <span
            className="
              font-medium
              text-slate-500
            "
          >
            Articles
          </span>
        </div>

        {/* Followers */}
        <div>
          <span
            className="
              font-bold
              text-slate-900
            "
          >
            {totalFollowers}
          </span>{" "}
          <span
            className="
              font-medium
              text-slate-500
            "
          >
            Followers
          </span>
        </div>

        {/* Following */}
        <div>
          <span
            className="
              font-bold
              text-slate-900
            "
          >
            {totalFollowing}
          </span>{" "}
          <span
            className="
              font-medium
              text-slate-500
            "
          >
            Following
          </span>
        </div>
      </div>

      {/* View profile button */}
      <Button
        href={profileUrl}
        variant="outline"
        size="md"
        fullWidth
        className="
          rounded-xl
          border-blue-400
          py-2
          font-semibold
          text-blue-600
          transition-colors
          hover:border-blue-500
          hover:bg-blue-50/60
        "
      >
        View profile
      </Button>
    </Card>
  );
}

export default AuthorCard;
