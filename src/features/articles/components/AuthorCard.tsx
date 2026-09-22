import { useState, useEffect, type JSX } from "react";
import { Link } from "react-router-dom";

import {
  Card,
  Avatar,
  Button,
} from "@/components/common";

import type { AuthorInfo } from "@/features/articles/api/articleApi";
import { getArticles, getMyPosts } from "@/features/articles/api/articleApi";
import { getUserProfileById, type UserProfile } from "@/lib/api/user.api";

export interface AuthorCardProps {
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  company?: string;
  authorBio?: string;
  articlesCount?: number | string | UserProfile;
  articlesCounts?: number | string | UserProfile;
  followersCount?: number | string;
  followingCount?: number | string;
  isAuthor?: boolean;
  author?: AuthorInfo | null;
}

export function AuthorCard({
  authorId,
  authorName = "DevSpace Author",
  authorAvatar,
  authorRole,
  company,
  authorBio,
  articlesCount,
  articlesCounts,
  followersCount,
  followingCount,
  isAuthor = false,
  author,
}: AuthorCardProps): JSX.Element {
  const [fetchedArticlesCount, setFetchedArticlesCount] = useState<number | null>(null);

  const displayName =
    author?.name ||
    author?.userName ||
    (authorName && authorName !== "DevSpace Author" ? authorName : "DevSpace Author");

  const displayAvatar = author?.avatarUrl ?? authorAvatar;

  const displayRole = authorRole ?? "Community Author";

  const displayCompany = company
    ? company.startsWith("@")
      ? company
      : `@ ${company}`
    : "";

  const displayBio =
    authorBio ||
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

      if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        for (const key of [
          "articlesCount",
          "totalArticles",
          "totalPosts",
          "postsCount",
          "postCount",
          "articleCount",
          "totalArticleCount",
          "totalPostsCount",
          "totalArticlesCount",
        ]) {
          const v = obj[key];
          if (typeof v === "number" && Number.isFinite(v)) return v;
          if (typeof v === "string" && v.trim() !== "") {
            const parsed = Number.parseInt(v, 10);
            if (Number.isFinite(parsed)) return parsed;
          }
        }
      }
    }

    return 0;
  };

  const targetAuthorId = author?.id || authorId;

  useEffect(() => {
    if (!targetAuthorId) return;

    // Check if article count was already provided via props or author object
    const providedArticles = getStatNumber(
      articlesCount,
      articlesCounts,
      author?.articlesCount,
      author?.totalArticles,
      author?.totalPosts,
      author?.postsCount,
      author?.postCount,
    );

    if (providedArticles > 0) return;

    let cancelled = false;

    async function loadArticlesCount(): Promise<void> {
      try {
        const profile = await getUserProfileById(targetAuthorId as string);
        if (cancelled) return;

        const countFromProfile = getStatNumber(
          profile?.articlesCount,
          profile?.totalArticles,
          profile?.totalPosts,
          profile?.postsCount,
          profile?.postCount,
          profile?.articleCount,
        );

        if (countFromProfile > 0) {
          setFetchedArticlesCount(countFromProfile);
          return;
        }

        const allArticles = isAuthor ? await getMyPosts() : await getArticles();
        if (cancelled) return;

        if (Array.isArray(allArticles)) {
          const userArticles = isAuthor
            ? allArticles
            : allArticles.filter(
                (art) =>
                  art.authorId === targetAuthorId ||
                  art.author?.id === targetAuthorId ||
                  (authorName &&
                    authorName !== "DevSpace Author" &&
                    (art.authorName === authorName ||
                      art.author?.name === authorName)),
              );
          setFetchedArticlesCount(userArticles.length);
        }
      } catch {
        // Fallback gracefully
      }
    }

    void loadArticlesCount();

    return () => {
      cancelled = true;
    };
  }, [targetAuthorId, isAuthor, authorName, articlesCount, articlesCounts, author]);

  const totalFollowers = getStatNumber(
    author?.totalFollowers,
    followersCount,
  );

  const totalFollowing = getStatNumber(
    author?.totalFollowed,
    followingCount,
  );

  const totalArticles = getStatNumber(
    articlesCount,
    articlesCounts,
    author?.articlesCount,
    author?.totalArticles,
    author?.totalPosts,
    author?.postsCount,
    author?.postCount,
    fetchedArticlesCount,
  );

  const profileUrl = isAuthor
    ? "/profile"
    : targetAuthorId
      ? `/profile/${targetAuthorId}`
      : "/profile";

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
